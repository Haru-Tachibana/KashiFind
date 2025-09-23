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
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // Debounce the query for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 800); // 800ms debounce for suggestions

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Debounced search for suggestions
  const { data: suggestions = [], isLoading } = useQuery(
    ['suggestions', debouncedQuery],
    () => searchSuggestions(debouncedQuery),
    {
      enabled: debouncedQuery.length >= 3 && showSuggestions, // Use debounced query
      staleTime: 60000, // 60 seconds
      refetchOnWindowFocus: false,
    }
  );

  // Trigger search when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 1000); // 1000ms debounce to reduce API calls

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
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-600" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestionsList(true)}
            placeholder={placeholder}
            className="block w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/40 text-gray-900 placeholder-gray-500 text-lg font-medium shadow-xl"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="h-5 w-5 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-800 font-medium">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.title}-${suggestion.artist}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                      index === selectedIndex ? 'bg-white/10' : ''
                    } ${
                      index === 0 ? 'rounded-t-2xl' : ''
                    } ${
                      index === suggestions.length - 1 ? 'rounded-b-2xl' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{suggestion.title}</div>
                    <div className="text-sm text-gray-600">{suggestion.artist}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-600 text-center font-medium">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
