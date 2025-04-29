import React from "react";
import PropTypes from "prop-types";

/**
 * Composant pour partager un lien vers le circuit actuel
 *
 * @param {Object} props - Propriétés du composant
 * @param {function} props.onClose - Fonction appelée à la fermeture du popup
 * @param {function} props.onShare - Fonction appelée pour partager l'URL
 * @param {string} props.currentPseudo - Pseudo actuel de l'utilisateur
 * @param {boolean} [props.showPseudoOption=false] - Indique si l'option de partage du pseudo est disponible
 * @returns {JSX.Element} Le composant dialogue de partage
 */
const ShareDialog = ({
    onClose,
    onShare,
    currentPseudo,
    showPseudoOption = false,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-primary-600 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        Partager ce circuit
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200"
                        aria-label="Fermer"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-gray-700">
                        Partage ce circuit avec tes amis pour qu'ils puissent
                        s'entraîner sur le même parcours !
                    </p>

                    {/* Option de partage simple (sans pseudo) - Toujours disponible */}
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-primary-600">
                                Partager le circuit uniquement
                            </h3>
                            <button
                                onClick={() => onShare(false)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full text-sm transition-colors"
                            >
                                Copier
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            Chaque personne jouera avec son propre pseudo.
                        </p>
                    </div>

                    {/* Option de partage avec pseudo (conditionnelle) */}
                    {showPseudoOption &&
                        currentPseudo &&
                        currentPseudo !== "Anonyme" && (
                            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-primary-600">
                                        Partager avec ton pseudo
                                    </h3>
                                    <button
                                        onClick={() => onShare(true)}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full text-sm transition-colors"
                                    >
                                        Copier
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Les autres joueront sous ton pseudo (
                                    {currentPseudo}) à moins qu'ils ne le
                                    changent.
                                </p>
                            </div>
                        )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ShareDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    currentPseudo: PropTypes.string,
    showPseudoOption: PropTypes.bool,
};

export default ShareDialog;
