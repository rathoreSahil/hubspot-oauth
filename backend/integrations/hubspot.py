# hubspot.py

import base64
import json
import urllib.parse
import secrets
import httpx
import asyncio
import requests
from integrations.integration_item import IntegrationItem

from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

from fastapi import Request,HTTPException
from fastapi.responses import HTMLResponse

CLIENT_ID = '6bf901c5-11d5-47e3-91e6-818c4f0db399'
CLIENT_SECRET = '5ca57464-e805-4599-93e3-5feeacd51017'
encoded_client_id_secret = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()

REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'
authorization_url = f'https://app.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}'

scope = 'oauth crm.objects.contacts.read'
optional_scope = 'crm.objects.contacts.write'

async def authorize_hubspot(user_id, org_id):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = json.dumps(state_data)
    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', encoded_state, expire=600)

    return f'{authorization_url}&state={encoded_state}&scope={scope}&optional_scope={optional_scope}'

async def oauth2callback_hubspot(request: Request):
    if request.query_params.get('error'):
        raise HTTPException(status_code=400, detail=request.query_params.get('error'))
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    decoded_string = urllib.parse.unquote_plus(encoded_state)
    state_data = json.loads(decoded_string)

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')

    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')
    
    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                'https://api.hubapi.com/oauth/v1/token',
                data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': REDIRECT_URI,
                    'client_id':CLIENT_ID,
                    'client_secret':CLIENT_SECRET
                }, 
                headers={
                    'Authorization': f'Basic {encoded_client_id_secret}',
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}'),
        )

    await add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', json.dumps(response.json()), expire=600)
    
    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)

async def get_hubspot_credentials(user_id, org_id):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    credentials = json.loads(credentials)
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')

    return credentials

def create_integration_item_metadata_object(response_json,item_type) -> IntegrationItem :
    properties = response_json.get('properties')
    integration_item_metadata = IntegrationItem(
        id=response_json.get('id', None),
        type=item_type,
        name=properties.get('firstname') + " " + properties.get('lastname'),
        email=properties.get('email',None),
        creation_time=response_json.get('createdAt'),
        last_modified_time=response_json.get('updatedAt')
    )

    return integration_item_metadata

def fetch_items(
    access_token: str, url: str, aggregated_response: list
) -> dict:
    """Fetching the list of contacts"""
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        results = response.json().get('results', {})
        paging = response.json().get('paging', None)

        for item in results:
            aggregated_response.append(item)

        if paging is not None:
            fetch_items(access_token, paging.get('next').get('link'), aggregated_response)
        else:
            return
    
    else:
        print("Error:", response)


async def get_items_hubspot(credentials) -> list[IntegrationItem]:
    """Aggregates all metadata relevant for a hubspot integration"""
    credentials = json.loads(credentials)
    url = 'https://api.hubapi.com/crm/v3/objects/contacts'
    list_of_integration_item_metadata = []
    list_of_responses = []

    fetch_items(credentials.get('access_token'), url, list_of_responses)
    for response in list_of_responses:
        list_of_integration_item_metadata.append(create_integration_item_metadata_object(response, 'Contact'))

    print('List of Integration Item Metadata')
    for integration_item_metadata in list_of_integration_item_metadata:
        print(integration_item_metadata.__dict__)
    return list_of_integration_item_metadata