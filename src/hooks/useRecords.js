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
     * Vérifie si un temps mérite d'être dans le top 10 global
     *
     * @param {number} time - Temps à vérifier
     * @param {Array} records - Liste des records actuels
     * @returns {boolean} - true si le temps mérite d'être dans le top 10
     */
    const isInTop10 = useCallback((time, records) => {
        // Si moins de 10 records, alors oui
        if (!records || records.length < 10) {
            return true;
        }

        // Vérifier si le temps est meilleur que le dernier du top 10
        const worstTimeInTop10 = Math.max(
            ...records.map((r) => parseFloat(r.chrono))
        );
        return time < worstTimeInTop10;
    }, []);

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

                // Sauvegarder localement si c'est un nouveau record personnel
                if (isNewPersonalRecord) {
                    const saved = localStorage.localRecords.saveRecord(
                        circuitNumber,
                        time
                    );
                    console.log(`Saved locally: ${saved}`);

                    // Mettre à jour l'état du record personnel
                    setPersonalRecord(time);
                }

                // Vérifier si le temps mérite d'être dans le top 10 global
                const shouldSendToServer = isInTop10(time, globalRecords);
                console.log(
                    `Should send to server (top 10 candidate): ${shouldSendToServer}`
                );

                // Envoyer au serveur même si ce n'est pas un record personnel,
                // tant que c'est potentiellement dans le top 10
                if (shouldSendToServer) {
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

                    // Mettre à jour immédiatement les records globaux avec la réponse du serveur
                    if (result.records && Array.isArray(result.records)) {
                        console.log(
                            "Updating global records from server response:",
                            result.records
                        );
                        setGlobalRecords(result.records);
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
                        records: result.records, // Retourner les records mis à jour
                    };
                } else {
                    // Pas besoin d'envoyer au serveur car ce n'est ni un record personnel
                    // ni un potentiel top 10
                    console.log(
                        "Not sending to server - not a top 10 candidate"
                    );

                    // Mettre quand même à jour lastSavedRecord pour l'UI
                    const savedRecord = {
                        time,
                        isNewPersonalRecord,
                        rank: null,
                        success: true, // Succès local uniquement
                    };
                    setLastSavedRecord(savedRecord);

                    return {
                        success: true,
                        isNewPersonalRecord,
                        newRank: null,
                        records: globalRecords, // Retourner les records actuels
                    };
                }
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
        [
            circuitNumber,
            fetchGlobalRecords,
            personalRecord,
            globalRecords,
            isInTop10,
        ]
    );

    /**
     * Vérifie si le temps donné est un nouveau record personnel
     *
     * @param {number} time - Temps à vérifier
     * @returns {boolean} - true si c'est un meilleur temps que le record personnel actuel
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
