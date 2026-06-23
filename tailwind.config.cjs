/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            // These allow you to use text-nino-pink or bg-nino-dark anywhere in your HTML
            colors: {
                'nino-pink': '#FF7096',
                'nino-cyan': '#22D3EE',
                'nino-dark': '#0F0E17',
                'nino-cream': '#F4EFEA',
            }
        },
    },
    plugins: [typography, daisyui],
    daisyui: {
        // We include the default "light" theme, plus your custom "ninodark"
        themes: [
            "light",
            {
                ninodark: {
                    "primary": "#FF7096",        // Nakano Pink for main buttons
                    "secondary": "#22D3EE",      // Ribbon Cyan for accents
                    "accent": "#A855F7",         // Soft purple
                    "neutral": "#1E1B29",        // Dark Velvet for card backgrounds
                    "base-100": "#0F0E17",       // Ribbon Indigo for deep background
                    "info": "#3ABFF8",
                    "success": "#36D399",
                    "warning": "#FBBD23",
                    "error": "#F87272",
                },
            }
        ],
        darkTheme: "ninodark", // This forces the site to use your Nino theme for dark mode
        logs: false,
    }
}