<?php

/**
 * API de gestion des records pour l'application "Les rois de la souris"
 *
 * - GET: Récupère les records pour un circuit
 * - POST: Enregistre un nouveau record
 */

// Activer les logs d'erreur pour le débogage
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log('Records API called with method: ' . $_SERVER['REQUEST_METHOD']);

// Désactiver la mise en cache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
// Autoriser les requêtes CORS pour le développement
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Gérer les requêtes OPTIONS (pre-flight pour CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Fonction d'écriture dans un fichier (pour compatibilité PHP < 5)
if (!function_exists('file_put_contents')) {
    function file_put_contents($filename, $data)
    {
        $f = fopen($filename, 'w');
        if (!$f) {
            return false;
        } else {
            $bytes = fwrite($f, $data);
            fclose($f);
            return $bytes;
        }
    }
}

// Fonction pour obtenir le chemin du fichier de records
function getRecordsFilePath($parcours)
{
    // Assurer que le parcours est numérique
    $parcours = (int)$parcours;

    // Construire le chemin absolu en utilisant __DIR__ (dossier du script actuel)
    return dirname(__DIR__) . '/records/parcours' . $parcours . '.txt';
}

/**
 * Traitement des requêtes GET
 * Récupère les records pour un circuit donné
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Vérification des paramètres
    if (!isset($_GET['parcours'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Paramètre manquant',
            'message' => 'Le paramètre "parcours" est requis'
        ]);
        exit;
    }

    $parcours = $_GET['parcours'];
    error_log('GET request for parcours: ' . $parcours);

    $fichier = getRecordsFilePath($parcours);
    error_log('Records file path: ' . $fichier);

    // Vérification de l'existence du fichier et création si nécessaire
    if (!file_exists($fichier)) {
        // Créer le dossier si nécessaire
        $dir = dirname($fichier);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Créer un fichier avec une entrée par défaut
        file_put_contents($fichier, 'RAZ,3600'.PHP_EOL);
        error_log('Created new records file with default entry');
    }

    // Lecture du fichier de records
    $records = [];
    $enregs = file($fichier);
    error_log('Read ' . count($enregs) . ' records from file');

    foreach ($enregs as $cle => $enreg) {
        $infos = explode(',', trim($enreg));
        if (count($infos) >= 2) {
            $records[] = [
                'pseudo' => htmlspecialchars($infos[0]),
                'chrono' => floatval($infos[1])
            ];
        }
    }

    // Réponse JSON
    echo json_encode(['records' => $records]);
    exit;
}

/**
 * Traitement des requêtes POST
 * Enregistre un nouveau record
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON si Content-Type est application/json
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    error_log('Content-Type: ' . $contentType);

    if (strpos($contentType, 'application/json') !== false) {
        $content = trim(file_get_contents("php://input"));
        $decoded = json_decode($content, true);

        // Si JSON valide, remplacer $_POST par les données décodées
        if ($decoded && is_array($decoded)) {
            $_POST = $decoded;
            error_log('Received JSON data: ' . json_encode($_POST));
        } else {
            error_log('Invalid JSON received: ' . $content);
        }
    } else {
        error_log('Form data received: ' . json_encode($_POST));
    }

    // Vérification des paramètres
    $requiredParams = ['parcours', 'pseudo', 'chrono', 'token'];
    foreach ($requiredParams as $param) {
        if (!isset($_POST[$param])) {
            http_response_code(400);
            $errorMessage = 'Le paramètre "'.$param.'" est requis';
            error_log('Error: ' . $errorMessage);
            echo json_encode([
                'error' => 'Paramètre manquant',
                'message' => $errorMessage,
                'received' => $_POST
            ]);
            exit;
        }
    }

    $parcours = (int)$_POST['parcours'];
    $pseudo = $_POST['pseudo'] ?: 'Anonyme';
    $chrono = isset($_POST['chrono']) && $_POST['chrono'] > 0 ? $_POST['chrono'] : 360000;
    $token = $_POST['token'];
    $fichier = getRecordsFilePath($parcours);

    error_log('Processing record: parcours=' . $parcours . ', pseudo=' . $pseudo . ', chrono=' . $chrono);
    error_log('Records file: ' . $fichier);

    // Génération de la clé de sécurité
    if (!isset($_POST['key']) && isset($_POST['chrono']) && isset($_POST['token'])) {
        $key = hash_hmac('sha256', "MiCetF".$chrono, $token);
        error_log('Generated key: ' . $key);
    } else {
        $key = isset($_POST['key']) ? $_POST['key'] : '';
        error_log('Using provided key: ' . $key);
    }

    $newRecord = '';
    $nRecord = 0;
    $ajoute = false;
    $newRank = null;

    // Création du fichier s'il n'existe pas
    if (!file_exists($fichier)) {
        // Créer le dossier si nécessaire
        $dir = dirname($fichier);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
            error_log('Created directory: ' . $dir);
        }

        // Créer un fichier avec une entrée par défaut
        file_put_contents($fichier, 'RAZ,3600'.PHP_EOL);
        error_log('Created new records file with default entry');
    }

    // Vérification de la clé de sécurité
    $expectedKey = hash_hmac('sha256', "MiCetF".$chrono, $token);
    error_log('Expected key: ' . $expectedKey);
    error_log('Provided key: ' . $key);

    if ($expectedKey === $key && $chrono != 360000) {
        error_log('Security key validation successful');

        // Le chrono reçu est en centièmes de seconde, on le divise par 100 pour l'affichage
        $chronoSeconds = $chrono / 100;
        error_log('Chrono in seconds: ' . $chronoSeconds);

        // Ouvrir le fichier des records
        $enregs = file($fichier);
        error_log('Read ' . count($enregs) . ' existing records');

        // Parcourir les records existants et insérer le nouveau au bon endroit
        foreach ($enregs as $cle => $enreg) {
            $infos = explode(',', trim($enreg));

            // S'assurer que l'enregistrement est valide
            if (count($infos) < 2) {
                error_log('Invalid record entry: ' . $enreg);
                continue;
            }

            $recordPseudo = $infos[0];
            $recordChrono = floatval($infos[1]);

            error_log("Record #$nRecord: $recordPseudo, $recordChrono vs $chronoSeconds");

            // Si le nouveau temps est meilleur, l'insérer ici
            if (!$ajoute && $recordChrono > $chronoSeconds) {
                $nRecord++;
                $newRecord .= $pseudo . ',' . $chronoSeconds . PHP_EOL;
                $ajoute = true;
                $newRank = $nRecord;
                error_log("New record inserted at position $nRecord");
            }

            // Si on a déjà 10 records, ne pas en ajouter plus
            if ($nRecord >= 10) {
                error_log('Already have 10 records, stopping');
                break;
            }

            // Ajouter le record existant
            $nRecord++;
            $newRecord .= trim($enreg) . PHP_EOL;
        }

        // Si on a moins de 10 records et que le nouveau n'a pas été ajouté, l'ajouter à la fin
        if ($nRecord < 10 && !$ajoute) {
            $newRecord .= $pseudo . ',' . $chronoSeconds . PHP_EOL;
            $newRank = $nRecord + 1;
            $ajoute = true;
            error_log("New record added at the end, position $newRank");
        }

        // Sauvegarder les records mis à jour
        if (file_put_contents($fichier, $newRecord)) {
            error_log('Successfully saved updated records');
        } else {
            error_log('Failed to save updated records');
        }
    } else {
        error_log('Security key validation failed');
        echo json_encode([
            'success' => false,
            'error' => 'Validation de sécurité échouée',
            'expectedKey' => $expectedKey,
            'providedKey' => $key,
            'records' => []
        ]);
        exit;
    }

    // Lecture des records mis à jour
    $records = [];
    if (file_exists($fichier)) {
        $enregs = file($fichier);

        foreach ($enregs as $cle => $enreg) {
            $infos = explode(',', trim($enreg));
            if (count($infos) >= 2) {
                $records[] = [
                    'pseudo' => htmlspecialchars($infos[0]),
                    'chrono' => floatval($infos[1])
                ];
            }
        }
    }

    // Réponse JSON
    $response = [
        'success' => $ajoute,
        'newRank' => $newRank,
        'records' => $records
    ];

    error_log('Response: ' . json_encode($response));
    echo json_encode($response);
    exit;
}

// Méthode non autorisée
http_response_code(405);
echo json_encode([
    'error' => 'Méthode non autorisée',
    'message' => 'Seules les méthodes GET, POST et OPTIONS sont autorisées'
]);
