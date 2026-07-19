import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      fontSize: {
        "2xs": ["0.6154rem", { lineHeight: "1.3", letterSpacing: "0.06em" }],
        xs: ["0.7692rem", { lineHeight: "1.3" }],
        sm: ["0.8462rem", { lineHeight: "1.45" }],
        base: ["0.9231rem", { lineHeight: "1.45" }],
        lg: ["1.0769rem", { lineHeight: "1.45" }],
        xl: ["1.2308rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "2xl": ["1.5385rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "3xl": ["1.8462rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        micro: "3px",
        interactive: "5px",
        container: "6px",
        lg: "6px",
        md: "5px",
        sm: "3px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "drawer-right-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "drawer-right-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "drawer-bottom-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "drawer-bottom-out": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "scale-center-in": {
          from: { transform: "scale(0.92)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-center-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.96)", opacity: "0" },
        },
        "slide-up-fade-in": {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up-fade-out": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(-6px)", opacity: "0" },
        },
        "reveal-clip-in": {
          from: { clipPath: "inset(0 0 100% 0)" },
          to: { clipPath: "inset(0 0 0% 0)" },
        },
        "reveal-clip-out": {
          from: { clipPath: "inset(0 0 0% 0)" },
          to: { clipPath: "inset(0 0 100% 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "drawer-right": "drawer-right-in 320ms ease-out",
        "drawer-right-out": "drawer-right-out 240ms ease-in",
        "drawer-bottom": "drawer-bottom-in 340ms cubic-bezier(0.32, 0.72, 0, 1)",
        "drawer-bottom-out": "drawer-bottom-out 280ms ease-in",
        "scale-center": "scale-center-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-center-out": "scale-center-out 160ms ease-in",
        "slide-up-fade": "slide-up-fade-in 200ms ease-out",
        "slide-up-fade-out": "slide-up-fade-out 140ms ease-in",
        "reveal-clip": "reveal-clip-in 280ms cubic-bezier(0.76, 0, 0.24, 1)",
        "reveal-clip-out": "reveal-clip-out 200ms ease-in",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;