/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: "#E8EEF6",
          100: "#C7D4E6",
          200: "#8FA9CB",
          300: "#577EB0",
          400: "#2F588A",
          500: "#0A2540",
          600: "#081E34",
          700: "#061728",
          800: "#04101C",
          900: "#020810",
        },
        brand: {
          DEFAULT: "#0A2540",
          primary: "#0A2540",
          accent: "#FF6B35",
          success: "#36B37E",
          danger: "#E5484D",
          warning: "#FF6B35",
          info: "#4C9AFF",
        },
        gas: {
          pressure: {
            normal: "#36B37E",
            low: "#FF6B35",
            high: "#FF5630",
            leak: "#E5484D",
            repair: "#FFAB00",
          },
        },
      },
      fontFamily: {
        sans: ["Source Han Sans CN", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "breathe": "breathe 2s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        "card-hover": "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
