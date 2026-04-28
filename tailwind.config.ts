import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#F4C400",
          yellowHover: "#E6B800",
          sky: "#5EA8FF",
          text: "#222222",
          sub: "#666666",
          border: "#EAEAEA",
          bg: "#FAFAF7"
        }
      },
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,0.04)"
      },
      borderRadius: {
        "4xl": "20px"
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "sans-serif"],
        accent: ["'Zen Maru Gothic'", "'Noto Sans JP'", "sans-serif"]
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(244, 196, 0, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(94, 168, 255, 0.12), transparent 24%)"
      }
    }
  },
  plugins: []
};

export default config;
