const { default: plugin } = require("@tailwindcss/typography");

module.exports = {
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["react"],
};
