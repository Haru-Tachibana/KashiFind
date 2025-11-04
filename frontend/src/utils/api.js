import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle ApiResponse wrapper: { success: true, data: {...}, error: null }
    if (response.data && response.data.success !== undefined) {
      // Check if response is an error
      if (!response.data.success) {
        // Return error for rejection
        const errorMessage = response.data.error || response.data.message || 'Request failed';
        return Promise.reject(new Error(errorMessage));
      }
      // Unwrap the ApiResponse - return the inner data
      return response.data.data !== undefined ? response.data.data : response.data;
    }
    // Direct response
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    // Return error response data if available
    if (error.response?.data) {
      // Handle ApiResponse error format
      if (error.response.data.error) {
        return Promise.reject(new Error(error.response.data.error));
      }
      return Promise.reject(new Error(error.response.data.message || 'Request failed'));
    }
    return Promise.reject(error);
  }
);

// Song API functions
export const getSongs = (params = {}) => {
  return api.get('/songs', { params });
};

export const getSong = (id) => {
  console.log('🌐 API Call: GET /api/songs/' + id);
  return api.get(`/songs/${id}`);
};

export const getExternalSong = (id) => {
  console.log('🌐 API Call: GET /api/songs/external/' + id);
  return api.get(`/songs/external/${id}`);
};

export const createSong = (songData) => {
  return api.post('/songs', songData);
};

export const updateSong = (id, songData) => {
  return api.put(`/songs/${id}`, songData);
};

export const deleteSong = (id) => {
  return api.delete(`/songs/${id}`);
};

// Search API functions
export const searchSongs = (params) => {
  return api.get('/search', { params });
};

export const searchSongsRealtime = (params) => {
  const { query, page = 1, limit = 50, ...restParams } = params;
  return api.get('/search/realtime', { 
    params: { 
      q: query,
      page,
      limit,
      ...restParams, 
      includeExternal: true 
    } 
  });
};

export const searchSuggestions = (query) => {
  return api.get('/search/suggestions', { 
    params: { q: query } 
  });
};

export const getTrendingSongs = (params = {}) => {
  return api.get('/search/trending', { params });
};

export const getGenres = () => {
  return api.get('/search/genres');
};

export const getYears = () => {
  return api.get('/search/years');
};

// Lyrics API functions
export const getLyrics = (id, format = 'original') => {
  return api.get(`/lyrics/${id}`, { 
    params: { format } 
  });
};

export const getLyricsFormats = (id) => {
  return api.get(`/lyrics/${id}/formats`);
};

export const processText = (text) => {
  return api.post('/lyrics/process', { text });
};

export const generateFurigana = (text) => {
  return api.post('/lyrics/furigana', { text });
};

export const getRandomLyrics = (params = {}) => {
  return api.get('/lyrics/random', { params });
};

export const getPopularLyrics = (params = {}) => {
  return api.get('/lyrics/popular', { params });
};

// Related songs - disabled since we removed database
// Could search for more songs by same artist if needed
export const getRelatedSongs = async (songId, params = {}) => {
  // Return empty array - related songs feature disabled (no database)
  // In the future, could search for more songs by same artist
  return Promise.resolve([]);
};

// YouTube API functions
export const getYouTubeVideos = (songId, songTitle, artist) => {
  // Use POST to avoid URL encoding issues with Japanese characters
  // Spring Boot sometimes rejects GET requests with improperly encoded characters
  return api.post(`/songs/${encodeURIComponent(songId)}/youtube`, {
    title: songTitle || '',
    artist: artist || ''
  }, {
    // Increase timeout for YouTube API calls
    timeout: 30000
  });
};


// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;
