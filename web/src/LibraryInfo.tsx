import { Tooltip } from "@mui/material";
import { ILibrary, LibraryInfoEnum } from "../../server/src/core/interfaces";

interface ILibraryInfoProps {
  library: ILibrary;
}

export function LibraryInfo(props: ILibraryInfoProps) {
  const versionPart = props.library.versionPart.replace(/\(.\)$/, "");
  return (
    <>
      {props.library.name}:{versionPart}
      {props.library.info && (
        <Tooltip title={getInfoTitle(props.library.info)}>
          <span style={{ background: "#CCFFCC", padding: "0 5px", borderRadius: "50%", boxShadow: "0 0 2px #006600" }}>{props.library.info}</span>
        </Tooltip>
      )}
    </>
  );
}

function getInfoTitle(info: LibraryInfoEnum): string {
  switch (info) {
    case LibraryInfoEnum.Asterisk:
      return "Dependencies omitted (listed previously)";
    case LibraryInfoEnum.LetterC:
      return "Dependency constraint";
    case LibraryInfoEnum.LetterN:
      return "Not resolved (configuration is not meant to be resolved)";
    default:
      return `Unknown "${info}"!!`;
  }
}
