import React from 'react';

const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="row" style={{ justifyContent: 'center', padding: 16 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.2"/>
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
    <span style={{ marginLeft: 8 }}>{label}</span>
  </div>
);

export default LoadingSpinner;
