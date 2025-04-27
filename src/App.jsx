import React, { useState, useEffect } from "react";
import { Navbar } from "@micetf/ui";
import Circuit from "./components/Circuit";
import Records from "./components/Records";
import Loading from "./components/common/Loading";
import Help from "./components/Popup/Help";
import GetPseudo from "./components/Popup/GetPseudo";
import useCircuit from "./hooks/useCircuit";
import api from "./utils/api";

/**
 * Composant principal de l'application
 */
const App = () => {
    // Récupérer le numéro de circuit depuis l'URL
    const getInitialCircuitNumber = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get("c")) || 1;
    };

    // États
    const [pseudo, setPseudo] = useState(
        localStorage.getItem("sourisPseudo") || "Anonyme"
    );
    const [showHelp, setShowHelp] = useState(false);
    const [showGetPseudo, setShowGetPseudo] = useState(false);
    const [personalRecord, setPersonalRecord] = useState(null);

    // Utiliser le hook useCircuit pour charger et gérer le circuit
    const { circuitData, loading, error, changeCircuit } = useCircuit(
        getInitialCircuitNumber()
    );

    // Vérifier si l'utilisateur a un record personnel
    useEffect(() => {
        if (circuitData) {
            const record = api.localRecords.getRecord(
                circuitData.circuitNumber
            );
            setPersonalRecord(record);

            // Vérifier si un pseudo existe déjà
            const savedPseudo = localStorage.getItem("sourisPseudo");
            if (!savedPseudo || savedPseudo.length < 4) {
                setShowGetPseudo(true);
            }
        }
    }, [circuitData]);

    /**
     * Gère le changement de circuit
     * @param {number} circuitNumber - Numéro du circuit à charger
     */
    const handleCircuitChange = async (circuitNumber) => {
        // Mettre à jour l'URL sans recharger la page
        window.history.pushState(
            {},
            `Les rois de la souris (Parcours n°${circuitNumber})`,
            `?c=${circuitNumber}`
        );

        // Changer le circuit
        await changeCircuit(circuitNumber);

        // Vérifier si l'utilisateur a un record personnel pour ce circuit
        const record = api.localRecords.getRecord(circuitNumber);
        setPersonalRecord(record);
    };

    /**
     * Gère la fin d'une partie
     * @param {string} result - Résultat de la partie ('win' ou 'lost')
     * @param {number} time - Temps réalisé (en secondes)
     */
    const handleGameEnd = async (result, time) => {
        if (result === "win" && time && circuitData) {
            // Sauvegarder le record local
            const isNewRecord = api.localRecords.saveRecord(
                circuitData.circuitNumber,
                time
            );

            if (isNewRecord) {
                setPersonalRecord(time);
            }

            // Envoyer le record au serveur
            try {
                await api.saveRecord({
                    parcours: circuitData.circuitNumber,
                    pseudo: pseudo,
                    chrono: time,
                    token: circuitData.sessionToken,
                });

                // Recharger les records globaux (via le composant Records qui gère ses propres données)
            } catch (error) {
                console.error("Erreur lors de la sauvegarde du record:", error);
            }
        }
    };

    /**
     * Gère le changement de pseudo
     * @param {string} newPseudo - Nouveau pseudo
     */
    const handlePseudoChange = (newPseudo) => {
        if (newPseudo && newPseudo.length >= 4) {
            setPseudo(newPseudo);
            localStorage.setItem("sourisPseudo", newPseudo);
            setShowGetPseudo(false);
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
                            Ton record personnel : {personalRecord.toFixed(2)} s
                        </div>
                    )}

                    {/* Menu de sélection des circuits */}
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
                        </div>
                    )}

                    {/* Pseudo */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => setShowGetPseudo(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition"
                            title="Changer de pseudo"
                        >
                            [{pseudo}]
                        </button>
                    </div>

                    {/* Records */}
                    {circuitData && (
                        <Records circuitNumber={circuitData.circuitNumber} />
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
            {showGetPseudo && (
                <GetPseudo
                    initialPseudo={pseudo}
                    onSubmit={handlePseudoChange}
                    onClose={() => setShowGetPseudo(false)}
                />
            )}
        </div>
    );
};

export default App;
