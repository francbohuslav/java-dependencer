import { Alert, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ICollisionReport } from "../../../server/src/core/interfaces";
import { ajax, PagesEnum } from "../functions";

export function CollisionPage() {
  const [collisions, setCollisions] = useState<ICollisionReport | undefined>(undefined);

  useEffect(() => {
    loadCollidedLibraries();
  }, []);

  async function loadCollidedLibraries() {
    const collisions = await ajax<ICollisionReport>("collisions");
    setCollisions(collisions);
  }

  return (
    <>
      {collisions ? (
        <>
          {Object.keys(collisions).length > 0 ? (
            <>
              <Typography variant="h6">Libraries with multiple versions</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" width="50%">
                        Library
                      </TableCell>
                      <TableCell component="th">Versions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(collisions).map((library) => (
                      <TableRow key={library}>
                        <TableCell component="th" scope="row">
                          <Tooltip title="Click to analyze library">
                            <Link to={`${PagesEnum.AnalyzePage}?library=${library}`}>{library}</Link>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {collisions[library].map((version) => (
                            <Chip key={version} label={version} size="small" sx={{ marginRight: "0.5em" }} />
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="success">Applications do not contain libraries with mutliple version</Alert>
          )}
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
}
