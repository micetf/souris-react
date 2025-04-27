/**
 * Utilitaires liés à la sécurité
 */

/**
 * Génère un token de session aléatoire
 *
 * @returns {string} - Le token généré
 */
export const generateSessionToken = () => {
    // Utiliser l'API Web Crypto pour générer un token sécurisé
    return Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0")
    ).join("");
};

/**
 * Génère une clé de sécurité pour valider les records
 * La clé est générée selon la même méthode que dans le code PHP d'origine
 *
 * @param {number} chrono - Temps en centièmes de secondes
 * @param {string} token - Token de session
 * @returns {Promise<string>} - Clé de sécurité (hash HMAC SHA-256)
 */
export const generateSecurityKey = async (chrono, token) => {
    try {
        // Utiliser SubtleCrypto pour générer un hash similaire à hash_hmac('sha256', ...) en PHP
        const encoder = new TextEncoder();
        const data = encoder.encode(`MiCetF${chrono}`);
        const keyData = encoder.encode(token);

        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signature = await window.crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            data
        );

        // Convertir le résultat en chaîne hexadécimale
        return Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    } catch (error) {
        console.error(
            "Erreur lors de la génération de la clé de sécurité:",
            error
        );
        // Fallback si SubtleCrypto n'est pas disponible ou échoue
        return token; // Simplifié, en production il faudrait une meilleure solution
    }
};

/**
 * Valide si un pseudo est acceptable
 *
 * @param {string} pseudo - Pseudo à valider
 * @returns {Object} - Résultat de la validation {valid: boolean, error: string|null}
 */
export const validatePseudo = (pseudo) => {
    if (!pseudo || pseudo.trim().length === 0) {
        return { valid: false, error: "Le pseudo ne peut pas être vide." };
    }

    if (pseudo.trim().length < 4) {
        return {
            valid: false,
            error: "Le pseudo doit contenir au moins 4 caractères.",
        };
    }

    if (pseudo.includes(",")) {
        return {
            valid: false,
            error: "Le pseudo ne peut pas contenir de virgule.",
        };
    }

    return { valid: true, error: null };
};

export default {
    generateSessionToken,
    generateSecurityKey,
    validatePseudo,
};
