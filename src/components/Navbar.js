import React, { useState } from 'react';

function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen); 
  };

  return (
    <div>
      <nav className="bg-blue-500 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="text-white text-xl font-bold">Tic-Tak-Toe</a>
              <a href="board" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">Home</a>
              <a href="/about" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">About</a>
              <a href="/signin" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">SignIn</a>
            </div>
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">Home</a>
              <a href="#" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">About</a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Menu;
