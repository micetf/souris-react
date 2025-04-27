import React from "react";
import PropTypes from "prop-types";

/**
 * Composant d'aide expliquant les règles du jeu
 *
 * @param {Object} props - Propriétés du composant
 * @param {function} props.onClose - Fonction appelée à la fermeture du popup
 * @returns {JSX.Element} Le composant popup d'aide
 */
const Help = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
                <div className="bg-primary-600 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        Les rois de la souris
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200"
                        aria-label="Fermer"
                    >
                        <i
                            className="fas fa-times text-xl"
                            aria-hidden="true"
                        ></i>
                    </button>
                </div>

                <div className="p-6">
                    <div className="prose prose-lg max-w-none">
                        <p>Toi aussi, tu veux devenir un roi de la souris ?</p>

                        <p>
                            Une petite coccinelle se cache sous un rond vert.
                            Elle ne sortira que si tu places le pointeur sur ce
                            rond.
                        </p>

                        <p>
                            Elle remplacera alors le pointeur. En suivant le
                            chemin bleu, tu dois amener cette petite coccinelle
                            jusqu'au rond rouge.
                        </p>

                        <p className="font-bold text-orange-600">
                            Attention ! Si tu quittes le chemin bleu, tu as
                            perdu.
                        </p>

                        <p>Essaie d'aller vite !</p>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={onClose}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center"
                        >
                            <i
                                className="fas fa-arrow-left mr-2"
                                aria-hidden="true"
                            ></i>{" "}
                            Retour au jeu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

Help.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default Help;
