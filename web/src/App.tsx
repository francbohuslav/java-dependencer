import { Alert, Box, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { IReport } from "../../server/src/core/interfaces";
import { ajax } from "./functions";
import { Report } from "./Report";
import Search from "./Search";

export function App() {
  const [library, setLibrary] = useState<string>("");
  const [report, setReport] = useState<IReport | undefined>(undefined);

  useEffect(() => {
    if (library && library.length >= 3) {
      loadReport(library);
    }
  }, [library]);

  async function loadReport(library: string) {
    console.log(`Searching ${library}`);
    const report = await ajax<IReport>("?library=" + encodeURIComponent(library));
    console.log(report);
    setReport(report);
  }

  return (
    <Container>
      <Box mt={1}>
        <Search onChange={setLibrary} />
        {report && (
          <Box mt={3}>
            {report.allUsedVersions.length === 0 ? <Alert severity="warning">Library "{library}" not found</Alert> : <Report report={report}></Report>}
          </Box>
        )}
      </Box>
    </Container>
  );
}
