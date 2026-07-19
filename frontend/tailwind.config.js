/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ponder: {
          bg: "#0B0F19",
          surface: "#111827",
          border: "#1E293B",
          muted: "#64748B",
          cyan: "#22D3EE",
          blue: "#38BDF8",
          glow: "rgba(34, 211, 238, 0.35)",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 211, 238, 0.25)",
        "glow-sm": "0 0 12px rgba(56, 189, 248, 0.2)",
      },
    },
  },
  plugins: [],
};
