import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader } from 'lucide-react';
import { useQuery } from 'react-query';
import { searchSuggestions } from '../utils/api';

const SearchBar = ({ 
  initialValue = '', 
  placeholder = 'Search songs, artists, or lyrics...',
  showSuggestions = true,
  className = '',
  onSearch = () => {}
}) => {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // Debounced search for suggestions
  const { data: suggestions = [], isLoading } = useQuery(
    ['suggestions', query],
    () => searchSuggestions(query),
    {
      enabled: query.length >= 2 && showSuggestions,
      staleTime: 30000, // 30 seconds
    }
  );

  // Trigger search when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestionsList(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    navigate(`/search?q=${encodeURIComponent(suggestion.title)}`);
    setShowSuggestionsList(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestionsList(true);
    setSelectedIndex(-1);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestionsList(false);
    setSelectedIndex(-1);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-container relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestionsList(true)}
            placeholder={placeholder}
            className="input-field pl-10 pr-10 py-3 w-full text-lg"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="h-5 w-5 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.title}-${suggestion.artist}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-gray-500">{suggestion.artist}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
