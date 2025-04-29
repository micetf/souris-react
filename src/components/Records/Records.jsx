import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../../utils/api";
import Button from "../common/Button";

/**
 * Composant affichant les records pour un circuit donné
 *
 * @param {Object} props - Propriétés du composant
 * @param {number} props.circuitNumber - Numéro du circuit
 * @returns {JSX.Element} Le composant d'affichage des records
 */
const Records = ({ circuitNumber }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Utilisé pour forcer le rechargement

    // Charger les records au chargement et quand le circuit change
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log(
                    `Component Records: Fetching records for circuit ${circuitNumber}`
                );
                const response = await api.getRecords(circuitNumber);

                if (response && response.records) {
                    setRecords(response.records);
                    console.log(`Received ${response.records.length} records`);
                } else {
                    console.warn(
                        "Received empty or invalid response:",
                        response
                    );
                    setRecords([]);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des records:", err);
                setError(
                    "Impossible de charger les records. Veuillez réessayer plus tard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [circuitNumber, refreshKey]);

    // Forcer un rafraîchissement des records
    const handleRefresh = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };

    return (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary-600 flex items-center">
                    <i className="fas fa-trophy mr-2" aria-hidden="true"></i>
                    Top 10 des records pour le circuit n°{circuitNumber}
                </h2>

                <Button
                    onClick={handleRefresh}
                    variant="secondary"
                    icon="fa-sync-alt"
                    size="small"
                    disabled={loading}
                    title="Rafraîchir les records"
                >
                    {loading ? "Chargement..." : "Rafraîchir"}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-500">
                        Chargement des records...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                    {error}
                    <div className="mt-2">
                        <Button
                            onClick={handleRefresh}
                            variant="error"
                            size="small"
                        >
                            Réessayer
                        </Button>
                    </div>
                </div>
            ) : records.length > 0 ? (
                <ol className="list-decimal pl-8 space-y-2">
                    {records.map((record, index) => (
                        <li
                            key={`${record.pseudo}-${index}`}
                            className="py-2 border-b border-gray-100 text-left"
                        >
                            <span className="font-medium">{record.pseudo}</span>{" "}
                            : {parseFloat(record.chrono).toFixed(2)} s
                        </li>
                    ))}
                </ol>
            ) : (
                <ul className="pl-8 py-2">
                    <li className="text-gray-500">
                        Il n'y a aucun record pour ce circuit.
                    </li>
                </ul>
            )}
        </div>
    );
};

Records.propTypes = {
    circuitNumber: PropTypes.number.isRequired,
};

export default Records;
