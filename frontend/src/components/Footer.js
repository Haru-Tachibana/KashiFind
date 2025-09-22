import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">LyricsSearch</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Discover and explore Japanese lyrics with modern design and advanced features. 
              Perfect for language learners and music enthusiasts.
            </p>
            <div className="flex space-x-4">
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </button>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/search" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Search Lyrics
                </Link>
              </li>
              <li>
                <Link 
                  to="/trending" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Trending Songs
                </Link>
              </li>
              <li>
                <Link 
                  to="/genres" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse by Genre
                </Link>
              </li>
              <li>
                <Link 
                  to="/artists" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Popular Artists
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Furigana Support</li>
              <li className="text-gray-400">Romaji Conversion</li>
              <li className="text-gray-400">Advanced Search</li>
              <li className="text-gray-400">Mobile Friendly</li>
              <li className="text-gray-400">Clean Interface</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 LyricsSearch. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </button>
              <button 
                className="text-gray-400 hover:text-white text-sm transition-colors"
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
