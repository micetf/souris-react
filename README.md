# Les rois de la souris

Une application d'entraînement à la manipulation de la souris, modernisée avec React, Tailwind CSS et Vite.

## 📋 Description

"Les rois de la souris" est un jeu éducatif qui permet aux utilisateurs d'améliorer leur dextérité avec la souris en suivant des parcours prédéfinis. Le joueur doit déplacer le curseur (représenté par une coccinelle) le long de chemins bleus, en commençant par un point vert et en se terminant par un point rouge, sans quitter le chemin.

Cette version modernise l'application originale de 2011 en utilisant des technologies front-end modernes tout en conservant les fonctionnalités et données existantes.

## ✨ Fonctionnalités

- 17 circuits de difficulté croissante
- Gestion des records personnels et globaux
- Chronomètre de précision
- Interface utilisateur moderne et responsive
- Compatible avec tous les navigateurs modernes

## 🛠️ Technologies

- **React 18+** : Construction de l'interface utilisateur
- **Tailwind CSS** : Stylisation de l'application
- **Vite** : Build et développement
- **PHP** (minimal) : API pour la gestion des records

## 🚀 Installation

### Prérequis

- Node.js 16+
- npm ou pnpm
- Serveur web avec PHP 7.0+ (pour l'API records)

### Installation

1. Cloner le dépôt

```bash
git clone https://github.com/micetf/souris.git
cd souris
```

2. Installer les dépendances

```bash
npm install
# ou avec pnpm
pnpm install
```

3. Démarrer le serveur de développement

```bash
npm run dev
# ou avec pnpm
pnpm dev
```

4. Construire pour la production

```bash
npm run build
# ou avec pnpm
pnpm build
```

## 📁 Structure du projet

```
souris/
│
├── api/
│   └── records.php                    # API PHP pour la gestion des records
│
├── public/
│   ├── images/
│   │   ├── coccinelle.cur             # Curseur personnalisé
│   │   └── parcours*.png              # Images des circuits
│   ├── index.html                     # Point d'entrée HTML
│   └── favicon.ico                    # Favicon
│
├── records/                           # Dossier contenant les fichiers de records
│
├── src/
│   ├── components/                    # Composants React
│   ├── hooks/                         # Hooks personnalisés
│   ├── utils/                         # Utilitaires
│   ├── styles/                        # Styles CSS
│   ├── App.jsx                        # Composant principal
│   └── main.jsx                       # Point d'entrée React
│
└── ... Fichiers de configuration
```

## 🔄 Migration depuis l'ancienne version

Cette version a été complètement reécrite en React, mais maintient la compatibilité avec les données existantes :

- Les fichiers de records sont utilisés tels quels
- Les images des circuits sont conservées
- La logique du jeu reste identique
- Le traitement d'image est déplacé côté client

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

MIT © Frédéric Misery

## 🙏 Remerciements

- [MiCetF](https://micetf.fr) pour l'application originale
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://reactjs.org)
- [Vite](https://vitejs.dev)
