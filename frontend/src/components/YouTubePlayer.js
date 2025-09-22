import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Music } from 'lucide-react';
import { getYouTubeVideos } from '../utils/api';

const YouTubePlayer = ({ songId, songTitle, artist }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await getYouTubeVideos(songId, songTitle, artist);
        if (response.data.success) {
          setVideos(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedVideo(response.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (songId) {
      fetchVideos();
    }
  }, [songId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
          <p className="text-gray-600">
            {error || 'No YouTube videos found for this song.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Music Videos</h3>
        <span className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Main Video Player */}
      {selectedVideo && (
        <div className="mb-6">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-3">
            <h4 className="font-medium text-gray-900 line-clamp-2">{selectedVideo.title}</h4>
            <p className="text-sm text-gray-600">{selectedVideo.channel}</p>
          </div>
        </div>
      )}

      {/* Video List */}
      {videos.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Other Videos</h4>
          <div className="space-y-3">
            {videos.slice(1).map((video) => (
              <div
                key={video.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedVideo?.id === video.id
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {video.title}
                  </h5>
                  <p className="text-xs text-gray-600">{video.channel}</p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(video.url, '_blank');
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Open in YouTube"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open in YouTube Button */}
      {selectedVideo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={selectedVideo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch on YouTube
          </a>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
