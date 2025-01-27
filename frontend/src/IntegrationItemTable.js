import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    minWidth: 150,
    maxWidth: 300,
    width: "auto",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function formatDate(dateString) {
  const date = new Date(dateString);

  // Format date and time
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long", // "Monday"
    year: "numeric", // "2025"
    month: "long", // "January"
    day: "numeric", // "11"
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric", // "3"
    minute: "2-digit", // "30"
    second: "2-digit", // "00"
    hour12: true, // Use 12-hour format (AM/PM)
  });

  const formattedDateString = `${formattedDate}, ${formattedTime}`;
  return formattedDateString;
}

export default function BasicTable({ rows }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "80vw", overflow: "scroll" }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="right">Id</StyledTableCell>
            <StyledTableCell>Type</StyledTableCell>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell>Email</StyledTableCell>
            <StyledTableCell align="right">Creation_Time</StyledTableCell>
            <StyledTableCell align="right">Last_Modified</StyledTableCell>
            <StyledTableCell>Directory</StyledTableCell>
            <StyledTableCell>Parent_Path_Or_Name</StyledTableCell>
            <StyledTableCell align="right">Parent_Id</StyledTableCell>
            <StyledTableCell>URL</StyledTableCell>
            <StyledTableCell>Children</StyledTableCell>
            <StyledTableCell>MIME_Type</StyledTableCell>
            <StyledTableCell>Delta</StyledTableCell>
            <StyledTableCell align="right">Drive_Id</StyledTableCell>
            <StyledTableCell>Visibility</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <StyledTableCell align="right">{row.id}</StyledTableCell>
              <StyledTableCell>{row.type}</StyledTableCell>
              <StyledTableCell>{row.name}</StyledTableCell>
              <StyledTableCell>{row.email}</StyledTableCell>
              <StyledTableCell align="right">
                {formatDate(row.creation_time)}
              </StyledTableCell>
              <StyledTableCell align="right">
                {formatDate(row.last_modified_time)}
              </StyledTableCell>
              <StyledTableCell>{row.directory}</StyledTableCell>
              <StyledTableCell>{row.parent_path_or_name}</StyledTableCell>
              <StyledTableCell align="right">{row.parent_id}</StyledTableCell>
              <StyledTableCell>{row.url}</StyledTableCell>
              <StyledTableCell>{row.children}</StyledTableCell>
              <StyledTableCell>{row.mime_type}</StyledTableCell>
              <StyledTableCell>{row.delta}</StyledTableCell>
              <StyledTableCell align="right">{row.drive_id}</StyledTableCell>
              <StyledTableCell>{row.visibility}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
