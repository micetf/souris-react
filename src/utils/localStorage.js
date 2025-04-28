/**
 * Utilitaires pour la gestion du localStorage
 */

/**
 * Gestion des records locaux
 */
export const localRecords = {
    /**
     * Initialise le stockage local des records
     * @returns {Object} - Records stockés localement
     */
    init: () => {
        if (!localStorage.getItem("sourisRecords")) {
            localStorage.setItem("sourisRecords", JSON.stringify({}));
        }
        return JSON.parse(localStorage.getItem("sourisRecords"));
    },

    /**
     * Sauvegarde un record local
     * @param {number|string} parcours - Numéro du parcours
     * @param {number|string} chrono - Temps réalisé (en secondes)
     * @returns {boolean} - true si c'est un nouveau record, false sinon
     */
    saveRecord: (parcours, chrono) => {
        let records = localRecords.init();

        // S'assurer que les deux valeurs sont des nombres pour la comparaison
        const oldRecord = parseFloat(records[parcours] || Infinity);
        const newTime = parseFloat(chrono);

        // S'assurer que les valeurs sont valides
        if (isNaN(newTime)) return false;

        // Pour un jeu de vitesse, un temps plus PETIT est meilleur
        if (newTime < oldRecord) {
            records[parcours] = newTime; // Stocker comme nombre
            localStorage.setItem("sourisRecords", JSON.stringify(records));
            return true; // Nouveau record
        }

        return false; // Pas de nouveau record
    },

    /**
     * Récupère un record local
     * @param {number} parcours - Numéro du parcours
     * @returns {number|null} - Le record ou null s'il n'existe pas
     */
    getRecord: (parcours) => {
        const records = localRecords.init();
        return records[parcours] || null;
    },

    /**
     * Récupère tous les records locaux
     * @returns {Object} - Tous les records stockés
     */
    getAllRecords: () => {
        return localRecords.init();
    },

    /**
     * Supprime un record local
     * @param {number} parcours - Numéro du parcours
     * @returns {boolean} - true si supprimé, false sinon
     */
    deleteRecord: (parcours) => {
        let records = localRecords.init();

        if (records[parcours]) {
            delete records[parcours];
            localStorage.setItem("sourisRecords", JSON.stringify(records));
            return true;
        }

        return false;
    },

    /**
     * Supprime tous les records locaux
     * @returns {boolean} - true si l'opération a réussi
     */
    clearAllRecords: () => {
        try {
            localStorage.setItem("sourisRecords", JSON.stringify({}));
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression des records:", error);
            return false;
        }
    },
};

/**
 * Gestion des préférences utilisateur
 */
export const userPreferences = {
    /**
     * Sauvegarde le pseudo de l'utilisateur
     * @param {string} pseudo - Pseudo à sauvegarder
     * @returns {boolean} - true si l'opération a réussi
     */
    savePseudo: (pseudo) => {
        try {
            localStorage.setItem("sourisPseudo", pseudo);
            return true;
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du pseudo:", error);
            return false;
        }
    },

    /**
     * Récupère le pseudo de l'utilisateur
     * @returns {string} - Pseudo sauvegardé ou 'Anonyme' par défaut
     */
    getPseudo: () => {
        return localStorage.getItem("sourisPseudo") || "Anonyme";
    },

    /**
     * Sauvegarde le dernier circuit visité
     * @param {number} circuit - Numéro du circuit
     * @returns {boolean} - true si l'opération a réussi
     */
    saveLastCircuit: (circuit) => {
        try {
            localStorage.setItem("sourisLastCircuit", circuit.toString());
            return true;
        } catch (error) {
            console.error(
                "Erreur lors de la sauvegarde du dernier circuit:",
                error
            );
            return false;
        }
    },

    /**
     * Récupère le dernier circuit visité
     * @returns {number} - Numéro du dernier circuit ou 1 par défaut
     */
    getLastCircuit: () => {
        const circuit = localStorage.getItem("sourisLastCircuit");
        return circuit ? parseInt(circuit, 10) : 1;
    },
};

export default {
    localRecords,
    userPreferences,
};
