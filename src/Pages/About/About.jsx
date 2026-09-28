import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroAbout from './Sections/HeroAbout';
import WhoWeAre from '../Home/Sections/WhoWeAre';
import OurStory from './Sections/OurStory';
import OurTeam from './Sections/OurTeam';
import OurPartner from './Sections/OurPartner';


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
      <HeroAbout />
      <WhoWeAre />
      <OurStory />
      <OurTeam />
      <OurPartner />
    </main>
  );
}

export default About;