// src/utils/assetPath.js
export const getAssetPath = (path) => {
    const base = import.meta.env.BASE_URL || "/";
    return `${base}${path.startsWith("/") ? path.substring(1) : path}`;
};
