import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
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
        setError(null);
        const response = await getYouTubeVideos(songId, songTitle, artist);
        console.log('YouTube API response:', response);
        console.log('Response type:', typeof response, 'Is array:', Array.isArray(response));
        
        // Handle response structure
        // Backend returns: ApiResponse.success(videos) where videos is List<Map>
        // After interceptor unwraps: response = the list/array
        let videoList = [];
        if (response) {
          if (Array.isArray(response)) {
            // Already an array (most common case)
            videoList = response;
          } else if (response.id || response.videoId || response.url) {
            // Single video object - wrap in array
            videoList = [response];
          } else if (response.data) {
            // Nested data property
            videoList = Array.isArray(response.data) ? response.data : [response.data];
          } else if (response.success && response.data) {
            // Still wrapped in ApiResponse
            videoList = Array.isArray(response.data) ? response.data : [response.data];
          }
        }
        
        console.log('Processed video list:', videoList);
        console.log('Video list length:', videoList.length);
        console.log('Song info:', { songId, songTitle, artist });
        setVideos(videoList);
        if (videoList.length > 0) {
          setSelectedVideo(videoList[0]);
        } else {
          setError('No videos found');
        }
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError(err.message || 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (songId && songTitle && artist) {
      fetchVideos();
    } else {
      setLoading(false);
      setError('Missing song information');
    }
  }, [songId, songTitle, artist]);

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
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
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
            <p className="text-xs text-gray-400">
              Views: {selectedVideo.viewCount?.toLocaleString()}
            </p>
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
