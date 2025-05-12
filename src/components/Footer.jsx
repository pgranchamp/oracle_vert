import React from 'react';

const Footer = () => {
  return (
    <footer className="p-4 bg-green-700 text-white text-center text-sm">
      <p>© {new Date().getFullYear()} L'Oracle du Vert Château</p>
      <p className="text-xs opacity-80 mt-1">Une application de diagnostic botanique par IA</p>
    </footer>
  );
};

export default Footer;
