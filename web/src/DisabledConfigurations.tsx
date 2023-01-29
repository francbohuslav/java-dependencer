import { Chip, Tooltip, Typography } from "@mui/material";
import ConfigurationsHelper from "./ConfigurationsHelper";

export interface IDisabledConfigurationsProps {
  onEnable?: () => void;
}

export function DisabledConfigurations(props: IDisabledConfigurationsProps) {
  const disabled = ConfigurationsHelper.getDisabledConfigurations();
  if (disabled.length === 0) {
    return <></>;
  }

  function enable(c: string) {
    return () => {
      ConfigurationsHelper.enableConfiguration(c);
      props.onEnable?.();
    };
  }

  return (
    <>
      <Typography variant="h6">Ignored configurations</Typography>
      {disabled.map((c) => (
        <Tooltip key={c} title="Click to enable this configuration">
          <Chip size="small" color="error" variant="outlined" label={c} sx={{ marginRight: "5px" }} onClick={enable(c)} />
        </Tooltip>
      ))}
    </>
  );
}
