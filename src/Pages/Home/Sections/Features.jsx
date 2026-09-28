import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Features.css';

gsap.registerPlugin(ScrollTrigger);

// Core features derived from MarketLink SRS Specifications
const projectsData = [
    {
        id: '01',
        category: 'Map Discovery',
        title: 'Interactive Market Mapping',
        image: 'https://i.pinimg.com/736x/19/0a/10/190a10498c6cd46f83060dc3c265d6ff.jpg',
    },
    {
        id: '02',
        category: 'Inventory Management',
        title: 'Weekly Farm Produce Stock',
        image: 'https://i.pinimg.com/1200x/7b/a2/d9/7ba2d93693d261ac4efe246d2c701e90.jpg',
    },
    {
        id: '03',
        category: 'Pre-Order System',
        title: 'Market Pickup Scheduling',
        image: 'https://i.pinimg.com/1200x/0c/d4/02/0cd402bf49c3421821c234e0a462d4ce.jpg',
    },
    {
        id: '04',
        category: 'Smart Assistance',
        title: 'AI Chatbot & Ratings',
        image: 'https://i.pinimg.com/736x/c8/bb/18/c8bb18fcc5af68d3b73e22e63762970e.jpg',
    },
];

function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, projectsData.length);

    const ctx = gsap.context(() => {
      const cards = cardsRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${cards.length * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      cards.forEach((card, index) => {
        if (index > 0) {
          tl.fromTo(
            card,
            { yPercent: 100 },
            { yPercent: 0, ease: 'none' },
            `card-${index}`
          );

          tl.to(
            cards[index - 1],
            {
              scale: 0.94,
              opacity: 0.4,
              ease: 'none',
            },
            `card-${index}`
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="features-section">
      <div className="cards-stack-container">
        {projectsData.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="project-card"
            style={{ zIndex: index + 1 }}
            data-cursor-text="VIEW"
          >
            {/* Image Container */}
            <div className="project-image-box">
              <img
                src={project.image}
                alt={project.title}
                className="project-img"
              />
              <div className="project-overlay" />
            </div>

            {/* Content Labels */}
            <div className="project-info">
              <div className="project-category">
                <span className="project-num">{project.id}</span>
                <span className="project-dot">•</span>
                <span className="category-title">{project.category}</span>
              </div>
              <h3 className="project-title">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;