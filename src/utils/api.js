/**
 * Module pour les appels à l'API
 */

import security from "./security";

/**
 * Utilitaire pour générer des chemins d'accès aux APIs
 * compatibles avec la configuration de base URL de Vite
 */
export const getApiPath = (endpoint) => {
    // Récupérer la base URL depuis l'environnement Vite
    const baseUrl = import.meta.env.BASE_URL || "/";

    // Supprimer le slash initial de l'endpoint si la base URL se termine par un slash
    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint.substring(1)
        : endpoint;

    // Construire le chemin complet
    return `${baseUrl}${normalizedEndpoint}`;
};

/**
 * URL de base de l'API (utilise la base URL de Vite)
 */
const API_BASE_URL = getApiPath("api");

/**
 * Récupère les records pour un circuit spécifique
 *
 * @param {number} circuitNumber - Numéro du circuit
 * @returns {Promise<Object>} - Liste des records
 */
export const getRecords = async (circuitNumber) => {
    try {
        // Construction de l'URL avec le format correct
        // L'API attend simplement "parcours=1", pas "parcours=parcours1"
        const url = `${API_BASE_URL}/records.php?parcours=${circuitNumber}`;

        console.log(
            `[API] Récupération des records pour le circuit ${circuitNumber} (${url})`
        );

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Vérification et nettoyage des données reçues
        if (!data.records || !Array.isArray(data.records)) {
            console.warn(
                "Format de réponse inattendu de l'API, initialisation d'un tableau vide"
            );
            return { records: [] };
        }

        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération des records:", error);

        // Retourner un tableau vide en cas d'erreur pour éviter les problèmes
        return { records: [] };
    }
};

/**
 * Sauvegarde un nouveau record
 *
 * @param {Object} recordData - Données du record
 * @param {number} recordData.parcours - Numéro du circuit
 * @param {string} recordData.pseudo - Pseudo du joueur
 * @param {number} recordData.chrono - Temps réalisé (en secondes)
 * @param {string} recordData.token - Token de sécurité
 * @returns {Promise<Object>} - Résultat de la sauvegarde
 */
export const saveRecord = async ({
    parcours,
    pseudo,
    chrono,
    token,
    debugContext,
}) => {
    try {
        // Convertir le temps en centièmes de secondes (format attendu par l'API)
        const chronoValue = Math.round(chrono * 100);

        // Générer une clé de sécurité - attendre la résolution de la promesse
        const key = await security.generateSecurityKey(chronoValue, token);

        // Création des données sous forme JSON pour l'API
        const recordData = {
            parcours: parcours,
            pseudo: pseudo,
            chrono: chronoValue,
            token: token,
            key: key,
            debugContext: debugContext || "unknown",
        };

        console.log(
            `[API] Sauvegarde d'un record pour le circuit ${parcours} (${chrono}s, ${pseudo})`
        );

        const response = await fetch(`${API_BASE_URL}/records.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recordData),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Vérification des données reçues
        if (!data.records || !Array.isArray(data.records)) {
            console.warn(
                "Format de réponse inattendu de l'API lors de la sauvegarde"
            );
            // Ajouter les records vides pour éviter les erreurs
            data.records = [];
        }

        return data;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du record:", error);

        // Retourner une structure d'erreur cohérente
        return {
            success: false,
            error: error.message,
            records: [],
        };
    }
};

/**
 * Importe les utilitaires pour les records locaux
 */
import localStorage from "./localStorage";
const { localRecords } = localStorage;

// Export de toutes les fonctions
export default {
    getRecords,
    saveRecord,
    localRecords,
    getApiPath,
};
