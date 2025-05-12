import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;
  
  return (
    <div className="w-full max-w-md bg-red-50 border border-red-100 rounded-lg p-5 mb-6 shadow-sm animate-fadein">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800 mb-1">Un problème est survenu</h3>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
        <button 
          onClick={onRetry} 
          className="ml-4 p-2 rounded-full hover:bg-red-100 flex-shrink-0 transition-colors duration-200"
          title="Réessayer"
        >
          <RefreshCw size={20} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
