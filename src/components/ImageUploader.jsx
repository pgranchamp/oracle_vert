import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader } from 'lucide-react';
import { processImageForUpload } from '../utils/imageCompression';

const ImageUploader = ({ onImageSelect, isLoading }) => {
  const fileInputRef = useRef(null);
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
    const maxSize = 8 * 1024 * 1024; // 8MB - corrigé: * au lieu de **
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
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-green-800 text-center">
        Photographiez votre plante
      </h2>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={triggerFileInput}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full flex items-center justify-center"
          disabled={isLoading || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader size={24} className="mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Camera size={24} className="mr-2" />
              Prendre une photo
            </>
          )}
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          className="hidden"
        />
      </div>
      
      <div className="text-center text-sm text-gray-500">
        ou
      </div>
      
      <div 
        className={`mt-4 border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:bg-green-50 ${(isLoading || isCompressing) ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={(isLoading || isCompressing) ? null : triggerFileInput}
      >
        {isCompressing ? (
          <>
            <Loader size={32} className="mx-auto mb-2 text-green-500 animate-spin" />
            <p className="text-sm text-gray-600">
              Optimisation de l'image en cours...
            </p>
          </>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm text-gray-600">
              Cliquez pour télécharger une image depuis votre galerie
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés: JPG, PNG, WEBP, HEIC, HEIF (max 8MB)
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default ImageUploader;
