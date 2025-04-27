import { useState, useEffect, useCallback } from "react";
import imageProcessing from "../utils/imageProcessing";
import security from "../utils/security";
import localStorage from "../utils/localStorage";

/**
 * Hook personnalisé pour gérer le chargement et le traitement des circuits
 *
 * @param {number} initialCircuitNumber - Numéro du circuit initial à charger
 * @returns {Object} État et fonctions pour manipuler le circuit
 */
const useCircuit = (initialCircuitNumber = 1) => {
    // États
    const [circuitNumber, setCircuitNumber] = useState(initialCircuitNumber);
    const [circuitData, setCircuitData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Génère le circuit à partir de l'image
     *
     * @param {number} number - Numéro du circuit à charger
     * @returns {Promise<Object>} - Données du circuit
     */
    const generateCircuit = useCallback(async (number) => {
        setLoading(true);
        setError(null);

        try {
            // Sauvegarder le dernier circuit consulté
            localStorage.userPreferences.saveLastCircuit(number);

            // Choisir la méthode de génération de bitmap en fonction du support des Web Workers
            const generateBitmap = window.Worker
                ? imageProcessing.generateBitmapFromImageAsync
                : imageProcessing.generateBitmapFromImage;

            // Générer la bitmap à partir de l'image
            const bitmap = await generateBitmap(number);

            // Générér un token de session pour la sécurité
            const sessionToken = security.generateSessionToken();

            // Créer les données complètes du circuit
            const data = {
                bitmap,
                circuitNumber: number,
                circuitName: `parcours${number}`,
                totalCircuits: 17, // Nombre total de circuits disponibles
                sessionToken,
                imageUrl: `/images/parcours${number}.png`,
                startPositions: imageProcessing.findStartPositions(bitmap),
                endPositions: imageProcessing.findEndPositions(bitmap),
            };

            setCircuitData(data);
            setLoading(false);

            return data;
        } catch (err) {
            console.error(
                `Erreur lors du chargement du circuit ${number}:`,
                err
            );
            setError(
                `Impossible de charger le circuit ${number}. ${err.message}`
            );
            setLoading(false);
            return null;
        }
    }, []);

    /**
     * Change de circuit
     *
     * @param {number} number - Numéro du circuit à charger
     * @returns {Promise<Object>} - Nouvelles données du circuit
     */
    const changeCircuit = useCallback(
        async (number) => {
            if (number === circuitNumber && circuitData) return circuitData;

            setCircuitNumber(number);
            return await generateCircuit(number);
        },
        [circuitNumber, circuitData, generateCircuit]
    );

    // Charger le circuit lors du montage du composant
    useEffect(() => {
        generateCircuit(circuitNumber);
    }, [circuitNumber, generateCircuit]);

    return {
        circuitData,
        loading,
        error,
        changeCircuit,
        circuitNumber,
    };
};

export default useCircuit;
