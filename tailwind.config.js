/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "vs-black": "#1e1e1e",
                "vs-behind-editor": "#252526",
                "vs-window": "#2d2d2d",
                "vs-selected-file": "#37373d",
                "vs-hover-file": "#2a2d2e",
            },
        },
    },
    plugins: [],
};
