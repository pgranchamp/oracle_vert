import React from 'react';
import { Check, Loader } from 'lucide-react';

const ImagePreview = ({ imagePreview, onAnalyze, isLoading, uploadProgress }) => {
  if (!imagePreview) return null;
  
  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="relative">
        {/* Container avec une hauteur et largeur fixes et gestion de l'aspect ratio */}
        <div className="relative w-full h-64 overflow-hidden">
          <img 
            src={imagePreview} 
            alt="Aperçu de la plante" 
            className="absolute inset-0 w-full h-full object-contain" // object-contain pour garder les proportions
          />
          {/* Overlay pour un effet légèrement tamisé */}
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </div>
        
        {/* Bouton d'analyse ou indicateur de progression */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLoading ? (
            <div className="backdrop-blur-sm bg-white bg-opacity-70 p-5 rounded-xl shadow-lg flex flex-col items-center">
              <Loader size={38} className="text-green-600 animate-spin mb-3" />
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-700 text-sm font-medium">
                {uploadProgress < 50 && "Préparation de l'image..."}
                {uploadProgress >= 50 && uploadProgress < 90 && "Analyse par l'IA en cours..."}
                {uploadProgress >= 90 && "Finalisation du diagnostic..."}
              </p>
            </div>
          ) : (
            <button
              onClick={onAnalyze}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-7 rounded-full flex items-center shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              <Check size={22} className="mr-2" />
              Analyser cette plante
            </button>
          )}
        </div>
      </div>
      
      {/* Informations sur l'image */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Image prête pour analyse
        </p>
      </div>
    </section>
  );
};

export default ImagePreview;
