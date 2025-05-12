import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="p-4 bg-gradient-to-r from-green-800 to-green-700 text-white text-center text-sm">
      <p className="flex items-center justify-center">
        © {new Date().getFullYear()} L'Oracle du Vert Château 
        <Heart size={16} className="mx-2 text-red-300 fill-current" />
        Vos plantes vous remercient
      </p>
      <p className="text-xs text-green-200 mt-1">Propulsé par l'IA et l'amour des plantes</p>
    </footer>
  );
};

export default Footer;
