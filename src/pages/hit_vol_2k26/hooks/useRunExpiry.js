// src/pages/hit_vol_2k26/hooks/useRunExpiry.js
//
// Watches the active-runs list and automatically calls endRun (via the same `onRunAction` path
// that the "Complete" button uses) the moment a volunteer's 30-minute run clock reaches zero —
// without any operator input required.
//
// Design rules this file follows, and why:
//
// 1. This hook never mutates state directly. It calls `onRunAction('endRun', ...)` — the same
//    function used by ActiveRunCard's "Complete" button — so the same idempotency key, the same
//    Code.gs lock, and the same ControlCenter `refresh()` cascade all apply automatically. The
//    roster update (PLAYING → RESTING) happens exactly once, through the existing, tested path.
//
// 2. Duplicate-transition guard: `triggeredRef` is a Set keyed by `volunteerId + '|' + runId`.
//    Once an auto-expiry call is dispatched for a given run, it is never dispatched again in the
//    same page session. If the operator manually completes the run first, Code.gs's idempotency
//    (endRun_ returning the cached result for the same requestId, or simply finding run.endedAt
//    already set) handles that without any extra work here.
//
// 3. Page-reload / reconnect case: on mount (and whenever `volunteers` changes), the effect
//    synchronously checks whether any currently-active volunteer's run is ALREADY past its expiry
//    (`getServerNow() >= startedAt + allowedMinutes * 60 * 1000`). If so, it calls endRun
//    immediately — no timer needed. This is what makes the "refresh the page after expiry"
//    acceptance test pass.
//
// 4. All `setTimeout` handles are stored in `timersRef` (keyed by the same compound key as
//    `triggeredRef`) and cleared in the effect's cleanup, so switching between tabs, unmounting,
//    or a fast `volunteers` re-render never leaves ghost timers running. A fresh scan always
//    replaces the previous set of timers.
//
// 5. `generateRequestId()` is called once per auto-expiry call, matching the pattern every other
//    `onRunAction` call site uses — never reused across the retries that sheetsApi handles
//    internally, and never shared between a manual click and an auto-expiry for the same volunteer.

import { useEffect, useRef } from 'react';
import { getServerNow } from '../services/serverTime.js';

/**
 * Automatically calls `onRunAction('endRun', ...)` when a volunteer's run reaches its allowed-time
 * cap, replicating exactly what the operator's "Complete" button does — so the volunteer is moved
 * to RESTING (with a cooldown) without requiring any manual action.
 *
 * @param {object[]} volunteers Full roster array from useVolunteers — scanned every render for
 *   active runs that are started but not yet ended.
 * @param {(action: string, volunteerId: string, extra?: object) => Promise<object>} onRunAction
 *   The same handler passed to VolunteerRoster / ActiveRunCard. Must be stable across renders
 *   (ControlCenter.jsx defines it outside the JSX tree, so it is — but document it here so a
 *   future refactor knows why this must stay a stable reference).
 */
export function useRunExpiry(volunteers, onRunAction) {
  // Set of `${volunteerId}|${runId}` strings we've already dispatched an endRun for this session.
  // Persists across re-renders (ref, not state) so we never fire twice for the same run, even if
  // the volunteers array refreshes while an endRun call is in flight.
  const triggeredRef = useRef(new Set());

  // Map of `${volunteerId}|${runId}` → setTimeout handle. Cleared and rebuilt on every volunteers
  // change so no ghost timer ever fires for a run that was manually ended before the clock ran out.
  const timersRef = useRef(new Map());

  // Stable ref to onRunAction so the setTimeout callback always sees the latest version without
  // needing to be in the effect's dep array (which would cancel+re-arm every second via useTick).
  const onRunActionRef = useRef(onRunAction);
  useEffect(() => {
    onRunActionRef.current = onRunAction;
  }, [onRunAction]);

  useEffect(() => {
    // Clear all timers from the previous render before re-arming. This is what prevents a ghost
    // timer from a volunteer who was manually completed from firing later and making a redundant
    // (though harmless, thanks to idempotency) auto-expiry call.
    timersRef.current.forEach((handle) => clearTimeout(handle));
    timersRef.current.clear();

    if (!volunteers || !volunteers.length) return;

    const nowMs = getServerNow();

    for (const volunteer of volunteers) {
      const run = volunteer.activeRun;
      // Only act on volunteers whose run has actually started (startedAt set).
      // Volunteers with an assigned-but-not-started run (startedAt falsy) are excluded:
      // their clock hasn't started yet, so there's nothing to expire.
      if (!run || !run.startedAt) continue;

      const key = `${volunteer.volunteerId}|${run.runId}`;

      // Skip if we already dispatched an auto-expiry for this run this session.
      if (triggeredRef.current.has(key)) continue;

      const allowedMs = (run.allowedMinutes || 30) * 60 * 1000;
      const expiryMs = Number(run.startedAt) + allowedMs;
      const msUntilExpiry = expiryMs - nowMs;

      async function triggerExpiry(vol, runKey, isImmediate) {
        // Double-check the guard: if a manual Complete landed between when we scheduled this and
        // when it fires, the key will already be present and we skip silently.
        if (triggeredRef.current.has(runKey)) return;
        triggeredRef.current.add(runKey);

        const logLabel = `${vol.name} (#${vol.volunteerNumber})`;
        if (isImmediate) {
          console.info(
            `[useRunExpiry] Run already expired on mount for ${logLabel} — calling endRun (auto-expiry).`
          );
        } else {
          console.info(
            `[useRunExpiry] 30-minute run expired for ${logLabel} — calling endRun (auto-expiry).`
          );
        }

        try {
          // `giveUp: true` — mirrors the Give Up button: Code.gs's endRun_ sets
          // effectiveDurationSeconds = 0 when this flag is present, so a team that ran the full
          // 30 minutes without completing the hunt scores zero (same as giving up manually).
          // `penalties: 0` — no locally-tallied penalties for an auto-expired run.
          // `autoExpired: true` — diagnostic marker only; Code.gs ignores unknown extra keys.
          // requestId is NOT passed here — handleRunAction generates a fresh one itself.
          const result = await onRunActionRef.current('endRun', vol.volunteerId, {
            penalties: 0,
            giveUp: true,
            autoExpired: true,
          });

          if (result && result.ok === false) {
            console.warn(
              `[useRunExpiry] endRun auto-transition FAILED for ${logLabel}: ${result.reason || result.message}`
            );
          } else {
            console.info(
              `[useRunExpiry] PLAYING → RESTING transition OK for ${logLabel}.`
            );
          }
        } catch (err) {
          // Log but never throw — a network hiccup on the auto-call must not crash the UI.
          // The next roster poll will catch the still-playing volunteer and the hook will
          // attempt again (the key will still be in triggeredRef, but the volunteer will no
          // longer appear in volunteers once the run truly ends server-side).
          console.error(
            `[useRunExpiry] endRun auto-transition threw for ${logLabel}: ${err && err.message}`
          );
          // Remove from triggered set so a later re-mount (e.g. page visibility change) can retry.
          triggeredRef.current.delete(runKey);
        }
      }

      if (msUntilExpiry <= 0) {
        // Run has already expired (page reload / tab reconnection). Fire synchronously inside a
        // microtask so we don't block the effect setup, but still before the next paint.
        Promise.resolve().then(() => triggerExpiry(volunteer, key, true));
      } else {
        // Schedule the auto-expiry to fire exactly when the run clock hits zero.
        const handle = setTimeout(
          () => triggerExpiry(volunteer, key, false),
          msUntilExpiry
        );
        timersRef.current.set(key, handle);
        console.debug(
          `[useRunExpiry] Armed expiry timer for ${volunteer.name} (#${volunteer.volunteerNumber}) ` +
          `in ${Math.round(msUntilExpiry / 1000)}s (runId=${run.runId}).`
        );
      }
    }

    // Cleanup: clear every timer we just armed when volunteers changes or on unmount.
    return () => {
      timersRef.current.forEach((handle) => clearTimeout(handle));
      timersRef.current.clear();
    };
    // Intentionally depends on volunteers (the roster source of truth) and nothing else.
    // onRunAction is accessed via onRunActionRef so a re-render of ControlCenter that produces a
    // new function reference doesn't cancel+re-arm all timers every second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volunteers]);
}
