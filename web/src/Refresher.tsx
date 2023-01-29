import { useCallback, useState } from "react";

export function useRefresher() {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  return forceUpdate;
}
