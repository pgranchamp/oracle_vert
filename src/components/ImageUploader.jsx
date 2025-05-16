import React, { useRef, useState } from 'react';
import { Camera, Upload, Image, Loader } from 'lucide-react';
import { processImageForUpload } from '../utils/imageCompression';

const ImageUploader = ({ onImageSelect, isLoading }) => {
  // Référence vers deux inputs : un pour la caméra, un pour la galerie
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      onImageSelect(null, "Format d'image non supporté. Utilisez JPG, PNG, WEBP, HEIC ou HEIF.");
      return;
    }
    
    // Validation de la taille (max 8MB)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      onImageSelect(null, "L'image est trop volumineuse (maximum 8MB)");
      return;
    }
    
    try {
      // Si l'image est relativement volumineuse, la compresser dès maintenant
      if (file.size > 1.5 * 1024 * 1024) { // Plus de 1.5MB
        setIsCompressing(true);
        console.log(`Image volumineuse détectée (${(file.size / 1024 / 1024).toFixed(2)}MB), compression préventive...`);
        
        // Compression de l'image
        const compressedBase64 = await processImageForUpload(file);
        
        // Prévisualisation et sélection
        onImageSelect({
          name: file.name,
          type: 'image/jpeg', // L'image compressée sera toujours en JPEG
          size: Math.round(compressedBase64.length * 0.75), // Estimation approximative
          _compressedData: compressedBase64 // Stockage des données compressées
        }, null, compressedBase64);
        
        setIsCompressing(false);
        return;
      }
      
      // Pour les petites images, utilisation standard sans compression immédiate
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(file, null, reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du traitement de l'image:", error);
      onImageSelect(null, "Erreur lors du traitement de l'image. Veuillez réessayer.");
      setIsCompressing(false);
    }
  };
  
  // Déclenche l'input pour la caméra
  const triggerCameraInput = () => {
    cameraInputRef.current.click();
  };
  
  // Déclenche l'input pour la galerie
  const triggerGalleryInput = () => {
    galleryInputRef.current.click();
  };

  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-green-800 text-center">
        Photographiez votre plante
      </h2>
      
      <div className="flex justify-center space-x-4">
        {/* Bouton pour prendre une photo avec la caméra */}
        <button 
          onClick={triggerCameraInput}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-full flex items-center justify-center flex-1"
          disabled={isLoading || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader size={20} className="mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Camera size={20} className="mr-2" />
              Prendre photo
            </>
          )}
        </button>
        
        {/* Bouton pour sélectionner depuis la galerie */}
        <button 
          onClick={triggerGalleryInput}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-full flex items-center justify-center flex-1"
          disabled={isLoading || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader size={20} className="mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Image size={20} className="mr-2" />
              Galerie
            </>
          )}
        </button>
        
        {/* Input caché pour la caméra */}
        <input 
          type="file" 
          ref={cameraInputRef}
          onChange={handleImageChange}
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          className="hidden"
        />
        
        {/* Input caché pour la galerie (sans attribut capture) */}
        <input 
          type="file" 
          ref={galleryInputRef}
          onChange={handleImageChange}
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
        />
      </div>
      
      {/* Zone explicative */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>
          Formats acceptés: JPG, PNG, WEBP, HEIC, HEIF (max 8MB)
        </p>
      </div>
      
      {/* Indicateur de compression */}
      {isCompressing && (
        <div className="mt-4 p-2 bg-gray-100 rounded-lg text-center">
          <Loader size={20} className="inline mr-2 text-green-500 animate-spin" />
          <span className="text-sm text-gray-700">Optimisation de l'image en cours...</span>
        </div>
      )}
    </section>
  );
};

export default ImageUploader;
