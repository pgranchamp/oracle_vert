/**
 * Service pour l'analyse de plantes
 * Gère la communication avec l'API serverless
 */

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
      
      throw new Error(`Erreur d'analyse: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    clearInterval(progressInterval);
    
    console.log("Résultat d'analyse obtenu:", result);
    
    // Vérifier si le résultat contient l'identification
    if (!result.identification) {
      console.warn("⚠️ La réponse ne contient pas d'identification - Format de réponse incorrect");
      console.log("Contenu complet de la réponse:", JSON.stringify(result));
    }
    
    // Signaler que l'analyse est terminée
    if (progressCallback) progressCallback(100);
    
    return result;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse:', error);
    throw error; // Propager l'erreur au composant
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
  
  // Validation de la taille (max 8MB)
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "L'image est trop volumineuse (maximum 8MB)"
    };
  }
  
  return { isValid: true };
};

// Fonction de test pour déboguer la réponse API
export const testDebugResponse = async () => {
  try {
    const response = await fetch('/api/debug-response');
    const result = await response.json();
    console.log("Test de la réponse de débogage:", result);
    return result;
  } catch (error) {
    console.error('Erreur lors du test de débogage:', error);
    throw error;
  }
};
