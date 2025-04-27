import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook personnalisé pour gérer un chronomètre de haute précision
 *
 * @param {Object} options - Options du chronomètre
 * @param {boolean} [options.autoStart=false] - Démarrer automatiquement le chronomètre
 * @param {number} [options.precision=2] - Nombre de chiffres après la virgule
 * @returns {Object} État et fonctions pour contrôler le chronomètre
 */
const useTimer = ({ autoStart = false, precision = 2 } = {}) => {
    // États
    const [isRunning, setIsRunning] = useState(autoStart);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Références
    const startTimeRef = useRef(null);
    const requestIdRef = useRef(null);
    const previousTimeRef = useRef(0);

    /**
     * Mise à jour du chronomètre avec requestAnimationFrame
     * pour une précision maximale
     */
    const tick = useCallback(
        (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = (timestamp - startTimeRef.current) / 1000;
            setElapsedTime(elapsed);

            if (isRunning) {
                requestIdRef.current = requestAnimationFrame(tick);
            }
        },
        [isRunning]
    );

    /**
     * Démarrer le chronomètre
     */
    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
            previousTimeRef.current = elapsedTime;
            startTimeRef.current = null;
            requestIdRef.current = requestAnimationFrame(tick);
        }
    }, [isRunning, elapsedTime, tick]);

    /**
     * Arrêter le chronomètre
     */
    const stop = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current);
            }
        }
    }, [isRunning]);

    /**
     * Réinitialiser le chronomètre
     *
     * @param {boolean} [autoRestart=false] - Redémarrer automatiquement après la réinitialisation
     */
    const reset = useCallback(
        (autoRestart = false) => {
            setElapsedTime(0);
            previousTimeRef.current = 0;
            startTimeRef.current = null;

            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current);
            }

            setIsRunning(autoRestart);
            if (autoRestart) {
                requestIdRef.current = requestAnimationFrame(tick);
            }
        },
        [tick]
    );

    // Formater le temps avec la précision demandée
    const formattedTime = elapsedTime.toFixed(precision);

    // Démarrer automatiquement si nécessaire
    useEffect(() => {
        if (autoStart) {
            start();
        }

        return () => {
            if (requestIdRef.current) {
                cancelAnimationFrame(requestIdRef.current);
            }
        };
    }, [autoStart, start]);

    return {
        isRunning,
        elapsedTime,
        formattedTime,
        start,
        stop,
        reset,
    };
};

export default useTimer;
