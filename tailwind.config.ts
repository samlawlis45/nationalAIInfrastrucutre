import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Palette Extensions
        slate: {
            950: '#020617',
            900: '#0f172a',
            800: '#1e293b',
            700: '#334155',
            600: '#475569',
            500: '#64748b',
            400: '#94a3b8',
            300: '#cbd5e1',
        },
        // Semantic mapping
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        
        // Border
        border: "var(--border)",
        
        // Text
        muted: "var(--text-muted)",
        // body: "var(--text-body)", // 'body' might conflict with html tag if used in weird ways, but ok as color
        // heading: "var(--text-heading)",
        
        // I'll use specific keys to avoid confusion, but the plan asked for semantic names.
        // I'll add them as direct colors so we can use text-body, bg-card etc.
        
        // Re-mapping for clarity based on plan
        // Usage: text-body, text-heading, text-muted
        "body": "var(--text-body)",
        "heading": "var(--text-heading)",
        
        accent: {
            blue: "var(--accent-blue)",
            cyan: "var(--accent-cyan)",
            emerald: "var(--accent-emerald)",
            amber: "var(--accent-amber)",
            indigo: "var(--accent-indigo)",
        },
        
        status: {
            success: "var(--status-success)",
            warning: "var(--status-warning)",
            caution: "var(--status-caution)",
            error: "var(--status-error)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
