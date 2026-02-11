import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#FACC15",       // Vibrant Gold/Yellow
        "primary-dark": "#EAB308", // Darker Gold
        accent: "#FDE68A",         // Light Gold
        obsidian: "#0A0A0A",       // Deep Black
        "bg-dark": "#09090B",      // Zinc-950
        surface: "#18181B",        // Dark Zinc for cards
        "surface-light": "#27272A", // Lighter surface
        glass: "rgba(250, 204, 21, 0.05)",
        "glass-border": "rgba(250, 204, 21, 0.15)",
        "glass-white": "rgba(255, 255, 255, 0.05)",
        "glass-white-border": "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-out': 'fade-out 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'loading-bar': {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
};
export default config;