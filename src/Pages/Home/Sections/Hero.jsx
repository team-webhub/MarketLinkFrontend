import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import gsap from 'gsap';
import favicon from '../../../assets/Images/favcion.png';
import '../Styles/Hero.css';

function Hero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const btnGroupRef = useRef(null);
  const topBarRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top Bar Entrance Animation
      gsap.fromTo(
        topBarRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );

      // Entrance animation for heading text lines
      gsap.fromTo(
        '.hero-line',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: 'power4.out',
          delay: 0.3,
        }
      );

      // Entrance animation for bottom CTA buttons
      gsap.fromTo(
        btnGroupRef.current,
        { y: 40, opacity: 0, xPercent: -50 },
        {
          y: 0,
          opacity: 1,
          xPercent: -50,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.8,
        }
      );

      // Entrance animation for Marquee
      gsap.fromTo(
        marqueeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const marqueeItems = [
    'CAMPAIGN DIRECTION',
    'VISUAL SYSTEMS',
    'BRAND IDENTITY',
    'CREATIVE DIRECTION',
    'DIGITAL DESIGN',
    'CONTENT PRODUCTION',
  ];

  return (
    <section ref={heroRef} className="hero-section">
      {/* Background Video */}
      <div className="hero-video-wrapper">
        <video autoPlay loop muted playsInline className="hero-bg-video">
          <source src="./demoVideo.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" />
      </div>

      {/* Top Navigation Bar inside Hero */}
      <div ref={topBarRef} className="hero-top-bar">
        <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
          <img src={favicon} alt="MarketLink" className="hero-brand-mark" />
        </a>

        <a href="#contact" className="hero-top-cta" data-cursor-text="TALK">
          START A CONVERSATION
        </a>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <h1 ref={textRef} className="hero-heading" data-cursor-text="LIRCLE">
          <span className="hero-line block-white">FARM-FRESH</span>
          <span className="hero-line block-green">PRODUCT</span>
          <span className="hero-line block-white">TO YOUR BASKET</span>
        </h1>
      </div>

      {/* Bottom CTA Buttons */}
      <div ref={btnGroupRef} className="hero-btn-group">
        <Link to="/markets" className="hero-btn btn-primary" data-cursor-text="EXPLORE">
          Explore Nearby Markets <i className="fa fa-arrow-right" aria-hidden="true"></i>
        </Link>
        <Link to="/services" className="hero-btn btn-secondary" data-cursor-text="BROWSE">
          Browse Fresh Harvest
        </Link>
      </div>

      {/* Infinite Marquee Bar */}
      <div ref={marqueeRef} className="hero-marquee" data-cursor-text="SERVICES">
        <div className="marquee-track">
          <div className="marquee-content">
            {marqueeItems.map((item, index) => (
              <React.Fragment key={index}>
                <span className="marquee-item">{item}</span>
                <span className="marquee-dot">•</span>
              </React.Fragment>
            ))}
          </div>

          {/* Duplicate set for seamless looping */}
          <div className="marquee-content" aria-hidden="true">
            {marqueeItems.map((item, index) => (
              <React.Fragment key={`dup-${index}`}>
                <span className="marquee-item">{item}</span>
                <span className="marquee-dot">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;