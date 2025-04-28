/**
 * Utilitaires pour le traitement d'images
 */
import { getAssetPath } from "./assetPath";

/**
 * Génère la bitmap d'un circuit à partir de son image avec une tolérance pour la détection des couleurs
 *
 * @param {number} circuitNumber - Numéro du circuit
 * @returns {Promise<Array<Array<number>>>} - Bitmap du circuit
 */
export const generateBitmapFromImage = (circuitNumber) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Important pour éviter les erreurs CORS
        img.src = getAssetPath(`images/parcours${circuitNumber}.png`);

        img.onload = () => {
            // Créer un canvas pour analyser l'image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;

            // Dessiner l'image sur le canvas
            ctx.drawImage(img, 0, 0);

            // Récupérer les données de l'image
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            // Créer la bitmap
            const bitmap = [];
            for (let x = 0; x < canvas.width; x++) {
                bitmap[x] = [];
            }

            // Analyser chaque pixel pour déterminer sa valeur avec tolérance de couleur
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const a = data[idx + 3];

                    // Ignorer les pixels transparents (alpha < 50)
                    if (a < 50) {
                        bitmap[x][y] = 0; // Considéré comme hors chemin
                        continue;
                    }

                    // Utiliser une tolérance pour la détection des couleurs
                    // Blanc (hors du chemin)
                    if (isWhiteish(r, g, b)) {
                        bitmap[x][y] = 0;
                    }
                    // Rouge (point d'arrivée)
                    else if (isReddish(r, g, b)) {
                        bitmap[x][y] = 3;
                    }
                    // Vert (point de départ)
                    else if (isGreenish(r, g, b)) {
                        bitmap[x][y] = 1;
                    }
                    // Autres couleurs (bleu - chemin)
                    else {
                        bitmap[x][y] = 2;
                    }
                }
            }

            // Nettoyer le bitmap pour éliminer les bruits
            cleanupBitmap(bitmap);

            resolve(bitmap);
        };

        img.onerror = () => {
            reject(
                new Error(
                    `Impossible de charger l'image du circuit ${circuitNumber}`
                )
            );
        };
    });
};

/**
 * Détermine si une couleur est proche du blanc
 * @param {number} r - Composante rouge
 * @param {number} g - Composante verte
 * @param {number} b - Composante bleue
 * @returns {boolean} - True si la couleur est blanche ou très claire
 */
function isWhiteish(r, g, b) {
    // Blanc avec une tolérance (tous les canaux > 240)
    return r > 240 && g > 240 && b > 240;
}

/**
 * Détermine si une couleur est proche du rouge
 * @param {number} r - Composante rouge
 * @param {number} g - Composante verte
 * @param {number} b - Composante bleue
 * @returns {boolean} - True si la couleur est rouge
 */
function isReddish(r, g, b) {
    // Rouge vif avec une tolérance
    return r > 200 && g < 50 && b < 50;
}

/**
 * Détermine si une couleur est proche du vert
 * @param {number} r - Composante rouge
 * @param {number} g - Composante verte
 * @param {number} b - Composante bleue
 * @returns {boolean} - True si la couleur est verte
 */
function isGreenish(r, g, b) {
    // Vert vif avec une tolérance
    return r < 50 && g > 200 && b < 50;
}

/**
 * Nettoie le bitmap pour éliminer les bruits et pixels isolés
 * @param {Array<Array<number>>} bitmap - Bitmap à nettoyer
 */
function cleanupBitmap(bitmap) {
    if (!bitmap || bitmap.length === 0) return;

    const width = bitmap.length;
    const height = bitmap[0].length;

    // Copie du bitmap pour éviter de modifier les valeurs pendant le traitement
    const tempBitmap = [];
    for (let x = 0; x < width; x++) {
        tempBitmap[x] = [...bitmap[x]];
    }

    // Supprimer les pixels isolés (bruit)
    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            // Si le pixel est un chemin (2) mais entouré de blancs (0), le convertir en blanc
            if (tempBitmap[x][y] === 2) {
                const neighbors = [
                    tempBitmap[x - 1][y - 1],
                    tempBitmap[x][y - 1],
                    tempBitmap[x + 1][y - 1],
                    tempBitmap[x - 1][y],
                    tempBitmap[x + 1][y],
                    tempBitmap[x - 1][y + 1],
                    tempBitmap[x][y + 1],
                    tempBitmap[x + 1][y + 1],
                ];

                // Compter les voisins qui sont blancs (0)
                const whiteNeighbors = neighbors.filter((v) => v === 0).length;

                // Si au moins 6 voisins sur 8 sont blancs, convertir ce pixel en blanc
                if (whiteNeighbors >= 6) {
                    bitmap[x][y] = 0;
                }
            }
        }
    }
}

/**
 * Version asynchrone optimisée qui utilise un worker pour le traitement de l'image
 *
 * @param {number} circuitNumber - Numéro du circuit
 * @returns {Promise<Array<Array<number>>>} - Bitmap du circuit
 */
export const generateBitmapFromImageAsync = (circuitNumber) => {
    return new Promise((resolve, reject) => {
        // Vérifier si les Web Workers sont supportés
        if (window.Worker) {
            // Créer un blob contenant le code du worker
            const workerCode = `
          self.onmessage = function(e) {
            const { imageData, width, height } = e.data;
            
            // Créer la bitmap
            const bitmap = Array(width).fill().map(() => Array(height));
            
            // Fonctions de détection de couleur
            function isWhiteish(r, g, b) {
                return r > 240 && g > 240 && b > 240;
            }
            
            function isReddish(r, g, b) {
                return r > 200 && g < 50 && b < 50;
            }
            
            function isGreenish(r, g, b) {
                return r < 50 && g > 200 && b < 50;
            }
            
            // Analyser chaque pixel
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = imageData[idx];
                const g = imageData[idx + 1];
                const b = imageData[idx + 2];
                const a = imageData[idx + 3];
                
                // Ignorer les pixels transparents
                if (a < 50) {
                    bitmap[x][y] = 0;
                    continue;
                }
                
                if (isWhiteish(r, g, b)) {
                  bitmap[x][y] = 0;
                } else if (isReddish(r, g, b)) {
                  bitmap[x][y] = 3;
                } else if (isGreenish(r, g, b)) {
                  bitmap[x][y] = 1;
                } else {
                  bitmap[x][y] = 2;
                }
              }
            }
            
            // Nettoyer le bitmap
            for (let x = 1; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    if (bitmap[x][y] === 2) {
                        const neighbors = [
                            bitmap[x-1][y-1], bitmap[x][y-1], bitmap[x+1][y-1],
                            bitmap[x-1][y],                    bitmap[x+1][y],
                            bitmap[x-1][y+1], bitmap[x][y+1], bitmap[x+1][y+1]
                        ];
                        
                        const whiteNeighbors = neighbors.filter(v => v === 0).length;
                        
                        if (whiteNeighbors >= 6) {
                            bitmap[x][y] = 0;
                        }
                    }
                }
            }
            
            self.postMessage(bitmap);
          };
        `;

            const blob = new Blob([workerCode], {
                type: "application/javascript",
            });
            const worker = new Worker(URL.createObjectURL(blob));

            // Charger l'image
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = getAssetPath(`images/parcours${circuitNumber}.png`);

            img.onload = () => {
                // Préparer les données de l'image à envoyer au worker
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Envoyer les données au worker
                worker.postMessage({
                    imageData: imageData.data,
                    width: canvas.width,
                    height: canvas.height,
                });

                // Gérer la réponse du worker
                worker.onmessage = (e) => {
                    resolve(e.data);
                    worker.terminate();
                };

                worker.onerror = (error) => {
                    reject(error);
                    worker.terminate();
                };
            };

            img.onerror = () => {
                reject(
                    new Error(
                        `Impossible de charger l'image du circuit ${circuitNumber}`
                    )
                );
            };
        } else {
            // Fallback si les Web Workers ne sont pas supportés
            generateBitmapFromImage(circuitNumber).then(resolve).catch(reject);
        }
    });
};

/**
 * Trouve les points de départ (pixels verts) dans une bitmap
 *
 * @param {Array<Array<number>>} bitmap - Bitmap du circuit
 * @returns {Array<Array<number>>} - Liste des coordonnées [x, y] des points de départ
 */
export const findStartPositions = (bitmap) => {
    if (!bitmap || !bitmap.length) return [];

    const startPositions = [];

    // Parcourir le bitmap pour trouver les pixels verts (valeur 1)
    for (let x = 0; x < bitmap.length; x++) {
        if (bitmap[x]) {
            for (let y = 0; y < bitmap[x].length; y++) {
                if (bitmap[x][y] === 1) {
                    startPositions.push([x, y]);
                }
            }
        }
    }

    return startPositions;
};

/**
 * Trouve les points d'arrivée (pixels rouges) dans une bitmap
 *
 * @param {Array<Array<number>>} bitmap - Bitmap du circuit
 * @returns {Array<Array<number>>} - Liste des coordonnées [x, y] des points d'arrivée
 */
export const findEndPositions = (bitmap) => {
    if (!bitmap || !bitmap.length) return [];

    const endPositions = [];

    // Parcourir le bitmap pour trouver les pixels rouges (valeur 3)
    for (let x = 0; x < bitmap.length; x++) {
        if (bitmap[x]) {
            for (let y = 0; y < bitmap[x].length; y++) {
                if (bitmap[x][y] === 3) {
                    endPositions.push([x, y]);
                }
            }
        }
    }

    return endPositions;
};

/**
 * Vérifie si une position est sur le chemin avec tolérance
 *
 * @param {Array<Array<number>>} bitmap - Bitmap du circuit
 * @param {number} x - Coordonnée X
 * @param {number} y - Coordonnée Y
 * @param {number} tolerance - Tolérance en pixels
 * @param {number} targetValue - Valeur cible à rechercher (1, 2 ou 3)
 * @returns {boolean} - True si la position est sur le chemin
 */
export const isOnPath = (bitmap, x, y, tolerance = 2, targetValue = 2) => {
    if (!bitmap || !bitmap.length) return false;

    // Vérifier la position exacte d'abord
    if (bitmap[x] && bitmap[x][y] === targetValue) return true;

    // Vérifier les positions autour avec la tolérance spécifiée
    for (let dx = -tolerance; dx <= tolerance; dx++) {
        for (let dy = -tolerance; dy <= tolerance; dy++) {
            const checkX = x + dx;
            const checkY = y + dy;

            if (
                checkX >= 0 &&
                checkY >= 0 &&
                checkX < bitmap.length &&
                bitmap[checkX] &&
                checkY < bitmap[checkX].length &&
                bitmap[checkX][checkY] === targetValue
            ) {
                return true;
            }
        }
    }

    return false;
};

export default {
    generateBitmapFromImage,
    generateBitmapFromImageAsync,
    findStartPositions,
    findEndPositions,
    isOnPath,
};
