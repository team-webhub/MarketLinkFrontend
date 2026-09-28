import React, { useState, useEffect } from 'react';
import favicon from '../assets/Images/favcion.png';
import './Loader.css';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 100;
        }
        // Smooth random increment for dynamic feel
        const increment = Math.floor(Math.random() * 10) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loader-screen">
      {/* Top Bar: Brand Name & Status */}
      <div className="loader-topbar">
        <img
          src={favicon}
          alt="MarketLink"
          className="loader-logo"
        />
        <span className="loader-status">
          SYSTEM INITIALIZING
        </span>
      </div>

      {/* Middle: Big Counter Number */}
      <div className="loader-counter-wrap">
        <div className="loader-counter-line">
          <span className="loader-counter">
            {String(progress).padStart(2, '0')}
          </span>
          <span className="loader-percent">
            %
          </span>
        </div>
      </div>

      {/* Bottom: Sharp Progress Bar & Detail */}
      <div className="loader-bottom">
        {/* Progress Container (Sharp Box - No Border Radius) */}
        <div className="loader-progress-track">
          <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="loader-progress-meta">
          <span>
            LOADING ASSETS...
          </span>
          <span>
            {progress === 100 ? 'READY' : 'PLEASE WAIT'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loader;