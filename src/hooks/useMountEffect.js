import { useEffect } from "react";

/**
 * useMountEffect — explicit wrapper for one-time external sync on mount.
 * Use this instead of useEffect(..., []) to make intent clear.
 * Valid uses: syncing with external stores/context on mount, DOM setup, third-party lifecycles.
 */
const useMountEffect = (effect) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};

export default useMountEffect;
