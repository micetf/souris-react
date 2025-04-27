<?php

/**
 * API de gestion des records
 *
 * Cette version simplifiée ne gère que les records, le traitement d'image
 * étant déplacé côté client.
 *
 * GET: Récupère les records pour un circuit
 * POST: Enregistre un nouveau record
 */

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
    $fichier = '../records/'.$parcours.'.txt';

    // Vérification de l'existence du fichier
    if (!file_exists($fichier)) {
        echo json_encode(['records' => []]);
        exit;
    }

    // Lecture du fichier de records
    $records = [];
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

    if (strpos($contentType, 'application/json') !== false) {
        $content = trim(file_get_contents("php://input"));
        $decoded = json_decode($content, true);

        // Si JSON valide, remplacer $_POST par les données décodées
        if ($decoded && is_array($decoded)) {
            $_POST = $decoded;
        }
    }

    // Vérification des paramètres
    $requiredParams = ['parcours', 'pseudo', 'chrono', 'token'];
    foreach ($requiredParams as $param) {
        if (!isset($_POST[$param])) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Paramètre manquant',
                'message' => 'Le paramètre "'.$param.'" est requis'
            ]);
            exit;
        }
    }

    $parcours = $_POST['parcours'];
    $pseudo = $_POST['pseudo'] ?: 'Anonyme';
    $chrono = isset($_POST['chrono']) && $_POST['chrono'] > 0 ? $_POST['chrono'] : 360000;
    $token = $_POST['token'];
    $fichier = '../records/parcours'.$parcours.'.txt';

    // Génération de la clé de sécurité
    if (!isset($_POST['key']) && isset($_POST['chrono']) && isset($_POST['token'])) {
        $key = hash_hmac('sha256', "MiCetF".$chrono, $token);
    } else {
        $key = isset($_POST['key']) ? $_POST['key'] : '';
    }

    $newRecord = '';
    $nRecord = 0;
    $ajoute = false;
    $newRank = null;

    // Création du fichier s'il n'existe pas
    if (!file_exists($fichier)) {
        file_put_contents($fichier, '');
    }

    // Vérification de la clé de sécurité
    $expectedKey = hash_hmac('sha256', "MiCetF".$chrono, $token);

    if ($expectedKey === $key && $chrono != 360000) {
        $enregs = file($fichier);
        foreach ($enregs as $cle => $enreg) {
            $infos = explode(',', $enreg);
            if (!$ajoute && $infos[1] >= ($chrono / 100)) {
                $nRecord++;
                $newRecord .= $pseudo.','.($chrono / 100).PHP_EOL;
                $ajoute = true;
                $newRank = $nRecord;
            }
            if ($nRecord > 9) {
                break;
            }
            $nRecord++;
            $newRecord .= $enreg;
        }
        if ($nRecord < 10 && !$ajoute) {
            $newRecord .= $pseudo.','.($chrono / 100).PHP_EOL;
            $newRank = $nRecord + 1;
        }
        file_put_contents($fichier, $newRecord);
    }

    // Lecture des records mis à jour
    $records = [];
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

    // Réponse JSON
    echo json_encode([
        'success' => $ajoute || $newRank !== null,
        'newRank' => $newRank,
        'records' => $records
    ]);
    exit;
}

// Méthode non autorisée
http_response_code(405);
echo json_encode([
    'error' => 'Méthode non autorisée',
    'message' => 'Seules les méthodes GET, POST et OPTIONS sont autorisées'
]);
