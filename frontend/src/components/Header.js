import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Music, Settings, Palette, Search, Home } from 'lucide-react';

const Header = ({ onCustomizeClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-white hover:text-white/80 transition-colors group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                <Music className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Kashi.find
              </span>
              <span className="text-xs text-white/60 font-medium -mt-1">
                Japanese Lyrics Search
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link 
              to="/search" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <button 
              onClick={onCustomizeClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <Palette className="h-4 w-4" />
              Customize
            </button>
            <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all">
              <Settings className="h-5 w-5" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 bg-white/5 backdrop-blur-sm rounded-b-xl">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                to="/search" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <button 
                onClick={() => {
                  onCustomizeClick();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium text-left"
              >
                <Palette className="h-4 w-4" />
                Customize Background
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium text-left">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
