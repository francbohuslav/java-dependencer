import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import { useState } from "react";
import { ajax } from "./functions";

export interface IRefreshDialogProps {
  onClose(): void;
}

export const RefreshDialog = (props: IRefreshDialogProps) => {
  const [loading, setLoading] = useState(false);
  async function doRefresh() {
    setLoading(true);
    try {
      const report = await ajax<boolean>(`refreshDependencies`);
      if (report !== true) {
        alert("Something happened: " + report);
      } else {
        alert("Done, you can close the dialog.");
      }
    } catch (ex: any) {
      console.error(ex);
      alert("Error: " + ex.message);
    }
    setLoading(false);
  }

  return (
    <Dialog onClose={() => props.onClose()} open>
      <DialogTitle>Refresh dependencies?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1"> It takes a while according to count of detected applications.</Typography>
          <Box textAlign="center" mt={3}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Button variant="contained" onClick={() => doRefresh()}>
                Yes. Do that!
              </Button>
            )}
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
