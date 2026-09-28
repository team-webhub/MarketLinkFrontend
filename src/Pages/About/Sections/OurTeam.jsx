import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/OurTeam.css';
import ramanImg from '../../../assets/Images/Ramanpfp.png';

gsap.registerPlugin(ScrollTrigger);

// Agart aap local image import kar rahe hain:
// import ramanImg from '../../../assets/Images/Ramanpfp.png';

const teamMembers = [
    {
        id: '01',
        name: 'Mehdi Abbas Mosani',
        role: 'HEAD OF BACKEND & ARCHITECTURE',
        tags: ['SYSTEMS', 'AGRI-LOGISTICS'],
        desc: 'Engineering real-time stall reservation engines, high-concurrency order processing, and cold-chain tracking APIs for regional produce hubs.',
        location: 'Karachi, PK',
        experience: '6+ Years',
        expertise: [
            { title: 'Market Systems', desc: 'Designing high-throughput database schemas for live inventory.' },
            { title: 'Logistics Infrastructure', desc: 'Building REST & GraphQL APIs for real-time order routing.' }
        ],
        imageMain: 'https://i.pinimg.com/736x/8c/27/b5/8c27b5317bdf37ce2d703489a087148e.jpg',
        imageHover: 'https://i.pinimg.com/736x/c2/ed/f1/c2edf114a1637d911e2143dcbd8546f6.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '02',
        name: 'Raman .',
        role: 'CREATIVE DIRECTOR & UX LEAD',
        tags: ['PRODUCT DESIGN', 'FARMER-UX'],
        desc: 'Architecting accessible, highly intuitive digital experiences that simplify produce trading for both local growers and wholesale buyers.',
        location: 'Mumbai, IN',
        experience: '8+ Years',
        expertise: [
            { title: 'Product Ecosystems', desc: 'Developing clean visual frameworks for complex agritech tools.' },
            { title: 'Vendor Design Systems', desc: 'Crafting frictionless mobile-first booking and checkout flows.' }
        ],
        // local import use kar rahe ho to: imageMain: ramanImg
        // public folder se: imageMain: '/Images/Ramanpfp.png'
        imageMain: 'https://i.pinimg.com/1200x/65/78/64/657864774184d29c4c3606640b3ec3fa.jpg',
        imageHover: 'https://i.pinimg.com/736x/32/45/2a/32452a58ddb42f9dfd20e466cd2cae20.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '03',
        name: 'Sooraj Kumar',
        role: 'LEAD FRONTEND DEVELOPER',
        tags: ['INTERACTIVE MAPS', 'FULLSTACK'],
        desc: 'Bringing MarketLink to life with interactive stall layout maps, live crop pricing charts, and ultra-responsive frontend architectures.',
        location: 'Lahore, PK',
        experience: '5+ Years',
        expertise: [
            { title: 'Interactive Map UI', desc: 'Building canvas & GSAP interactive market floorplan grids.' },
            { title: 'Real-time Dashboards', desc: 'Integrating WebSockets for live yield stock updates.' }
        ],
        imageMain: 'https://i.pinimg.com/1200x/45/d1/a4/45d1a4f0c5dd55b1d3632179e9ba770e.jpg',
        imageHover: 'https://i.pinimg.com/736x/93/6a/12/936a12f189136d28b7a382bf863df56a.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '04',
        name: 'Abdul Wasay Khan',
        role: 'GROWTH & STRATEGY LEAD',
        tags: ['FARMER ONBOARDING', 'OPERATIONS'],
        desc: 'Executing data-driven market expansions, building partnerships with farming cooperatives, and optimizing direct-to-consumer distribution.',
        location: 'Islamabad, PK',
        experience: '7+ Years',
        expertise: [
            { title: 'Marketplace Operations', desc: 'Scaling regional market hubs and farm-to-stall pipelines.' },
            { title: 'Growth & Partnerships', desc: 'Connecting agriculture networks with urban fresh food retailers.' }
        ],
        imageMain: 'https://i.pinimg.com/736x/a9/c7/af/a9c7afccabdfd2ea84f7123a35bc84b0.jpg',
        imageHover: 'c:\Users\Administrator\Downloads\WhatsApp Image 2026-09-24 at 6.41.39 PM.jpeg.',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '05',
        isUpcoming: true,
        title: 'More MarketLink Contributors Coming Soon',
        desc: 'We are continually expanding our network of agritech engineers, logistics leads, and community managers nationwide.',
    },
];

function OurTeam() {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const iconRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Modal state & animation refs
    const [activeModalMember, setActiveModalMember] = useState(null);
    const modalOverlayRef = useRef(null);
    const modalBoxRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const track = trackRef.current;
            const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

            // Horizontal Scroll Animation with Section Pinning
            gsap.to(track, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const idx = Math.min(
                            teamMembers.length - 1,
                            Math.floor(self.progress * teamMembers.length)
                        );
                        setCurrentIndex(idx);

                        // Rotate Custom Icon based on scroll progress
                        if (iconRef.current) {
                            gsap.set(iconRef.current, {
                                rotation: self.progress * 720,
                            });
                        }
                    },
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Open Modal Function
    const openModal = (member) => {
        if (!member.isUpcoming) {
            setActiveModalMember(member);
        }
    };

    useEffect(() => {
        if (activeModalMember && modalBoxRef.current) {
            gsap.fromTo(
                modalOverlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                modalBoxRef.current,
                { opacity: 0, scale: 0.88, y: 35 },
                { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)' }
            );
        }
    }, [activeModalMember]);

    // Close Modal Function
    const closeModal = () => {
        if (modalOverlayRef.current && modalBoxRef.current) {
            gsap.to(modalBoxRef.current, {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.25,
            });
            gsap.to(modalOverlayRef.current, {
                opacity: 0,
                duration: 0.25,
                onComplete: () => setActiveModalMember(null),
            });
        } else {
            setActiveModalMember(null);
        }
    };

    return (
        <section id='team' ref={sectionRef} className="ourteam-section">
            {/* Top Header Section */}
            <div className="ourteam-header">
                <div className="ourteam-title-group">
                    {/* Badge */}
                    <div className="ourteam-badge">
                        <span className="badge-dash">—</span> OUR TEAM
                    </div>

                    <div className="ourteam-heading-row">
                        <h2 className="ourteam-heading">MEET THE TEAM</h2>

                        {/* Custom Rotating Circle Icon */}
                        <div className="ourteam-icon-wrapper">
                            <img
                                ref={iconRef}
                                src="https://i.pinimg.com/736x/00/25/db/0025db8abe92b8189b1fe78f19727e6e.jpg"
                                alt="Rotating Badge"
                                className="ourteam-custom-icon"
                            />
                        </div>
                    </div>

                    {/* Dynamic Scroll Description */}
                    <p className="ourteam-dynamic-desc">
                        {teamMembers[currentIndex].desc}
                    </p>
                </div>

                {/* Live Counter */}
                <div className="ourteam-counter">
                    <span className="counter-current">
                        {String(currentIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="counter-divider"> / </span>
                    <span className="counter-total">
                        {String(teamMembers.length).padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Header Arrow Scroll Indicator Bar */}
            {/* <div className="ourteam-scroll-arrow-bar">
                <div className="arrow-indicator-label">
                    <span>ACTIVE MEMBER POINTER</span>
                </div>
                <div className="arrow-indicator-track">
                    {teamMembers.map((member, idx) => (
                        <div
                            key={idx}
                            className={`arrow-step-item ${currentIndex === idx ? 'active-step' : ''}`}
                        >
                            <span className="step-arrow-icon"><i class="fa fa-arrow-down" aria-hidden="true"></i></span>
                            <span className="step-number">{member.id || '05'}</span>
                            <span className="step-name-tooltip">
                                {member.name ? member.name.split(' ')[0] : 'UPCOMING'}
                            </span>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* Horizontal Scroll Track Wrapper */}
            <div className="ourteam-track-wrapper">
                <div ref={trackRef} className="ourteam-track">
                    {teamMembers.map((item, idx) => {
                        if (item.isUpcoming) {
                            return (
                                <div key={idx} className="ourteam-card upcoming-card">
                                    <div className="upcoming-box">
                                        <span className="upcoming-badge">JOIN US</span>
                                        <h3 className="upcoming-title">{item.title}</h3>
                                        <p className="upcoming-desc">{item.desc}</p>
                                        <div className="upcoming-plus-icon">+</div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={item.id}
                                className="ourteam-card"
                                onClick={() => openModal(item)}
                            >
                                {/* Image Container with Hover Swap & Social Icons Overlay */}
                                <div className="ourteam-img-box">
                                    <img
                                        src={item.imageMain}
                                        alt={item.name}
                                        className="ourteam-img img-primary"
                                    />
                                    <img
                                        src={item.imageHover}
                                        alt={`${item.name} hover`}
                                        className="ourteam-img img-secondary"
                                    />

                                    {/* Social Overlay Icons */}
                                    <div className="card-social-overlay">
                                        <div className="social-icons-row">
                                            <a
                                                href={item.socials.linkedin}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="social-btn"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fa-brands fa-linkedin-in"></i>
                                            </a>
                                            <a
                                                href={item.socials.instagram}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="social-btn"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fa-brands fa-instagram"></i>
                                            </a>
                                            <a
                                                href={item.socials.whatsapp}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="social-btn"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fa-brands fa-whatsapp"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Member Meta Info */}
                                <div className="ourteam-card-info">
                                    <div className="ourteam-card-meta">
                                        <span className="ourteam-tags">
                                            {item.tags.map((tag, i) => (
                                                <React.Fragment key={i}>
                                                    {i > 0 && <span className="tag-dot">•</span>}
                                                    <span>{tag}</span>
                                                </React.Fragment>
                                            ))}
                                        </span>
                                        <span className="ourteam-card-num">{item.id}</span>
                                    </div>
                                    <h3 className="ourteam-card-name">{item.name}</h3>
                                    <span className="ourteam-card-role">{item.role}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* White Theme Member Detail Modal (InspectServices Style) */}
            {activeModalMember && (
                <div ref={modalOverlayRef} className="ourteam-modal-overlay" onClick={closeModal}>
                    <div
                        ref={modalBoxRef}
                        className="ourteam-modal-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="ourteam-modal-close" onClick={closeModal}>✕</button>

                        <div className="ourteam-modal-left">
                            <div className="ourteam-modal-img-frame">
                                <img src={activeModalMember.imageMain} alt={activeModalMember.name} />
                            </div>
                            <div className="ourteam-modal-img-frame">
                                <img src={activeModalMember.imageHover} alt={activeModalMember.name} />
                            </div>
                        </div>

                        <div className="ourteam-modal-right">
                            <div className="ourteam-modal-tag-badge">
                                {activeModalMember.tags.join(' • ')}
                            </div>

                            <h2 className="ourteam-modal-title">{activeModalMember.name}</h2>

                            <div className="ourteam-modal-meta">
                                <span className="ourteam-modal-role-badge">{activeModalMember.role}</span>
                                <span className="ourteam-modal-num">{activeModalMember.id}</span>
                            </div>

                            <p className="ourteam-modal-desc">{activeModalMember.desc}</p>

                            <div className="ourteam-modal-section">
                                <span className="ourteam-modal-label">EXPERIENCE & LOCATION:</span>
                                <p className="ourteam-modal-val">
                                    {activeModalMember.experience} | {activeModalMember.location}
                                </p>
                            </div>

                            <div className="ourteam-modal-section">
                                <span className="ourteam-modal-label">KEY EXPERTISE:</span>
                                <ul className="ourteam-modal-list">
                                    {activeModalMember.expertise.map((exp, idx) => (
                                        <li key={idx} className="ourteam-modal-li">
                                            <strong>• {exp.title}</strong>
                                            <span>{exp.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="ourteam-modal-actions">
                                <a
                                    href={activeModalMember.socials.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ourteam-modal-btn"
                                >
                                    Connect on LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default OurTeam;