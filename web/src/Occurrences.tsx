import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Fragment } from "react";
import { IOccurrence } from "../../server/src/core/interfaces";
import ConfigurationsHelper from "./ConfigurationsHelper";
import { DisablableConfiguration } from "./DisablableConfiguration";
import { LibraryInfo } from "./LibraryInfo";
import ReportHelper from "./ReportHelper";

export interface IOccurrencesProps {
  occurrences: IOccurrence[];
  onClose(): void;
  onRefresh(): void;
}

export const Occurrences = (props: IOccurrencesProps) => {
  const occurrences = props.occurrences;

  return (
    <Dialog maxWidth="md" fullWidth onClose={() => props.onClose()} open>
      <DialogTitle>Occurrences</DialogTitle>
      <DialogContent>
        {occurrences.map((occ, i) => {
          if (ReportHelper.isOccurrencesFullDisabled(occ)) {
            return <Fragment key={i}></Fragment>;
          }
          const path = [...occ.usedBy];
          path.reverse();
          return (
            <Box key={i} mt={3} sx={{ position: "relative" }}>
              <Box sx={{ position: "absolute", right: "-5px", top: "-12px" }}>
                {occ.configurations
                  .filter((c) => ConfigurationsHelper.isEnabled(c))
                  .map((c) => (
                    <DisablableConfiguration configuration={c} sx={{ marginLeft: "0.5em" }} onDisable={props.onRefresh} />
                  ))}
              </Box>
              <Card elevation={2}>
                <CardContent>
                  {path.map((u, level) => (
                    <Typography key={`key${level}`} variant="body1" sx={{ fontFamily: "monospace", paddingLeft: level * 20 + "px" }}>
                      {level == path.length - 1 ? (
                        <strong>
                          <LibraryInfo library={u} />
                        </strong>
                      ) : (
                        <LibraryInfo library={u} />
                      )}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
