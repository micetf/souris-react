import React, { useState, useEffect } from "react";
import { Navbar } from "@micetf/ui";
import Circuit from "./components/Circuit";
import Records from "./components/Records";
import Loading from "./components/common/Loading";
import Help from "./components/Popup/Help";
import ShareDialog from "./components/Popup/ShareDialog";
import { PseudoSelector } from "./components/Popup";
import useCircuit from "./hooks/useCircuit";
import useRecords from "./hooks/useRecords";
import localStorage from "./utils/localStorage";
import { validatePseudo } from "./utils/security";

/**
 * Composant principal de l'application
 */
const App = () => {
    // Récupérer le numéro de circuit depuis l'URL
    const getInitialParameters = () => {
        const urlParams = new URLSearchParams(window.location.search);

        // Récupérer le circuit depuis l'URL ou utiliser le dernier visité
        let circuitFromUrl = parseInt(urlParams.get("c"));
        // S'assurer que le circuit est un nombre positif
        circuitFromUrl =
            !isNaN(circuitFromUrl) && circuitFromUrl > 0 ? circuitFromUrl : 0;

        const lastCircuit = localStorage.userPreferences.getLastCircuit();
        // S'assurer que le circuit du localStorage est valide
        const validLastCircuit = lastCircuit > 0 ? lastCircuit : 0;

        // Utiliser le circuit de l'URL, puis celui du localStorage, sinon 1 par défaut
        const initialCircuit = circuitFromUrl || validLastCircuit || 1;

        return {
            circuitNumber: initialCircuit,
        };
    };

    const initialParams = getInitialParameters();

    // États
    const [pseudo, setPseudo] = useState("Anonyme");
    const [showPseudoSelector, setShowPseudoSelector] = useState(true);
    const [storedPseudos, setStoredPseudos] = useState([]);
    const [showHelp, setShowHelp] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [shareNotification, setShareNotification] = useState(false);
    const [currentRecords, setCurrentRecords] = useState(null);

    // Utiliser le hook useCircuit pour charger et gérer le circuit
    const { circuitData, loading, error, changeCircuit, circuitNumber } =
        useCircuit(initialParams.circuitNumber);

    // Utiliser le hook useRecords pour gérer les records
    const {
        globalRecords,
        personalRecord,
        saveRecord,
        isNewRecord,
        lastSavedRecord,
    } = useRecords(circuitNumber);

    // Charger les pseudos stockés lors du chargement initial
    useEffect(() => {
        const savedPseudos = localStorage.pseudoManager.getAllPseudos();
        setStoredPseudos(savedPseudos);
    }, []);

    // Mettre à jour les records actuels à partir du hook useRecords
    useEffect(() => {
        if (globalRecords && globalRecords.length > 0) {
            setCurrentRecords(globalRecords);
        }
    }, [globalRecords]);

    /**
     * Gère le changement de circuit
     * @param {number} circuitNumber - Numéro du circuit à charger
     */
    const handleCircuitChange = async (circuitNumber) => {
        // Vérification supplémentaire que le circuit est un nombre positif
        if (isNaN(circuitNumber) || circuitNumber <= 0) {
            console.error("Numéro de circuit invalide:", circuitNumber);
            return;
        }

        // Mettre à jour l'URL sans recharger la page
        const urlParams = new URLSearchParams();
        urlParams.set("c", circuitNumber);

        // Construire la nouvelle URL avec les paramètres mis à jour
        const newUrl = `?${urlParams.toString()}`;
        window.history.pushState(
            {},
            `Les rois de la souris (Parcours n°${circuitNumber})`,
            newUrl
        );

        // Réinitialiser les records pour éviter d'afficher ceux du circuit précédent
        setCurrentRecords(null);

        // Changer le circuit
        await changeCircuit(circuitNumber);
    };

    /**
     * Génère une URL pour le partage
     * @returns {string} L'URL de partage
     */
    const generateShareURL = () => {
        const urlParams = new URLSearchParams();
        urlParams.set("c", circuitNumber);

        // Nous ne partageons plus le pseudo dans l'URL
        return `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    };

    /**
     * Gère le partage de l'URL
     */
    const handleShare = () => {
        const shareURL = generateShareURL();
        navigator.clipboard.writeText(shareURL);
        setShareNotification(true);
        setTimeout(() => setShareNotification(false), 3000);
        setShowShareDialog(false);
    };

    /**
     * Gère la fin d'une partie
     * @param {string} result - Résultat de la partie ('win' ou 'lost')
     * @param {number} time - Temps réalisé (en secondes)
     */
    const handleGameEnd = async (result, time) => {
        console.log(`Game ended with result: ${result}, time: ${time}s`);

        if (result === "win" && time && circuitData) {
            // Vérifier si c'est un nouveau record personnel
            const newPersonalRecord = isNewRecord(time);
            console.log(`Is new personal record: ${newPersonalRecord}`);

            console.log(
                `Saving performance time: ${time}s for circuit ${circuitData.circuitNumber}`
            );

            // Toujours tenter de sauvegarder le temps, même si ce n'est pas un record personnel
            try {
                const saveResult = await saveRecord({
                    pseudo: pseudo,
                    time: time,
                    token: circuitData.sessionToken,
                    debugContext: `App_handleGameEnd_${uniqueId}`,
                });

                console.log("Record save result:", saveResult);

                // Mettre à jour la liste des records avec la réponse du serveur
                if (saveResult.success && saveResult.records) {
                    console.log(
                        "Updating records from server response:",
                        saveResult.records
                    );
                    setCurrentRecords(saveResult.records);
                }

                // Gérer le retour (succès ou échec)
                if (!saveResult.success) {
                    console.error("Error saving record:", saveResult.error);
                }
            } catch (error) {
                console.error("Erreur lors de la sauvegarde du record:", error);
            }
        }
    };

    /**
     * Gère la sélection du pseudo
     * @param {string} selectedPseudo - Pseudo sélectionné
     * @param {boolean} saveToLocalStorage - Indique si le pseudo doit être sauvegardé
     */
    const handlePseudoSelect = (selectedPseudo, saveToLocalStorage = true) => {
        if (selectedPseudo && selectedPseudo.length >= 4) {
            console.log(
                `Pseudo selected: ${selectedPseudo}, save: ${saveToLocalStorage}`
            );
            setPseudo(selectedPseudo);

            // Fermer le sélecteur de pseudo
            setShowPseudoSelector(false);

            // Si l'utilisateur souhaite sauvegarder le pseudo
            if (saveToLocalStorage) {
                // Ajouter à la liste des pseudos récents
                localStorage.pseudoManager.addPseudo(selectedPseudo);

                // Mettre à jour la liste des pseudos stockés pour la prochaine fois
                const updatedPseudos =
                    localStorage.pseudoManager.getAllPseudos();
                setStoredPseudos(updatedPseudos);
            }
        } else if (selectedPseudo === "Anonyme") {
            // Cas spécial pour "Anonyme"
            setPseudo("Anonyme");
            setShowPseudoSelector(false);
        }
    };

    /**
     * Ouvre le sélecteur de pseudo
     */
    const openPseudoSelector = () => {
        // Rafraîchir la liste des pseudos stockés
        const savedPseudos = localStorage.pseudoManager.getAllPseudos();
        setStoredPseudos(savedPseudos);
        setShowPseudoSelector(true);
    };

    /**
     * Supprime un pseudo spécifique de la liste stockée
     * @param {string} pseudoToRemove - Pseudo à supprimer
     */
    const handleRemovePseudo = (pseudoToRemove) => {
        console.log(`Removing pseudo: ${pseudoToRemove}`);

        // Supprimer le pseudo du localStorage
        localStorage.pseudoManager.removePseudo(pseudoToRemove);

        // Mettre à jour la liste des pseudos stockés
        const updatedPseudos = localStorage.pseudoManager.getAllPseudos();
        setStoredPseudos(updatedPseudos);
    };

    /**
     * Efface tous les pseudos stockés
     */
    const handleClearPseudos = () => {
        console.log("Clearing all stored pseudos");

        // Confirmation avant suppression
        if (
            window.confirm(
                "Es-tu sûr(e) de vouloir effacer tous les pseudos enregistrés ?"
            )
        ) {
            // Supprimer tous les pseudos du localStorage
            localStorage.pseudoManager.clearAllPseudos();

            // Mettre à jour l'état
            setStoredPseudos([]);
        }
    };

    // Construire le fil d'ariane pour la Navbar
    const breadcrumb = ["micetf", "souris"];
    if (circuitData) {
        breadcrumb.push(`parcours-${circuitData.circuitNumber}`);
    }

    if (loading && !circuitData) {
        return <Loading message="Chargement du circuit..." />;
    }

    if (error && !circuitData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Erreur lors du chargement
                    </h1>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar
                breadcrumb={breadcrumb}
                subtitle="Les rois de la souris"
                showHelp={true}
                onHelpClick={() => setShowHelp(true)}
                baseUrl="https://micetf.fr"
                paypalId="ZXVEXH5392YTY"
                contactEmail="webmaster@micetf.fr"
            />

            <main className="container mx-auto px-4 py-8 flex-grow">
                {/* Circuit */}
                <div className="max-w-4xl mx-auto">
                    {circuitData && (
                        <Circuit
                            circuitName={circuitData.circuitName}
                            bitmap={circuitData.bitmap}
                            imageUrl={circuitData.imageUrl}
                            onGameEnd={handleGameEnd}
                        />
                    )}

                    {/* Record personnel */}
                    {personalRecord && (
                        <div className="mt-4 bg-green-700 text-white p-3 rounded-lg text-center shadow-md">
                            Ton record personnel :{" "}
                            {parseFloat(personalRecord).toFixed(2)} s
                        </div>
                    )}

                    {/* Dernier record sauvegardé */}
                    {lastSavedRecord && lastSavedRecord.isNewPersonalRecord && (
                        <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-lg text-center shadow-sm animate-pulse">
                            Nouveau record personnel !{" "}
                            {parseFloat(lastSavedRecord.time).toFixed(2)} s
                            {lastSavedRecord.rank && (
                                <span className="ml-2 font-bold">
                                    (Rang {lastSavedRecord.rank} au classement)
                                </span>
                            )}
                        </div>
                    )}

                    {/* Menu de sélection des circuits et bouton de partage */}
                    {circuitData && (
                        <div className="mt-6 flex flex-wrap justify-center items-center gap-2 p-4 bg-white rounded-lg shadow-md">
                            <span className="mr-2">|</span>
                            <button
                                onClick={() => setShowHelp(true)}
                                className="text-primary-600 hover:underline font-medium"
                            >
                                <i className="fas fa-question-circle mr-1"></i>{" "}
                                Aide
                            </button>
                            <span className="mx-2">|</span>

                            {/* Boutons pour chaque circuit */}
                            {Array.from(
                                { length: circuitData.totalCircuits },
                                (_, i) => i + 1
                            ).map((num) => (
                                <React.Fragment key={num}>
                                    <button
                                        onClick={() => handleCircuitChange(num)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            num === circuitData.circuitNumber
                                                ? "bg-primary-600 text-white"
                                                : "text-primary-600 hover:bg-primary-100"
                                        }`}
                                    >
                                        {num}
                                    </button>
                                    {num === circuitData.totalCircuits && (
                                        <span className="ml-2">|</span>
                                    )}
                                </React.Fragment>
                            ))}

                            {/* Bouton de partage */}
                            <button
                                onClick={() => setShowShareDialog(true)}
                                className="text-primary-600 hover:underline font-medium flex items-center ml-2"
                                title="Partager ce circuit"
                            >
                                <i className="fas fa-share-alt mr-1"></i>{" "}
                                Partager
                            </button>
                        </div>
                    )}

                    {/* Affichage et bouton de changement du pseudo */}
                    <div className="mt-4 flex justify-center relative">
                        <button
                            onClick={openPseudoSelector}
                            className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition flex items-center"
                            title="Changer de pseudo"
                        >
                            <i className="fas fa-user mr-2"></i>[{pseudo}]
                            <i className="fas fa-pencil-alt ml-2 text-xs"></i>
                        </button>

                        {/* Notification de partage réussi */}
                        {shareNotification && (
                            <div className="absolute -top-10 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md animate-fade-in-out">
                                URL copiée !
                            </div>
                        )}
                    </div>

                    {/* Records - Passer les records actuels pour une mise à jour instantanée */}
                    {circuitData && (
                        <Records
                            circuitNumber={circuitData.circuitNumber}
                            initialRecords={currentRecords}
                        />
                    )}
                </div>
            </main>

            <footer className="py-4 text-center text-gray-700 bg-white border-t border-gray-200">
                <p>
                    Créé par{" "}
                    <a
                        href="http://www.micetf.fr"
                        className="text-primary-600 hover:underline"
                    >
                        MiCetF
                    </a>{" "}
                    (2011) -
                    <a
                        id="contact"
                        href="#"
                        className="text-primary-600 hover:underline ml-1"
                    >
                        contact
                    </a>
                </p>
            </footer>

            {/* Popups */}
            {showHelp && <Help onClose={() => setShowHelp(false)} />}

            {showPseudoSelector && (
                <PseudoSelector
                    storedPseudos={storedPseudos}
                    onSubmit={handlePseudoSelect}
                    canClose={false} // On force la sélection d'un pseudo
                    onRemovePseudo={handleRemovePseudo}
                    onClearPseudos={handleClearPseudos}
                />
            )}

            {showShareDialog && (
                <ShareDialog
                    onClose={() => setShowShareDialog(false)}
                    onShare={handleShare}
                    currentPseudo={pseudo}
                    showPseudoOption={false} // Désactiver l'option de partage avec pseudo
                />
            )}
        </div>
    );
};

export default App;
