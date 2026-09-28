import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/OurStory.css';

gsap.registerPlugin(ScrollTrigger);

const storyData = [
  {
    year: '2020',
    title: 'The Agritech Spark',
    desc: 'MarketLink was envisioned as a direct bridge connecting local farmers with city markets, cutting out unfair middlemen.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2021',
    title: 'Stall Booking Engine',
    desc: 'Launched our digital platform allowing local growers to reserve physical market stalls and manage daily stock seamlessly.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2022',
    title: 'Cold-Chain Logistics',
    desc: 'Integrated temperature-controlled delivery networks, ensuring fresh produce travels safely from farm gates to urban stalls.',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2023',
    title: 'Direct Pre-Orders',
    desc: 'Enabled harvest pre-orders and CSA subscriptions, giving consumers direct access to seasonal crops prior to market days.',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2024',
    title: 'Regional Hub Scale',
    desc: 'Expanded operations across 25 regional agricultural hubs, empowering over 2,500 active independent farmers and vendors.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2025',
    title: 'AI Yield Forecasting',
    desc: 'Integrated predictive demand analytics to help growers estimate crop requirements, optimize pricing, and eliminate food waste.',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    year: '2026',
    title: 'Sustainable Future',
    desc: 'Pioneering zero-carbon direct-to-consumer networks and transparent farm-to-table traceability across national markets.',
    image: 'https://i.pinimg.com/1200x/81/72/68/8172682ee1614e9c4b9437a921c65d73.jpg',
  },
];

function OurStory() {
  const sectionRef = useRef(null);
  const imageCardsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = imageCardsRef.current;
      const totalSlides = storyData.length;

      // Pin section & control scroll-driven image stacking + active list item
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalSlides * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              totalSlides - 1,
              Math.floor(self.progress * totalSlides)
            );
            setActiveIndex(idx);
          },
        },
      });

      // Stacked cards slide up animation
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="ourstory-section">
      <div className="ourstory-main-container">
        
        {/* Left Column: Stacked Image Showcase (Swapped to Left) */}
        <div className="ourstory-left-col">
          <div className="ourstory-img-wrapper">
            {storyData.map((item, idx) => (
              <div
                key={item.year}
                ref={(el) => (imageCardsRef.current[idx] = el)}
                className="stacked-img-card"
                style={{ zIndex: idx + 1 }}
              >
                <img src={item.image} alt={item.title} className="ourstory-img" />
              </div>
            ))}

            {/* Floating Index / Year Badge */}
            <div className="ourstory-index-badge">
              <span className="current-year">{storyData[activeIndex].year}</span>
              <span className="slide-divider"> / </span>
              <span className="total-years">2026</span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Year List (Swapped to Right) */}
        <div className="ourstory-right-col">
          <div className="ourstory-sublabel">
            <span className="sublabel-dash">—</span> OUR STORY
          </div>

          <h2 className="ourstory-heading">
            OUR<br />JOURNEY
          </h2>

          <p className="ourstory-desc">
            {storyData[activeIndex].desc}
          </p>

          {/* List of Years (Active item updates on scroll) */}
          <div className="ourstory-list">
            {storyData.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.year}
                  className={`ourstory-item ${isActive ? 'active' : ''}`}
                >
                  <span className="story-title">{item.title}</span>
                  <span className="story-year">{item.year}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default OurStory;