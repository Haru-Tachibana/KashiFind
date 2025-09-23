import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import SongDetailPage from './pages/SongDetailPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import BackgroundCustomizer from './components/BackgroundCustomizer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('kashifind-background') || '';
  });

  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem('kashifind-background', backgroundImage);
    }
  }, [backgroundImage]);

  const handleBackgroundChange = (imageUrl) => {
    setBackgroundImage(imageUrl);
  };

  const handleRemoveBackground = () => {
    setBackgroundImage('');
    localStorage.removeItem('kashifind-background');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div 
          className="min-h-screen flex flex-col relative"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          
          {/* Content with glassmorphism effect */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header onCustomizeClick={() => setShowCustomizer(true)} />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/song/:id" element={<SongDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
          
          {/* Background Customizer Modal */}
          {showCustomizer && (
            <BackgroundCustomizer
              currentBackground={backgroundImage}
              onBackgroundChange={handleBackgroundChange}
              onRemoveBackground={handleRemoveBackground}
              onClose={() => setShowCustomizer(false)}
            />
          )}
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
