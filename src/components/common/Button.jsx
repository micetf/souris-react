import React from "react";
import PropTypes from "prop-types";

/**
 * Composant Button réutilisable avec différentes variantes
 *
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Contenu du bouton
 * @param {function} props.onClick - Fonction appelée au clic
 * @param {string} [props.variant='primary'] - Variante de style ('primary', 'secondary', 'success', 'error')
 * @param {string} [props.size='medium'] - Taille du bouton ('small', 'medium', 'large')
 * @param {string} [props.icon] - Classe Font Awesome pour l'icône (sans le 'fa-' préfixe)
 * @param {string} [props.className] - Classes CSS additionnelles
 * @param {boolean} [props.disabled=false] - État désactivé
 * @param {string} [props.type='button'] - Type de bouton HTML
 * @param {string} [props.title] - Attribut title pour l'infobulle
 * @returns {JSX.Element} Le composant bouton
 */
const Button = ({
    children,
    onClick,
    variant = "primary",
    size = "medium",
    icon,
    className = "",
    disabled = false,
    type = "button",
    title,
    ...rest
}) => {
    // Styles de base
    const baseStyles =
        "inline-flex items-center justify-center font-medium transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2";

    // Tailles
    const sizeStyles = {
        small: "px-3 py-1 text-sm",
        medium: "px-4 py-2",
        large: "px-6 py-3 text-lg",
    };

    // Variantes
    const variantStyles = {
        primary:
            "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
        secondary:
            "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
        success:
            "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
        error: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    };

    // État désactivé
    const disabledStyles = disabled
        ? "opacity-50 cursor-not-allowed pointer-events-none"
        : "";

    // Assembler toutes les classes
    const buttonClasses = `
    ${baseStyles} 
    ${sizeStyles[size] || sizeStyles.medium} 
    ${variantStyles[variant] || variantStyles.primary}
    ${disabledStyles}
    ${className}
  `.trim();

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
            title={title}
            {...rest}
        >
            {icon && (
                <i
                    className={`fas fa-${icon} ${children ? "mr-2" : ""}`}
                    aria-hidden="true"
                ></i>
            )}
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(["primary", "secondary", "success", "error"]),
    size: PropTypes.oneOf(["small", "medium", "large"]),
    icon: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    type: PropTypes.string,
    title: PropTypes.string,
};

export default Button;
