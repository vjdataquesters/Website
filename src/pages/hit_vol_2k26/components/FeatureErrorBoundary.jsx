// src/pages/hit_vol_2k26/components/FeatureErrorBoundary.jsx
//
// Wraps ControlCenter so an unexpected render error during a live event shows a recoverable message
// instead of a blank white screen. Deliberately generic and simple: it never touches the network or
// any hit_vol_2k26 state, so it can't itself be the thing that's broken.
// A React error boundary MUST be a class component — there is no hooks equivalent.

import { Component } from 'react';
import PropTypes from 'prop-types';

export default class FeatureErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('hit_vol_2k26 feature crashed:', error, info && info.componentStack);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-sm p-6 text-center">
          <p className="mb-3 text-lg font-semibold text-rose-700">Something went wrong.</p>
          <p className="mb-4 text-sm text-slate-600">
            Your data is safe on the server — nothing here is stored only on this screen. Reloading will recover it.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

FeatureErrorBoundary.propTypes = {
  children: PropTypes.node,
};
