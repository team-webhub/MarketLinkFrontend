import React from 'react';
import '../Styles/Marquee.css';

// Ticker keywords aligned with MarketLink SRS platform themes
const marqueeItems = [
  'FARM FRESH PRODUCE',
  'DIRECT PRE-ORDERS',
  'INTERACTIVE MAP PICKUP',
  'WEEKLY HARVEST STOCK',
  'ZERO MIDDLEMEN',
  'SUSTAINABLE COMMUNITY',
];

// Sparkle Star SVG Icon
const SparkleIcon = () => (
  <svg
    className="marquee-svg sparkle-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 0L14.593 9.407L24 12L14.593 14.593L12 24L9.407 14.593L0 12L9.407 9.407L12 0Z"
      fill="currentColor"
    />
  </svg>
);

// Arrow SVG Icon
const ArrowIcon = () => (
  <svg
    className="marquee-svg arrow-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Marquee() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {/* Set 1 */}
        <div className="marquee-content">
          {marqueeItems.map((item, index) => (
            <div key={`set1-${index}`} className="marquee-item">
              <span className="marquee-text">{item}</span>
              {index % 2 === 0 ? <SparkleIcon /> : <ArrowIcon />}
            </div>
          ))}
        </div>

        {/* Set 2 (Seamless Infinite Loop ke liye Duplicate) */}
        <div className="marquee-content" aria-hidden="true">
          {marqueeItems.map((item, index) => (
            <div key={`set2-${index}`} className="marquee-item">
              <span className="marquee-text">{item}</span>
              {index % 2 === 0 ? <SparkleIcon /> : <ArrowIcon />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marquee;