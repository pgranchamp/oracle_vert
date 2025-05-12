import React from 'react';
import { Check, Loader } from 'lucide-react';

const ImagePreview = ({ imagePreview, onAnalyze, isLoading, uploadProgress }) => {
  if (!imagePreview) return null;
  
  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="relative">
        <img 
          src={imagePreview} 
          alt="Aperçu de la plante" 
          className="w-full h-64 object-cover"
        />
        
        {/* Bouton d'analyse ou indicateur de progression */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLoading ? (
            <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg flex flex-col items-center">
              <Loader size={24} className="text-green-600 animate-spin mb-2" />
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-700 text-sm">
                {uploadProgress < 50 && "Préparation de l'image..."}
                {uploadProgress >= 50 && uploadProgress < 90 && "Analyse par l'IA en cours..."}
                {uploadProgress >= 90 && "Finalisation du diagnostic..."}
              </p>
            </div>
          ) : (
            <button
              onClick={onAnalyze}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full flex items-center shadow-lg"
            >
              <Check size={20} className="mr-2" />
              Cliquez pour analyser cette plante
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImagePreview;
