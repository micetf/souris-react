import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import localStorage from "../utils/localStorage";

/**
 * Hook personnalisé pour gérer les records d'un circuit
 *
 * @param {number} circuitNumber - Numéro du circuit
 * @returns {Object} État et fonctions pour gérer les records
 */
const useRecords = (circuitNumber) => {
    // États
    const [globalRecords, setGlobalRecords] = useState([]);
    const [personalRecord, setPersonalRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSavedRecord, setLastSavedRecord] = useState(null);

    /**
     * Récupère les records globaux depuis l'API
     */
    const fetchGlobalRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Fetching records for circuit ${circuitNumber}`);
            const response = await api.getRecords(circuitNumber);
            setGlobalRecords(response.records || []);

            // Récupérer aussi le record personnel local
            const localRecord =
                localStorage.localRecords.getRecord(circuitNumber);
            setPersonalRecord(localRecord);

            return response.records;
        } catch (err) {
            console.error("Erreur lors de la récupération des records:", err);
            setError(
                "Impossible de charger les records. Veuillez réessayer plus tard."
            );
            return [];
        } finally {
            setLoading(false);
        }
    }, [circuitNumber]);

    /**
     * Sauvegarde un nouveau record
     *
     * @param {Object} recordData - Données du record
     * @param {string} recordData.pseudo - Pseudo du joueur
     * @param {number} recordData.time - Temps réalisé (en secondes)
     * @param {string} recordData.token - Token de sécurité
     * @returns {Promise<Object>} - Résultat de la sauvegarde
     */
    const saveRecord = useCallback(
        async ({ pseudo, time, token }) => {
            try {
                setLoading(true);
                setError(null);

                console.log(
                    `Saving record for circuit ${circuitNumber}: ${time}s by ${pseudo}`
                );

                // Vérifier si c'est un nouveau record personnel
                const isNewPersonalRecord =
                    !personalRecord || time < personalRecord;
                console.log(
                    `Is new personal record: ${isNewPersonalRecord}, current: ${personalRecord}s, new: ${time}s`
                );

                // Sauvegarder localement d'abord si c'est un nouveau record
                if (isNewPersonalRecord) {
                    const saved = localStorage.localRecords.saveRecord(
                        circuitNumber,
                        time
                    );
                    console.log(`Saved locally: ${saved}`);

                    // Mettre à jour l'état du record personnel
                    setPersonalRecord(time);
                }

                // Puis envoyer au serveur
                console.log(
                    `Sending record to server for circuit ${circuitNumber}`
                );
                const result = await api.saveRecord({
                    parcours: circuitNumber,
                    pseudo,
                    chrono: time,
                    token,
                });

                console.log("Server response:", result);

                // Gérer les erreurs de l'API
                if (!result.success && result.error) {
                    setError(`Erreur serveur: ${result.error}`);
                    return {
                        success: false,
                        error: result.error,
                        isNewPersonalRecord,
                    };
                }

                // Mettre à jour les records globaux
                if (result.records && Array.isArray(result.records)) {
                    setGlobalRecords(result.records);
                } else {
                    // Si le serveur ne renvoie pas la liste mise à jour, rafraîchir manuellement
                    await fetchGlobalRecords();
                }

                // Enregistrer ce record comme le dernier sauvegardé
                const savedRecord = {
                    time,
                    isNewPersonalRecord,
                    rank: result.newRank || null,
                    success: result.success,
                };
                setLastSavedRecord(savedRecord);
                console.log("Last saved record updated:", savedRecord);

                return {
                    success: true,
                    isNewPersonalRecord,
                    newRank: result.newRank,
                    ...result,
                };
            } catch (err) {
                console.error("Erreur lors de la sauvegarde du record:", err);
                setError(
                    "Impossible de sauvegarder le record. Veuillez réessayer plus tard."
                );

                return {
                    success: false,
                    error: err.message,
                };
            } finally {
                setLoading(false);
            }
        },
        [circuitNumber, fetchGlobalRecords, personalRecord]
    );

    /**
     * Vérifie si le temps donné est un nouveau record
     *
     * @param {number} time - Temps à vérifier
     * @returns {boolean} - true si c'est un meilleur temps que le record actuel
     */
    const isNewRecord = useCallback(
        (time) => {
            return !personalRecord || time < personalRecord;
        },
        [personalRecord]
    );

    // Charger les records au chargement et quand le numéro de circuit change
    useEffect(() => {
        fetchGlobalRecords();
    }, [circuitNumber, fetchGlobalRecords]);

    return {
        globalRecords,
        personalRecord,
        loading,
        error,
        lastSavedRecord,
        fetchGlobalRecords,
        saveRecord,
        isNewRecord,
    };
};

export default useRecords;
