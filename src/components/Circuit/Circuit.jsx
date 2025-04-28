import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import useGame from "../../hooks/useGame";
import Popup from "../Popup/Popup";
import imageUtils from "../../utils/imageProcessing";

/**
 * Composant principal du jeu affichant le circuit et gérant les interactions
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.circuitName - Nom du circuit (ex: "parcours1")
 * @param {Array<Array<number>>} props.bitmap - Données bitmap du circuit
 * @param {string} props.imageUrl - URL de l'image du circuit
 * @param {function} props.onGameEnd - Callback appelé à la fin du jeu
 */
const Circuit = ({ circuitName, bitmap, imageUrl, onGameEnd }) => {
    // Références
    const circuitRef = useRef(null);
    const imgRef = useRef(null);

    // États locaux
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({
        title: "",
        message: "",
        type: "info",
    });
    const [imgOffset, setImgOffset] = useState({ left: 0, top: 0 });
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
    const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

    // Trouver les positions de départ dans le bitmap
    const startPositions = imageUtils.findStartPositions(bitmap);

    // Hook useGame pour la logique de jeu
    const { gameState, elapsedTime, startGame, resetGame, updatePosition } =
        useGame(bitmap);

    // Stocker les dimensions originales de l'image
    useEffect(() => {
        if (bitmap && bitmap.length) {
            setOriginalSize({
                width: bitmap.length,
                height: bitmap[0].length,
            });
        }
    }, [bitmap]);

    // Fonction pour mettre à jour les offsets et dimensions de l'image
    const updateImageMetrics = useCallback(() => {
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            setImgOffset({
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
            });
            setImgSize({
                width: rect.width,
                height: rect.height,
            });
        }
    }, []);

    // Mettre à jour les métriques lorsque la fenêtre change
    useEffect(() => {
        updateImageMetrics();

        // S'assurer que les métriques sont exactes après le chargement complet
        if (imgRef.current) {
            imgRef.current.onload = updateImageMetrics;
        }

        window.addEventListener("resize", updateImageMetrics);
        window.addEventListener("scroll", updateImageMetrics);

        return () => {
            window.removeEventListener("resize", updateImageMetrics);
            window.removeEventListener("scroll", updateImageMetrics);
        };
    }, [updateImageMetrics]);

    // Convertir les coordonnées de l'écran en coordonnées bitmap
    const screenToBitmapCoordinates = useCallback(
        (screenX, screenY) => {
            // S'assurer que les dimensions sont valides
            if (
                !imgSize.width ||
                !imgSize.height ||
                !originalSize.width ||
                !originalSize.height
            ) {
                return [0, 0];
            }

            // Calculer les coordonnées relatives à l'image
            const relativeX = screenX - imgOffset.left;
            const relativeY = screenY - imgOffset.top;

            // Convertir en coordonnées bitmap en tenant compte du ratio d'échelle
            const scaleX = originalSize.width / imgSize.width;
            const scaleY = originalSize.height / imgSize.height;

            const bitmapX = Math.floor(relativeX * scaleX);
            const bitmapY = Math.floor(relativeY * scaleY);

            return [bitmapX, bitmapY];
        },
        [imgOffset, imgSize, originalSize]
    );

    // Gestion des événements souris
    const handleMouseMove = useCallback(
        (e) => {
            e.preventDefault();

            // Convertir les coordonnées écran en coordonnées bitmap
            const [x, y] = screenToBitmapCoordinates(e.pageX, e.pageY);

            // Si le jeu est en cours, mettre à jour la position
            if (gameState === "playing") {
                const result = updatePosition(x, y);

                // Gérer les différents résultats
                if (result) {
                    switch (result) {
                        case "collision":
                        case "teleport":
                        case "out-of-bounds":
                            setPopupContent({
                                title: "Perdu !",
                                message: "Tu as quitté le chemin bleu.",
                                type: "error",
                            });
                            setShowPopup(true);

                            // Notifier le composant parent
                            if (onGameEnd) {
                                onGameEnd("lost");
                            }
                            break;

                        case "finish":
                            const timeString = elapsedTime.toFixed(2);
                            setPopupContent({
                                title: "Bravo !",
                                message: `Tu as réussi en ${timeString} secondes !`,
                                type: "success",
                                time: elapsedTime,
                            });
                            setShowPopup(true);

                            // Notifier le composant parent
                            if (onGameEnd) {
                                onGameEnd("win", elapsedTime);
                            }
                            break;

                        default:
                            break;
                    }
                }
            } else if (gameState === "idle") {
                // Vérifier si on démarre le jeu (clic sur un point de départ)
                if (
                    bitmap &&
                    x >= 0 &&
                    y >= 0 &&
                    x < bitmap.length &&
                    bitmap[x]
                ) {
                    const value = bitmap[x][y];
                    if (value === 1) {
                        // Point de départ (vert)
                        startGame([x, y]);
                    }
                }
            }
        },
        [
            bitmap,
            gameState,
            elapsedTime,
            onGameEnd,
            screenToBitmapCoordinates,
            startGame,
            updatePosition,
        ]
    );

    const handleMouseDown = useCallback(
        (e) => {
            // Si le jeu est en cours, considérer comme une défaite (clic)
            if (gameState === "playing") {
                e.preventDefault();

                setPopupContent({
                    title: "Perdu !",
                    message: "Tu as cliqué pendant le jeu.",
                    type: "error",
                });
                setShowPopup(true);

                resetGame();

                if (onGameEnd) {
                    onGameEnd("lost");
                }
            }
        },
        [gameState, onGameEnd, resetGame]
    );

    // Gérer la sortie du circuit
    const handleMouseLeave = useCallback(() => {
        if (gameState === "playing") {
            setPopupContent({
                title: "Perdu !",
                message: "Tu as quitté la zone de jeu.",
                type: "error",
            });
            setShowPopup(true);

            resetGame();

            if (onGameEnd) {
                onGameEnd("lost");
            }
        }
    }, [gameState, onGameEnd, resetGame]);

    // Fermer le popup et réinitialiser le jeu
    const handleClosePopup = () => {
        setShowPopup(false);
        resetGame();
    };

    // Style du curseur en fonction de l'état du jeu
    const getCursorStyle = () => {
        if (gameState === "playing") {
            return 'url("/images/coccinelle.cur"), pointer';
        }
        return "auto";
    };

    return (
        <div className="relative" ref={circuitRef}>
            {/* Container pour maintenir le ratio */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg shadow-md overflow-hidden">
                {/* Image du circuit */}
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt={`Circuit ${circuitName}`}
                    className="w-full h-full object-contain"
                    style={{ cursor: getCursorStyle() }}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    draggable={false}
                />
            </div>

            {/* Chronomètre */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-primary-600 text-2xl font-bold py-2 px-6 rounded-full shadow-md">
                {elapsedTime.toFixed(2)}
            </div>

            {/* Indication pour démarrer (si le jeu n'est pas en cours) */}
            {gameState === "idle" && startPositions.length > 0 && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 text-sm py-1 px-4 rounded-full shadow">
                    Commence en plaçant ton curseur sur un point vert
                </div>
            )}

            {/* Popup de résultat */}
            {showPopup && (
                <Popup
                    title={popupContent.title}
                    message={popupContent.message}
                    type={popupContent.type}
                    onClose={handleClosePopup}
                    time={popupContent.time}
                />
            )}
        </div>
    );
};

Circuit.propTypes = {
    circuitName: PropTypes.string.isRequired,
    bitmap: PropTypes.array.isRequired,
    imageUrl: PropTypes.string.isRequired,
    onGameEnd: PropTypes.func,
};

export default Circuit;
