import React from "react";
import PropTypes from "prop-types";

/**
 * Composant d'indicateur de chargement
 *
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.message='Chargement...'] - Message à afficher pendant le chargement
 * @param {string} [props.size='medium'] - Taille du spinner ('small', 'medium', 'large')
 * @param {boolean} [props.fullScreen=false] - Si true, l'indicateur occupe tout l'écran
 * @param {string} [props.className] - Classes CSS additionnelles
 * @returns {JSX.Element} L'indicateur de chargement
 */
const Loading = ({
    message = "Chargement...",
    size = "medium",
    fullScreen = false,
    className = "",
}) => {
    // Tailles du spinner
    const spinnerSize = {
        small: "h-6 w-6 border-2",
        medium: "h-10 w-10 border-3",
        large: "h-16 w-16 border-4",
    };

    // Classes pour le conteneur
    const containerClasses = fullScreen
        ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50"
        : "flex flex-col items-center justify-center p-8";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div
                className={`${spinnerSize[size] || spinnerSize.medium} rounded-full border-primary-600 border-t-transparent animate-spin`}
                role="status"
                aria-label="Chargement"
            />
            {message && (
                <p className="mt-4 text-primary-600 font-medium">{message}</p>
            )}
        </div>
    );
};

Loading.propTypes = {
    message: PropTypes.string,
    size: PropTypes.oneOf(["small", "medium", "large"]),
    fullScreen: PropTypes.bool,
    className: PropTypes.string,
};

export default Loading;
