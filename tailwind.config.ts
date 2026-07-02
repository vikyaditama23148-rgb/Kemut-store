import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#fbf9f9",
        "surface-dim": "#dbdad9",
        "surface-bright": "#fbf9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#efeded",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e3e2e2",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#444748",
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        primary: "#0a0a0a",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "on-primary-container": "#858383",
        secondary: "#735c00",
        "on-secondary": "#ffffff",
        "secondary-container": "#fed65b",
        "on-secondary-container": "#745c00",
        gold: "#d4af37",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#fbf9f9",
        "on-background": "#1b1c1c",
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0px 20px 40px rgba(0,0,0,0.04)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
