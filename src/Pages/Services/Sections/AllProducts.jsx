import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/AllServices.css';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const projectsData = [
  {
    id: 1,
    tag: 'STALL RESERVATION / VENUE / LOGISTICS',
    title: 'Market Stall Space Booking',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    tag: 'FARM PRE-ORDERS / E-COMMERCE',
    title: 'Seasonal Yield Pre-Orders',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    tag: 'COLD-CHAIN / TRANSPORT / HARVEST',
    title: 'Temperature-Controlled Logistics',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    tag: 'DIGITAL STOREFRONT / RETAIL',
    title: 'Custom Farm Web & Mobile Shop',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 5,
    tag: 'COMMUNITY / CSA / MEMBERSHIPS',
    title: 'CSA Box Subscription Management',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 6,
    tag: 'POP-UP / EQUIPMENT / HARDWARE',
    title: 'Turnkey Market Canopy & Stall Kits',
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 7,
    tag: 'WHOLESALE / AGGREGATION / B2B',
    title: 'Restaurant & Grocer Supply Pooling',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 8,
    tag: 'PAYMENTS / HARDWARE / POS',
    title: 'Contactless Field Terminal Setup',
    image: 'https://i.pinimg.com/1200x/6d/a4/5d/6da45d04877ac661ad443e0e651d296c.jpg',
  },
  {
    id: 9,
    tag: 'DATA / HARVEST INSIGHTS / ANALYTICS',
    title: 'Crop Yield & Demand Forecasting',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 10,
    tag: 'ECOSYSTEM / NETWORKING / COMMUNITY',
    title: 'Regional Farmers Market Network',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=800&auto=format&fit=crop',
  }
];

function AllServices() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Text Fade In & Slide Up
      gsap.fromTo(
        headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. Grid Cards Staggered Scroll Animation
      const cards = gridRef.current.querySelectorAll('.as-card');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="as-section">
      <div className="as-container">
        
        {/* Section Header */}
        <div ref={headerRef} className="as-header-grid">
          <div className="as-title-col">
            <Link to={'/services'} className="as-badge">— Go Back</Link>
            <h2 className="as-main-heading">
              ALL <br />
              SERVICES
            </h2>
          </div>
          <div className="as-desc-col">
            <p className="as-desc-text">
              From fresh harvest transport to market stall reservations and direct customer pre-orders, explore our full suite of digital and physical solutions built for local food ecosystems.
            </p>
          </div>
        </div>

        {/* 2-Column Projects Grid */}
        <div ref={gridRef} className="as-grid">
          {projectsData.map((project) => (
            <div key={project.id} className="as-card">
              <div className="as-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="as-image"
                  loading="lazy"
                />
                <div className="as-image-overlay"></div>
              </div>
              <div className="as-card-info">
                <span className="as-project-tag">{project.tag}</span>
                <h3 className="as-project-title">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default AllServices;