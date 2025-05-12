import React from 'react';

// Version de l'application pour vérifier les mises à jour
const APP_VERSION = '1.1.0'; // Incrémentez cette valeur à chaque déploiement

const Footer = () => {
  return (
    <footer className="p-4 bg-green-700 text-white text-center text-sm">
      <p>© {new Date().getFullYear()} L'Oracle du Vert Château</p>
      <p className="text-xs opacity-80 mt-1">Une application de diagnostic botanique par IA</p>
      {/* Marqueur de version pour vérifier les mises à jour */}
      <p className="text-xs opacity-50 mt-1">v{APP_VERSION}</p>
    </footer>
  );
};

export default Footer;
