import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Star, Globe, BookOpen } from 'lucide-react';
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
      title: 'Lyrics Display',
      description: 'Clean, readable lyrics with multiple format support.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Multi-language',
      description: 'Support for songs in various languages and formats.'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Clean Interface',
      description: 'Modern, ad-free design focused on the music and lyrics you love.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Discover
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"> Lyrics</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Find song lyrics with advanced search and modern features.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <SearchBar 
                placeholder="Search for your favorite songs..."
                className="mb-8"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We've built the perfect tool for music lovers and lyrics enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/30 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 text-white rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Songs Section */}
      {trendingSongs.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Trending Now
                </h2>
                <p className="text-white/80">
                  The most popular songs this week
                </p>
              </div>
              <Link
                to="/trending"
                className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 hover:border-white/40 px-6 py-3 inline-flex items-center rounded-2xl font-medium transition-all"
              >
                View All
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Popular Songs
                </h2>
                <p className="text-white/80">
                  All-time favorites from our community
                </p>
              </div>
              <Link
                to="/search?sort=popularity"
                className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 hover:border-white/40 px-6 py-3 inline-flex items-center rounded-2xl font-medium transition-all"
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Explore Music?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users discovering new songs and lyrics.
            </p>
            <Link
              to="/search"
              className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 hover:border-white/40 font-semibold py-4 px-8 rounded-2xl text-lg transition-all inline-flex items-center shadow-xl"
            >
              <Search className="h-5 w-5 mr-2" />
              Start Searching Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
