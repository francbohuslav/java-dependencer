import { Alert, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IReport } from "../../../server/src/core/interfaces";
import { ajax, PagesEnum } from "../functions";
import { Report } from "../Report";
import ReportHelper from "../ReportHelper";
import Search from "../Search";

export function AnalyzePage() {
  const location = useLocation();
  const library = new URLSearchParams(location.search).get("library") ?? "";
  const [report, setReport] = useState<IReport | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (library && library.length >= 3) {
      loadReport(library);
    }
  }, [library]);

  async function loadReport(library: string) {
    console.log(`Searching ${library}`);
    const report = await ajax<IReport>("?library=" + encodeURIComponent(library));
    setReport(report);
  }
  return (
    <>
      <Search library={library} onChange={(library) => navigate(`${PagesEnum.AnalyzePage}?library=${library}`)} />
      {report && (
        <Box mt={3}>
          {ReportHelper.fetchAllVersions(report).size === 0 ? (
            <Alert severity="warning">Library "{library}" not found</Alert>
          ) : (
            <Report report={report}></Report>
          )}
        </Box>
      )}
    </>
  );
}
