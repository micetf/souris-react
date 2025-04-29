import React from "react";
import PropTypes from "prop-types";

/**
 * Composant popup générique utilisé pour afficher des messages, des résultats ou d'autres informations
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Titre du popup
 * @param {string} props.message - Message principal à afficher
 * @param {string} props.type - Type de popup ('info', 'success', 'error')
 * @param {function} props.onClose - Fonction appelée à la fermeture du popup
 * @param {number} [props.time] - Temps réalisé (pour les popups de résultat)
 * @param {boolean} [props.isNewRecord] - Indique si c'est un nouveau record personnel
 * @param {ReactNode} [props.children] - Contenu supplémentaire
 * @returns {JSX.Element} Le composant popup
 */
const Popup = ({
    title,
    message,
    type = "info",
    onClose,
    time,
    isNewRecord,
    children,
}) => {
    // Détermine les styles en fonction du type de popup
    const getStyles = () => {
        switch (type) {
            case "success":
                return {
                    header: "bg-green-700 text-white",
                    icon: "fas fa-check-circle",
                };
            case "error":
                return {
                    header: "bg-orange-700 text-white",
                    icon: "fas fa-exclamation-circle",
                };
            default:
                return {
                    header: "bg-primary-600 text-white",
                    icon: "fas fa-info-circle",
                };
        }
    };

    const styles = getStyles();

    // Récupération du numéro de parcours depuis l'URL pour le fond du popup
    const getCircuitNumberFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("c") || "1";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full"
                style={{
                    backgroundImage: `url(/images/parcours${getCircuitNumberFromUrl()}.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="relative">
                    <h2
                        className={`${styles.header} p-4 text-xl font-bold text-center`}
                    >
                        <i
                            className={`${styles.icon} mr-2`}
                            aria-hidden="true"
                        ></i>
                        {title}
                    </h2>

                    <div className="bg-white bg-opacity-90 p-6">
                        <p className="text-gray-800 mb-6 text-center text-lg">
                            {message}

                            {type === "success" && isNewRecord && (
                                <span className="block mt-2 text-green-600 font-bold animate-pulse">
                                    Nouveau record personnel !
                                </span>
                            )}
                        </p>

                        {children && <div className="mb-6">{children}</div>}

                        <div className="flex justify-center">
                            <button
                                onClick={onClose}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                            >
                                Recommencer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Popup.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["info", "success", "error"]),
    onClose: PropTypes.func.isRequired,
    time: PropTypes.number,
    isNewRecord: PropTypes.bool,
    children: PropTypes.node,
};

export default Popup;
