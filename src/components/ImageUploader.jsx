import React, { useRef, useState } from 'react';
import { Camera, Upload, Image } from 'lucide-react';

const ImageUploader = ({ onImageSelect, isLoading }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
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
  
  // Gestion du glisser-déposer
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Simuler le changement de fichier
      const event = { target: { files: [file] } };
      handleImageChange(event);
    }
  };

  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800 text-center flex items-center justify-center">
          <Image size={22} className="mr-2 text-green-600" />
          Diagnostic de votre plante
        </h2>
        
        <div className="flex justify-center mb-5">
          <button 
            onClick={triggerFileInput}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
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
        
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
            <div className="border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-500">ou</span>
          </div>
        </div>
        
        <div 
          className={`mt-5 border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-dashed border-green-300'} rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-green-50'}`}
          onClick={isLoading ? null : triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={36} className="mx-auto mb-3 text-green-500" />
          <p className="text-sm text-gray-600 mb-2">
            {isDragging ? 'Déposez votre image ici' : 'Glissez-déposez votre image ici ou cliquez pour parcourir'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Formats acceptés: JPG, PNG, WEBP, HEIC, HEIF (max 8MB)
          </p>
        </div>
      </div>
    </section>
  );
};

export default ImageUploader;
