import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'accent-primary': '#00f3ff',
        'accent-secondary': '#b36cff',
      },
      borderRadius: {
        '3xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 243, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(179, 108, 255, 0.2)',
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;