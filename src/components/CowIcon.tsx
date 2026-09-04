import React from "react";

interface CowIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function CowIcon({ size = 24, className, ...props }: CowIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* 1. HORNS (Outlines matching the dramatic sweeping horns of the picture) */}
      {/* Left Horn */}
      <path d="M 38 42 C 24 43 14 36 10 24 C 6 12 11 2 13 1" />
      <path d="M 39 44 C 28 41 20 32 16 22 C 12 12 13 4 13 1" />
      
      {/* Right Horn */}
      <path d="M 62 42 C 76 43 86 36 90 24 C 94 12 89 2 87 1" />
      <path d="M 61 44 C 72 41 80 32 84 22 C 88 12 87 4 87 1" />

      {/* Horn ridge shading lines inside horns */}
      <path d="M 12 18 C 14 24 22 30 28 33" strokeWidth="1.5" />
      <path d="M 88 18 C 86 24 78 30 72 33" strokeWidth="1.5" />

      {/* 2. CROWN / FOREHEAD (The top head plate between horns) */}
      <path d="M 38 42 C 43 39 57 39 62 42" />
      <path d="M 42 45 C 46 43 54 43 58 45" />
      
      {/* Center forehead plate and stylized fur lines */}
      <path d="M 50 41 L 50 51" />
      <path d="M 46 44 C 47 48 45 52 42 54" />
      <path d="M 54 44 C 53 48 55 52 58 54" />
      <path d="M 48 48 C 49 51 51 51 52 48" />

      {/* 3. EARS (Symmetric horizontal ears with inner fold details) */}
      {/* Left Ear */}
      <path d="M 35 50 C 25 49 17 50 15 52 C 17 55 25 56 33 53" />
      <path d="M 20 51.5 C 24 52 28 51 31 50" strokeWidth="1.5" />
      
      {/* Right Ear */}
      <path d="M 65 50 C 75 49 83 50 85 52 C 83 55 75 56 67 53" />
      <path d="M 80 51.5 C 76 52 72 51 69 50" strokeWidth="1.5" />

      {/* 4. EYES & BROW (Intense bull eyes) */}
      {/* Left Eye */}
      <path d="M 33 55 C 34 52 38 52 40 55 C 39 57 35 57 33 55 Z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="36.5" cy="54.5" r="1" fill="currentColor" />
      <path d="M 31 53 C 34 51 38 51 40 53" strokeWidth="2" />
      
      {/* Right Eye */}
      <path d="M 67 55 C 66 52 62 52 60 55 C 61 57 65 57 67 55 Z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="63.5" cy="54.5" r="1" fill="currentColor" />
      <path d="M 69 53 C 66 51 62 51 60 53" strokeWidth="2" />

      {/* 5. CHEEKS, JAW & CHEST (Dewlap tapering to a point at the bottom) */}
      <path d="M 35 53 C 31 66 35 79 50 96" />
      <path d="M 65 53 C 69 66 65 79 50 96" />
      
      {/* Neck muscle contours / Shading */}
      <path d="M 38 63 C 35 74 41 86 48 93" strokeWidth="1.5" />
      <path d="M 62 63 C 65 74 59 86 52 93" strokeWidth="1.5" />
      <path d="M 41 68 C 43 78 46 84 50 88" strokeWidth="1" />
      <path d="M 59 68 C 57 78 54 84 50 88" strokeWidth="1" />

      {/* 6. NOSE BRIDGE & MUZZLE (The snout, nostrils and mouth) */}
      {/* Nose Bridge */}
      <path d="M 42 55 C 43 65 44 72 41 76" />
      <path d="M 58 55 C 57 65 56 72 59 76" />
      
      {/* Muzzle Outline */}
      <path d="M 41 76 C 41 79 43 83 50 83 C 57 83 59 79 59 76" />
      
      {/* Nostrils */}
      <path d="M 43 77 C 42 78 43 80 45 80 C 47 80 47 78 45 77 Z" fill="currentColor" />
      <path d="M 57 77 C 58 78 57 80 55 80 C 53 80 53 78 55 77 Z" fill="currentColor" />
      
      {/* Mouth & Lips */}
      <path d="M 44 82 C 47 84 53 84 56 82" />
      <path d="M 46 85 C 48 87 52 87 54 85" strokeWidth="1.5" />
    </svg>
  );
}
