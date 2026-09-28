import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Styles/CustomCursor.css';

function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // 60FPS smooth GSAP quickTo tracking
    const xDot = gsap.quickTo(dotRef.current, 'x', { duration: 0.08, ease: 'power3.out' });
    const yDot = gsap.quickTo(dotRef.current, 'y', { duration: 0.08, ease: 'power3.out' });

    const xRing = gsap.quickTo(ringRef.current, 'x', { duration: 0.32, ease: 'power2.out' });
    const yRing = gsap.quickTo(ringRef.current, 'y', { duration: 0.32, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Global listener to detect hover on interactive elements
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [data-cursor], .project-card, .workthat-card, .motiv-row');
      if (target) {
        setIsHovered(true);
        const text = target.getAttribute('data-cursor-text');
        if (text) setCursorText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [data-cursor], .project-card, .workthat-card, .motiv-row');
      if (target) {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseLeave = () => {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.2 });
    };

    const handleMouseEnter = () => {
      gsap.to(cursorRef.current, { opacity: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor-wrapper ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
    >
      {/* Inner Dot / Inner Hollow Ring on Hover */}
      <div ref={dotRef} className="cursor-dot">
        {cursorText && <span className="cursor-text">{cursorText}</span>}
      </div>

      {/* Outer Neon Ring */}
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}

export default CustomCursor;