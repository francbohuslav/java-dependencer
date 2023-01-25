import CheckIcon from "@mui/icons-material/Check";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { IReport } from "../../server/src/core/interfaces";

export interface IReportProps {
  report: IReport;
}

export const Report = (props: IReportProps) => {
  const report = props.report;
  const allVersions = getVersions(report.allUsedVersions);
  allVersions.sort();

  return (
    <>
      <Box mb={3}>
        <Typography variant="h6">Found libraries</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {report.allUsedVersions.map((libAndVersion) => (
                <TableRow key={libAndVersion}>
                  <TableCell>{libAndVersion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Typography variant="h6">Version / modules</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell component="th">App/Module</TableCell>
              {allVersions.map((version) => (
                <TableCell align="center" component="th" key={version}>
                  {version}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(report.applications)
              .filter(([, appReport]) => appReport.allUsedVersions.length > 0)
              .map(([appName, appReport]) => (
                <>
                  <TableRow key={appName}>
                    <TableCell component="th" scope="row" sx={{ background: "#DDFFFF" }} colSpan={allVersions.length + 1}>
                      <strong>{appName}</strong> {appReport.allUsedVersions.length > 0 && <>({getVersions(appReport.allUsedVersions).join(", ")})</>}
                    </TableCell>
                  </TableRow>
                  {Object.entries(appReport.modules)
                    .filter(([, moduleReport]) => moduleReport.allUsedVersions.length > 0)
                    .map(([moduleName, moduleReport]) => {
                      const versions = getVersions(moduleReport.allUsedVersions);
                      return (
                        <TableRow key={moduleName}>
                          <TableCell component="th" scope="row" sx={{ paddingLeft: "2em" }}>
                            {moduleName}
                          </TableCell>
                          {allVersions.map((v) => (
                            <TableCell align="center" key={v}>
                              {versions.includes(v) ? <CheckIcon sx={{ color: "green" }} /> : ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                </>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

function getVersion(libAndVersion: string) {
  const parts = libAndVersion.split(":");
  let versionPart = parts[parts.length - 1];
  versionPart = versionPart.replace(/\(.*\)/, "").trim();
  versionPart = versionPart.replace(/^.*\->/, "").trim();
  return versionPart;
}

function getVersions(libAndVersion: string[]): string[] {
  return [...new Set<string>(libAndVersion.map((v) => getVersion(v)))];
}
