'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = "h-10", light = false }: LogoProps) {
  const color = light ? '#ffffff' : '#2b221a';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 220 75"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Letter Z (first) */}
        <path
          d="M20 30H45L20 65H45"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cat U (first U) */}
        {/* Pointy Left Ear */}
        <path
          d="M57 32L53 14L63 26"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color}
        />
        {/* Pointy Right Ear */}
        <path
          d="M83 32L87 14L77 26"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color}
        />
        {/* Cat U Body */}
        <path
          d="M58 32V50C58 58.2843 64.7157 65 70 65C75.2843 65 82 58.2843 82 50V32"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Cat Nose (small heart) */}
        <path
          d="M70 54.5C70.5 53.5 72 53.5 72 54.5C72 55.5 70 57 70 57C70 57 68 55.5 68 54.5C68 53.5 69.5 53.5 70 54.5Z"
          fill={color}
        />
        {/* Whiskers Left */}
        <path d="M52 50H42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53 46L43 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53 54L43 56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Whiskers Right */}
        <path d="M88 50H98" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M87 46L97 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M87 54L97 56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Letter Z (second) */}
        <path
          d="M110 30H135L110 65H135"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dog U (second U) */}
        {/* Floppy Left Ear */}
        <path
          d="M148 24C145 20 138 22 138 28C138 34 146 38 147 40"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color}
        />
        {/* Floppy Right Ear */}
        <path
          d="M172 24C175 20 182 22 182 28C182 34 174 38 173 40"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={color}
        />
        {/* Dog U Body */}
        <path
          d="M148 32V50C148 58.2843 154.716 65 160 65C165.284 65 172 58.2843 172 50V32"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Dog Nose & Muzzle */}
        <circle cx="160" cy="53" r="3.5" fill={color} />
        <path
          d="M156.5 56.5C158 58 160 58.5 160 56.5C160 58.5 162 58 163.5 56.5"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      {/* Brand Subtitle "PET CO" */}
      <div
        className="text-[10px] sm:text-[11px] tracking-[0.45em] font-bold uppercase mt-1 opacity-90 select-none flex items-center gap-1.5"
        style={{ color: color, fontFamily: 'var(--font-nunito), sans-serif' }}
      >
        <span className="opacity-60 text-xs">🐾</span>
        <span>PET CO.</span>
        <span className="opacity-60 text-xs">🐾</span>
      </div>
    </div>
  );
}
