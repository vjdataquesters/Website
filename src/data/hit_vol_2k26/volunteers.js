// src/data/hit_vol_2k26/volunteers.js
//
// PLACEHOLDER ROSTER — replace the `name` field for all 45 entries before the live event.
// Names below are obviously fake ("Red Path 1 - Volunteer A") on purpose, so nobody mistakes
// this for real data. Everything else (volunteerId, volunteerNumber, colour, path) is the
// permanent structural identity and should NOT change once the Google Sheet is seeded from
// this file, because runs reference volunteers by volunteerId.
//
// This file is also the ONE seeding source: paste its JSON shape into the "Volunteers" tab
// of the Google Sheet when setting it up (see the final report / apps-script/hit_vol_2k26/Code.gs
// header comment for the exact column order).

import { COLOURS, PATHS_PER_COLOUR, VOLUNTEERS_PER_PATH, TOTAL_VOLUNTEERS } from './config.js';

const SLOT_LETTERS = ['A', 'B', 'C'];

function buildRoster() {
  const roster = [];
  let volunteerNumber = 1;

  for (const colour of COLOURS) {
    const colourLabel = colour.charAt(0).toUpperCase() + colour.slice(1);
    for (let path = 1; path <= PATHS_PER_COLOUR; path++) {
      for (let slot = 1; slot <= VOLUNTEERS_PER_PATH; slot++) {
        const slotLetter = SLOT_LETTERS[slot - 1];
        const volunteerId = `${colour.toUpperCase()}-${path}-${String(slot).padStart(2, '0')}`;
        roster.push({
          volunteerId,
          volunteerNumber,
          name: `${colourLabel} Path ${path} - Volunteer ${slotLetter}`,
          colour,
          path,
          // Source-of-truth state fields (mirrors the Volunteers sheet columns exactly).
          // These are the seed/default values only — once the sheet exists, the sheet is
          // authoritative and this file is never read again at runtime.
          manuallyAvailable: true,
          activeRunId: '',
          cooldownEnd: '',
        });
        volunteerNumber += 1;
      }
    }
  }

  return roster;
}

export const VOLUNTEERS_SEED = buildRoster();

if (VOLUNTEERS_SEED.length !== TOTAL_VOLUNTEERS) {
  // Fails loudly at import time rather than silently seeding a short roster.
  throw new Error(
    `hit_vol_2k26: expected ${TOTAL_VOLUNTEERS} volunteers, built ${VOLUNTEERS_SEED.length} — check config.js counts.`
  );
}

export default VOLUNTEERS_SEED;
