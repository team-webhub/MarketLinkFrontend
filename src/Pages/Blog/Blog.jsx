import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroBlog from './Sections/HeroBlog';
import Magazine from './Sections/Magazine';


function About() {
  useEffect(() => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="main-content">
      <HeroBlog />
      <Magazine />
    </main>
  );
}

export default About;