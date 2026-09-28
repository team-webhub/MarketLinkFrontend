import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Loader from '../../Components/Loader'; // Path apne project ke hisab se adjust kar lein
import Hero from './Sections/Hero';
import Footer from '../../Components/Sections/Footer';
import Approach from './Sections/Approach';
import Features from './Sections/Features';
import Motiv from './Sections/Motiv';
import WorkThat from './Sections/WorkThat';
import WhatWeDo from './Sections/WhatWeDo';
import WhoWeAre from './Sections/WhoWeAre';
import Collaborators from './Sections/Collaborators';
import Stats from './Sections/Stats';
import Question from './Sections/Question';
import Marquee from './Sections/Marquee';
import GetInTouch from './Sections/GetInTouch';

function Home() {
  const [isLoading, setIsLoading] = useState(true);

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
    <>
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      <main className="main-content">
        <Hero />
        <Approach />
        <Features />
        <Motiv />
        <WorkThat />
        <WhatWeDo />
        <hr className='bg-black text-zinc-300' />
        <WhoWeAre />
        {/* <Collaborators /> */}
        <Stats />
        <Question />
        <Marquee />
        <GetInTouch />
        
      </main>
    </>
  );
}

export default Home;