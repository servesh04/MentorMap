/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            primary: 'var(--primary)',
            secondary: 'var(--secondary)',
            background: 'var(--background)',
            foreground: 'var(--foreground)',
            surface: 'var(--card)',
            card: 'var(--card)',
            muted: 'var(--muted)',
            border: 'var(--border)',
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
