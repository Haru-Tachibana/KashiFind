import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Eye, 
  Heart,
  Share2,
  Download
} from 'lucide-react';
import LyricsDisplay from '../components/LyricsDisplay';
import SongCard from '../components/SongCard';
import YouTubePlayer from '../components/YouTubePlayer';
import { getSong, getExternalSong, getRelatedSongs } from '../utils/api';
import { useAutoTextColor } from '../hooks/useAutoTextColor';

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lyricsFormat, setLyricsFormat] = useState('original');
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
  
  // Debug logging for received ID
  console.log('🆔 SongDetailPage received ID:', id);

  // Fetch song details - always use external API since we use external IDs
  const { data: song, isLoading, error } = useQuery(
    ['song', id],
    async () => {
      console.log('🌐 Fetching from external API:', id);
      const response = await getExternalSong(id);
      console.log('✅ Found in external API:', response.data?.title);
      return response;
    },
    {
      enabled: !!id,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    }
  );

  // Use the fetched song
  const displaySong = song?.data || song;
  
  // Debug logging - only log once per song
  useEffect(() => {
    if (displaySong) {
      console.log('🎵 Song loaded:', displaySong.title, 'by', displaySong.artist);
      console.log('📝 Lyrics available:', !!displaySong.lyrics);
    }
  }, [displaySong?.title, displaySong?.artist]);

  // Fetch related songs
  const { data: relatedSongs = [] } = useQuery(
    ['related-songs', id],
    () => getRelatedSongs(id, { limit: 6 }),
    {
      enabled: !!displaySong,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className={textColors.primary}>Loading song details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className={`text-lg font-medium ${textColors.primary} mb-2`}>
            Song Not Found
          </h3>
          <p className={`${textColors.secondary} mb-4`}>
            The song you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleFormatChange = (format) => {
    setLyricsFormat(format);
  };

    const getLyricsText = () => {
      if (!displaySong || !displaySong.lyrics) {
        return 'No lyrics available for this song.';
      }
      
      // Handle new lyrics structure where lyrics.original is an object
      const lyricsData = displaySong.lyrics.original || displaySong.lyrics;
      
      switch (lyricsFormat) {
        case 'hiragana':
          return lyricsData?.hiragana || lyricsData?.original || 'No hiragana available.';
        case 'romaji':
          return lyricsData?.romaji || lyricsData?.original || 'No romaji available.';
        default:
          return lyricsData?.original || lyricsData || 'No lyrics available.';
      }
    };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className={`flex items-center ${textColors.secondary} hover:${textColors.primary} mb-6 transition-colors`}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </motion.button>

        {/* Song Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            {/* Album Art */}
            <div className="flex-shrink-0">
              {displaySong?.imageUrl ? (
                <img 
                  src={displaySong.imageUrl} 
                  alt={`${displaySong.title} album art`}
                  className="w-24 h-24 rounded-xl object-cover"
                  onError={(e) => {
                    // Fallback to music icon if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white ${displaySong?.imageUrl ? 'hidden' : 'flex'}`}
              >
                <span className="text-2xl">🎵</span>
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
            <h1 className={`text-3xl font-bold ${textColors.primary} japanese-text mb-2`}>
              {displaySong.title}
            </h1>
            <p className={`text-xl ${textColors.secondary} font-medium mb-4`}>
              {displaySong.artist}
            </p>
            
            {displaySong.album && (
              <p className={`text-lg ${textColors.muted} mb-4`}>
                {displaySong.album}
              </p>
            )}

              {/* Metadata */}
              <div className={`flex flex-wrap items-center gap-4 text-sm ${textColors.muted}`}>
                {displaySong.year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {displaySong.year}
                  </div>
                )}
                {displaySong.genre && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {displaySong.genre}
                  </div>
                )}
                {displaySong.popularity > 0 && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {displaySong.popularity} views
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </motion.div>

        {/* YouTube Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <YouTubePlayer
            songId={id}
            songTitle={displaySong.title}
            artist={displaySong.artist}
          />
        </motion.div>

        {/* Lyrics Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LyricsDisplay
            song={displaySong}
            lyrics={displaySong?.lyrics}
            format={lyricsFormat}
            onFormatChange={handleFormatChange}
          />
        </motion.div>

        {/* Related Songs */}
        {relatedSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Songs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedSongs.map((relatedSong, index) => (
                <motion.div
                  key={relatedSong._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <SongCard song={relatedSong} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Song Metadata */}
        {displaySong.metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Song Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displaySong.metadata.duration && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration</span>
                  <p className="text-gray-900">
                    {Math.floor(displaySong.metadata.duration / 60)}:{(displaySong.metadata.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}
              {displaySong.metadata.bpm && (
                <div>
                  <span className="text-sm font-medium text-gray-500">BPM</span>
                  <p className="text-gray-900">{displaySong.metadata.bpm}</p>
                </div>
              )}
              {displaySong.metadata.key && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Key</span>
                  <p className="text-gray-900">{displaySong.metadata.key}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default SongDetailPage;
