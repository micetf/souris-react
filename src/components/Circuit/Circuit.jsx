import React, { useEffect, useRef, useState } from "react";
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

    // États locaux
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({
        title: "",
        message: "",
        type: "info",
    });
    const [circuitOffset, setCircuitOffset] = useState({ left: 0, top: 0 });

    // Trouver les positions de départ dans le bitmap
    const startPositions = imageUtils.findStartPositions(bitmap);

    // Hook useGame pour la logique de jeu
    const { gameState, elapsedTime, startGame, resetGame, updatePosition } =
        useGame(bitmap);

    // Calculer l'offset du circuit pour les coordonnées relatives
    useEffect(() => {
        if (circuitRef.current) {
            const updateOffset = () => {
                const rect = circuitRef.current.getBoundingClientRect();
                setCircuitOffset({
                    left: rect.left + window.scrollX,
                    top: rect.top + window.scrollY,
                });
            };

            updateOffset();

            // Mettre à jour l'offset quand la fenêtre est redimensionnée
            window.addEventListener("resize", updateOffset);

            return () => {
                window.removeEventListener("resize", updateOffset);
            };
        }
    }, [gameState, bitmap]); // Recalculer si l'état du jeu ou le bitmap change

    // Gestion des événements souris
    const handleMouseMove = (e) => {
        e.preventDefault();

        // Calculer les coordonnées relatives au circuit
        const x = Math.round(e.pageX - circuitOffset.left);
        const y = Math.round(e.pageY - circuitOffset.top);

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
            if (bitmap && bitmap[x] && bitmap[x][y] === 1) {
                startGame([x, y]);
            }
        }
    };

    const handleMouseDown = (e) => {
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
    };

    // Gérer la sortie du circuit
    const handleMouseLeave = () => {
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
    };

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

        // Si le jeu n'a pas commencé, utiliser le curseur auto sur le chemin (pour indiquer où commencer)
        return "auto";
    };

    return (
        <div className="relative">
            {/* Circuit */}
            <div
                ref={circuitRef}
                className="relative w-full h-auto rounded-lg overflow-hidden shadow-md aspect-[4/3]"
                style={{
                    background: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    cursor: getCursorStyle(),
                }}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
            />

            {/* Chronomètre */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-primary-600 text-2xl font-bold py-2 px-6 rounded-full shadow-md">
                {elapsedTime.toFixed(2)}
            </div>

            {/* Indication pour démarrer (si le jeu n'est pas en cours et les points de départ sont connus) */}
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

export default Circuit;
