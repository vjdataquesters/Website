// src/pages/hit_vol_2k26/hooks/useRun.js
//
// Polls sheetsApi.getRun(volunteerId) for the Volunteer page — the lighter, per-volunteer sibling
// of useVolunteers.js's roster poll (see services/runLogic.js's file header for why the Volunteer
// page deliberately does NOT reuse getVolunteers). Same "keep showing stale data on a transient
// poll failure" behaviour as useVolunteers, and the same UI-cache-only discipline: nothing here is
// ever the source of truth, it is always re-derived from what the server just said.

import { useCallback, useEffect, useRef, useState } from 'react';
import { sheetsApi as defaultSheetsApi } from '../services/sheetsApi.js';
import { pickPollDelayMs } from '../services/rosterLogic.js';
import { POLL_INTERVAL_MS } from '../../../data/hit_vol_2k26/config.js';

export function useRun(volunteerId, { client = defaultSheetsApi } = {}) {
  const [run, setRun] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [pollError, setPollError] = useState(null);

  const timeoutRef = useRef(null);
  const mountedRef = useRef(false);
  const hasDataRef = useRef(false);
  const pollRef = useRef(async () => {});
  // Bumped by setRunDirectly. A poll that was already in flight when a mutation (e.g. LOG PENALTY)
  // applied its own authoritative response must not later overwrite that fresher state with the
  // stale pre-mutation data it started fetching before the write happened — without this guard, a
  // slow getRun response landing after setRunDirectly could silently revert a just-logged penalty
  // (or a just-started/ended run) back to what the server said a moment earlier. Each poll captures
  // the generation it started with and only applies its result if nothing fresher has landed since.
  const generationRef = useRef(0);

  const scheduleNext = useCallback(() => {
    if (!mountedRef.current) return;
    const isVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    const delay = pickPollDelayMs(POLL_INTERVAL_MS, isVisible);
    timeoutRef.current = setTimeout(() => pollRef.current(), delay);
  }, []);

  const poll = useCallback(async () => {
    if (!client || !volunteerId) {
      setStatus('error');
      setPollError(!volunteerId ? 'No volunteer identified yet.' : 'Not configured.');
      return;
    }
    const myGeneration = generationRef.current;
    try {
      const result = await client.getRun(volunteerId);
      if (!mountedRef.current) return;
      if (result.ok) {
        // A mutation (setRunDirectly) applied a newer authoritative state while this request was
        // in flight — this response is stale, discard it rather than clobbering that fresher state.
        if (generationRef.current !== myGeneration) return;
        setRun(result.run || null);
        setStatus('ready');
        setPollError(null);
        hasDataRef.current = true;
      } else {
        setPollError(result.message || result.reason || 'Could not load your run.');
        if (!hasDataRef.current) setStatus('error');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setPollError((err && err.message) || 'Could not reach the server.');
      if (!hasDataRef.current) setStatus('error');
    } finally {
      if (mountedRef.current) scheduleNext();
    }
  }, [client, volunteerId, scheduleNext]);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  const refresh = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollRef.current();
  }, []);

  /** Lets a mutation handler apply its own authoritative response immediately, instead of waiting
   *  for the next poll — this is what makes START/PENALTY/END feel instant. Also bumps the
   *  generation counter so any poll already in flight when this fires discards its (now-stale)
   *  result instead of overwriting this with older data — see generationRef above. */
  const setRunDirectly = useCallback((nextRun) => {
    generationRef.current += 1;
    setRun(nextRun);
    hasDataRef.current = true;
    setStatus('ready');
    setPollError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    hasDataRef.current = false;
    setStatus('loading');
    pollRef.current();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // Re-runs when volunteerId changes (e.g. "Not you?" switches identity mid-session).
  }, [volunteerId]);

  return { run, status, pollError, refresh, setRunDirectly };
}
