import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'profile';
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'table', rows = 5 }) => {
  if (type === 'profile') {
    return (
      <div className="skeleton-container">
        <div className="skeleton-row">
          <div className="skeleton-line avatar"></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton-line medium thick"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: rows }).map((_, i) => (
          <div className="skeleton-line card" key={i}></div>
        ))}
      </div>
    );
  }

  // Default: table
  return (
    <div className="skeleton-container">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-table-row" key={i}>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
