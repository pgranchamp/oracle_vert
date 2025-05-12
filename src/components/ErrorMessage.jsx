import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;
  
  return (
    <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle size={24} className="text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{message}</p>
        </div>
        <button 
          onClick={onRetry} 
          className="ml-4 p-2 rounded-full hover:bg-red-100 flex-shrink-0"
          title="Réessayer"
        >
          <RefreshCw size={20} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
