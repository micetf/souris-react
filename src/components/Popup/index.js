/**
 * Point d'entrée pour les composants Popup
 * Exporte tous les composants relatifs aux popups
 */
import Popup from "./Popup";
import Help from "./Help";
import GetPseudo from "./GetPseudo";
import ShareDialog from "./ShareDialog";

// Export du composant principal en tant qu'export par défaut
export default Popup;

// Export des autres composants connexes
export { Help, GetPseudo, ShareDialog };
