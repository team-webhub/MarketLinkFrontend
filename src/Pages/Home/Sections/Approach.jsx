import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Approach.css';

gsap.registerPlugin(ScrollTrigger);

const textParagraph = [
  { text: 'Connecting ', isGreen: false },
  { text: 'local ', isGreen: false },
  { text: 'farmers ', isGreen: false },
  { text: 'directly ', isGreen: false },
  { text: 'with ', isGreen: false },
  { text: 'conscious ', isGreen: false },
  { text: 'consumers ', isGreen: false },
  { text: 'to ', isGreen: false },
  { text: 'eliminate ', isGreen: false },
  { text: 'wasted ', isGreen: false },
  { text: 'trips ', isGreen: false },
  { text: 'and ', isGreen: false },
  { text: 'bring ', isGreen: false },
  { text: 'fresh ', isGreen: false },
  { text: 'harvest ', isGreen: false },
  { text: 'straight ', isGreen: false },
  { text: 'to ', isGreen: false },
  { text: 'your ', isGreen: false },
  { text: 'basket. ', isGreen: false },
  { text: 'FARM ', isGreen: true },
  { text: 'FRESH ', isGreen: true },
  { text: 'IS ', isGreen: true },
  { text: 'OUR ', isGreen: true },
  { text: 'PROMISE. ', isGreen: true },
  { text: 'We ', isGreen: false },
  { text: 'empower ', isGreen: false },
  { text: 'local ', isGreen: false },
  { text: 'producers ', isGreen: false },
  { text: 'to ', isGreen: false },
  { text: 'publish ', isGreen: false },
  { text: 'weekly ', isGreen: false },
  { text: 'inventory, ', isGreen: false },
  { text: 'manage ', isGreen: false },
  { text: 'seamless ', isGreen: false },
  { text: 'pre-orders, ', isGreen: false },
  { text: 'and ', isGreen: false },
  { text: 'build ', isGreen: false },
  { text: 'lasting ', isGreen: false },
  { text: 'community ', isGreen: false },
  { text: 'bonds ', isGreen: false },
  { text: 'through ', isGreen: false },
  { text: 'transparent ', isGreen: false },
  { text: 'pricing ', isGreen: false },
  { text: 'and ', isGreen: false },
  { text: 'map-based ', isGreen: false },
  { text: 'pickup ', isGreen: false },
  { text: 'locations.', isGreen: false },
];

function Approach() {
  const sectionRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 35 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reveal-word:not(.text-green-highlight)',
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 40%',
            scrub: 0.8,
          },
        }
      );
    }, sectionRef);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          return { hours: 4, minutes: 12, seconds: 35 };
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => {
      ctx.revert();
      clearInterval(timer);
    };
  }, []);

  return (
    <section ref={sectionRef} className="approach-section">
      <div className="approach-container">
        <div className="approach-header">
          <span className="approach-label">OUR MISSION</span>
          <span className="approach-sublabel">BRIDGING FARMERS & COMMUNITIES</span>
        </div>

        <div className="approach-body">
          <h2 className="approach-text">
            {textParagraph.map((item, index) => (
              <span
                key={index}
                className={`reveal-word ${item.isGreen ? 'text-green-highlight' : ''}`}
              >
                {item.text}
              </span>
            ))}
          </h2>
        </div>

        <div className="approach-utility-grid">
          <div className="countdown-panel">
            <div className="utility-label">Pre-order cutoff</div>
            <div className="countdown-row">
              <span className="countdown-box">
                <strong>{String(timeLeft.hours).padStart(2, '0')}</strong>
                <small>Hrs</small>
              </span>
              <span className="countdown-box">
                <strong>{String(timeLeft.minutes).padStart(2, '0')}</strong>
                <small>Min</small>
              </span>
              <span className="countdown-box">
                <strong>{String(timeLeft.seconds).padStart(2, '0')}</strong>
                <small>Sec</small>
              </span>
            </div>
            <p>Saturday market pre-order cutoff: 4 hours left</p>
          </div>

          <div className="limited-stock-panel">
            <div className="utility-label">Limited stock</div>
            <div className="limited-stock-card">
              <span>Only 10 kg Organic Strawberries left for Saturday</span>
            </div>
          </div>

          {/* <div className="ai-panel">
            <div className="utility-label">AI assistant</div>
            <div className="ai-inner">
              <div>
                <strong>Smart Basket Helper</strong>
                <p>Ask about market timing, seasonal recipes, and fresh basket suggestions.</p>
              </div>
              <button type="button">Launch AI</button>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default Approach;