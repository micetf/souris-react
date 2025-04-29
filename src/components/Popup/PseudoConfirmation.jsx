import React from "react";
import PropTypes from "prop-types";

/**
 * Composant qui demande à l'utilisateur de confirmer son pseudo au démarrage
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.storedPseudo - Le pseudo stocké dans le localStorage
 * @param {function} props.onConfirm - Callback pour confirmer le pseudo stocké
 * @param {function} props.onReject - Callback pour rejeter le pseudo stocké et en définir un nouveau
 * @returns {JSX.Element} Le composant de confirmation de pseudo
 */
const PseudoConfirmation = ({ storedPseudo, onConfirm, onReject }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-primary-600 p-4">
                    <h2 className="text-xl font-bold text-white text-center">
                        Confirmation du pseudo
                    </h2>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <i className="fas fa-user-check text-primary-600 text-3xl mb-4"></i>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Est-ce bien ton pseudo ?
                        </h3>
                        <p className="mb-6 text-lg font-semibold bg-gray-100 py-2 px-4 rounded-full inline-block">
                            {storedPseudo}
                        </p>
                        <p className="text-sm text-gray-600">
                            Une personne a récemment joué sur cet appareil avec
                            ce pseudo.
                        </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={onReject}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-medium transition-colors flex items-center"
                        >
                            <i className="fas fa-user-edit mr-2"></i>
                            Changer de pseudo
                        </button>

                        <button
                            onClick={onConfirm}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center"
                        >
                            <i className="fas fa-check mr-2"></i>
                            Oui, c'est moi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

PseudoConfirmation.propTypes = {
    storedPseudo: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
};

export default PseudoConfirmation;
