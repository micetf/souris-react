import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { validatePseudo } from "../../utils/security";

/**
 * Composant pour sélectionner un pseudo au démarrage avec suggestions des pseudos précédents
 *
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.storedPseudos - Liste des pseudos précédemment utilisés
 * @param {function} props.onSubmit - Fonction appelée à la soumission du formulaire
 * @param {boolean} props.canClose - Si false, l'utilisateur ne peut pas fermer le sélecteur sans choisir un pseudo
 * @param {function} props.onRemovePseudo - Fonction pour supprimer un pseudo spécifique
 * @param {function} props.onClearPseudos - Fonction pour supprimer tous les pseudos
 * @returns {JSX.Element} Le composant sélecteur de pseudo
 */
const PseudoSelector = ({
    storedPseudos = [],
    onSubmit,
    canClose = false,
    onRemovePseudo,
    onClearPseudos,
}) => {
    const [pseudo, setPseudo] = useState("");
    const [error, setError] = useState("");
    const [saveLocally, setSaveLocally] = useState(true);
    const inputRef = useRef(null);

    // Focus sur l'input au chargement
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Valider le pseudo
        const validation = validatePseudo(pseudo);

        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        // Soumettre le pseudo avec l'option de sauvegarde
        onSubmit(pseudo.trim(), saveLocally);
    };

    const handleChange = (e) => {
        setPseudo(e.target.value);

        // Effacer l'erreur si l'utilisateur corrige
        if (error) {
            setError("");
        }
    };

    const selectStoredPseudo = (storedPseudo) => {
        setPseudo(storedPseudo);
        if (error) {
            setError("");
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-50 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-primary-600 p-4">
                    <h2 className="text-xl font-bold text-white text-center">
                        Les rois de la souris
                    </h2>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Choisis ton pseudo pour jouer
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

                            {/* Pseudos récemment utilisés */}
                            {storedPseudos.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-600">
                                            Pseudos récemment utilisés :
                                        </p>
                                        <button
                                            type="button"
                                            onClick={onClearPseudos}
                                            className="text-red-600 hover:text-red-800 text-xs"
                                            title="Effacer tous les pseudos"
                                        >
                                            <i className="fas fa-trash-alt mr-1"></i>{" "}
                                            Effacer tout
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {storedPseudos.map(
                                            (storedPseudo, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            selectStoredPseudo(
                                                                storedPseudo
                                                            )
                                                        }
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                                                    >
                                                        {storedPseudo}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            onRemovePseudo(
                                                                storedPseudo
                                                            )
                                                        }
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Supprimer ce pseudo"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="flex items-center text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={saveLocally}
                                        onChange={(e) =>
                                            setSaveLocally(e.target.checked)
                                        }
                                        className="form-checkbox h-4 w-4 text-primary-600 rounded"
                                    />
                                    <span className="ml-2">
                                        Mémoriser ce pseudo pour plus tard
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    Il sera proposé comme option lors de ta
                                    prochaine visite.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            {canClose && (
                                <button
                                    type="button"
                                    onClick={() => onSubmit("Anonyme", false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium transition-colors"
                                >
                                    Anonyme
                                </button>
                            )}

                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center"
                            >
                                <i className="fas fa-check mr-2"></i>
                                Jouer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

PseudoSelector.propTypes = {
    storedPseudos: PropTypes.array,
    onSubmit: PropTypes.func.isRequired,
    canClose: PropTypes.bool,
    onRemovePseudo: PropTypes.func,
    onClearPseudos: PropTypes.func,
};

export default PseudoSelector;
