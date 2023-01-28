import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { IOccurrence } from "../../server/src/core/interfaces";

export interface IOccurrencesProps {
  occurrences: IOccurrence[];
  onClose(): void;
}

export const Occurrences = (props: IOccurrencesProps) => {
  const occurrences = props.occurrences;

  return (
    <Dialog maxWidth="md" fullWidth onClose={() => props.onClose()} open>
      <DialogTitle>Occurrences</DialogTitle>
      <DialogContent>
        {occurrences.map((occ, i) => {
          const path = [...occ.usedBy];
          path.reverse();
          return (
            <Box key={i} mt={3} sx={{ position: "relative" }}>
              <Chip
                size="small"
                color="info"
                label={occ.configuration}
                sx={{ position: "absolute", right: "-5px", top: "-8px", boxShadow: "2px 2px 4px rgb(0,0,0,0.3)" }}
              />
              <Card elevation={2}>
                <CardContent>
                  {path.map((u, level) => (
                    <Typography key={u} variant="body1" sx={{ fontFamily: "monospace", paddingLeft: level * 20 + "px" }}>
                      {level == path.length - 1 ? <strong>{u}</strong> : u}
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
