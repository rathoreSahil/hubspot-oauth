import { useState } from "react";
import { Box, Button } from "@mui/material";
import axios from "axios";
import BasicTable from "./IntegrationItemTable";

const endpointMapping = {
  Notion: "notion",
  Airtable: "airtable",
  Hubspot: "hubspot",
};

export const DataForm = ({ integrationType, credentials }) => {
  const [loadedData, setLoadedData] = useState(null);
  const endpoint = endpointMapping[integrationType];

  const handleLoad = async () => {
    try {
      const formData = new FormData();
      formData.append("credentials", JSON.stringify(credentials));
      const response = await axios.post(
        `http://localhost:8000/integrations/${endpoint}/load`,
        formData
      );
      const data = response.data;
      console.log(JSON.stringify(data, null, 2));
      setLoadedData(data);
    } catch (e) {
      alert(e?.response?.data?.detail);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      width="100%"
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap="2px">
        <BasicTable rows={loadedData || []} />
        <Button
          onClick={handleLoad}
          sx={{ mt: 2, maxWidth: "max-content" }}
          variant="contained"
        >
          Load Data
        </Button>
        <Button
          onClick={() => setLoadedData(null)}
          sx={{ mt: 1, maxWidth: "max-content" }}
          variant="contained"
        >
          Clear Data
        </Button>
      </Box>
    </Box>
  );
};
