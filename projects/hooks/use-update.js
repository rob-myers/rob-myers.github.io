import React from "react";

/**
 * Provides a function to trigger an update.
 */
export default function useUpdate() {
  const [, setNow] = React.useState(() => Date.now());
  return () => setNow(Date.now());
}
