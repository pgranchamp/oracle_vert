/**
 * Service pour l'analyse de plantes
 * Gère la communication avec l'API serverless
 */

// Analyser une image de plante
export const analyzePlant = async (base64Image, progressCallback) => {
  try {
    // Appel à notre API serverless
    // IMPORTANT: Le chemin correct est /api/analyze-plant
    // Next.js expose automatiquement ce chemin à partir du fichier dans pages/api/
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
    let progress = 50;
    const progressInterval = setInterval(() => {
      progress += 2;
      if (progress >= 90) {
        clearInterval(progressInterval);
      }
      if (progressCallback) progressCallback(progress);
    }, 300);
    
    if (!response.ok) {
      const errorData = await response.json();
      clearInterval(progressInterval);
      throw new Error(errorData.error || 'Erreur serveur');
    }
    
    const result = await response.json();
    clearInterval(progressInterval);
    
    // Signaler que l'analyse est terminée
    if (progressCallback) progressCallback(100);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    throw error;
  }
};

// Fonction utilitaire pour lire un fichier en base64
export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
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
  
  // Validation de la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "L'image est trop volumineuse (maximum 5MB)"
    };
  }
  
  return { isValid: true };
};
