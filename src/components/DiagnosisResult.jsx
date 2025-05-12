import React from 'react';

const DiagnosisResult = ({ diagnosis }) => {
  if (!diagnosis) return null;
  
  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">Diagnostic de l'Oracle</h2>
        
        <div className="mb-4">
          <h3 className="font-medium text-green-700 mb-1">Problème identifié:</h3>
          <p className="text-gray-800">{diagnosis.diagnosis}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-green-700 mb-1">Traitement recommandé:</h3>
          <p className="text-gray-800">{diagnosis.treatment}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-green-700 mb-1">Suivi conseillé:</h3>
          <p className="text-gray-800">{diagnosis.followUp}</p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            Consultation effectuée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiagnosisResult;
