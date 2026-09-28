import React, { useState } from 'react';
import toast from 'react-hot-toast';
import favicon from '../../assets/Images/favcion.png';
import '../Styles/Footer.css';

function Footer() {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('Suggestion');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error('Please enter your feedback message');
            return;
        }

        setIsSubmitting(true);

        // Simulate Feedback submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            toast.success('🎉 Feedback submitted! Thank you for helping MarketLink grow.');

            setTimeout(() => {
                setSubmitted(false);
                setComment('');
                setRating(5);
            }, 3500);
        }, 800);
    };

    return (
        <footer className="ft-section">
            <div className="ft-container">
                {/* 1. Top Liquid Blob Banner */}
                <div className="ft-top-banner ft-hover-effect">
                    <div className="ft-blob-wrapper">
                        <div className="ft-blob ft-blob-1"></div>
                        <div className="ft-blob ft-blob-2"></div>
                        <div className="ft-blob ft-blob-3"></div>
                    </div>
                    <div className="ft-top-content">
                        <span className="ft-badge-tag">🌾 MarketLink Agritech</span>
                        <p className="ft-sub-text">
                            Directly connecting verified farmers with urban buyers. Real-time pricing, fresh produce, and seamless pre-orders.
                        </p>
                    </div>
                </div>

                {/* 2. Middle Interactive CTA Bar */}
                <a href="#feedback-section" className="ft-cta-bar ft-hover-effect">
                    <span className="ft-cta-title">Have suggestions or feedback? Share with us below</span>
                    <div className="ft-cta-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>
                </a>

                {/* 3. Main Footer Box */}
                <div className="ft-main-box ft-hover-effect">
                    {/* Brand Column */}
                    <div className="ft-brand-col">
                        <div className="ft-logo">
                            <img src={favicon} alt="MarketLink" className="ft-logo-mark" />
                            {/* <span className="ft-logo-text">MarketLink</span> */}
                        </div>
                    </div>

                    {/* Navigation & Feedback Grid */}
                    <div className="ft-links-grid">
                        {/* Col 1: Navigation */}
                        <div>
                            <h4 className="ft-col-title">Explore</h4>
                            <ul className="ft-link-list">
                                <li><a href="/markets">Fresh Markets</a></li>
                                <li><a href="/farmers">Verified Farmers</a></li>
                                <li><a href="/pre-orders">My Pre-Orders</a></li>
                                <li><a href="/sehat-ai">Sehat.ai Bot</a></li>
                            </ul>
                        </div>

                        {/* Col 2: Active Hubs */}
                        <div>
                            <h4 className="ft-col-title">Active Hubs</h4>
                            <ul className="ft-link-list">
                                <li><a href="#hub1">Karachi Central</a></li>
                                <li><a href="#hub2">Gulshan Stalls</a></li>
                                <li><a href="#hub3">Clifton Hub</a></li>
                                <li><a href="#hub4">Sindh Produce</a></li>
                            </ul>
                        </div>

                        {/* Col 3: Social Links */}
                        <div>
                            <h4 className="ft-col-title">Connect</h4>
                            <div className="ft-social-icons">
                                <a href="#facebook" aria-label="Facebook">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                </a>
                                <a href="#instagram" aria-label="Instagram">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                </a>
                                <a href="#whatsapp" aria-label="WhatsApp">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Col 4: Interactive Feedback Form Section */}
                        <div className="ft-feedback-col" id="feedback-section">
                            <h4 className="ft-col-title ft-feedback-heading">
                                Feedback <span className="ft-chip-green">LIVE</span>
                            </h4>

                            {submitted ? (
                                <div className="ft-feedback-success">
                                    <span className="ft-success-icon">✨</span>
                                    <p>Shukriya! Aapka feedback submit ho gaya hai.</p>
                                </div>
                            ) : (
                                <form className="ft-feedback-form" onSubmit={handleFeedbackSubmit}>
                                    {/* Star Rating Picker */}
                                    <div className="ft-stars-wrapper">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                className={`ft-star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>

                                    {/* Feedback Type Category */}
                                    <select
                                        className="ft-input-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Suggestion">💡 Suggestion</option>
                                        <option value="Produce Quality">🥬 Produce Quality</option>
                                        <option value="Bug Report">🐛 App Issue / Bug</option>
                                        <option value="General Review">💬 General Review</option>
                                    </select>

                                    {/* Feedback Comment */}
                                    <textarea
                                        className="ft-input-textarea"
                                        placeholder="Apni rai ya suggestion likhein..."
                                        rows="2"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={250}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="ft-feedback-submit-btn"
                                        disabled={isSubmitting || !comment.trim()}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Disclaimer & Copyright Bar */}
                <div className="ft-bottom-bar">
                    <p className="ft-copyright">© {new Date().getFullYear()} MarketLink Agritech. All rights reserved.</p>
                    <p className="ft-disclaimer">
                        <strong>Disclaimer:</strong> MarketLink provides direct farm-to-buyer connectivity. All orders are processed directly through verified local market stalls.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;