// src/pages/hit_vol_2k26/components/ConnectionBanner.jsx
//
// The "we're having trouble reaching the server" indicator for the Control Center, instead of
// hand-rolling inline banner text. Shown whenever a poll (useVolunteers) most recently failed but
// stale data is still on screen — the page never blanks itself out over a transient failure, it
// just says so quietly while it keeps trying.

import PropTypes from 'prop-types';

export default function ConnectionBanner({ message }) {
  if (!message) return null;
  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
      <span className="mx-auto block max-w-5xl">
        Connection issue — retrying… <span className="text-amber-600">({message})</span>
      </span>
    </div>
  );
}

ConnectionBanner.propTypes = {
  message: PropTypes.string,
};
