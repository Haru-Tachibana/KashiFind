import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  Music
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';
import { searchSongs, searchSongsRealtime, getGenres, getYears } from '../utils/api';
import { useAutoTextColor } from '../hooks/useAutoTextColor';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    type: 'all',
    sortBy: 'relevance',
    genre: '',
    year: '',
    page: 1,
    limit: 50, // Increased from 20 to 50
    realtime: true // Enable real-time search by default
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [backgroundImage, setBackgroundImage] = useState(localStorage.getItem('kashifind-background') || '');

  // Auto text color detection
  const { textColors, isLoading: colorLoading } = useAutoTextColor(backgroundImage);

  // Listen for background changes
  useEffect(() => {
    const handleStorageChange = () => {
      setBackgroundImage(localStorage.getItem('kashifind-background') || '');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', filters],
    () => filters.realtime ? searchSongsRealtime(filters) : searchSongs(filters),
    {
      enabled: !!filters.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    }
  );

  // Normalize search results data structure
  const normalizedResults = React.useMemo(() => {
    if (!searchResults) return null;
    
    if (filters.realtime) {
      // Realtime search returns { data: { database: [], external: [], total: number } }
      const allSongs = [
        ...(searchResults.data?.database || []),
        ...(searchResults.data?.external || [])
      ];
      return {
        data: allSongs,
        pagination: {
          total: searchResults.data?.total || allSongs.length,
          page: 1,
          pages: 1
        }
      };
    } else {
      // Regular search returns { data: [], pagination: {} }
      return searchResults;
    }
  }, [searchResults, filters.realtime]);

  // Fetch filter options
  const { data: genres = [] } = useQuery('genres', getGenres);
  const { data: years = [] } = useQuery('years', getYears);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.year) params.set('year', filters.year);
    if (filters.page > 1) params.set('page', filters.page);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle search
  const handleSearch = (query) => {
    setFilters(prev => ({
      ...prev,
      query,
      page: 1
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      type: 'all',
      sortBy: 'relevance',
      genre: '',
      year: '',
      limit: 50,
      page: 1
    }));
  };

  const hasActiveFilters = filters.type !== 'all' || filters.genre || filters.year || filters.sortBy !== 'relevance';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
            {filters.query ? `Search Results for "${filters.query}"` : 'Search Songs'}
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                initialValue={filters.query}
                onSearch={handleSearch}
                placeholder="Search songs, artists, or lyrics..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, realtime: !prev.realtime }))}
                className={`btn-secondary inline-flex items-center ${
                  filters.realtime ? 'bg-green-100 text-green-700' : ''
                }`}
              >
                <div className={`h-2 w-2 rounded-full mr-2 ${filters.realtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {filters.realtime ? 'Real-time ON' : 'Real-time OFF'}
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary inline-flex items-center ${
                  showFilters ? 'bg-primary-100 text-primary-700' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                    {[filters.type !== 'all' && 'type', filters.genre && 'genre', filters.year && 'year', filters.sortBy !== 'relevance' && 'sort'].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Type */}
              <div>
                <label className={`block text-sm font-medium ${textColors.primary} mb-2`}>
                  Search In
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title Only</option>
                  <option value="artist">Artist Only</option>
                  <option value="lyrics">Lyrics Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className={`block text-sm font-medium ${textColors.primary} mb-2`}>
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-field"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="artist">Artist A-Z</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className={`block text-sm font-medium ${textColors.primary} mb-2`}>
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className={`block text-sm font-medium ${textColors.primary} mb-2`}>
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Results Per Page */}
              <div>
                <label className={`block text-sm font-medium ${textColors.primary} mb-2`}>
                  Results Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className={textColors.primary}>Searching for songs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Music className="h-12 w-12 mx-auto" />
            </div>
            <h3 className={`text-lg font-medium ${textColors.primary} mb-2`}>
              Search Error
            </h3>
            <p className={textColors.secondary}>
              {error.message || 'Something went wrong while searching. Please try again.'}
            </p>
          </div>
        ) : !normalizedResults?.data || normalizedResults.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className={`text-lg font-medium ${textColors.primary} mb-2`}>
              No songs found
            </h3>
            <p className={textColors.secondary}>
              Try adjusting your search terms or filters to find more results.
            </p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className={textColors.secondary}>
                  {normalizedResults?.pagination?.total || normalizedResults?.data?.length || 0} songs found
                  {filters.realtime && (
                    <span className="ml-2 text-green-600">
                      (live results)
                    </span>
                  )}
                  {normalizedResults?.pagination?.total > 0 && (
                    <span className="ml-2">
                      (Page {normalizedResults.pagination.page} of {normalizedResults.pagination.pages})
                    </span>
                  )}
                </p>
                {filters.realtime && (
                  <div className="flex items-center text-xs text-green-600">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Real-time search active
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            }>
              {/* Search Results */}
              {normalizedResults?.data?.map((song, index) => (
                <motion.div
                  key={song._id || song.externalId || `song-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <SongCard song={song} showLyrics={viewMode === 'list'} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {normalizedResults?.pagination?.pages > 1 && (
              <div className="mt-12">
                {/* Pagination Info */}
                <div className="text-center mb-6">
                  <p className={textColors.secondary}>
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, normalizedResults.pagination.total)} of {normalizedResults.pagination.total} songs
                  </p>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    {/* First Page */}
                    {filters.page > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
                        >
                          1
                        </button>
                        {filters.page > 4 && (
                          <span className="px-2 text-white/50">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(7, normalizedResults.pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (normalizedResults.pagination.pages <= 7) {
                        pageNum = i + 1;
                      } else if (filters.page <= 4) {
                        pageNum = i + 1;
                      } else if (filters.page >= normalizedResults.pagination.pages - 3) {
                        pageNum = normalizedResults.pagination.pages - 6 + i;
                      } else {
                        pageNum = filters.page - 3 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > normalizedResults.pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            filters.page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-white bg-white/10 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= normalizedResults.pagination.pages}
                      className="px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    
                    {/* Last Page */}
                    {filters.page < normalizedResults.pagination.pages - 2 && (
                      <>
                        {filters.page < normalizedResults.pagination.pages - 3 && (
                          <span className="px-2 text-white/50">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(normalizedResults.pagination.pages)}
                          className="px-3 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
                        >
                          {normalizedResults.pagination.pages}
                        </button>
                      </>
                    )}
                  </nav>
                </div>
                
                {/* Quick Jump */}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <span className={textColors.secondary}>Go to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={normalizedResults.pagination.pages}
                    value={filters.page}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= normalizedResults.pagination.pages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                    placeholder="Page"
                  />
                  <span className={textColors.secondary}>of {normalizedResults.pagination.pages}</span>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default SearchPage;
