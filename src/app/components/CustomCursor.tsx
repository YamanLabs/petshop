'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PawPrint } from 'lucide-react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const positionRef = useRef({ x: 0, y: 0 });
  const trailPositionRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | null>(null);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    // Check if it's a touch device
    const checkTouchDevice = () => {
      const hasTouch = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    };

    checkTouchDevice();
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    // Show cursor on first movement
    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      
      // Spawn a ripple
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const handleMouseUp = () => setIsClicked(false);

    // Event delegation to detect hover on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const checkInteractive = (element: HTMLElement): boolean => {
        const tagName = element.tagName.toLowerCase();
        const isLinkOrButton = 
          tagName === 'a' || 
          tagName === 'button' || 
          tagName === 'input' || 
          tagName === 'textarea' || 
          tagName === 'select' ||
          element.getAttribute('role') === 'button' ||
          element.classList.contains('cursor-pointer');
        
        if (isLinkOrButton) return true;
        if (element.parentElement && element.parentElement !== document.body) {
          return checkInteractive(element.parentElement);
        }
        return false;
      };

      if (checkInteractive(target)) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Smooth animation loop for the trail
    const updateTrail = () => {
      const dx = positionRef.current.x - trailPositionRef.current.x;
      const dy = positionRef.current.y - trailPositionRef.current.y;
      
      // Apply spring/lerp (0.15 speed factor)
      trailPositionRef.current.x += dx * 0.15;
      trailPositionRef.current.y += dy * 0.15;
      
      setTrailPosition({ 
        x: trailPositionRef.current.x, 
        y: trailPositionRef.current.y 
      });
      
      requestRef.current = requestAnimationFrame(updateTrail);
    };
    
    requestRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Click ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-50 rounded-full border border-black/40 bg-black/5 animate-[ping_0.6s_ease-out_forwards]"
          style={{
            left: ripple.x - 16,
            top: ripple.y - 16,
            width: 32,
            height: 32,
          }}
        />
      ))}

      {/* Main trailing cursor */}
      <div
        className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out select-none"
        style={{
          left: trailPosition.x,
          top: trailPosition.y,
          transform: `translate(-50%, -50%) scale(${isClicked ? 0.8 : isHovered ? 1.3 : 1})`,
        }}
      >
        <div className="relative text-black drop-shadow-md">
          {/* Subtle trail dot or shadow if desired, currently using pure PawPrint */}
          <PawPrint 
            className={`w-6 h-6 transition-all duration-300 ${
              isHovered ? 'rotate-12 scale-110' : ''
            }`} 
            fill="black"
            stroke="white"
            strokeWidth={1.5}
            style={{
              filter: 'drop-shadow(0px 0px 1.2px rgba(255, 255, 255, 0.9)) drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.4))'
            }}
          />
        </div>
      </div>
    </>
  );
}
