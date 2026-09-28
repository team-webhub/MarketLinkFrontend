import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../../../Core/api';
import '../Styles/WorkThat.css';

gsap.registerPlugin(ScrollTrigger);

const fallbackProjects = [
  {
    id: '01',
    tags: ['VEGETABLES', 'ORGANIC', 'FRESH'],
    title: 'Farm Fresh Vegetables',
    image: 'https://i.pinimg.com/736x/7f/af/f5/7faff57c10c7164ee8e4a1fa9d793ef4.jpg',
  },
  {
    id: '02',
    tags: ['FRUITS', 'SEASONAL', 'LOCAL'],
    title: 'Seasonal Orchard Fruits',
    image: 'https://i.pinimg.com/736x/44/4a/75/444a75572ec0947d6cd16b10dbc4abed.jpg',
  },
  {
    id: '03',
    tags: ['DAIRY', 'FARM-FRESH', 'PURE'],
    title: 'Fresh Dairy & Eggs',
    image: 'https://i.pinimg.com/736x/fd/9e/c1/fd9ec19c8e92ccb3ac4d3e32c19488eb.jpg',
  },
  {
    id: '04',
    tags: ['BAKERY', 'HOMEMADE', 'ARTISAN'],
    title: 'Artisanal Baked Goods',
    image: 'https://i.pinimg.com/736x/1e/90/d6/1e90d6d8359df7b63fc1486969d02600.jpg',
  },
  {
    id: '05',
    tags: ['HERBS', 'NATURAL', 'ORGANIC'],
    title: 'Fresh Herbs & Spices',
    image: 'https://i.pinimg.com/1200x/7a/e0/8a/7ae08a3a4c7677ac097a4df551078d1e.jpg',
  },
];

function WorkThat() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [projects, setProjects] = useState(fallbackProjects);
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await API.get('/product/Product', {
          params: { sort: 'newest', is_available: true },
        });

        const productList = response?.data?.products || [];

        if (Array.isArray(productList) && productList.length > 0) {
          const mappedProducts = productList.slice(0, 6).map((product, index) => ({
            id: String(index + 1).padStart(2, '0'),
            title: product.name,
            tags: [
              product.category?.toUpperCase() || 'FRESH',
              product.unit?.toUpperCase() || 'LOCAL',
              'MARKET PICK',
            ],
            image: product.image_url || fallbackProjects[index % fallbackProjects.length].image,
            price: product.price,
            stock: product.stock_quantity,
          }));

          setProjects(mappedProducts);
        }
      } catch (error) {
        setProjects(fallbackProjects);
      }
    };

    fetchLatestProducts();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      // Dynamic calculation for responsiveness
      const getScrollDistance = () => track.scrollWidth - window.innerWidth + 80;

      // Horizontal Scroll Animation with Section Pinning
      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true, // Recalculates on screen resize
          onUpdate: (self) => {
            const idx = Math.min(
              projects.length,
              Math.floor(self.progress * projects.length) + 1
            );
            setCurrentIndex(idx);
          },
        },
      });

      // Animated Pulsing Dot Icon
      gsap.to('.work-glow-icon', {
        scale: 1.35,
        opacity: 0.7,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, sectionRef);

    return () => ctx.revert(); // Proper cleanup for React + GSAP
  }, [projects]);

  return (
    <section ref={sectionRef} className="workthat-section">
      <div className="workthat-header">
        <div className="workthat-title-group" data-cursor-text="HARVEST">
          <h2 className="workthat-heading">LATEST PRODUCTS</h2>
          <div className="workthat-sub-row">
            <span className="workthat-subheading">fresh picks from nearby farms</span>
            <i className="fa-solid fa-circle-dot work-glow-icon green-icon"></i>
          </div>
        </div>

        <div className="workthat-counter" data-cursor-text="CATEGORIES">
          <span className="counter-current">
            {String(currentIndex).padStart(2, '0')}
          </span>
          <span className="counter-divider"> / </span>
          <span className="counter-total">
            {String(projects.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="workthat-track-wrapper">
        <div ref={trackRef} className="workthat-track">
          {projects.map((item, index) => (
            <Link to={'/services'} key={`${item.title}-${index}`} className="workthat-card" data-cursor-text="BROWSE">
              <div className="workthat-img-box">
                <img src={item.image} alt={item.title} className="workthat-img" />
                <div className="card-hover-overlay">
                  <i className="fa-solid fa-arrow-up-right-from-square hover-icon"></i>
                </div>
              </div>

              <div className="workthat-card-info">
                <div className="workthat-card-meta">
                  <span className="workthat-tags">
                    {item.tags.map((tag, i) => (
                      <React.Fragment key={`${tag}-${i}`}>
                        {i > 0 && <span className="tag-dot">•</span>}
                        <span>{tag}</span>
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="workthat-card-num">{item.id}</span>
                </div>
                <h3 className="workthat-card-title">{item.title}</h3>
                {typeof item.price === 'number' && (
                  <div className="workthat-card-price-row">
                    <span className="workthat-price">₹{item.price}</span>
                    <span className="workthat-stock">{item.stock} left</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkThat;