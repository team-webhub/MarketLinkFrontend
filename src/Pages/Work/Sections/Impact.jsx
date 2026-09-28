import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../../../Core/api';
import '../Styles/Impact.css';

gsap.registerPlugin(ScrollTrigger);

const fallbackStats = [
    { number: '100%', title: 'DIRECT FARM TO BASKET' },
    { number: '50+', title: 'VERIFIED LOCAL STALLS' },
    { number: '15K+', title: 'WEEKLY FRESH PRE-ORDERS' },
    { number: '0%', title: 'MIDDLEMEN COMMISSIONS' },
];

function Impact() {
    const wrapperRef = useRef(null);
    const badgeRef = useRef(null);
    const headingRef = useRef(null);
    const descRef = useRef(null);
    const statsRef = useRef(null);
    const ctaRef = useRef(null);
    const ctaTextRef = useRef(null);
    const ctaBtnRef = useRef(null);
    const [impactStats, setImpactStats] = useState(fallbackStats);

    useEffect(() => {
        const fetchImpactStats = async () => {
            try {
                const response = await API.get('/admin/public-stats');
                const data = response?.data?.data;

                if (data) {
                    setImpactStats([
                        { number: '100%', title: 'DIRECT FARM TO BASKET' },
                        { number: `${data.totalMarkets || 0}+`, title: 'VERIFIED LOCAL STALLS' },
                        { number: `${(data.totalOrders || 0) > 999 ? `${Math.floor((data.totalOrders || 0) / 1000)}K+` : (data.totalOrders || 0) + '+'}`, title: 'WEEKLY FRESH PRE-ORDERS' },
                        { number: `${data.totalFarmers || 0}+`, title: 'LOCAL FARMERS ON PLATFORM' },
                    ]);
                }
            } catch (error) {
                console.error('Public stats fetch failed:', error);
                setImpactStats(fallbackStats);
            }
        };

        fetchImpactStats();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const impactTl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    start: 'top 75%',
                },
            });

            impactTl
                .fromTo(badgeRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
                .fromTo(headingRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4')
                .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6');

            const statBoxes = statsRef.current?.querySelectorAll('.imp-stat-box');
            if (statBoxes?.length) {
                impactTl.fromTo(
                    statBoxes,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
                    '-=0.4'
                );
            }

            const ctaTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: 'top 80%',
                },
            });

            const ctaLines = ctaTextRef.current?.querySelectorAll('.cta-line');
            if (ctaLines?.length) {
                ctaTl.fromTo(
                    ctaLines,
                    { y: 60, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
                );
            }

            ctaTl.fromTo(
                ctaBtnRef.current,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                '-=0.5'
            );
        }, wrapperRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={wrapperRef} className="imp-wrapper">
            <section id="impact" className="imp-section">
                <div className="imp-container">
                    <div className="imp-header-grid">
                        <div className="imp-left-col">
                            <div ref={badgeRef} className="imp-badge">
                                <span className="imp-badge-line"></span>
                                MARKET IMPACT
                            </div>

                            <h2 ref={headingRef} className="imp-heading">
                                EMPOWERING <br />
                                LOCAL FARMERS
                            </h2>
                        </div>

                        <div className="imp-right-col">
                            <p ref={descRef} className="imp-description">
                                MarketLink transforms how communities source fresh produce. By connecting local farm stalls directly with consumers, we eliminate middlemen, lower food miles, and guarantee sustainable fair prices for growers.
                            </p>
                        </div>
                    </div>

                    <div ref={statsRef} className="imp-stats-grid">
                        {impactStats.map((item, index) => (
                            <div key={index} className="imp-stat-box">
                                <span className="imp-stat-number">{item.number}</span>
                                <h4 className="imp-stat-title">{item.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section ref={ctaRef} className="imp-cta-section">
                <div className="imp-container cta-container">
                    <h2 ref={ctaTextRef} className="imp-cta-heading">
                        <span className="cta-line-wrap">
                            <span className="cta-line">READY TO SUPPORT LOCAL FARMERS?</span>
                        </span>
                    </h2>

                    <div ref={ctaBtnRef} className="imp-cta-btn-wrapper">
                        <a href="#markets-grid" className="imp-cta-btn">
                            <span>EXPLORE NEARBY STALLS</span>
                            <span className="cta-arrow">→</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Impact;