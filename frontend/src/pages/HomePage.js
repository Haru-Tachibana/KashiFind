import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Music, TrendingUp, Star, Globe, BookOpen } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';
import { getTrendingSongs, getPopularLyrics } from '../utils/api';

const HomePage = () => {
  const { data: trendingSongs = [] } = useQuery(
    'trending-songs',
    () => getTrendingSongs({ limit: 6 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: popularSongs = [] } = useQuery(
    'popular-songs',
    () => getPopularLyrics({ limit: 6 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Advanced Search',
      description: 'Find songs by title, artist, or lyrics with intelligent search algorithms.'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Furigana Support',
      description: 'View hiragana readings above kanji characters for easier learning.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Romaji Conversion',
      description: 'Switch between kanji, hiragana, and romaji formats instantly.'
    },
    {
      icon: <Music className="h-8 w-8" />,
      title: 'Clean Interface',
      description: 'Modern, ad-free design focused on the music and lyrics you love.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover Japanese
                <span className="text-primary-600"> Lyrics</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Explore thousands of Japanese songs with furigana, romaji, and modern search features. 
                Perfect for language learners and music enthusiasts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <SearchBar 
                placeholder="Search for your favorite Japanese songs..."
                className="mb-8"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/search"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Browse All Songs
              </Link>
              <Link
                to="/trending"
                className="btn-outline text-lg px-8 py-3 inline-flex items-center"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Trending
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the perfect tool for Japanese music lovers and language learners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Songs Section */}
      {trendingSongs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Trending Now
                </h2>
                <p className="text-gray-600">
                  The most popular songs this week
                </p>
              </div>
              <Link
                to="/trending"
                className="btn-outline inline-flex items-center"
              >
                View All
                <TrendingUp className="h-4 w-4 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSongs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SongCard song={song} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Songs Section */}
      {popularSongs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Popular Songs
                </h2>
                <p className="text-gray-600">
                  All-time favorites from our community
                </p>
              </div>
              <Link
                to="/search?sort=popularity"
                className="btn-outline inline-flex items-center"
              >
                View All
                <Star className="h-4 w-4 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularSongs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SongCard song={song} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Explore Japanese Music?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users discovering new songs and improving their Japanese language skills.
          </p>
          <Link
            to="/search"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all inline-flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Start Searching Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
