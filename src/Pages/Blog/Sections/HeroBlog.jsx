import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import favicon from '../../../assets/Images/favcion.png';
import '../Styles/HeroBlog.css';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

function HeroBlog() {
  const sectionRef = useRef(null);
  const topBarRef = useRef(null);
  const bgRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const btnRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      // 1. Top Bar Reveal
      tl.fromTo(
        topBarRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );

      // 2. Badge Reveal
      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // 3. Staggered Line-by-Line Heading Reveal
      const lines = headingRef.current.querySelectorAll('.heading-line');
      tl.fromTo(
        lines,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        '-=0.4'
      );

      // 4. CTA Button & Description Staggered Reveal
      tl.fromTo(
        btnRef.current,
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        '-=0.5'
      );

      tl.fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );

      // Smooth Parallax Scroll Effect on Background Image
      gsap.to(bgRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hb-section">
      {/* Background Parallax Image */}
      <div ref={bgRef} className="hb-bg-image"></div>
      <div className="hb-dark-overlay"></div>

      {/* Top Navigation / Header Bar */}
      <div ref={topBarRef} className="hb-top-bar">
        <Link to="/" className="hero-brand-logo" data-cursor-text="HOME">
          <img src={favicon} alt="MarketLink" className="hero-brand-mark" />
        </Link>

        <a href="#newsletter" className="hb-top-cta" data-cursor-text="JOURNAL">
          LATEST ARTICLES
        </a>
      </div>

      {/* Main Content Layout */}
      <div className="hb-container">
        <div className="hb-content-grid">

          {/* Left Column: Badge, Line-Masked Heading & Button */}
          <div className="hb-left-col">
            <span ref={badgeRef} className="hb-badge">— MARKETLINK JOURNAL</span>

            <h1 ref={headingRef} className="hb-heading">
              <span className="heading-line-wrap">
                <span className="heading-line">HARVEST INSIGHTS</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line hb-green-text">& FARMING</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line hb-green-text">STORIES.</span>
              </span>
            </h1>

            <a ref={btnRef} href="#newsletter" className="hb-btn">
              EXPLORE ARTICLES
            </a>
          </div>

          {/* Right Column: Narrative / Ethos */}
          <div className="hb-right-col">
            <p ref={descRef} className="hb-description">
              Explore deep dives into direct-to-market agriculture, cold-chain logistics innovations, market stall management trends, and real stories empowering local independent growers.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroBlog;