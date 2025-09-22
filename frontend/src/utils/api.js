import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
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
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Song API functions
export const getSongs = (params = {}) => {
  return api.get('/songs', { params });
};

export const getSong = (id) => {
  return api.get(`/songs/${id}`);
};

export const getExternalSong = (id) => {
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
  return api.get('/search/realtime', { 
    params: { 
      ...params, 
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

// Related songs (placeholder - would need backend implementation)
export const getRelatedSongs = (songId, params = {}) => {
  // This would typically be implemented in the backend
  // For now, we'll return songs from the same artist or genre
  return api.get('/songs', { 
    params: { 
      ...params,
      relatedTo: songId 
    } 
  });
};

// YouTube API functions
export const getYouTubeVideos = (songId, songTitle, artist) => {
  return api.get(`/songs/${songId}/youtube`, {
    params: {
      title: songTitle,
      artist: artist
    }
  });
};

// Song API functions
export const getSong = (id) => {
  return api.get(`/songs/${id}`);
};

export const getExternalSong = (id) => {
  return api.get(`/songs/external/${id}`);
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;
