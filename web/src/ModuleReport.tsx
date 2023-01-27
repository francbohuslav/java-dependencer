import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { ajaxRaw, IModuleId } from "./functions";

export interface IOccurrencesProps {
  moduleId: IModuleId;
  onClose(): void;
}

export const ModuleReport = (props: IOccurrencesProps) => {
  const moduleId = props.moduleId;
  const [report, setReport] = useState<string>("");

  useEffect(() => {
    (async () => {
      const report = await ajaxRaw(`getModuleReport?appName=${encodeURIComponent(moduleId.appName)}&moduleName=${encodeURIComponent(moduleId.moduleName)}`);
      setReport(report);
    })();
  });

  return (
    <Dialog maxWidth="xl" fullWidth onClose={() => props.onClose()} open>
      <DialogTitle>Dependency report</DialogTitle>
      <DialogContent>
        <DialogContentText>{report ? <pre>{report}</pre> : <CircularProgress />}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
