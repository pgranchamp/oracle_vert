/**
 * Utilitaire pour compresser et redimensionner les images
 * avant de les envoyer à l'API
 */

/**
 * Compresse et redimensionne une image
 * @param {File} file - Fichier image original
 * @param {Object} options - Options de compression
 * @param {number} options.maxWidth - Largeur maximale de l'image (default: 1024px)
 * @param {number} options.maxHeight - Hauteur maximale de l'image (default: 1024px)
 * @param {number} options.quality - Qualité de compression JPEG (0-1, default: 0.8)
 * @returns {Promise<Blob>} Image compressée sous forme de Blob
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8
  } = options;
  
  return new Promise((resolve, reject) => {
    // Création d'un élément canvas pour le redimensionnement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Création d'un objet Image pour charger le fichier
    const img = new Image();
    
    // Création d'un URL pour le fichier
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Libération de l'URL
      URL.revokeObjectURL(url);
      
      // Calcul des dimensions proportionnelles
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      // Configuration du canvas
      canvas.width = width;
      canvas.height = height;
      
      // Dessin de l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Conversion en blob avec compression
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Échec de la compression de l\'image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
    
    // Chargement de l'image
    img.src = url;
  });
};

/**
 * Convertit un Blob en base64
 * @param {Blob} blob - Blob à convertir
 * @returns {Promise<string>} Chaîne base64
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Compresse une image et la convertit en base64
 * @param {File} file - Fichier image original
 * @returns {Promise<string>} Image compressée en base64
 */
export const processImageForUpload = async (file) => {
  try {
    const compressedBlob = await compressImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8
    });
    
    // Afficher des informations sur la compression
    console.log(`Image compressée: ${(compressedBlob.size / 1024).toFixed(2)} KB (original: ${(file.size / 1024).toFixed(2)} KB)`);
    
    const base64Data = await blobToBase64(compressedBlob);
    return base64Data;
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
};
