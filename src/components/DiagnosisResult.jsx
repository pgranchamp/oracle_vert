import React from 'react';
import { Leaf } from 'lucide-react';

const DiagnosisResult = ({ diagnosis }) => {
  if (!diagnosis) return null;
  
  // Déterminer si l'identification est positive ou négative
  const hasIdentification = diagnosis.identification && 
                            !diagnosis.identification.toLowerCase().includes("pas à identifier") && 
                            !diagnosis.identification.toLowerCase().includes("pas suffisamment") &&
                            !diagnosis.identification.toLowerCase().includes("n'arrive pas");
  
  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Diagnostic de l'Oracle</h2>
        
        {/* Identification de la plante */}
        {diagnosis.identification && (
          <div className="mb-4">
            <h3 className="font-medium text-green-700 mb-1 flex items-center">
              <Leaf size={16} className="mr-1" />
              Identification de la plante:
            </h3>
            <p className="text-gray-800">{diagnosis.identification}</p>
          </div>
        )}
        
        {/* Diagnostic */}
        <div className="mb-4">
          <h3 className="font-medium text-green-700 mb-1">Problème identifié:</h3>
          <p className="text-gray-800">{diagnosis.diagnosis}</p>
        </div>
        
        {/* Traitement */}
        <div className="mb-4">
          <h3 className="font-medium text-green-700 mb-1">Traitement recommandé:</h3>
          <p className="text-gray-800">{diagnosis.treatment}</p>
        </div>
        
        {/* Suivi */}
        <div>
          <h3 className="font-medium text-green-700 mb-1">Suivi conseillé:</h3>
          <p className="text-gray-800">{diagnosis.followUp}</p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic text-center">
            Consultation effectuée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiagnosisResult;
