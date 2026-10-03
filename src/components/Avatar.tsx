import React from 'react';

interface AvatarProps {
  id: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showCrown?: boolean;
}

export const AVATAR_PRESETS = [
  { id: 'avatar_1', name: 'Danish (Orange Top)', bg: 'bg-amber-500', icon: '👦' },
  { id: 'avatar_2', name: 'Ayaan (Green Hair)', bg: 'bg-emerald-500', icon: '🧔' },
  { id: 'avatar_3', name: 'Zara (Coral Band)', bg: 'bg-rose-500', icon: '👧' },
  { id: 'avatar_4', name: 'Riya (Sky Blue)', bg: 'bg-sky-500', icon: '👩' },
  { id: 'avatar_5', name: 'Imran (Blue Cap)', bg: 'bg-blue-600', icon: '🧢' },
  { id: 'avatar_6', name: 'Sana (Sunny)', bg: 'bg-yellow-400', icon: '👱‍♀️' },
  { id: 'avatar_7', name: 'Leo (Artist)', bg: 'bg-orange-500', icon: '🎨' },
  { id: 'avatar_8', name: 'Pixie (Cool Cat)', bg: 'bg-teal-500', icon: '🐱' },
];

export const Avatar: React.FC<AvatarProps> = ({ id, size = 'md', className = '', showCrown = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
    '2xl': 'w-28 h-28 text-6xl',
  };

  const preset = AVATAR_PRESETS.find(p => p.id === id) || AVATAR_PRESETS[0];

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {showCrown && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 animate-crownFloat drop-shadow-[0_2px_4px_rgba(217,119,6,0.8)]">
          <svg className="w-6 h-6 text-yellow-400 fill-yellow-400 stroke-amber-700 stroke-2" viewBox="0 0 24 24">
            <path d="M2 18h20v2H2v-2zm1.5-12l4.5 6 4-8 4 8 4.5-6L21 16H3L3.5 6z" />
          </svg>
        </div>
      )}
      
      <div
        className={`rounded-full ${sizeClasses[size]} ${preset.bg} border-2 border-slate-800 flex items-center justify-center shadow-md select-none transition-transform hover:scale-105`}
        style={{
          boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2), 2px 3px 0px rgba(15,23,42,0.8)'
        }}
      >
        <span>{preset.icon}</span>
      </div>
    </div>
  );
};
