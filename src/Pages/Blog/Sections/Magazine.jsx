import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import '../Styles/Magazine.css';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const ARTICLES_DATA = [
  {
    id: 1,
    date: '16. March 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/736x/8c/6d/4c/8c6d4c57944ccb7eb8fe1bd9edfb5be3.jpg',
    title: 'Hope dies last',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 2,
    date: '16. March 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/1200x/70/68/68/70686803cc5687cf083409aa617fd789.jpg',
    title: "Don't close your eyes",
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis bibendum ut.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 3,
    date: '16. March 2026',
    category: 'SCULPTURES',
    image: 'https://i.pinimg.com/736x/91/02/ac/9102ac280baac2e78578c069e9baa7c6.jpg',
    title: 'The best art museums',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 4,
    date: '15. March 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/736x/7b/f8/73/7bf873cec4d37c0ea59199f40c802c30.jpg',
    title: 'The devil is in the details',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis bibendum ut.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 5,
    date: '14. March 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/1200x/d3/b8/fc/d3b8fc4c3dade23bf582f38bd1564d76.jpg',
    title: 'An indestructible hope',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 6,
    date: '12. March 2026',
    category: 'STREET ART',
    image: 'https://i.pinimg.com/1200x/02/69/77/0269777b9e6b53264ad536d938fc7b9f.jpg',
    title: 'Street art festival',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis bibendum ut.',
    author: 'Jakob Grønberg',
    duration: '1 Min',
  },
  {
    id: 7,
    date: '10. March 2026',
    category: 'SCULPTURES',
    image: 'https://i.pinimg.com/1200x/4e/de/9b/4ede9b7755aee9454cd927e6ada4828f.jpg',
    title: 'Forms and marble silhouettes',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Elena Rostova',
    duration: '2 Min',
  },
  {
    id: 8,
    date: '08. March 2026',
    category: 'STREET ART',
    image: 'https://i.pinimg.com/736x/0a/f4/b9/0af4b95580047c5a1b54f816dc2b0f3e.jpg',
    title: 'Visions of urban tomorrow',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis.',
    author: 'Marcus Vance',
    duration: '3 Min',
  },
  {
    id: 9,
    date: '05. March 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/736x/e0/a2/f7/e0a2f72d866861f8794ac508cbae7d99.jpg',
    title: 'Textures of eternal silence',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Elena Rostova',
    duration: '2 Min',
  },
  {
    id: 10,
    date: '02. March 2026',
    category: 'STREET ART',
    image: 'https://i.pinimg.com/736x/34/71/4f/34714f808e56565e9b94d9426eb23b59.jpg',
    title: 'Chasing black and white',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis.',
    author: 'Jakob Grønberg',
    duration: '4 Min',
  },
  {
    id: 11,
    date: '28. February 2026',
    category: 'SCULPTURES',
    image: 'https://i.pinimg.com/736x/e1/8f/d4/e18fd4d9a572598f2c83b423bdc9a1f9.jpg',
    title: 'Evolving perspectives',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas dui id ornare arcu odio ut sem.',
    author: 'Marcus Vance',
    duration: '2 Min',
  },
  {
    id: 12,
    date: '25. February 2026',
    category: 'ART',
    image: 'https://i.pinimg.com/736x/34/47/91/3447910e232168f7bb2007c9558047a2.jpg',
    title: 'The minimalist portrait',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras ornare arcu dui vivamus arcu felis.',
    author: 'Elena Rostova',
    duration: '3 Min',
  },
];

const CATEGORIES = ['ALL', 'ART', 'STREET ART', 'SCULPTURES'];

function Magazine() {
  const [selectedCat, setSelectedCat] = useState('ALL');
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const gridRef = useRef(null);

  const filteredArticles = selectedCat === 'ALL'
    ? ARTICLES_DATA
    : ARTICLES_DATA.filter((item) => item.category === selectedCat);

  // Function to setup typewriter animation on card titles
  const animateTypewriter = () => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.mag-card');

    cards.forEach((card) => {
      const titleEl = card.querySelector('.mag-card-title');
      const targetText = titleEl.getAttribute('data-title');

      if (titleEl && targetText) {
        // Reset text initially
        gsap.set(titleEl, { text: '' });

        // Typewriter animation with ScrollTrigger
        gsap.to(titleEl, {
          text: targetText,
          duration: Math.max(0.8, targetText.length * 0.05),
          ease: 'none',
          onStart: () => titleEl.classList.add('typing'),
          onComplete: () => titleEl.classList.remove('typing'), // Typing khatam hote hi cursor gayab
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
    });
  };

  // Initial Animations on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header & Filter Reveal
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        filterRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. Cards Fade Up Reveal
      const cards = gridRef.current.querySelectorAll('.mag-card');
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          },
        }
      );

      // 3. Typewriter Animation Trigger
      animateTypewriter();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Re-run typewriter animation when filter changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.mag-card');

    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        onComplete: animateTypewriter
      }
    );
  }, [selectedCat]);

  return (
    <section id='newsletter' ref={sectionRef} className="mag-section">
      <div className="mag-container">

        {/* Section Top Badge */}
        <div className="mag-top-badge">— EDITORIAL MAGAZINE</div>

        {/* Huge Magazine Title */}
        <div ref={headerRef} className="mag-header">
          <h1 className="mag-title">MAGAZINE</h1>
        </div>

        {/* Categories Bar */}
        <div ref={filterRef} className="mag-filter-bar">
          <span className="mag-filter-label">CATEGORIES</span>
          <div className="mag-filter-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`mag-pill ${selectedCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Magazine Cards Grid */}
        <div ref={gridRef} className="mag-grid">
          {filteredArticles.map((article) => (
            <article key={article.id} className="mag-card">

              {/* Top Meta Bar */}
              <div className="mag-card-top">
                <span className="mag-card-date">{article.date}</span>
                <span className="mag-card-badge">{article.category}</span>
              </div>

              {/* Monochrome Image Wrapper */}
              <div className="mag-card-img-wrap">
                <img
                  src={article.image}
                  alt={article.title}
                  className="mag-card-img"
                  loading="lazy"
                />
              </div>

              {/* Card Body */}
              <div className="mag-card-body">
                <h3
                  className="mag-card-title"
                  data-title={article.title}
                >
                  {article.title}
                </h3>
                <p className="mag-card-excerpt">{article.excerpt}</p>
              </div>

              {/* Card Footer */}
              <div className="mag-card-footer">
                <span>Text: <strong>{article.author}</strong></span>
                <span>Duration: <strong>{article.duration}</strong></span>
              </div>

            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Magazine;