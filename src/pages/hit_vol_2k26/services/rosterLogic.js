// src/pages/hit_vol_2k26/services/rosterLogic.js
//
// Pure, framework-free helpers for the Control Center roster view. Kept separate from the
// VolunteerRoster/ActiveRunCard/RosterRow components so the actual logic (grouping, sorting, live status
// between polls, poll-interval jitter) is unit-testable with node:test the same way statusLogic.js
// is, instead of only being exercisable through a rendered React tree.
//
// A quick note on WHY the client re-derives status at all, given getVolunteers_ already returns a
// server-computed `status` per volunteer: that status is only as fresh as the last poll (every
// 5-20s per config.js's POLL_INTERVAL_MS). Two things need to update every second, between polls,
// without waiting on the network: a RESTING volunteer's cooldown counting down and flipping to
// AVAILABLE the instant it hits zero, and a PLAYING volunteer's elapsed timer. deriveLiveStatus
// recomputes status from the same fields getVolunteers_ already sent (manuallyAvailable,
// cooldownEnd, and whether activeRun is present) against a ticking clock, by calling straight into
// statusLogic.js's computeStatus — never re-implementing the precedence rules a second time.

import { COLOURS } from '../../../data/hit_vol_2k26/config.js';
import { computeStatus, computeElapsedSeconds } from './statusLogic.js';

/**
 * Recomputes a roster row's status against the current (server-synced) time, without waiting for
 * the next poll. Safe to call every second from a ticking display.
 * @param {object} volunteerRow one entry from getVolunteers_'s `volunteers` array
 * @param {number} nowMs
 */
export function deriveLiveStatus(volunteerRow, nowMs) {
  return computeStatus(
    {
      activeRunId: volunteerRow.activeRun ? volunteerRow.activeRun.runId : '',
      activeRunEndedAt: null,
      manuallyAvailable: volunteerRow.manuallyAvailable,
      cooldownEnd: volunteerRow.cooldownEnd || '',
    },
    nowMs
  );
}

const COLOUR_ORDER = new Map(COLOURS.map((c, i) => [c, i]));

/**
 * Stable sort for roster display: colour (in the fixed COLOURS order), then path, then
 * volunteerNumber — matches the order the roster is seeded in, so the grid reads top-to-bottom the
 * same way the Sheet does.
 */
export function sortVolunteersForDisplay(volunteers) {
  return [...volunteers].sort((a, b) => {
    const colourDiff = (COLOUR_ORDER.get(a.colour) ?? 99) - (COLOUR_ORDER.get(b.colour) ?? 99);
    if (colourDiff !== 0) return colourDiff;
    const pathDiff = Number(a.path) - Number(b.path);
    if (pathDiff !== 0) return pathDiff;
    return Number(a.volunteerNumber) - Number(b.volunteerNumber);
  });
}

/**
 * Groups a (pre-sorted, or not — this sorts internally) volunteer list into an array of
 * { colour, volunteers } sections in COLOURS order, ready for the roster to render as sections.
 */
export function groupVolunteersByColour(volunteers) {
  const sorted = sortVolunteersForDisplay(volunteers);
  const byColour = new Map(COLOURS.map((c) => [c, []]));
  for (const v of sorted) {
    if (!byColour.has(v.colour)) byColour.set(v.colour, []); // defensive: unknown colour still shows
    byColour.get(v.colour).push(v);
  }
  // Every colour section is included, even if empty (e.g. a colour with no seeded volunteers yet),
  // so the Control Center layout stays stable rather than sections appearing/disappearing.
  return COLOURS.map((colour) => ({ colour, volunteers: byColour.get(colour) }));
}

/**
 * Live counts for the roster's summary strip, recomputed against `nowMs` so it agrees with what
 * each individual roster row is showing at the same instant.
 * @returns {{AVAILABLE:number, PLAYING:number, RESTING:number, UNAVAILABLE:number, total:number}}
 */
export function summarizeRosterCounts(volunteers, nowMs) {
  const counts = { AVAILABLE: 0, PLAYING: 0, RESTING: 0, UNAVAILABLE: 0 };
  for (const v of volunteers) {
    const status = deriveLiveStatus(v, nowMs);
    if (status in counts) counts[status] += 1;
  }
  return { ...counts, total: volunteers.length };
}

/**
 * Splits the live roster into the three priority tiers the Control Center renders as separate
 * sections (see VolunteerRoster.jsx) instead of one uniform grid of 45 identical cards: runs that
 * need attention RIGHT NOW, volunteers resting who just need a glance, and everyone else (the bulk
 * of the roster — available/unavailable — rendered as a dense table rather than big cards).
 * @param {object[]} volunteers getVolunteers_'s `volunteers` array
 * @param {number} nowMs
 * @returns {{active: object[], resting: object[], roster: object[]}}
 */
export function splitRosterByPriority(volunteers, nowMs) {
  const active = [];
  const resting = [];
  const roster = [];

  for (const v of volunteers) {
    const status = deriveLiveStatus(v, nowMs);
    if (status === 'PLAYING') active.push(v);
    else if (status === 'RESTING') resting.push(v);
    else roster.push(v);
  }

  // Most time already elapsed first — the run closest to (or past) the allowed cap is the one that
  // needs the operator's attention soonest.
  active.sort((a, b) => {
    const aElapsed = computeElapsedSeconds(a.activeRun && a.activeRun.startedAt, null, nowMs);
    const bElapsed = computeElapsedSeconds(b.activeRun && b.activeRun.startedAt, null, nowMs);
    return bElapsed - aElapsed;
  });

  // Soonest-to-clear first — the volunteer about to flip back to AVAILABLE is the one worth
  // noticing; a missing cooldownEnd (shouldn't happen while RESTING) sorts last rather than crashing.
  resting.sort((a, b) => (Number(a.cooldownEnd) || Infinity) - (Number(b.cooldownEnd) || Infinity));

  return { active, resting, roster: sortVolunteersForDisplay(roster) };
}

/**
 * Filters the dense roster table by free-text search (name or volunteer number) and/or a set of
 * selected colours — both optional, both AND'd together when present. Pure and framework-free, like
 * everything else here, so RosterFilters.jsx's behaviour is unit-testable without rendering React.
 * @param {object[]} volunteers
 * @param {{query?: string, colours?: Set<string>|null}} [filters]
 */
export function filterRosterVolunteers(volunteers, { query = '', colours = null } = {}) {
  const q = String(query || '').trim().toLowerCase();
  return volunteers.filter((v) => {
    if (colours && colours.size > 0 && !colours.has(v.colour)) return false;
    if (!q) return true;
    return (
      String(v.name || '').toLowerCase().includes(q) ||
      String(v.volunteerNumber == null ? '' : v.volunteerNumber).includes(q)
    );
  });
}

/**
 * Picks the next poll delay, with random jitter, so ~45 devices polling on the same nominal
 * interval don't all land on the Apps Script execution-quota ceiling at the same instant (see plan
 * §H). `randomFn` is injectable for deterministic tests — defaults to Math.random.
 * @param {{rosterActive:number, rosterIdle:number, jitterMs:number}|{runActive:number, runIdle:number, jitterMs:number}} pollConfig
 * @param {boolean} isPageVisible
 * @param {() => number} [randomFn] returns a value in [0, 1)
 */
export function pickPollDelayMs(pollConfig, isPageVisible, randomFn = Math.random) {
  const base = isPageVisible
    ? pollConfig.rosterActive ?? pollConfig.runActive
    : pollConfig.rosterIdle ?? pollConfig.runIdle;
  const jitter = (randomFn() * 2 - 1) * pollConfig.jitterMs; // +/- jitterMs
  return Math.max(500, Math.round(base + jitter)); // never poll faster than 2x/sec no matter what
}
