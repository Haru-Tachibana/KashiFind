import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Music, 
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

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lyricsFormat, setLyricsFormat] = useState('original');

  // Fetch song details - try local first, then external
  const { data: song, isLoading, error } = useQuery(
    ['song', id],
    async () => {
      try {
        // First try to get from local database
        return await getSong(id);
      } catch (err) {
        // If 404, try external API
        if (err.response?.status === 404) {
          return await getExternalSong(id);
        }
        throw err;
      }
    },
    {
      enabled: !!id,
      retry: false, // Don't retry on 404
    }
  );

  // Use the fetched song
  const displaySong = song?.data || song;
  
  // Debug logging
  console.log('Song data:', displaySong);

  // Fetch related songs
  const { data: relatedSongs = [] } = useQuery(
    ['related-songs', id],
    () => getRelatedSongs(id, { limit: 6 }),
    {
      enabled: !!displaySong,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading song details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Music className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Song Not Found
          </h3>
          <p className="text-gray-600 mb-4">
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
      
      switch (lyricsFormat) {
        case 'hiragana':
          return displaySong.lyrics.hiragana || displaySong.lyrics.original || 'No hiragana available.';
        case 'romaji':
          return displaySong.lyrics.romaji || displaySong.lyrics.original || 'No romaji available.';
        default:
          return displaySong.lyrics.original || 'No lyrics available.';
      }
    };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
                <Music className="h-12 w-12" />
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 japanese-text mb-2">
              {displaySong.title}
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-4">
              {displaySong.artist}
            </p>
            
            {displaySong.album && (
              <p className="text-lg text-gray-500 mb-4">
                {displaySong.album}
              </p>
            )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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

              {/* Tags */}
              {displaySong.tags && displaySong.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {displaySong.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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

        {/* Lyrics Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LyricsDisplay
            song={displaySong}
            lyrics={getLyricsText()}
            format={lyricsFormat}
            onFormatChange={handleFormatChange}
          />
        </motion.div>

        {/* YouTube Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <YouTubePlayer
            songId={id}
            songTitle={displaySong.title}
            artist={displaySong.artist}
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
    </div>
  );
};

export default SongDetailPage;
