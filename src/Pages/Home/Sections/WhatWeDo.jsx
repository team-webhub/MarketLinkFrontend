import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../Styles/WhatWeDo.css';

// Core Services & Platform Offerings matching MarketLink SRS
const services = [
  {
    id: '1',
    title: 'Direct Farm Pre-Ordering',
    image: 'https://i.pinimg.com/736x/c4/16/ac/c416ac3f32b9307492eaf515cc243b49.jpg',
  },
  {
    id: '2',
    title: 'Interactive Market Mapping',
    image: 'https://i.pinimg.com/1200x/f2/3f/62/f23f627c7469925ba2529b10ea9f01c1.jpg',
  },
  {
    id: '3',
    title: 'Weekly Live Stock Inventory',
    image: 'https://i.pinimg.com/736x/d0/f5/c0/d0f5c015f28e17aa1faf22046588152f.jpg',
  },
  {
    id: '4',
    title: 'Farmer Stall Management',
    image: 'https://i.pinimg.com/236x/d0/aa/94/d0aa9480d388a118aafa6efbdf7ecb3d.jpg',
  },
  {
    id: '5',
    title: 'Smart AI Shopping Assistant',
    image: 'https://i.pinimg.com/736x/71/6d/c1/716dc1e50bb859beaf311b3abbb16a09.jpg',
  },
];

function WhatWeDo() {
  const sectionRef = useRef(null);
  const previewImgRef = useRef(null);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    // Smooth 60fps cursor tracking for floating card preview
    const xTo = gsap.quickTo(previewImgRef.current, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(previewImgRef.current, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
    };

    const currentSection = sectionRef.current;
    if (currentSection) {
      currentSection.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (currentSection) {
        currentSection.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleMouseEnter = (item) => {
    setActiveService(item);
    
    // Id 2 & 4 ke liye rotation 6deg, baaki ke liye -6deg
    const rotationAngle = item.id === '2' || item.id === '4' ? 6 : -6;

    gsap.to(previewImgRef.current, {
      scale: 1,
      opacity: 1,
      rotation: rotationAngle,
      duration: 0.35,
      ease: 'back.out(1.5)',
    });
  };

  const handleMouseLeave = () => {
    setActiveService(null);
    gsap.to(previewImgRef.current, {
      scale: 0.7,
      opacity: 0,
      rotation: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
  };

  return (
    <section ref={sectionRef} className="whatwedo-section">
      {/* Top Header */}
      <div className="whatwedo-header">
        <div className="whatwedo-sublabel">
          <span className="sublabel-dash">—</span> WHAT WE OFFER
        </div>
        <h2 className="whatwedo-title">
          SOLUTIONS THAT<br />
          CONNECT COMMUNITIES
        </h2>
      </div>

      {/* Services Accordion / List */}
      <div className="whatwedo-list">
        {services.map((item) => (
          <div
            key={item.id}
            className={`whatwedo-item ${activeService?.id === item.id ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
            data-cursor-text="EXPLORE"
          >
            <div className="item-number-badge">{item.id}</div>
            <h3 className="item-title">{item.title}</h3>
            <i className="fa-solid fa-arrow-right item-arrow"></i>
          </div>
        ))}
      </div>

      {/* Floating Hover Card Following Mouse */}
      <div ref={previewImgRef} className="whatwedo-preview-card">
        {activeService && (
          <img
            src={activeService.image}
            alt={activeService.title}
            className="preview-img"
          />
        )}
      </div>
    </section>
  );
}

export default WhatWeDo;