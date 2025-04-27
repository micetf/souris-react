import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { validatePseudo } from "../../utils/security";

/**
 * Composant pour saisir ou modifier le pseudo du joueur
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.initialPseudo - Pseudo initial (si déjà défini)
 * @param {function} props.onSubmit - Fonction appelée à la soumission du formulaire
 * @param {function} props.onClose - Fonction appelée à la fermeture du popup
 * @returns {JSX.Element} Le composant popup de saisie du pseudo
 */
const GetPseudo = ({ initialPseudo = "Anonyme", onSubmit, onClose }) => {
    const [pseudo, setPseudo] = useState(initialPseudo);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    // Focus sur l'input au chargement
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();

            // Sélectionner tout le texte si c'est "Anonyme" ou autre valeur par défaut
            if (initialPseudo === "Anonyme") {
                inputRef.current.select();
            }
        }
    }, [initialPseudo]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Valider le pseudo
        const validation = validatePseudo(pseudo);

        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        // Soumettre le pseudo
        onSubmit(pseudo.trim());
    };

    const handleChange = (e) => {
        setPseudo(e.target.value);

        // Effacer l'erreur si l'utilisateur corrige
        if (error) {
            setError("");
        }
    };

    // Gérer la touche Echap pour fermer
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onKeyDown={handleKeyDown}
        >
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-primary-600 p-4">
                    <h2 className="text-xl font-bold text-white text-center">
                        Les rois de la souris
                    </h2>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Saisis ton pseudo !
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={pseudo}
                                onChange={handleChange}
                                placeholder="Ton pseudo (min. 4 caractères)"
                                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                    error ? "border-red-500" : "border-gray-300"
                                }`}
                                aria-invalid={error ? "true" : "false"}
                                aria-describedby={
                                    error ? "pseudo-error" : undefined
                                }
                            />

                            {error && (
                                <p
                                    id="pseudo-error"
                                    className="mt-2 text-red-600 text-sm"
                                >
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium transition-colors"
                            >
                                Annuler
                            </button>

                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

GetPseudo.propTypes = {
    initialPseudo: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default GetPseudo;
