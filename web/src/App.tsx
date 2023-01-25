import { Alert, Box, Button, Container, Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { IReport } from "../../server/src/core/interfaces";
import { Report } from "./Report";

export function App() {
  const [term, setTerm] = useState<string>("");
  const [report, setReport] = useState<IReport | undefined>(undefined);

  useEffect(() => {
    if (term && term.length >= 3) {
      searchTerm(term);
    }
  }, [term]);

  async function searchTerm(term: string) {
    console.log(`Searching ${term}`);
    const data = await fetch("http://localhost:3000/?term=" + encodeURIComponent(term));
    const report = (await data.json()) as IReport;
    console.log(report);
    setReport(report);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    var formData = new FormData(e.target as HTMLFormElement);
    setTerm(formData.get("term") as string);
  }

  return (
    <Container>
      <Box mt={1}>
        <form onSubmit={onSubmit}>
          <Box>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item xs={10}>
                <TextField name="term" label="Library to search" variant="standard" helperText="At least 3 letter must be insterted" fullWidth />
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained">
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
        {report && (
          <Box mt={3}>
            {report.allUsedVersions.length === 0 ? <Alert severity="warning">Library "{term}" not found</Alert> : <Report report={report}></Report>}
          </Box>
        )}
      </Box>
    </Container>
  );
}
