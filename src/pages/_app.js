import '../styles/globals.css';

// Ajouter une variable de version pour forcer le rechargement des ressources
const APP_VERSION = '1.1.1'; // Incrémenté pour forcer un rechargement

function MyApp({ Component, pageProps }) {
  // Forcer le rechargement des ressources côté client lors du premier rendu
  if (typeof window !== 'undefined') {
    // Vérifier si la version de l'application a changé
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      // Mettre à jour la version stockée
      localStorage.setItem('app_version', APP_VERSION);
      
      // Forcer le rechargement de la page sans cache
      if (storedVersion) { // Ne pas recharger lors de la première visite
        console.log('Nouvelle version détectée, rechargement...');
        window.location.reload(true);
      }
    }
  }
  
  return <Component {...pageProps} />;
}

export default MyApp;
