import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import favicon from '../../../assets/Images/favcion.png';
import '../Styles/HeroService.css';

gsap.registerPlugin(ScrollTrigger);

function HeroProduct() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const topBarRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const btnRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      // Top Bar Reveal
      tl.fromTo(
        topBarRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );

      // Badge Reveal
      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // Staggered Line-by-Line Heading Text Reveal
      const lines = headingRef.current.querySelectorAll('.heading-line');
      tl.fromTo(
        lines,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        '-=0.4'
      );

      // CTA Button & Description Reveal
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

      // Background Parallax Scroll Effect
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
    <section ref={sectionRef} className="hp-section">
      {/* Background Image Container with Parallax */}
      <div ref={bgRef} className="hp-bg-image" />
      <div className="hp-dark-overlay" />

      {/* Top Bar */}
      <div ref={topBarRef} className="hp-top-bar">
        <Link to="/" className="hp-brand-logo" data-cursor-text="HOME">
          <img src={favicon} alt="MarketLink" className="hero-brand-mark" />
        </Link>

        <a href="#ourservices" className="hp-top-cta" data-cursor-text="CATALOG">
          EXPLORE CATALOG
        </a>
      </div>

      {/* Main Content Grid */}
      <div className="hp-container">
        <div className="hp-content-grid">
          {/* Left Column */}
          <div className="hp-left-col">
            <span ref={badgeRef} className="hp-badge">
              — SEASONAL HARVEST & ORGANIC STOCKS
            </span>

            <h1 ref={headingRef} className="hp-heading">
              <span className="heading-line-wrap">
                <span className="heading-line">FRESH ORGANIC</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line hp-green-text">PRODUCE &</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line hp-green-text">FARM HARVEST.</span>
              </span>
            </h1>

            <a ref={btnRef} href="#ourservices" className="hp-btn">
              BROWSE ALL PRODUCTS
            </a>
          </div>

          {/* Right Column */}
          <div className="hp-right-col">
            <p ref={descRef} className="hp-description">
              Explore daily fresh farm harvests, organic vegetables, seasonal fruits, and artisanal produce directly stocked by local verified farmers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroProduct;