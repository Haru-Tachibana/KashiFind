import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LyricsDisplay = ({ 
  song, 
  lyrics, 
  format = 'original',
  onFormatChange 
}) => {
  const [showFurigana, setShowFurigana] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLyrics = async () => {
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      toast.success('Lyrics copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy lyrics');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.artist} - ${song.title}`,
          text: lyrics,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatLyrics = (text) => {
    if (!text) return '';
    
    // Split into lines and process each line
    return text.split('\n').map((line, index) => {
      if (!line.trim()) {
        return <br key={index} />;
      }
      
      return (
        <div key={index} className="mb-2">
          <div className="japanese-text text-lg leading-relaxed text-gray-900">
            {line}
          </div>
        </div>
      );
    });
  };

  // Check if character is kanji
  const isKanji = (char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FAF) || // CJK Unified Ideographs
           (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
           (code >= 0x20000 && code <= 0x2A6DF); // CJK Extension B
  };

  // Check if character is hiragana
  const isHiragana = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x3040 && code <= 0x309F;
  };

  // Check if character is katakana
  const isKatakana = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x30A0 && code <= 0x30FF;
  };

  // Smart furigana - only show furigana for kanji, replace hiragana with spaces
  const formatLyricsWithFurigana = (originalText, hiraganaText) => {
    if (!originalText || !hiraganaText) return formatLyrics(originalText);
    
    return originalText.split('\n').map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }
      
      const hiraganaLine = hiraganaText.split('\n')[lineIndex] || '';
      
      // Create smart furigana line - only show furigana for kanji
      let smartFurigana = '';
      let hiraganaIndex = 0;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (isKanji(char)) {
          // For kanji, add the corresponding hiragana
          if (hiraganaIndex < hiraganaLine.length) {
            // Find the next hiragana sequence for this kanji
            let hiraganaForKanji = '';
            while (hiraganaIndex < hiraganaLine.length && 
                   (isHiragana(hiraganaLine[hiraganaIndex]) || isKatakana(hiraganaLine[hiraganaIndex]))) {
              hiraganaForKanji += hiraganaLine[hiraganaIndex];
              hiraganaIndex++;
            }
            smartFurigana += hiraganaForKanji;
          } else {
            smartFurigana += ' ';
          }
        } else {
          // For non-kanji (hiragana, katakana, punctuation), add spaces
          smartFurigana += ' ';
          // Skip corresponding characters in hiragana line
          while (hiraganaIndex < hiraganaLine.length && 
                 !isKanji(hiraganaLine[hiraganaIndex]) && 
                 hiraganaLine[hiraganaIndex] !== ' ') {
            hiraganaIndex++;
          }
        }
      }
      
      return (
        <div key={lineIndex} className="mb-2">
          <div className="relative">
            {/* Smart Furigana (only for kanji) */}
            <div className="text-xs text-gray-500 leading-tight mb-1 font-mono">
              {smartFurigana}
            </div>
            {/* Original text */}
            <div className="japanese-text text-lg leading-relaxed text-gray-900">
              {line}
            </div>
          </div>
        </div>
      );
    });
  };

  const getFormatButtonClass = (currentFormat) => {
    const baseClass = "px-3 py-1 text-sm font-medium rounded-lg transition-all";
    return format === currentFormat 
      ? `${baseClass} bg-primary-600 text-white` 
      : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 japanese-text">
            {song.title}
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            {song.artist}
          </p>
          {song.album && (
            <p className="text-sm text-gray-500">
              {song.album}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={handleCopyLyrics}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Format Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700 mr-2">Format:</span>
        
        <button
          onClick={() => onFormatChange('original')}
          className={getFormatButtonClass('original')}
        >
          Original
        </button>
        
        <button
          onClick={() => onFormatChange('hiragana')}
          className={getFormatButtonClass('hiragana')}
        >
          Hiragana
        </button>
        
        <button
          onClick={() => onFormatChange('romaji')}
          className={getFormatButtonClass('romaji')}
        >
          Romaji
        </button>

        {/* Toggle Options */}
        <div className="flex items-center space-x-4 ml-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showFurigana}
              onChange={(e) => setShowFurigana(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="flex items-center">
              {showFurigana ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              Furigana
            </span>
          </label>

          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showRomaji}
              onChange={(e) => setShowRomaji(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="flex items-center">
              {showRomaji ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              Romaji
            </span>
          </label>
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="lyrics-content">
        {/* Show furigana on top of kanji when enabled and in original format */}
        {showFurigana && format === 'original' && song.lyrics?.hiragana ? (
          formatLyricsWithFurigana(lyrics, song.lyrics.hiragana)
        ) : (
          formatLyrics(lyrics)
        )}
        
        {/* Additional formats if toggled */}
        {showFurigana && song.lyrics?.hiragana && format !== 'original' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Hiragana Reading:</h3>
            <div className="japanese-text text-lg leading-relaxed text-blue-900">
              {formatLyrics(song.lyrics.hiragana)}
            </div>
          </div>
        )}

        {showRomaji && song.lyrics?.romaji && format !== 'romaji' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Romaji:</h3>
            <div className="text-lg leading-relaxed text-green-900">
              {formatLyrics(song.lyrics.romaji)}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
        <p>
          Lyrics for "{song.title}" by {song.artist}
          {song.year && ` (${song.year})`}
        </p>
      </div>
    </div>
  );
};

export default LyricsDisplay;
