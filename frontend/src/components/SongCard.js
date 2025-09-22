import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Calendar, Tag, Eye } from 'lucide-react';

const SongCard = ({ song, showLyrics = false }) => {
  const formatYear = (year) => {
    return year ? year.toString() : 'Unknown';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Link 
      to={`/song/${song._id || song.externalId || song.id}`}
      className="block group"
    >
      <div className="card hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
        <div className="flex items-start space-x-4">
          {/* Album/Artist Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
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
              
              {/* Popularity indicator */}
              {song.popularity > 0 && (
                <div className="flex items-center text-sm text-gray-100 ml-2">
                  <Eye className="h-4 w-4 mr-1" />
                  {song.popularity}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-100">
              {song.year && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatYear(song.year)}
                </div>
              )}
              {song.genre && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  {song.genre}
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

            {/* Tags */}
            {song.tags && song.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {song.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-600 text-white rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {song.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-600 text-white rounded-full">
                    +{song.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SongCard;
