import React from 'react';
import { Leaf } from 'lucide-react';

const Header = () => {
  return (
    <header className="p-4 bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <Leaf size={28} className="mr-3 text-green-300" />
          <div>
            <h1 className="text-2xl font-bold text-center">L'Oracle du Vert Château</h1>
            <p className="text-center text-sm text-green-100">Diagnostic botanique par intelligence artificielle</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
