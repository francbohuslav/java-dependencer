import { Refresh as RefreshIcon } from "@mui/icons-material";
import { AppBar, Box, IconButton, MenuItem, Toolbar, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PagesEnum, PageTitles } from "./functions";
import { RefreshDialog } from "./RefreshDialog";

export const AppMenu = () => {
  const [openRefreshDialog, setOpenRefreshDialog] = useState<boolean>(false);
  const navigation = useLocation();

  return (
    <Box pb={10}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div">
            Java Dependencer
          </Typography>
          <Box ml={5}>
            {[PagesEnum.CollisionPage, PagesEnum.AnalyzePage].map((page) => (
              <Link to={page} key={page}>
                <MenuItem sx={{ display: "inline-block" }}>
                  <Typography color={navigation.pathname == page ? "cyan" : "white"}>{PageTitles[page]}</Typography>
                </MenuItem>
              </Link>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Reload dependencies">
            <IconButton size="large" color="inherit" onClick={() => setOpenRefreshDialog(true)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {openRefreshDialog && <RefreshDialog onClose={() => setOpenRefreshDialog(false)} />}
    </Box>
  );
};
