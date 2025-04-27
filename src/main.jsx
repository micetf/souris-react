import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";

/**
 * Point d'entrée principal de l'application
 *
 * Ce fichier initialise l'application React et effectue le montage
 * dans l'élément DOM avec l'id 'root'.
 */

// Gestion des erreurs globales non capturées
window.addEventListener("error", (event) => {
    console.error("Erreur non capturée:", event.error);

    // On pourrait ajouter ici de la télémétrie ou des logs pour production
});

// Détection des fonctionnalités nécessaires du navigateur
const checkBrowserCompatibility = () => {
    const requiredFeatures = [
        { name: "Canvas 2D", check: () => !!window.CanvasRenderingContext2D },
        {
            name: "requestAnimationFrame",
            check: () => !!window.requestAnimationFrame,
        },
        {
            name: "localStorage",
            check: () => {
                try {
                    localStorage.setItem("test", "test");
                    localStorage.removeItem("test");
                    return true;
                } catch (e) {
                    return false;
                }
            },
        },
    ];

    const missingFeatures = requiredFeatures
        .filter((feature) => !feature.check())
        .map((feature) => feature.name);

    return {
        compatible: missingFeatures.length === 0,
        missingFeatures,
    };
};

// Vérifier la compatibilité avant de démarrer l'application
const compatibility = checkBrowserCompatibility();
if (!compatibility.compatible) {
    // Afficher un message d'erreur si le navigateur n'est pas compatible
    document.getElementById("root").innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: 'Nunito', sans-serif;">
      <h1 style="color: #d32f2f; margin-bottom: 1rem;">Navigateur non compatible</h1>
      <p>Votre navigateur ne prend pas en charge certaines fonctionnalités nécessaires :</p>
      <ul style="list-style: none; padding: 0; margin: 1rem 0;">
        ${compatibility.missingFeatures.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
      <p>Veuillez mettre à jour votre navigateur ou essayer un autre comme Chrome, Firefox, Edge ou Safari.</p>
    </div>
  `;
} else {
    // Montage de l'application React
    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Supprimer le spinner de chargement initial s'il existe
const removeLoadingSpinner = () => {
    const spinner = document.querySelector(
        '#root > div[style*="animation: spin"]'
    );
    if (spinner && spinner.parentNode === document.getElementById("root")) {
        spinner.style.display = "none";
    }
};

// Supprimer le spinner une fois que React est monté
window.addEventListener("DOMContentLoaded", removeLoadingSpinner);
