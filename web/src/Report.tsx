import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import { Fragment, useState } from "react";
import { IOccurrence, IReport } from "../../server/src/core/interfaces";
import { IModuleId } from "./functions";
import { ModuleReport } from "./ModuleReport";
import { Occurrences } from "./Occurrences";

export interface IReportProps {
  report: IReport;
}

export const Report = (props: IReportProps) => {
  const [occurrences, setOccurrences] = useState<IOccurrence[] | undefined>(undefined);
  const [moduleId, setModuleId] = useState<IModuleId | undefined>(undefined);
  const report = props.report;
  const allVersions = getVersions(report.allUsedVersions);
  allVersions.sort();

  return (
    <>
      <Box mb={3}>
        <Typography variant="h6">Found libraries/versions</Typography>
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
            <TableRow sx={{ background: "#DDDDFF" }}>
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
                <Fragment key={appName}>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ background: "#DDFFFF" }} colSpan={allVersions.length + 1}>
                      <strong>{appName}</strong> {appReport.allUsedVersions.length > 0 && <>({getVersions(appReport.allUsedVersions).join(", ")})</>}
                    </TableCell>
                  </TableRow>
                  {Object.entries(appReport.modules)
                    .filter(([, moduleReport]) => moduleReport.allUsedVersions.length > 0)
                    .map(([moduleName, moduleReport]) => {
                      const occurencesPerVersion = getOccurrencesPerVersion(moduleReport.occurrences);
                      return (
                        <TableRow key={moduleName}>
                          <TableCell component="th" scope="row" sx={{ paddingLeft: "2em" }}>
                            <Tooltip title="Show raw dependencies output">
                              <Link sx={{ cursor: "pointer" }} onClick={() => setModuleId({ appName, moduleName })}>
                                {moduleName}
                              </Link>
                            </Tooltip>
                          </TableCell>
                          {allVersions.map((v) => (
                            <TableCell align="center" key={v}>
                              {occurencesPerVersion[v] ? (
                                <Tooltip title="Show occurences for this module and version">
                                  <Link sx={{ cursor: "pointer" }} onClick={() => setOccurrences(occurencesPerVersion[v])}>
                                    {occurencesPerVersion[v].length}x
                                  </Link>
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                </Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {occurrences && <Occurrences occurrences={occurrences} onClose={() => setOccurrences(undefined)} />}
      {moduleId && <ModuleReport moduleId={moduleId} onClose={() => setModuleId(undefined)} />}
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

function getOccurrencesPerVersion(occurrences: IOccurrence[]): { [version: string]: IOccurrence[] } {
  const result: { [version: string]: IOccurrence[] } = {};
  for (const occurrence of occurrences) {
    const version = getVersion(occurrence.library);
    if (!result[version]) {
      result[version] = [];
    }
    result[version].push(occurrence);
  }
  return result;
}
