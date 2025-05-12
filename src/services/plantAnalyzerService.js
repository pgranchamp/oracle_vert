/**
 * Service pour l'analyse de plantes
 * Gère la communication avec l'API serverless
 */
import { processImageForUpload } from '../utils/imageCompression';

// Analyser une image de plante
export const analyzePlant = async (base64Image, progressCallback) => {
  try {
    // Mise à jour de la progression
    if (progressCallback) progressCallback(10);
    
    console.log("Début de l'appel API");
    
    // Appel à notre API serverless
    const response = await fetch('/api/analyze-plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image
      })
    });
    
    // Simuler la progression pendant l'analyse
    let progress = 30;
    const progressInterval = setInterval(() => {
      progress += 3;
      if (progress >= 90) {
        clearInterval(progressInterval);
      }
      if (progressCallback) progressCallback(progress);
    }, 300);
    
    console.log("Réponse reçue, statut:", response.status);
    
    if (!response.ok) {
      clearInterval(progressInterval);
      
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      
      // Message d'erreur plus convivial pour l'erreur 413
      if (response.status === 413) {
        throw new Error("L'image est trop volumineuse pour être analysée. Veuillez utiliser une image plus petite.");
      }
      
      throw new Error(`Erreur d'analyse: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    clearInterval(progressInterval);
    
    console.log("Résultat d'analyse obtenu:", result);
    
    // Signaler que l'analyse est terminée
    if (progressCallback) progressCallback(100);
    
    return result;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse:', error);
    throw error; // Propager l'erreur au composant
  }
};

// Fonction utilitaire pour lire un fichier en base64 avec compression
export const readFileAsBase64 = async (file) => {
  try {
    // Vérifier si l'image a déjà été compressée dans ImageUploader
    if (file._compressedData) {
      console.log("Image déjà compressée, utilisation des données existantes");
      return file._compressedData;
    }
    
    // Vérifier la taille pour décider de la compression
    if (file.size > 1 * 1024 * 1024) { // > 1MB
      console.log(`Image non compressée détectée (${(file.size / 1024 / 1024).toFixed(2)}MB), compression...`);
      
      // Utiliser la compression d'image
      const compressedBase64 = await processImageForUpload(file);
      return compressedBase64;
    } else {
      console.log(`Petite image (${(file.size / 1024).toFixed(2)}KB), pas de compression nécessaire`);
      
      // Pour les petites images, pas besoin de compression
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    
    // Fallback sur la méthode standard sans compression en cas d'erreur
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// Validation des images
export const validateImage = (file) => {
  // Validation du type de fichier
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Format d'image non supporté. Utilisez JPG, PNG, WEBP, HEIC ou HEIF."
    };
  }
  
  // Validation de la taille (max 8MB)
  const maxSize = 8 * 1024 * 1024; // 8MB (corrigé)
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "L'image est trop volumineuse (maximum 8MB)"
    };
  }
  
  return { isValid: true };
};
