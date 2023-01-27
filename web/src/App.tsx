import { Refresh as RefreshIcon } from "@mui/icons-material";
import { Alert, AppBar, Box, Container, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { IReport } from "../../server/src/core/interfaces";
import "./App.css";
import { ajax } from "./functions";
import { RefreshDialog } from "./RefreshDialog";
import { Report } from "./Report";
import ReportHelper from "./ReportHelper";
import Search from "./Search";

export function App() {
  const [library, setLibrary] = useState<string>("");
  const [openRefreshDialog, setOpenRefreshDialog] = useState<boolean>(false);
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
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Java Dependencer
            </Typography>
            <Tooltip title="Reload dependencies">
              <IconButton size="large" color="inherit" onClick={() => setOpenRefreshDialog(true)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      </Box>
      <Container>
        <Box mt={1}>
          <Search onChange={setLibrary} />
          {report && (
            <Box mt={3}>
              {ReportHelper.fetchAllVersions(report).size === 0 ? (
                <Alert severity="warning">Library "{library}" not found</Alert>
              ) : (
                <Report report={report}></Report>
              )}
            </Box>
          )}
        </Box>
        {openRefreshDialog && <RefreshDialog onClose={() => setOpenRefreshDialog(false)} />}
      </Container>
    </>
  );
}
