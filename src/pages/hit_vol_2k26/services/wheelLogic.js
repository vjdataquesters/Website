// src/pages/hit_vol_2k26/services/wheelLogic.js
//
// Pure decision logic for the Assignment Wheel, kept separate from AssignmentWheel.jsx so the
// parts that matter most to get right — who counts as eligible, whether a team name is already
// taken, and the actual random pick — are unit-testable and don't depend on the spin animation or
// any React state machine.
//
// FAIRNESS: pickRandomVolunteer treats the eligible pool as one flat list and picks uniformly at
// random from it — equal odds PER VOLUNTEER, not per-colour-first (a volunteer in a colour with
// more currently-available people has exactly the same chance as one in a colour with fewer). This
// matches the confirmed decision during planning; see the statistical test in
// tests/wheelLogic.test.mjs for empirical proof this holds, not just a design note.
//
// pickWeightedVolunteer is the one actually used for the live "Spin" pick (AssignmentWheel.jsx) —
// same flat-pool idea, but a volunteer whose (colour, path) group was used within the last
// PATH_RECENCY_WINDOW_MS gets a reduced chance, so back-to-back teams don't keep landing on the same
// physical route. pickRandomVolunteer is kept as-is (and still used for the cosmetic spin-cycle
// display) and is exactly what pickWeightedVolunteer degrades to once no path has been used recently.
//
// The actual commit (assignTeam) always re-validates both of these checks server-side, under the
// lock, at write time (see Code.gs's assignTeam_) — this module's checks are an instant client-side
// hint only, so the operator doesn't spin against someone who's obviously already gone, but they
// are NOT the source of truth and the UI must still handle the server saying otherwise.

import { normalizeTeamName } from './statusLogic.js';
import { deriveLiveStatus } from './rosterLogic.js';
import { COOLDOWN_MINUTES, PATH_RECENCY_WINDOW_MS, MIN_PATH_WEIGHT } from '../../../data/hit_vol_2k26/config.js';

/**
 * @param {object[]} volunteers roster rows (getVolunteers_ shape)
 * @param {number} nowMs
 * @returns {object[]} volunteers currently AVAILABLE, recomputed live (not trusting a stale poll)
 */
export function getEligibleVolunteers(volunteers, nowMs) {
  return volunteers.filter((v) => deriveLiveStatus(v, nowMs) === 'AVAILABLE');
}

/**
 * @param {string} teamName
 * @param {Set<string>|string[]} usedTeamNames normalized team names already used (from
 *   getVolunteers_'s `usedTeamNames`)
 */
export function isTeamNameTaken(teamName, usedTeamNames) {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return false;
  const set = usedTeamNames instanceof Set ? usedTeamNames : new Set(usedTeamNames || []);
  return set.has(normalized);
}

/**
 * Uniformly picks one volunteer from the eligible pool. `randomFn` is injectable so tests can
 * assert both specific indices (deterministic) and the overall distribution (statistical).
 * @param {object[]} eligibleVolunteers
 * @param {() => number} [randomFn] returns a value in [0, 1)
 * @returns {object|null} null when the pool is empty
 */
export function pickRandomVolunteer(eligibleVolunteers, randomFn = Math.random) {
  if (!eligibleVolunteers.length) return null;
  const index = Math.min(Math.floor(randomFn() * eligibleVolunteers.length), eligibleVolunteers.length - 1);
  return eligibleVolunteers[index];
}

function pathKey(colour, path) {
  return `${colour}::${path}`;
}

/**
 * Derives, for every (colour, path) group present in `volunteers`, the most recent moment any
 * volunteer in that group was in active use: a run in progress (activeRun.startedAt) or a just-
 * ended run still cooling down (cooldownEnd minus the cooldown length, i.e. the actual moment that
 * run ended). This is pure derived state, same as the rest of the feature — no new Sheet field, just
 * fields getVolunteers_ already returns — and it keeps working even once a volunteer flips back to
 * AVAILABLE, since cooldownEnd isn't cleared on that transition, only overwritten by their next run.
 * A group with no such signal at all (never played this session) is left out of the map entirely —
 * see pickWeightedVolunteer's use of it, treated as "never recently used" (full weight).
 * @param {object[]} volunteers roster rows (getVolunteers_ shape)
 * @returns {Map<string, number>} pathKey(colour, path) -> lastActivityMs
 */
export function computePathLastActivity(volunteers) {
  const lastActivity = new Map();
  for (const v of volunteers) {
    let activityMs = NaN;
    if (v.activeRun && v.activeRun.startedAt) {
      activityMs = Number(v.activeRun.startedAt);
    } else if (v.cooldownEnd) {
      const cooldownEndMs = Number(v.cooldownEnd);
      if (Number.isFinite(cooldownEndMs)) activityMs = cooldownEndMs - COOLDOWN_MINUTES * 60 * 1000;
    }
    if (!Number.isFinite(activityMs)) continue;
    const key = pathKey(v.colour, v.path);
    const existing = lastActivity.get(key);
    if (existing === undefined || activityMs > existing) lastActivity.set(key, activityMs);
  }
  return lastActivity;
}

/**
 * Converts "how long ago was this path last used" into a selection weight in [minWeight, 1] — 1 once
 * `windowMs` has fully elapsed (or the path has never been used: `lastActivityMs` not finite),
 * decaying linearly down to `minWeight` right at the moment of use. Exported on its own (rather than
 * folded into pickWeightedVolunteer) so the decay curve itself is directly unit-testable.
 * @param {number} lastActivityMs epoch ms, or a non-finite value meaning "never used"
 * @param {number} nowMs
 * @param {number} [windowMs]
 * @param {number} [minWeight]
 */
export function computePathWeight(lastActivityMs, nowMs, windowMs = PATH_RECENCY_WINDOW_MS, minWeight = MIN_PATH_WEIGHT) {
  if (!Number.isFinite(lastActivityMs)) return 1;
  const elapsed = Math.max(0, nowMs - lastActivityMs); // clamp negative (clock skew) to "just now"
  if (elapsed >= windowMs) return 1;
  const ratio = elapsed / windowMs; // 0 (just used) .. 1 (window fully elapsed)
  return minWeight + ratio * (1 - minWeight);
}

/**
 * Weighted random choice over `items`/`weights` (same length, positional). All-zero weights fall
 * back to a uniform pick rather than returning null, as a defensive last resort — shouldn't happen
 * here since computePathWeight's floor is never zero, but a pick should still happen even if it did.
 */
function weightedPick(items, weights, randomFn) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return items[Math.min(Math.floor(randomFn() * items.length), items.length - 1)];
  let r = randomFn() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1]; // floating-point rounding fallback
}

/**
 * Same contract as pickRandomVolunteer, but volunteers on a (colour, path) group used within
 * PATH_RECENCY_WINDOW_MS get a reduced — never zero — chance, so the wheel naturally spreads
 * assignments across paths over time instead of clumping the same walking route back-to-back. A
 * SOFT bias rather than a hard cooldown, deliberately: see PATH_RECENCY_WINDOW_MS's comment for why a
 * hard exclusion risks the wheel having nothing left to pick.
 *
 * `allVolunteers` (not just the eligible pool) is what path recency is derived from — a path someone
 * is CURRENTLY playing on is exactly the "just used" case this exists to catch, even though that
 * specific volunteer isn't in the eligible pool themselves; their path-mates who ARE eligible should
 * still be deprioritized.
 * @param {object[]} eligibleVolunteers pool to actually pick from (getEligibleVolunteers's output)
 * @param {object[]} allVolunteers the full roster, used only to derive path recency
 * @param {number} nowMs
 * @param {() => number} [randomFn] returns a value in [0, 1)
 * @returns {object|null} null when the pool is empty
 */
export function pickWeightedVolunteer(eligibleVolunteers, allVolunteers, nowMs, randomFn = Math.random) {
  if (!eligibleVolunteers.length) return null;
  const lastActivity = computePathLastActivity(allVolunteers);
  const weights = eligibleVolunteers.map((v) => computePathWeight(lastActivity.get(pathKey(v.colour, v.path)), nowMs));
  return weightedPick(eligibleVolunteers, weights, randomFn);
}

/**
 * The client-side pre-check run before starting a spin — instant feedback only; the server is
 * always re-checked at commit time regardless of what this returns.
 * @returns {{ok:true}|{ok:false, reason:'EMPTY_TEAM_NAME'|'TEAM_ALREADY_PLAYED'|'NO_ELIGIBLE_VOLUNTEERS'}}
 */
export function canSpin(teamName, usedTeamNames, eligibleVolunteers) {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return { ok: false, reason: 'EMPTY_TEAM_NAME' };
  if (isTeamNameTaken(teamName, usedTeamNames)) return { ok: false, reason: 'TEAM_ALREADY_PLAYED' };
  if (!eligibleVolunteers.length) return { ok: false, reason: 'NO_ELIGIBLE_VOLUNTEERS' };
  return { ok: true };
}
