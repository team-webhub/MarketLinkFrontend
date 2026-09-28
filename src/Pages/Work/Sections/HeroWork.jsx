import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import favicon from '../../../assets/Images/favcion.png';
import '../Styles/HeroWork.css'; // Apne CSS file structure ke according import rakhein
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

function HeroMarkets() {
    const sectionRef = useRef(null);
    const topBarRef = useRef(null);
    const bgRef = useRef(null);
    const badgeRef = useRef(null);
    const headingRef = useRef(null);
    const btnRef = useRef(null);
    const descRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: 'power3.out', duration: 1 },
            });

            // 1. Top Bar Reveal
            tl.fromTo(
                topBarRef.current,
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 }
            );

            // 2. Badge Reveal
            tl.fromTo(
                badgeRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 },
                '-=0.4'
            );

            // 3. Staggered Line-by-Line Heading Text Reveal
            const lines = headingRef.current.querySelectorAll('.heading-line');
            tl.fromTo(
                lines,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
                '-=0.4'
            );

            // 4. CTA Button & Description Staggered Reveal
            tl.fromTo(
                btnRef.current,
                { y: 30, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7 },
                '-=0.5'
            );

            tl.fromTo(
                descRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.6'
            );

            // Smooth Background Parallax Effect on Scroll
            gsap.to(bgRef.current, {
                yPercent: 18,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="hw-section">
            {/* Background Image Container with GSAP Parallax */}
            <div ref={bgRef} className="hw-bg-image"></div>
            <div className="hw-dark-overlay"></div>

            {/* Top Navigation Bar inside Hero */}
            <div ref={topBarRef} className="hw-top-bar">
                <Link to="/" className="hero-brand-logo" data-cursor-text="HOME">
                    <img src={favicon} alt="MarketLink" className="hero-brand-mark" />
                </Link>

                <Link to="/register" className="hw-top-cta" data-cursor-text="JOIN">
                    JOIN AS A FARMER
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="hw-container">
                <div className="hw-content-grid">

                    {/* Left Column: Badge, Heading & Wide CTA Button */}
                    <div className="hw-left-col">
                        <span ref={badgeRef} className="hw-badge">— LOCAL MARKETS & STALLS</span>

                        <h1 ref={headingRef} className="hw-heading">
                            <span className="heading-line-wrap">
                                <span className="heading-line">FRESH LOCAL</span>
                            </span>
                            <span className="heading-line-wrap">
                                <span className="heading-line hw-green-text">MARKETS &</span>
                            </span>
                            <span className="heading-line-wrap">
                                <span className="heading-line hw-green-text">STALLS NEAR YOU.</span>
                            </span>
                        </h1>

                        <a ref={btnRef} href="#markets-grid" className="hw-btn">
                            EXPLORE STALLS
                        </a>
                    </div>

                    {/* Right Column: Narrative Description */}
                    <div className="hw-right-col">
                        <p ref={descRef} className="hw-description">
                            Discover vibrant local farmer markets, browse organic stalls, and connect directly with community growers. Pre-order farm-fresh produce and pick up directly from your nearest market hub.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default HeroMarkets;