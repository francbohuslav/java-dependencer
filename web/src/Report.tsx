import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import { Fragment, useState } from "react";
import { IOccurrence, IReport, IReportApplication, IReportModule } from "../../server/src/core/interfaces";
import { DisablableConfiguration } from "./DisablableConfiguration";
import { DisabledConfigurations } from "./DisabledConfigurations";
import { IModuleId } from "./functions";
import { LibraryInfo } from "./LibraryInfo";
import { ModuleReport } from "./ModuleReport";
import { Occurrences } from "./Occurrences";
import { useRefresher } from "./Refresher";
import ReportHelper from "./ReportHelper";

export interface IReportProps {
  report: IReport;
}

export const Report = (props: IReportProps) => {
  const refresh = useRefresher();
  const [occurrences, setOccurrences] = useState<IOccurrence[] | undefined>(undefined);
  const [moduleId, setModuleId] = useState<IModuleId | undefined>(undefined);
  const report = props.report;
  const allVersions = [...ReportHelper.fetchAllVersions(report)];
  allVersions.sort();
  const librariesAndConfigurations = ReportHelper.fetchConfigurationPerLibrariesAndVersion(report);

  function renderAppRows(appName: string, appReport: IReportApplication) {
    const appVersions = [...ReportHelper.fetchAppVersions(appReport)];

    if (appVersions.length === 0) {
      return <Fragment key={appName}></Fragment>;
    }
    return (
      <Fragment key={appName}>
        <TableRow>
          <TableCell component="th" scope="row" sx={{ background: "#DDFFFF" }} colSpan={allVersions.length + 1}>
            <strong>{appName}</strong> ({appVersions.join(", ")})
          </TableCell>
        </TableRow>
        {Object.entries(appReport.modules).map(([moduleName, moduleReport]) => renderModuleRows(appName, moduleName, moduleReport))}
      </Fragment>
    );
  }

  function renderModuleRows(appName: string, moduleName: string, moduleReport: IReportModule) {
    const moduleVersions = [...ReportHelper.fetchModuleVersions(moduleReport)];

    if (moduleVersions.length === 0) {
      return <Fragment key={moduleName}></Fragment>;
    }
    const occurencesPerVersion = ReportHelper.getOccurrencesPerVersion(moduleReport.occurrences);

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
  }

  return (
    <>
      <Box mb={3}>
        <Typography variant="h6">Found libraries/versions</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {sort([...librariesAndConfigurations.keys()]).map((libAndVersion) => {
                const library = librariesAndConfigurations.get(libAndVersion)!.libraryInfo;
                return (
                  <TableRow key={libAndVersion}>
                    <TableCell>
                      <Box display="flex" justifyContent="space-between">
                        <span style={{ whiteSpace: "nowrap" }}>
                          <LibraryInfo library={library} />
                        </span>
                        <span style={{ textAlign: "right", lineHeight: "2em" }}>
                          {sort([...librariesAndConfigurations.get(libAndVersion)!.configurations]).map((configuration) => (
                            <DisablableConfiguration key={configuration} configuration={configuration} sx={{ marginLeft: "5px" }} onDisable={refresh} />
                          ))}
                        </span>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={3}>
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
            <TableBody>{Object.entries(report.applications).map(([appName, appReport]) => renderAppRows(appName, appReport))}</TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mb={3}>
        <DisabledConfigurations onEnable={refresh} />
      </Box>
      {occurrences && <Occurrences occurrences={occurrences} onClose={() => setOccurrences(undefined)} onRefresh={refresh} />}
      {moduleId && <ModuleReport moduleId={moduleId} onClose={() => setModuleId(undefined)} />}
    </>
  );
};

function sort(array: string[]): string[] {
  const result = [...array];
  result.sort();
  return result;
}
