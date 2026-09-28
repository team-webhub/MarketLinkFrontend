import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/ReadMoreService.css';

gsap.registerPlugin(ScrollTrigger);

function ReadMoreService() {
  const containerRef = useRef(null);

  // Slot Refs
  const slot1Ref = useRef(null);
  const slot2Ref = useRef(null);
  const slot3Ref = useRef(null);

  // Bracket Refs (Initialized as arrays)
  const brackets1Ref = useRef([]);
  const brackets2Ref = useRef([]);
  const brackets3Ref = useRef([]);

  // Text / Icon Refs
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slots = [
        { wrapper: slot1Ref.current, brackets: brackets1Ref.current, text: text1Ref.current },
        { wrapper: slot2Ref.current, brackets: brackets2Ref.current, text: text2Ref.current },
        { wrapper: slot3Ref.current, brackets: brackets3Ref.current, text: text3Ref.current },
      ];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 50%',
          scrub: 1,
        },
      });

      slots.forEach((slot) => {
        if (!slot.wrapper) return;

        // Dynamic width calculation
        const targetWidth = slot.wrapper.scrollWidth;

        // Stage 1: Expand width between words
        tl.fromTo(
          slot.wrapper,
          {
            width: 0,
            marginLeft: 0,
            marginRight: 0,
          },
          {
            width: targetWidth,
            marginLeft: '0.3em',
            marginRight: '0.3em',
            duration: 1,
            ease: 'power2.inOut',
          },
          0
        )
          // Stage 2: Fade & Scale in curly brackets
          .fromTo(
            slot.brackets,
            {
              opacity: 0,
              scale: 0.3,
            },
            {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
            },
            0.3
          )
          // Stage 3: Fade in inner text/icon
          .fromTo(
            slot.text,
            {
              opacity: 0,
              scale: 0.5,
              y: 5,
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
            },
            0.6
          );
      });

      // Recalculate ScrollTrigger positions
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="rms-outer-wrapper">
      <div className="rms-container">
        
        {/* Left Column Box */}
        <div className="rms-left-box">
          <div className="rms-top-content">
            <span className="rms-badge">— WHAT WE DO</span>

            <div className="rms-headline-group">
              {/* Line 1 */}
              <h1 className="rms-line">
                <span>WE</span>
                <div ref={slot1Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets1Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text1Ref} className="rms-inner-text">EMPOWER</span>
                  <span ref={(el) => (brackets1Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
                <span>EVERY</span>
              </h1>

              {/* Line 2 */}
              <h1 className="rms-line">
                <span>LOCAL HARVEST</span>
              </h1>

              {/* Line 3 */}
              <h1 className="rms-line">
                <span>FOR YOU</span>
                <div ref={slot2Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets2Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text2Ref} className="rms-inner-text">
                    <i className="fas fa-seedling fa-sm"></i>
                  </span>
                  <span ref={(el) => (brackets2Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
                <span>AND</span>
              </h1>

              {/* Line 4 */}
              <h1 className="rms-line">
                <span>YOUR MARKET</span>
                <div ref={slot3Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets3Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text3Ref} className="rms-inner-text">
                    <svg viewBox="0 0 24 24" className="rms-spiral-svg" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </span>
                  <span ref={(el) => (brackets3Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
              </h1>
            </div>
          </div>

          {/* Subtitle & CTA */}
          <div className="rms-body-group">
            <p className="rms-description">
              MarketLink bridges the gap between local farms, market organizers, and conscious consumers. From seamless stall reservations to direct pre-order fulfillment, we provide the digital infrastructure your local food ecosystem needs to flourish.
            </p>
            <a href="#about" className="rms-cta-btn">
              Discover More
            </a>
          </div>
        </div>

        {/* Right Column Image */}
        <div className="rms-right-box">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" 
            alt="Local Farmers Market" 
            className="rms-right-img" 
          />
          <div className="rms-bg-doddle">
            <img src="./bgdoddle1.png" alt="" />
          </div>
        </div>

      </div>
    </section>
  );
}

export default ReadMoreService;