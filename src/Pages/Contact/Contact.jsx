import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroContact from './Sections/HeroContact';
import ContactForm from './Sections/ContactForm';

function Contact() {
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
            <HeroContact />
            <ContactForm />
        </main>
    );
}

export default Contact;