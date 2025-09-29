import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/5 backdrop-blur-xl border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                  <Music className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Kashi.find
                </span>
                <span className="text-xs text-white/60 font-medium -mt-1">
                  Lyrics Search
                </span>
              </div>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              Discover and explore song lyrics with modern design and advanced features. 
              Perfect for music enthusiasts.
            </p>
            <div className="flex space-x-4">
              <button 
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </button>
              <button 
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button 
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-2">
              <li className="text-white/70">Advanced Search</li>
              <li className="text-white/70">Multi-language Support</li>
              <li className="text-white/70">Mobile Friendly</li>
              <li className="text-white/70">Clean Interface</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm">
              © 2025 Kashi.find. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
