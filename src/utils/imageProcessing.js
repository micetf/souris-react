/**
 * Utilitaires pour le traitement d'images
 */
import { getAssetPath } from "../utils/assetPath";
/**
 * Génère la bitmap d'un circuit à partir de son image
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

            // Analyser chaque pixel pour déterminer sa valeur
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];

                    // Déterminer la valeur du pixel:
                    // 0: blanc (hors du chemin)
                    // 1: vert (point de départ)
                    // 2: bleu (chemin normal)
                    // 3: rouge (point d'arrivée)
                    if (r === 255 && g === 255 && b === 255) {
                        bitmap[x][y] = 0;
                    } else if (r === 255 && g === 0 && b === 0) {
                        bitmap[x][y] = 3;
                    } else if (r === 0 && g === 255 && b === 0) {
                        bitmap[x][y] = 1;
                    } else {
                        bitmap[x][y] = 2;
                    }
                }
            }

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
 * Version optimisée qui utilise un worker pour le traitement de l'image
 * Utile pour les appareils mobiles pour éviter de bloquer le thread principal
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
            
            // Analyser chaque pixel
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = imageData[idx];
                const g = imageData[idx + 1];
                const b = imageData[idx + 2];
                
                if (r === 255 && g === 255 && b === 255) {
                  bitmap[x][y] = 0;
                } else if (r === 255 && g === 0 && b === 0) {
                  bitmap[x][y] = 3;
                } else if (r === 0 && g === 255 && b === 0) {
                  bitmap[x][y] = 1;
                } else {
                  bitmap[x][y] = 2;
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

export default {
    generateBitmapFromImage,
    generateBitmapFromImageAsync,
    findStartPositions,
    findEndPositions,
};
