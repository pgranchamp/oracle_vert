import React from 'react';

const Header = () => {
  return (
    <header className="p-4 bg-green-700 text-white shadow-md">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-center">L'Oracle du Vert Château</h1>
        <p className="text-center text-sm opacity-80">Diagnostic botanique par IA</p>
      </div>
    </header>
  );
};

export default Header;
