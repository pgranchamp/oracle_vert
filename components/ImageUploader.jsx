import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

const ImageUploader = ({ onImageSelect, isLoading }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      onImageSelect(null, "Format d'image non supporté. Utilisez JPG, PNG, WEBP, HEIC ou HEIF.");
      return;
    }
    
    // Validation de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onImageSelect(null, "L'image est trop volumineuse (maximum 5MB)");
      return;
    }
    
    // Lecture et prévisualisation de l'image
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelect(file, null, reader.result);
    };
    reader.readAsDataURL(file);
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
          disabled={isLoading}
        >
          <Camera size={24} className="mr-2" />
          Prendre une photo
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
        className={`mt-4 border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:bg-green-50 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={isLoading ? null : triggerFileInput}
      >
        <Upload size={32} className="mx-auto mb-2 text-green-500" />
        <p className="text-sm text-gray-600">
          Cliquez pour télécharger une image depuis votre galerie
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Formats acceptés: JPG, PNG, WEBP, HEIC, HEIF (max 5MB)
        </p>
      </div>
    </section>
  );
};

export default ImageUploader;
