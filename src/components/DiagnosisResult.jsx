import React from 'react';
import { Stethoscope, Pill, Calendar, Leaf, AlertTriangle } from 'lucide-react';

const DiagnosisResult = ({ diagnosis }) => {
  if (!diagnosis) return null;
  
  // Debug - Afficher le contenu complet du diagnostic dans la console
  console.log("Contenu du diagnostic reçu :", diagnosis);
  
  // Déterminer si l'identification est positive ou négative
  const hasIdentification = diagnosis.identification && 
                            !diagnosis.identification.toLowerCase().includes("pas à identifier") && 
                            !diagnosis.identification.toLowerCase().includes("pas suffisamment") &&
                            !diagnosis.identification.toLowerCase().includes("n'arrive pas");
  
  return (
    <section className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
      {/* Barre de débogage en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs font-mono">
          <div>Format reçu: {JSON.stringify(Object.keys(diagnosis))}</div>
          {diagnosis.identification && <div>ID présent: {diagnosis.identification.substring(0, 30)}...</div>}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 mr-3">
            <Stethoscope size={22} />
          </span>
          <h2 className="text-xl font-semibold text-green-800">Diagnostic de l'Oracle</h2>
        </div>
        
        {/* Message d'information si ancien format détecté */}
        {!diagnosis.identification && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Fonctionnalité d'identification de plante activée mais pas encore disponible pour cette analyse. 
                Veuillez réessayer avec une nouvelle photo.
              </p>
            </div>
          </div>
        )}
        
        {/* Identification de la plante */}
        {diagnosis.identification && (
          <div className={`mb-5 ${hasIdentification ? 'bg-green-50' : 'bg-amber-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${hasIdentification ? 'text-green-800' : 'text-amber-800'} mb-2 flex items-center`}>
              <Leaf size={18} className="mr-2" />
              Identification de la plante:
            </h3>
            <p className="text-gray-800 ml-8">{diagnosis.identification}</p>
          </div>
        )}
        
        {/* Diagnostic */}
        <div className="mb-5 bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-700 text-white rounded-full text-xs mr-2">1</span>
            Problème identifié:
          </h3>
          <p className="text-gray-800 ml-8">{diagnosis.diagnosis}</p>
        </div>
        
        {/* Traitement */}
        <div className="mb-5 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-700 text-white rounded-full text-xs mr-2">2</span>
            <Pill size={16} className="mr-1" />
            Traitement recommandé:
          </h3>
          <p className="text-gray-800 ml-8">{diagnosis.treatment}</p>
        </div>
        
        {/* Suivi */}
        <div className="mb-4 bg-amber-50 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 mb-2 flex items-center">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-700 text-white rounded-full text-xs mr-2">3</span>
            <Calendar size={16} className="mr-1" />
            Suivi conseillé:
          </h3>
          <p className="text-gray-800 ml-8">{diagnosis.followUp}</p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic flex items-center justify-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Consultation effectuée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiagnosisResult;
