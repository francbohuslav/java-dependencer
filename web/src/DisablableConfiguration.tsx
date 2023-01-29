import { Chip, SxProps, Theme, Tooltip } from "@mui/material";
import ConfigurationsHelper from "./ConfigurationsHelper";

export interface IDisablableConfigurationProps {
  configuration: string;
  sx?: SxProps<Theme>;
  onDisable?: () => void;
}

export function DisablableConfiguration(props: IDisablableConfigurationProps) {
  function disable() {
    ConfigurationsHelper.disableConfiguration(props.configuration);
    props.onDisable?.();
  }

  return (
    <Tooltip title="Click to ignore this configuration">
      <Chip size="small" color="info" label={props.configuration} onClick={disable} sx={props.sx} />
    </Tooltip>
  );
}
