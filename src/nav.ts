import { useEffect } from "react";

/**
 * Asked before the hash route changes — including the phone's back button,
 * which otherwise drops a half-done lesson without a word. Return false to stay.
 * Only the player sets one, so a single slot is enough.
 */
let guard: (() => boolean) | undefined;

export function useLeaveGuard(canLeave: () => boolean) {
  useEffect(() => {
    guard = canLeave;
    return () => {
      if (guard === canLeave) guard = undefined;
    };
  });
}

export const mayLeave = () => !guard || guard();
