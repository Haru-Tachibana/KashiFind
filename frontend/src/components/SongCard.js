import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Calendar } from 'lucide-react';

const SongCard = ({ song, showLyrics = false }) => {
  const formatYear = (year) => {
    return year ? year.toString() : 'Unknown';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Determine the correct ID for routing
  const songId = song._id || song.externalId || song.id;
  
  // Debug logging
  console.log('SongCard - Song:', song.title, 'ID:', songId, 'ExternalId:', song.externalId);
  
  return (
    <Link 
      to={`/song/${songId}`}
      className="block group"
    >
      <div className="card hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
        <div className="flex items-start space-x-4">
          {/* Album Art */}
          <div className="flex-shrink-0">
            {song.imageUrl ? (
              <img 
                src={song.imageUrl} 
                alt={`${song.title} album art`}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  // Fallback to music icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white ${song.imageUrl ? 'hidden' : 'flex'}`}
            >
              <Music className="h-8 w-8" />
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                  {song.title}
                </h3>
                <p className="text-gray-100 font-medium truncate">
                  {song.artist}
                </p>
                {song.album && (
                  <p className="text-sm text-gray-200 truncate">
                    {song.album}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-100">
              {song.year && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatYear(song.year)}
                </div>
              )}
            </div>

            {/* Lyrics Preview */}
            {showLyrics && song.lyrics && (
              <div className="mt-3">
                <p className="text-sm text-gray-100 japanese-text leading-relaxed">
                  {truncateText(song.lyrics.original || song.lyrics)}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </Link>
  );
};

export default SongCard;
