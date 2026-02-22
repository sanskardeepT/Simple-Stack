import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "w-64 h-64" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full" />
      
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      >
        <defs>
          <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Shield Background */}
        <motion.path
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d="M200 40 L340 100 V200 C340 280 280 340 200 360 C120 340 60 280 60 200 V100 L200 40Z"
          stroke="url(#eyeGradient)"
          strokeWidth="2"
          fill="none"
        />

        {/* Eye Outer Shape */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d="M40 200 C40 200 120 80 200 80 C280 80 360 200 360 200 C360 200 280 320 200 320 C120 320 40 200 40 200Z"
          stroke="url(#eyeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Iris / Radar Container */}
        <g transform="translate(200, 200)">
          {/* Radar Circles */}
          <circle r="70" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3" />
          <circle r="45" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.5" />
          <circle r="20" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.8" />
          
          {/* Scanning Radar Beam */}
          <motion.path
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            d="M0 0 L0 -70 A70 70 0 0 1 60.6 -35 Z"
            fill="url(#radarGradient)"
            style={{ transformOrigin: 'center' }}
          />

          {/* Scanning Line */}
          <motion.line
            x1="0" y1="0" x2="0" y2="-70"
            stroke="#60A5FA"
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Central Pupil / Core */}
          <circle r="8" fill="white" filter="url(#glow)">
            <animate
              attributeName="r"
              values="8;10;8"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.7;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Digital Accents */}
        <path d="M100 120 L80 100" stroke="#3B82F6" strokeWidth="2" opacity="0.5" />
        <path d="M300 120 L320 100" stroke="#8B5CF6" strokeWidth="2" opacity="0.5" />
        <path d="M100 280 L80 300" stroke="#3B82F6" strokeWidth="2" opacity="0.5" />
        <path d="M300 280 L320 300" stroke="#8B5CF6" strokeWidth="2" opacity="0.5" />
      </svg>
    </div>
  );
};
