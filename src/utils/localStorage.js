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
        try {
            if (!localStorage.getItem("sourisRecords")) {
                localStorage.setItem("sourisRecords", JSON.stringify({}));
            }
            const records = JSON.parse(localStorage.getItem("sourisRecords"));

            // Vérification de l'intégrité des données
            if (typeof records !== "object" || records === null) {
                console.warn("Records corrompus, réinitialisation");
                localStorage.setItem("sourisRecords", JSON.stringify({}));
                return {};
            }

            return records;
        } catch (error) {
            console.error(
                "Erreur lors de l'initialisation des records:",
                error
            );
            return {};
        }
    },

    /**
     * Sauvegarde un record local
     * @param {number|string} parcours - Numéro du parcours
     * @param {number|string} chrono - Temps réalisé (en secondes)
     * @returns {boolean} - true si c'est un nouveau record, false sinon
     */
    saveRecord: (parcours, chrono) => {
        try {
            console.log(
                `Saving local record for circuit ${parcours}: ${chrono}s`
            );

            let records = localRecords.init();

            // S'assurer que parcours est une chaîne pour l'utiliser comme clé
            const parcoursKey = parcours.toString();

            // S'assurer que les deux valeurs sont des nombres pour la comparaison
            const oldRecord = parseFloat(records[parcoursKey] || Infinity);
            const newTime = parseFloat(chrono);

            // S'assurer que les valeurs sont valides
            if (isNaN(newTime) || newTime <= 0) {
                console.warn(`Invalid time value: ${chrono}`);
                return false;
            }

            console.log(`Old record: ${oldRecord}s, New record: ${newTime}s`);

            // Pour un jeu de vitesse, un temps plus PETIT est meilleur
            if (newTime < oldRecord) {
                records[parcoursKey] = newTime; // Stocker comme nombre
                localStorage.setItem("sourisRecords", JSON.stringify(records));
                console.log(`New record saved: ${newTime}s`);
                return true; // Nouveau record
            }

            return false; // Pas de nouveau record
        } catch (error) {
            console.error(
                "Erreur lors de la sauvegarde du record local:",
                error
            );
            return false;
        }
    },

    /**
     * Récupère un record local
     * @param {number} parcours - Numéro du parcours
     * @returns {number|null} - Le record ou null s'il n'existe pas
     */
    getRecord: (parcours) => {
        try {
            const records = localRecords.init();
            const parcoursKey = parcours.toString();
            const record = records[parcoursKey];

            // S'assurer que la valeur est un nombre
            return record !== undefined ? parseFloat(record) : null;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération du record local:",
                error
            );
            return null;
        }
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
        try {
            let records = localRecords.init();
            const parcoursKey = parcours.toString();

            if (records[parcoursKey] !== undefined) {
                delete records[parcoursKey];
                localStorage.setItem("sourisRecords", JSON.stringify(records));
                return true;
            }

            return false;
        } catch (error) {
            console.error("Erreur lors de la suppression du record:", error);
            return false;
        }
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
            if (!pseudo || pseudo.trim().length < 4) {
                console.warn("Pseudo invalide, minimum 4 caractères requis");
                return false;
            }

            localStorage.setItem("sourisPseudo", pseudo.trim());
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
        try {
            const pseudo = localStorage.getItem("sourisPseudo");
            return pseudo && pseudo.trim().length >= 4 ? pseudo : "Anonyme";
        } catch (error) {
            console.error("Erreur lors de la récupération du pseudo:", error);
            return "Anonyme";
        }
    },

    /**
     * Sauvegarde le dernier circuit visité
     * @param {number} circuit - Numéro du circuit
     * @returns {boolean} - true si l'opération a réussi
     */
    saveLastCircuit: (circuit) => {
        try {
            const circuitNumber = parseInt(circuit);
            if (isNaN(circuitNumber) || circuitNumber < 1) {
                console.warn("Numéro de circuit invalide");
                return false;
            }

            localStorage.setItem("sourisLastCircuit", circuitNumber.toString());
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
        try {
            const circuit = localStorage.getItem("sourisLastCircuit");
            const circuitNumber = circuit ? parseInt(circuit, 10) : 1;
            return !isNaN(circuitNumber) && circuitNumber > 0
                ? circuitNumber
                : 1;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération du dernier circuit:",
                error
            );
            return 1;
        }
    },
};

/**
 * Gestion des pseudos précédemment utilisés
 */
export const pseudoManager = {
    /**
     * Récupère tous les pseudos stockés
     * @returns {Array} - Liste des pseudos précédents (max 3)
     */
    getAllPseudos: () => {
        try {
            const storedPseudos = localStorage.getItem("sourisAllPseudos");
            if (!storedPseudos) return [];
            
            const pseudoList = JSON.parse(storedPseudos);
            if (!Array.isArray(pseudoList)) return [];
            
            // Filtrer les pseudos vides ou "Anonyme"
            return pseudoList.filter(p => p && p !== "Anonyme" && p.length >= 4);
        } catch (error) {
            console.error("Erreur lors de la récupération des pseudos:", error);
            return [];
        }
    },
    
    /**
     * Ajoute un pseudo à la liste des pseudos stockés
     * @param {string} pseudo - Pseudo à stocker
     * @returns {boolean} - true si l'opération a réussi
     */
    addPseudo: (pseudo) => {
        if (!pseudo || pseudo === "Anonyme" || pseudo.length < 4) return false;
        
        try {
            // Récupérer la liste actuelle
            const currentList = pseudoManager.getAllPseudos();
            
            // Si le pseudo est déjà dans la liste, le mettre en premier
            const filteredList = currentList.filter(p => p !== pseudo);
            
            // Ajouter le nouveau pseudo au début (plus récent)
            const newList = [pseudo, ...filteredList];
            
            // Garder seulement les 3 derniers pseudos (limite adaptée pour contexte scolaire)
            const limitedList = newList.slice(0, 3);
            
            // Sauvegarder
            localStorage.setItem("sourisAllPseudos", JSON.stringify(limitedList));
            
            return true;
        } catch (error) {
            console.error("Erreur lors de l'ajout du pseudo:", error);
            return false;
        }
    },
    
    /**
     * Supprime un pseudo de la liste des pseudos stockés
     * @param {string} pseudo - Pseudo à supprimer
     * @returns {boolean} - true si l'opération a réussi
     */
    removePseudo: (pseudo) => {
        try {
            // Récupérer la liste actuelle
            const currentList = pseudoManager.getAllPseudos();
            
            // Filtrer le pseudo à supprimer
            const newList = currentList.filter(p => p !== pseudo);
            
            // Sauvegarder
            localStorage.setItem("sourisAllPseudos", JSON.stringify(newList));
            
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression du pseudo:", error);
            return false;
        }
    },
    
    /**
     * Efface tous les pseudos stockés
     * @returns {boolean} - true si l'opération a réussi
     */
    clearAllPseudos: () => {
        try {
            localStorage.removeItem("sourisAllPseudos");
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression de tous les pseudos:", error);
            return false;
        }
    }
};

// Export par défaut
export default {
    localRecords,
    userPreferences,
    pseudoManager
};