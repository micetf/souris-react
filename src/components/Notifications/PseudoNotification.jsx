import React from "react";
import PropTypes from "prop-types";

/**
 * Composant de notification pour informer l'utilisateur qu'il utilise un pseudo partagé via URL
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.pseudo - Le pseudo partagé
 * @param {function} props.onAdopt - Callback pour adopter le pseudo partagé
 * @param {function} props.onCustomize - Callback pour ouvrir la popup de changement de pseudo
 * @param {function} props.onDismiss - Callback pour fermer la notification sans action
 * @returns {JSX.Element} Le composant de notification
 */
const PseudoNotification = ({ pseudo, onAdopt, onCustomize, onDismiss }) => {
    return (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-md">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <i className="fas fa-info-circle text-blue-600 text-xl"></i>
                </div>
                <div className="ml-3 flex-grow">
                    <h3 className="text-sm font-medium text-blue-800">
                        Pseudo partagé
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>
                            Tu utilises actuellement le pseudo{" "}
                            <strong>{pseudo}</strong> provenant d'un lien
                            partagé.
                        </p>
                        <p className="mt-1">
                            Ce pseudo sera utilisé uniquement pour cette
                            session, sauf si tu choisis de l'adopter.
                        </p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
                            onClick={onAdopt}
                        >
                            Adopter ce pseudo
                        </button>
                        <button
                            type="button"
                            className="bg-white hover:bg-gray-50 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-md text-sm font-medium"
                            onClick={onCustomize}
                        >
                            Utiliser mon pseudo
                        </button>
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 px-3 py-1.5 text-sm font-medium"
                            onClick={onDismiss}
                        >
                            <i className="fas fa-times mr-1"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

PseudoNotification.propTypes = {
    pseudo: PropTypes.string.isRequired,
    onAdopt: PropTypes.func.isRequired,
    onCustomize: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
};

export default PseudoNotification;
