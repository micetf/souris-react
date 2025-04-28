import { useState, useEffect, useRef, useCallback } from "react";
import imageUtils from "../utils/imageProcessing";

/**
 * Hook personnalisé pour gérer la logique du jeu
 *
 * @param {Array<Array<number>>} bitmap - Matrice 2D représentant le circuit
 * @returns {Object} État et fonctions pour contrôler le jeu
 */
const useGame = (bitmap) => {
    // États du jeu
    const [gameState, setGameState] = useState("idle"); // 'idle', 'playing', 'win', 'lost'
    const [currentPosition, setCurrentPosition] = useState([0, 0]);
    const [startPosition, setStartPosition] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastResult, setLastResult] = useState(null);

    // Références
    const timerRef = useRef(null);
    const lastPositionRef = useRef([0, 0]);
    const requestAnimationFrameRef = useRef(null);

    // Tolérance pour la détection des sorties de route (en pixels)
    const pathTolerance = 3;

    // Fonction de mise à jour du chronomètre
    const updateTimer = useCallback(() => {
        if (gameState === "playing" && startTime) {
            const now = new Date();
            const elapsed = (now.getTime() - startTime.getTime()) / 1000;
            setElapsedTime(elapsed);

            requestAnimationFrameRef.current =
                requestAnimationFrame(updateTimer);
        }
    }, [gameState, startTime]);

    // Démarrer ou arrêter le chronomètre en fonction de l'état du jeu
    useEffect(() => {
        if (gameState === "playing" && startTime) {
            updateTimer();
        } else {
            if (requestAnimationFrameRef.current) {
                cancelAnimationFrame(requestAnimationFrameRef.current);
            }
        }

        return () => {
            if (requestAnimationFrameRef.current) {
                cancelAnimationFrame(requestAnimationFrameRef.current);
            }
        };
    }, [gameState, startTime, updateTimer]);

    /**
     * Démarrer une nouvelle partie
     *
     * @param {Array<number>} position - Position de départ [x, y]
     */
    const startGame = useCallback((position) => {
        setStartPosition(position);
        setCurrentPosition(position);
        lastPositionRef.current = position;
        setStartTime(new Date());
        setElapsedTime(0);
        setGameState("playing");
    }, []);

    /**
     * Réinitialiser le jeu
     */
    const resetGame = useCallback(() => {
        setGameState("idle");
        setElapsedTime(0);
        setCurrentPosition([0, 0]);
        setStartPosition(null);
        setStartTime(null);

        if (requestAnimationFrameRef.current) {
            cancelAnimationFrame(requestAnimationFrameRef.current);
        }
    }, []);

    /**
     * Terminer le jeu (victoire ou défaite)
     *
     * @param {string} result - Résultat de la partie ('win' ou 'lost')
     * @returns {number|null} - Temps final en cas de victoire, null sinon
     */
    const endGame = useCallback(
        (result) => {
            const finalState = result === "win" ? "win" : "lost";
            setGameState(finalState);

            if (requestAnimationFrameRef.current) {
                cancelAnimationFrame(requestAnimationFrameRef.current);
            }

            setLastResult({
                state: finalState,
                time: elapsedTime,
                position: currentPosition,
            });

            return finalState === "win" ? elapsedTime : null;
        },
        [elapsedTime, currentPosition]
    );

    /**
     * Mettre à jour la position et vérifier les collisions avec tolérance
     *
     * @param {number} x - Position X de la souris
     * @param {number} y - Position Y de la souris
     * @returns {string|null} - Résultat de la mise à jour (null, 'collision', 'finish', etc.)
     */
    const updatePosition = useCallback(
        (x, y) => {
            // Ne rien faire si le jeu n'est pas en cours
            if (gameState !== "playing") return null;

            // Vérifier si le déplacement n'est pas trop grand (anti-triche)
            const lastPos = lastPositionRef.current;
            const moveDistance = Math.sqrt(
                Math.pow(Math.abs(lastPos[0] - x), 2) +
                    Math.pow(Math.abs(lastPos[1] - y), 2)
            );

            if (moveDistance > 400) {
                endGame("lost");
                return "teleport"; // Déplacement trop grand
            }

            // Mettre à jour la position
            setCurrentPosition([x, y]);
            lastPositionRef.current = [x, y];

            // Vérifier si on est en dehors des limites du bitmap
            if (!bitmap || x < 0 || y < 0 || x >= bitmap.length) {
                endGame("lost");
                return "out-of-bounds";
            }

            // Vérifier si on est sur un point d'arrivée (rouge)
            // Utiliser la fonction utilitaire avec tolérance
            if (imageUtils.isOnPath(bitmap, x, y, pathTolerance, 3)) {
                endGame("win");
                return "finish";
            }

            // Vérifier si on est sur le chemin (bleu) ou sur un point de départ (vert)
            const onPath =
                imageUtils.isOnPath(bitmap, x, y, pathTolerance, 2) ||
                imageUtils.isOnPath(bitmap, x, y, pathTolerance, 1);

            if (!onPath) {
                endGame("lost");
                return "collision";
            }

            return null; // Continuer le jeu
        },
        [bitmap, gameState, endGame, pathTolerance]
    );

    // Retourner les états et fonctions
    return {
        gameState,
        currentPosition,
        startPosition,
        elapsedTime,
        lastResult,
        startGame,
        resetGame,
        endGame,
        updatePosition,
    };
};

export default useGame;
