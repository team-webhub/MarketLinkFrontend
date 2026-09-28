import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Collaborators.css';

gsap.registerPlugin(ScrollTrigger);

// Local Farms & Market Partners matching MarketLink SRS
const partnersData = [
  {
    id: 1,
    name: 'Green Valley Farms',
    category: 'Organic Vegetables',
    image: 'https://i.pinimg.com/1200x/89/29/2e/89292e3c67cb19487f485155272340af.jpg',
  },
  {
    id: 2,
    name: 'Sunrise Orchards',
    category: 'Fresh Fruits',
    image: 'https://i.pinimg.com/1200x/1b/a7/63/1ba763572c4524b3f0991f829294acea.jpg',
  },
  {
    id: 3,
    name: 'Valley Dairy Collective',
    category: 'Pure Dairy & Eggs',
    image: 'https://i.pinimg.com/736x/2c/b1/78/2cb178c016645ad0901564dcfeccc77a.jpg',
  },
  {
    id: 4,
    name: 'Central Farmers Market',
    category: 'Regional Hub',
    image: 'https://i.pinimg.com/1200x/7d/15/f3/7d15f3adc9db4441af07044017cc9aeb.jpg',
  },
  {
    id: 5,
    name: 'Artisan Harvest Co.',
    category: 'Bakery & Honey',
    image: 'https://i.pinimg.com/1200x/48/99/a7/4899a7a094caeba19d1c2d92a6040fca.jpg',
  },
];

const statsData = [
  { target: 150, suffix: '+', label: 'VERIFIED FARMERS' },
  { target: 25, suffix: '+', label: 'LOCAL MARKETS' },
  { target: 500, suffix: '+', label: 'WEEKLY PRE-ORDERS' },
  { target: 100, suffix: '%', label: 'DIRECT PICKUP' },
];

function Collaborators() {
  const sectionRef = useRef(null);
  const imageCardsRef = useRef([]);
  const statRefs = useRef([]);
  const [activePartnerIndex, setActivePartnerIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = imageCardsRef.current.filter(Boolean);
      const totalSlides = partnersData.length;

      // Pin section & control scroll-driven image stacking + active list item
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalSlides * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              totalSlides - 1,
              Math.floor(self.progress * totalSlides)
            );
            setActivePartnerIndex(idx);
          },
        },
      });

      // Animate stacked cards coming up one over another
      cards.forEach((card, index) => {
        if (index > 0) {
          tl.fromTo(
            card,
            { yPercent: 100 },
            { yPercent: 0, ease: 'none' },
            `step-${index}`
          );
        }
      });

      // Stats Count-up Trigger
      statRefs.current.forEach((el, idx) => {
        if (!el) return;
        const target = statsData[idx].target;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.collaborators-stats-bar',
            start: 'top 90%',
          },
          onUpdate: () => {
            el.innerText = `${Math.floor(obj.val)}${statsData[idx].suffix}`;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="collaborators-section">
      <div className="collaborators-main-container">
        {/* Left Info Column */}
        <div className="collaborators-left-col">
          <div className="collaborators-sublabel">
            <span className="sublabel-dash">—</span> OUR NETWORK
          </div>

          <h2 className="collaborators-heading">
            FEATURED<br />FARMS & MARKETS
          </h2>

          <p className="collaborators-desc">
            We collaborate with registered local farmers and regional produce markets to bring transparent weekly inventory and seamless pre-orders straight to your neighborhood.
          </p>

          {/* List of Partners */}
          <div className="collaborators-list">
            {partnersData.map((item, idx) => {
              const isActive = idx === activePartnerIndex;
              return (
                <div
                  key={item.id}
                  className={`collaborator-item ${isActive ? 'active' : ''}`}
                >
                  <span className="partner-name">{item.name}</span>
                  <span className="partner-category">{item.category}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Stacked Image Showcase */}
        <div className="collaborators-right-col">
          <div className="collaborator-img-wrapper">
            {partnersData.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => (imageCardsRef.current[idx] = el)}
                className="stacked-img-card"
                style={{ zIndex: idx + 1 }}
              >
                <img src={item.image} alt={item.name} className="collaborator-img" />
              </div>
            ))}

            {/* Floating Index Counter */}
            <div className="collaborator-index-badge">
              <span className="current-slide">{activePartnerIndex + 1}</span>
              <span className="slide-divider"> / </span>
              <span className="total-slides">{partnersData.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="collaborators-stats-bar">
        {statsData.map((stat, idx) => (
          <div key={idx} className="stat-item">
            <h3
              ref={(el) => (statRefs.current[idx] = el)}
              className="stat-number"
            >
              0{stat.suffix}
            </h3>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Collaborators;