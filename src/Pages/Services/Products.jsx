import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroProduct from './Sections/HeroProduct';
import ReadMoreService from './Sections/ReadMoreService';
import OurProducts from './Sections/OurProducts';


function Services() {
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
      <HeroProduct />
      <ReadMoreService />
      <OurProducts />
      <hr className='bg-black text-zinc-800' />
    </main>
  );
}

export default Services;