import { Box, Container } from "@mui/material";
import React from "react";
import "./App.css";
import { AppMenu } from "./AppMenu";

export function MainLayout(props: React.PropsWithChildren) {
  return (
    <>
      <AppMenu />
      <Container>
        <Box mt={1}>{props.children}</Box>
      </Container>
    </>
  );
}
