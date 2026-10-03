import React from 'react';

export const PaintSplatterBorder: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none opacity-40">
      {/* Top Left Yellow & Red Paint Strokes */}
      <svg className="absolute -top-10 -left-10 w-64 h-64 text-amber-400" viewBox="0 0 200 200" fill="currentColor">
        <path d="M45.7,-77.4C58.9,-69.8,69.1,-57.4,76.6,-43.3C84,-29.3,88.7,-13.6,86.5,1.3C84.3,16.1,75.1,30.2,65.2,42.8C55.3,55.4,44.7,66.6,31.7,73.4C18.8,80.2,3.5,82.7,-11.2,80.7C-25.9,78.8,-40,72.4,-51.7,62.8C-63.4,53.2,-72.7,40.4,-78.9,25.8C-85.1,11.2,-88.2,-5.3,-84.4,-20.3C-80.7,-35.3,-70.1,-48.8,-57.2,-56.6C-44.3,-64.4,-29.1,-66.4,-14.7,-70.9C-0.3,-75.4,13.3,-82.3,27.5,-85C32.5,-85.9,32.5,-85,45.7,-77.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute top-8 left-36 w-32 h-32 text-orange-500 opacity-60" viewBox="0 0 200 200" fill="currentColor">
        <circle cx="50" cy="50" r="30" />
        <circle cx="110" cy="40" r="20" />
        <circle cx="70" cy="90" r="15" />
      </svg>

      {/* Top Right Sky Blue & Electric Blue Paint Splatters */}
      <svg className="absolute -top-12 -right-12 w-72 h-72 text-sky-400" viewBox="0 0 200 200" fill="currentColor">
        <path d="M41.7,-68.8C53.8,-63.4,63.4,-51.8,71.2,-38.7C79,-25.6,85.1,-11,83.8,3C82.5,17,73.8,30.4,63.9,41.9C54,53.4,42.8,63,29.9,69.5C17,76,2.4,79.4,-11.8,77.5C-26,75.6,-39.8,68.4,-51.6,58.6C-63.4,48.8,-73.2,36.4,-78.2,22C-83.3,7.6,-83.5,-8.8,-77.9,-23C-72.3,-37.2,-60.9,-49.2,-47.9,-54.3C-34.9,-59.4,-20.3,-57.6,-5.7,-60.9C8.8,-64.3,29.6,-74.2,41.7,-68.8Z" transform="translate(100 100)" />
      </svg>

      {/* Bottom Left Green Paint */}
      <svg className="absolute -bottom-16 -left-12 w-64 h-64 text-emerald-500 opacity-50" viewBox="0 0 200 200" fill="currentColor">
        <path d="M38.8,-61.2C50.2,-54.6,59.3,-43.7,66.8,-31.2C74.3,-18.8,80.1,-4.9,78.5,8.1C76.9,21.1,67.8,33.2,57.4,43.2C46.9,53.2,35.1,61.1,21.8,66.7C8.5,72.3,-6.4,75.6,-20.2,72.4C-34,69.2,-46.8,59.6,-56.9,47.8C-67,36,-74.5,22,-77.2,6.8C-79.9,-8.4,-77.8,-24.8,-69.5,-37.6C-61.2,-50.4,-46.7,-59.6,-32.4,-64.4C-18.1,-69.2,-3.9,-69.6,9.1,-67.4C22.1,-65.2,27.4,-67.8,38.8,-61.2Z" transform="translate(100 100)" />
      </svg>

      {/* Bottom Right Orange & Gold Accents */}
      <svg className="absolute -bottom-10 -right-10 w-64 h-64 text-yellow-500 opacity-50" viewBox="0 0 200 200" fill="currentColor">
        <path d="M49.2,-74.8C62.7,-69.3,71.8,-54.2,77.7,-38.4C83.7,-22.6,86.5,-6.1,84.4,9.6C82.3,25.3,75.3,40.2,64.6,51.8C53.9,63.4,39.6,71.7,24.4,75.7C9.2,79.7,-6.9,79.4,-21.8,74.9C-36.8,70.4,-50.5,61.7,-60.7,49.8C-70.9,37.8,-77.6,22.7,-79.8,6.8C-82,-9.1,-79.7,-25.7,-71.4,-38.9C-63.1,-52.1,-48.9,-61.9,-34.5,-67C-20.1,-72.1,-5.5,-72.5,9.6,-74.4C24.7,-76.3,35.7,-80.3,49.2,-74.8Z" transform="translate(100 100)" />
      </svg>
    </div>
  );
};

export const DoodlePencil: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <div className={`inline-block transform -rotate-45 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Eraser */}
        <path d="M20 20 L35 35 L25 45 L10 30 Z" fill="#EF4444" stroke="#1E293B" strokeWidth="3" />
        {/* Metal band */}
        <path d="M25 45 L35 35 L40 40 L30 50 Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
        {/* Pencil body */}
        <path d="M30 50 L40 40 L75 75 L65 85 Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="3" />
        {/* Pencil lines */}
        <line x1="33" y1="47" x2="68" y2="82" stroke="#D97706" strokeWidth="2" />
        {/* Wood tip */}
        <path d="M75 75 L65 85 L90 95 Z" fill="#FDE68A" stroke="#1E293B" strokeWidth="3" />
        {/* Lead */}
        <path d="M83 88 L78 93 L90 95 Z" fill="#1E293B" />
      </svg>
    </div>
  );
};

export const DoodleCrown: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg className={`text-yellow-400 fill-yellow-400 stroke-amber-700 stroke-2 ${className}`} viewBox="0 0 24 24">
      <path d="M2 18h20v2H2v-2zm1.5-12l4.5 6 4-8 4 8 4.5-6L21 16H3L3.5 6z" />
    </svg>
  );
};
