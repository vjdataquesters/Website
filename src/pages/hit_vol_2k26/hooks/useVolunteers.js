// src/pages/hit_vol_2k26/hooks/useVolunteers.js
//
// Polls sheetsApi.getVolunteers() on a jittered interval (faster while the Control Center tab is
// visible, slower/jittered while hidden — see plan §H on the Apps Script 30-simultaneous-execution
// ceiling, and rosterLogic.pickPollDelayMs which this schedules through). React state here is a UI
// CACHE only — the Sheet, reached through sheetsApi, is the only source of truth; nothing here is
// ever written to localStorage or trusted across a reload without being re-fetched.
//
// Once the roster has loaded successfully at least once, a later poll failure does NOT blank the
// UI back to a loading/error screen — the last-known roster keeps showing, and `pollError` is set
// so the caller can surface a small "having trouble reaching the server" indicator instead of
// yanking away data the operator was just looking at.

import { useCallback, useEffect, useRef, useState } from 'react';
import { sheetsApi as defaultSheetsApi } from '../services/sheetsApi.js';
import { pickPollDelayMs } from '../services/rosterLogic.js';
import { POLL_INTERVAL_MS } from '../../../data/hit_vol_2k26/config.js';

export function useVolunteers({ client = defaultSheetsApi } = {}) {
  const [volunteers, setVolunteers] = useState([]);
  const [usedTeamNames, setUsedTeamNames] = useState(new Set());
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [pollError, setPollError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const timeoutRef = useRef(null);
  const mountedRef = useRef(false);
  const hasDataRef = useRef(false);
  // Holds the latest poll() so scheduleNext always calls the current version, not a stale closure
  // captured when the effect first ran — this is what lets scheduleNext have an empty dep array.
  const pollRef = useRef(async () => {});

  const scheduleNext = useCallback(() => {
    if (!mountedRef.current) return;
    const isVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    const delay = pickPollDelayMs(POLL_INTERVAL_MS, isVisible);
    timeoutRef.current = setTimeout(() => pollRef.current(), delay);
  }, []);

  const poll = useCallback(async () => {
    if (!client) {
      setStatus('error');
      setPollError('HIT Volunteer Control Center is not configured (missing VITE_HIT_VOL_2K26_API_URL).');
      return;
    }
    try {
      const result = await client.getVolunteers();
      if (!mountedRef.current) return;
      if (result.ok) {
        setVolunteers(result.volunteers || []);
        setUsedTeamNames(new Set(result.usedTeamNames || []));
        setStatus('ready');
        setPollError(null);
        setLastUpdatedAt(Date.now());
        hasDataRef.current = true;
      } else {
        const message = result.message || result.reason || 'Could not load volunteers.';
        setPollError(message);
        if (!hasDataRef.current) setStatus('error');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = (err && err.message) || 'Could not reach the server.';
      setPollError(message);
      if (!hasDataRef.current) setStatus('error');
    } finally {
      if (mountedRef.current) scheduleNext();
    }
  }, [client, scheduleNext]);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  /** Cancels any pending scheduled poll and polls immediately — for a manual "Retry" button. */
  const refresh = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollRef.current();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    pollRef.current();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // Intentionally runs once on mount — polling re-schedules itself via pollRef/scheduleNext,
    // not by re-running this effect.
  }, []);

  return { volunteers, usedTeamNames, status, pollError, lastUpdatedAt, refresh };
}
