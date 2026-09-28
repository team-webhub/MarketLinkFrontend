import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import '../Styles/ContactForm.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ContactForm = () => {
    const formRef = useRef(null);
    const sectionRef = useRef(null);

    // EmailJS Credentials (Hardcoded inside file)
    const SERVICE_ID = 'service_seouurt';
    const TEMPLATE_ID = 'template_ixoavcy';
    const PUBLIC_KEY = 'nu-HAUVXrdLdqUk72';

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        service_type: '',
        user_email: '',
        newsletter: false,
        message: ''
    });

    const [buttonText, setButtonText] = useState('Submit');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Path & Arrow animation setup
            const path = document.querySelector('.ftx-journey-path .animated-path');
            const arrow = document.querySelector('.ftx-journey-path .arrow-head');

            if (path) {
                const pathLen = path.getTotalLength();
                gsap.set(path, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
            }
            if (arrow) {
                gsap.set(arrow, { opacity: 0 });
            }

            // 2. Stars Continuous Rotation
            gsap.to('.ftx-star-circle', {
                rotation: 360,
                duration: 8,
                ease: 'none',
                repeat: -1
            });

            // 3. ScrollTrigger Timeline
            const contactTl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            contactTl
                .fromTo(
                    '.ftx-version-badge',
                    { opacity: 0, y: -20 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                )
                .fromTo(
                    '.ftx-hero-title',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                    '-=0.3'
                )
                .fromTo(
                    '.ftx-rotating-stars',
                    { opacity: 0, scale: 0.5 },
                    { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
                    '-=0.4'
                );

            if (path) {
                contactTl.to(
                    path,
                    { strokeDashoffset: 0, duration: 2, ease: 'power2.out' },
                    '-=0.2'
                );
            }

            if (arrow) {
                contactTl.to(
                    arrow,
                    { opacity: 1, duration: 0.4, ease: 'power1.out' },
                    '-=0.3'
                );
            }

            contactTl
                .fromTo(
                    '.ftx-info-col .ftx-info-block',
                    { opacity: 0, x: -40 },
                    { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' },
                    '-=1.5'
                )
                .fromTo(
                    '.ftx-form-col form > *',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
                    '-=1.2'
                )
                .fromTo(
                    '.ftx-footer-huge h2',
                    { opacity: 0, scale: 0.9, y: 30 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.2)' },
                    '-=0.5'
                )
                .fromTo(
                    ['.ftx-footer-details > div', '.ftx-footer-bottom > div'],
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
                    '-=0.4'
                );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Form Focus / Blur Label GSAP Animations
    const handleFocus = (e) => {
        const group = e.target.closest('.ftx-form-group');
        if (!group) return;
        const label = group.querySelector('.ftx-label-sub');
        if (label) {
            gsap.to(label, { color: 'var(--text-green)', x: 5, duration: 0.3, ease: 'power2.out' });
        }
        gsap.to(e.target, { borderBottomColor: 'var(--text-green)', duration: 0.3 });
    };

    const handleBlur = (e) => {
        const group = e.target.closest('.ftx-form-group');
        if (!group) return;
        const label = group.querySelector('.ftx-label-sub');
        if (label) {
            gsap.to(label, { color: '#ffffff', x: 0, duration: 0.3, ease: 'power2.out' });
        }

        if (!e.target.value.trim()) {
            gsap.to(e.target, { borderBottomColor: '#333333', duration: 0.3 });
        } else {
            gsap.to(e.target, { borderBottomColor: '#ffffff', duration: 0.3 });
        }
    };

    // Submit Handler with EmailJS
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setButtonText('Sending...');

        // EmailJS Template variables mapping (matching EmailJS Dashboard layout)
        const templateParams = {
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            email: formData.user_email,
            company: formData.service_type || 'N/A',
            title: formData.service_type || 'General Inquiry',
            phone: 'N/A',
            message: formData.message || 'No message provided.'
        };

        emailjs
            .send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            )
            .then(
                () => {
                    setButtonText('Message Sent! ✅');
                    setIsSubmitting(false);
                    setFormData({
                        first_name: '',
                        last_name: '',
                        service_type: '',
                        user_email: '',
                        newsletter: false,
                        message: ''
                    });

                    setTimeout(() => {
                        setButtonText('Submit');
                    }, 3000);
                },
                (error) => {
                    console.error('EmailJS Error:', error);
                    setButtonText('Failed to Send ❌');
                    setIsSubmitting(false);

                    setTimeout(() => {
                        setButtonText('Submit');
                    }, 3000);
                }
            );
    };

    return (
        <section className="gsap-fade-anim" id="contact-form" ref={sectionRef}>
            <div className="ftx-contact-wrapper">
                <div className="ftx-blob-left"></div>
                <div className="ftx-blob-right"></div>

                <div className="container ftx-content-container">
                    {/* Version Badge */}
                    <span className="ftx-version-badge gsap-hero-badge">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ftx-spin-icon"
                            viewBox="0 0 13 13"
                            fill="currentColor"
                            width="13"
                            height="13"
                        >
                            <path
                                fill="currentColor"
                                d="M5.6,12.6c-0.5-0.8-0.7-2.4-1.7-3.5c-1-1-2.7-1.2-3.5-1.7C-0.1,7-0.1,6,0.4,5.6c0.8-0.5,2.3-0.6,3.5-1.8 C5,2.8,5.1,1.2,5.6,0.4C6-0.1,7-0.1,7.4,0.4c0.5,0.8,0.7,2.4,1.8,3.5c1.2,1.2,2.6,1.2,3.5,1.7c0.6,0.4,0.6,1.4,0,1.7 C11.8,7.9,10.2,8,9.1,9.1c-1,1-1.2,2.7-1.7,3.5C7,13.1,6,13.1,5.6,12.6z"
                            />
                        </svg>
                        <span className="ms-1">MarketLink Direct Portal</span>
                    </span>

                    {/* Hero Header */}
                    <div className="ftx-hero-header-wrapper">
                        <h1 className="ftx-hero-title ftx-hover-gradient">Grow Your Market</h1>

                        <div className="ftx-journey-row">
                            <h1 className="ftx-hero-title ftx-hover-gradient">Reach Today</h1>

                            <div className="ftx-launch-graphics">
                                <svg
                                    className="ftx-journey-path"
                                    viewBox="0 0 350 200"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        className="animated-path"
                                        d="M10,20 Q80,20 120,20 C160,20 160,60 120,60 L40,60 C0,60 0,100 40,100 L300,100 C340,100 340,140 300,140 L160,140 L160,185"
                                        stroke="var(--text-green)"
                                        strokeWidth="15"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        className="arrow-head"
                                        d="M140,165 L160,185 L180,165"
                                        stroke="var(--text-green)"
                                        strokeWidth="15"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                <div className="ftx-rotating-stars">
                                    <div className="ftx-star-circle ftx-star-blue">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#000000"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="12" y1="2" x2="12" y2="22" />
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                                        </svg>
                                    </div>
                                    <div className="ftx-star-circle ftx-star-green">
                                        <svg viewBox="0 0 24 24" fill="currentColor" color="#000000">
                                            <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="ftx-content-grid">
                        {/* Left Info Column */}
                        <div className="ftx-info-col">
                            <div className="ftx-info-block">
                                <p>Karachi, Pakistan</p>
                                <p>2026</p>
                            </div>
                            <div className="ftx-info-block">
                                <p>Support Hours</p>
                                <p>Monday - Friday</p>
                                <p>11 AM - 2 PM</p>
                            </div>
                            <div className="ftx-map">
                                <iframe
                                    title="MarketLink Location"
                                    src="https://maps.google.com/maps?q=Karachi%20Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {/* Right Form Column */}
                        <div className="ftx-form-col">
                            <form id="ftx-contact-form" ref={formRef} onSubmit={handleSubmit}>
                                <label className="ftx-label-main">Name (required)</label>

                                <div className="ftx-form-row">
                                    <div className="ftx-form-group">
                                        <label className="ftx-label-sub">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="ftx-input"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            required
                                        />
                                    </div>
                                    <div className="ftx-form-group">
                                        <label className="ftx-label-sub">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="ftx-input"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ftx-form-group">
                                    <label className="ftx-label-sub">Inquiry Type</label>
                                    <div className="ftx-select-wrapper">
                                        <select
                                            name="service_type"
                                            className="ftx-input ftx-select"
                                            value={formData.service_type}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            required
                                        >
                                            <option value=""></option>
                                            <option value="Stall Booking & Management">Stall Booking & Management</option>
                                            <option value="Cold-Chain Logistics">Cold-Chain Logistics</option>
                                            <option value="Wholesale Produce Buyer">Wholesale Produce Buyer</option>
                                            <option value="Farmer / Cooperative Partnership">Farmer / Cooperative Partnership</option>
                                            <option value="General Inquiry">General Inquiry</option>
                                        </select>
                                        <svg
                                            className="ftx-select-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="ftx-form-group">
                                    <label className="ftx-label-sub">Email (required)</label>
                                    <input
                                        type="email"
                                        name="user_email"
                                        className="ftx-input"
                                        value={formData.user_email}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        required
                                    />
                                </div>

                                <div className="ftx-checkbox-group">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        id="ftx-news"
                                        className="ftx-checkbox"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                        value="Yes"
                                    />
                                    <label htmlFor="ftx-news" className="ftx-checkbox-label">
                                        Subscribe to MarketLink harvest reports & market updates
                                    </label>
                                </div>

                                <div className="ftx-form-group">
                                    <label className="ftx-label-sub">Message</label>
                                    <input
                                        type="text"
                                        name="message"
                                        className="ftx-input"
                                        value={formData.message}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        placeholder="Tell us about your produce volume or market requirements..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    id="ftx-submit-btn"
                                    className="ftx-submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {buttonText}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Footer Section */}
                    <div className="ftx-footer">
                        <div className="ftx-footer-huge">
                            <h2 className="ftx-footer-email">rk4328417@gmail.com</h2>
                            <h2 className="ftx-footer-phone">(+92) 310 3371549</h2>
                        </div>

                        <div className="ftx-footer-details">
                            <div>
                                <p>Karachi, Pakistan</p>
                                <p>2026</p>
                            </div>
                            <div>
                                <p>Support Hours</p>
                                <p>Monday - Friday 11 AM - 2 PM</p>
                            </div>

                            <div className="ftx-links-right">
                                <span style={{ color: '#888888' }}>Direct Contact</span>
                                <a href="#contact-form" className="ftx-link ftx-link-underline">
                                    Partner With MarketLink
                                </a>
                            </div>
                        </div>

                        <div className="ftx-footer-bottom">
                            <div>
                                © 2026 MarketLink | Connecting Agriculture directly from Farm to Table.
                            </div>

                            <div className="ftx-social-links">
                                <a href="#" className="ftx-social-icon">
                                    Bē
                                </a>
                                <a href="#" className="ftx-social-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                                <a href="#" className="ftx-social-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                                <a href="#" className="ftx-link" style={{ marginLeft: '20px' }}>
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;