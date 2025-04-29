/**
 * Utilitaire pour générer des chemins d'accès aux ressources statiques
 * compatibles avec la configuration de base URL de Vite
 */
export const getAssetPath = (path) => {
    // Récupérer la base URL depuis l'environnement Vite
    const baseUrl = import.meta.env.BASE_URL || "/";

    // Supprimer le slash initial du chemin si la base URL se termine par un slash
    const normalizedPath = path.startsWith("/") ? path.substring(1) : path;

    // Construire le chemin complet
    return `${baseUrl}${normalizedPath}`;
};

export default getAssetPath;
