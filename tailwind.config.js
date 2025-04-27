/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@micetf/ui/**/*.{js,jsx}", // Pour les composants de la bibliothèque MiCetF
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                },
            },
            fontFamily: {
                sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"), // Pour le style du texte dans la documentation
    ],
    // Assurez-vous que les classes importantes sont toujours incluses
    safelist: [
        // Classes pour la Navbar
        {
            pattern:
                /^(bg|text|border)-(primary|gray|red|green|blue|yellow)-\d+$/,
        },
        "fixed",
        "top-0",
        "w-full",
        "z-50",

        // Classes pour les animations
        "animate-spin",
        "animate-pulse",

        // Classes pour les états du jeu
        "bg-green-700",
        "bg-orange-700",
        "bg-red-600",
    ],
};
