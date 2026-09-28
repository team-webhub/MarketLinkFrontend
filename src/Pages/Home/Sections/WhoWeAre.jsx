import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/WhoWeAre.css';

gsap.registerPlugin(ScrollTrigger);

// Core pillars matching MarketLink SRS
const tags = [
  'COMMUNITY-FIRST',
  'FARM-FRESH',
  'SUSTAINABLE',
  'MAP-ENABLED',
  'DIRECT-PICKUP',
];

function WhoWeAre() {
  const sectionRef = useRef(null);
  const imageBoxRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal on scroll
      gsap.fromTo(
        imageBoxRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      // Text elements stagger animation
      gsap.fromTo(
        '.whoweare-anim',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="whoweare-section" data-cursor-text="ABOUT">
      <div className="whoweare-container">
        {/* Left Image Column */}
        <div ref={imageBoxRef} className="whoweare-image-col">
          <div className="whoweare-img-wrapper">
            <img
              src="https://i.pinimg.com/1200x/24/95/49/249549a6bb3395793bf0d1204dd1d03e.jpg"
              alt="MarketLink Farmers Market"
              className="whoweare-img"
            />
            {/* Green Counter Badge */}
            <div className="whoweare-badge">
              <span className="badge-number">100%</span>
              <span className="badge-text">FRESH & LOCAL</span>
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div ref={contentRef} className="whoweare-content-col">
          {/* Sublabel */}
          <div className="whoweare-sublabel whoweare-anim">
            <span className="sublabel-dash">—</span> WHO WE ARE
          </div>

          {/* Main Heading */}
          <h2 className="whoweare-heading whoweare-anim">
            WE ARE<br />
            MARKETLINK.
          </h2>

          {/* Key Statement Paragraph */}
          <p className="whoweare-intro whoweare-anim">
            <strong>MarketLink</strong> is an eGreen Basket platform connecting local farmers directly with conscious consumers.
          </p>

          {/* Descriptive Body Paragraphs */}
          <p className="whoweare-body whoweare-anim">
            We bridge the gap between local growers and shoppers, making weekly harvest inventory, fair pricing, and pickup windows transparently accessible.
          </p>

          <p className="whoweare-body whoweare-anim">
            By integrating map-based stall location discovery and pre-ordering, we help farmers eliminate waste while giving customers a predictable, fresh shopping experience.
          </p>

          {/* Upgraded Tag Pills Container */}
          <div className="whoweare-tags whoweare-anim">
            {tags.map((tag, index) => (
              <span key={index} className="whoweare-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhoWeAre;