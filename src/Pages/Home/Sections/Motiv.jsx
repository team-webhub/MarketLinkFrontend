import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Motiv.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: '01',
    label: 'Find Your Market',
    text: 'Search by location or day to discover nearby farmer markets and live pickup windows.',
    icon: 'fa-location-dot',
  },
  {
    id: '02',
    label: 'Pre-Order Fresh Stock',
    text: 'Add items from weekly inventory to your basket before market hours close for pickup.',
    icon: 'fa-basket-shopping',
  },
  {
    id: '03',
    label: 'Pick Up & Pay',
    text: 'Visit the stall, collect your order, and pay securely at pickup with cash or digital options.',
    icon: 'fa-wallet',
  },
];

function Motiv() {
  const sectionRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        row1Ref.current,
        { x: -80 },
        {
          x: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        row2Ref.current,
        { x: 80 },
        {
          x: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        row3Ref.current,
        { x: -80 },
        {
          x: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      gsap.to('.motiv-icon-spin', {
        rotate: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.motiv-icon-pulse', {
        scale: 1.2,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="motiv-section">
      <div className="motiv-container">
        <div className="motiv-intro">
          <span className="motiv-kicker">— HOW IT WORKS</span>
          <h2 className="motiv-intro-title">A simpler way to buy from local farms.</h2>
        </div>

        <div ref={row1Ref} className="motiv-row row-1" data-cursor-text="MARKETS">
          <div className="motiv-label-box">
            <i className="fa-solid fa-seedling motiv-icon-spin green-icon"></i>
            <span className="motiv-sublabel">STEP 01</span>
          </div>
          <div className="motiv-card-copy">
            <h3 className="motiv-title motiv-black">{steps[0].label}</h3>
            <p>{steps[0].text}</p>
          </div>
        </div>

        <div ref={row2Ref} className="motiv-row row-2" data-cursor-text="PREORDER">
          <div className="motiv-card-copy align-right">
            <h3 className="motiv-title motiv-green-italic">{steps[1].label}</h3>
            <p>{steps[1].text}</p>
          </div>
          <div className="motiv-label-box">
            <span className="motiv-sublabel">STEP 02</span>
            <i className="fa-solid fa-basket-shopping motiv-icon-pulse green-icon"></i>
          </div>
        </div>

        <div ref={row3Ref} className="motiv-row row-3" data-cursor-text="PICKUP">
          <div className="motiv-label-box">
            <i className="fa-solid fa-wallet motiv-icon-pulse green-icon"></i>
            <span className="motiv-sublabel">STEP 03</span>
          </div>
          <div className="motiv-card-copy">
            <h3 className="motiv-title motiv-outline">{steps[2].label}</h3>
            <p>{steps[2].text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Motiv;