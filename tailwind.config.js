/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // MADAAR Brand Identity
        navy: {
          DEFAULT: "#111D2D",
          50: "#F4F6F9",
          100: "#E5E9F0",
          200: "#C4CDDC",
          300: "#98A8C1",
          400: "#60769A",
          500: "#3D5375",
          600: "#2B3C56",
          700: "#1E2A3D",
          800: "#162130",
          900: "#111D2D",
          950: "#0A111B",
        },
        gold: {
          DEFAULT: "#C7A66A",
          50: "#FBF8F2",
          100: "#F5EFE1",
          200: "#EBDFC3",
          300: "#DECAA1",
          400: "#D3B782",
          500: "#C7A66A",
          600: "#B08E4F",
          700: "#8C6F3B",
          800: "#6E562F",
          900: "#544225",
        },
        ivory: {
          DEFAULT: "#F1EFE8",
          light: "#FBFBF9",
          dark: "#E3E0D5",
        },
        teal: {
          DEFAULT: "#27877E",
          50: "#F0F9F8",
          100: "#DBF2EF",
          200: "#B8E4DF",
          300: "#86CECB",
          400: "#4EB2AD",
          500: "#27877E",
          600: "#1F7068",
          700: "#1A5A54",
          800: "#164944",
          900: "#143D39",
        },
        status: {
          present: "#10B981", // Emerald
          absent: "#EF4444",  // Crimson Red
          late: "#F59E0B",    // Amber
          excused: "#6366F1", // Indigo
          early: "#8B5CF6",   // Purple
        }
      },
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "Cairo", "sans-serif"],
        english: ["'Plus Jakarta Sans'", "'Manrope'", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(17, 29, 45, 0.05), 0 4px 16px -4px rgba(17, 29, 45, 0.08)",
        "card-hover": "0 8px 24px -4px rgba(17, 29, 45, 0.12), 0 4px 12px -2px rgba(199, 166, 106, 0.15)",
        gold: "0 0 15px rgba(199, 166, 106, 0.3)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      }
    },
  },
  plugins: [],
};
