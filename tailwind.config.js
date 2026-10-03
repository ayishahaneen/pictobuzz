/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chalk: {
          bg: "#121820",
          card: "#1a222d",
          border: "#2a3644",
          input: "#0f141a"
        },
        sketch: {
          yellow: "#FBBF24",
          yellowDark: "#D97706",
          blue: "#0EA5E9",
          blueDark: "#0284C7",
          green: "#22C55E",
          greenDark: "#16A34A",
          red: "#EF4444",
          redDark: "#DC2626",
          orange: "#F97316",
          orangeDark: "#EA580C",
          cyan: "#06B6D4",
          paper: "#FAF7EE",
          paperBorder: "#E2D9C5",
          paperDark: "#F3EDE0"
        }
      },
      fontFamily: {
        doodle: ["'Fredoka'", "'Outfit'", "cursive", "sans-serif"],
        hand: ["'Comic Neue'", "'Fredoka'", "cursive", "sans-serif"],
        sans: ["'Outfit'", "'Inter'", "sans-serif"]
      },
      boxShadow: {
        'sketch': '3px 3px 0px #1E293B',
        'sketch-lg': '5px 5px 0px #1E293B',
        'sketch-yellow': '4px 4px 0px #D97706',
        'sketch-blue': '4px 4px 0px #0284C7',
        'sketch-green': '4px 4px 0px #16A34A',
        'sketch-red': '4px 4px 0px #DC2626',
        'sketch-orange': '4px 4px 0px #EA580C',
        'glow-yellow': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.4)',
      },
      borderRadius: {
        'doodle': '255px 15px 225px 15px/15px 225px 15px 255px',
        'doodle-sm': '20px 8px 18px 7px/8px 18px 7px 20px',
        'doodle-md': '35px 14px 30px 12px/14px 30px 12px 35px',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        crownFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-5px) rotate(3deg)' }
        },
        splatter: {
          '0%': { transform: 'scale(0.8)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        wiggle: 'wiggle 1.5s ease-in-out infinite',
        bounceShort: 'bounceShort 1s ease-in-out infinite',
        crownFloat: 'crownFloat 2s ease-in-out infinite',
        splatter: 'splatter 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
};
