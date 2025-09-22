const Kuroshiro = require('kuroshiro').default || require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji').default || require('kuroshiro-analyzer-kuromoji');

class JapaneseTextProcessor {
  constructor() {
    this.kuroshiro = new Kuroshiro();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.kuroshiro.init(new KuromojiAnalyzer());
      this.initialized = true;
      console.log('Japanese text processor initialized');
    } catch (error) {
      console.error('Failed to initialize Japanese text processor:', error);
      throw error;
    }
  }

  /**
   * Convert kanji to hiragana
   * @param {string} text - Input text with kanji
   * @returns {Promise<string>} - Text with hiragana readings
   */
  async toHiragana(text) {
    if (!this.initialized) await this.initialize();
    
    try {
      return await this.kuroshiro.convert(text, { to: 'hiragana' });
    } catch (error) {
      console.error('Error converting to hiragana:', error);
      return text; // Return original text if conversion fails
    }
  }

  /**
   * Convert kanji to romaji
   * @param {string} text - Input text with kanji
   * @returns {Promise<string>} - Text in romaji
   */
  async toRomaji(text) {
    if (!this.initialized) await this.initialize();
    
    try {
      return await this.kuroshiro.convert(text, { to: 'romaji' });
    } catch (error) {
      console.error('Error converting to romaji:', error);
      return text; // Return original text if conversion fails
    }
  }

  /**
   * Convert text to katakana
   * @param {string} text - Input text
   * @returns {Promise<string>} - Text in katakana
   */
  async toKatakana(text) {
    if (!this.initialized) await this.initialize();
    
    try {
      return await this.kuroshiro.convert(text, { to: 'katakana' });
    } catch (error) {
      console.error('Error converting to katakana:', error);
      return text;
    }
  }

  /**
   * Process lyrics and generate all formats
   * @param {string} lyrics - Original lyrics text
   * @returns {Promise<Object>} - Object with original, hiragana, and romaji versions
   */
  async processLyrics(lyrics) {
    if (!this.initialized) await this.initialize();

    try {
      const [hiragana, romaji] = await Promise.all([
        this.toHiragana(lyrics),
        this.toRomaji(lyrics)
      ]);

      return {
        original: lyrics,
        hiragana,
        romaji
      };
    } catch (error) {
      console.error('Error processing lyrics:', error);
      return {
        original: lyrics,
        hiragana: lyrics,
        romaji: lyrics
      };
    }
  }

  /**
   * Add furigana (hiragana readings) above kanji
   * @param {string} text - Text with kanji
   * @returns {Promise<string>} - HTML with furigana
   */
  async addFurigana(text) {
    if (!this.initialized) await this.initialize();

    try {
      // This is a simplified furigana implementation
      // For production, you might want to use a more sophisticated approach
      const hiragana = await this.toHiragana(text);
      
      // Simple approach: return both kanji and hiragana
      // In a real implementation, you'd want to map each kanji to its reading
      return {
        kanji: text,
        hiragana: hiragana,
        combined: `${text} (${hiragana})`
      };
    } catch (error) {
      console.error('Error adding furigana:', error);
      return {
        kanji: text,
        hiragana: text,
        combined: text
      };
    }
  }

  /**
   * Check if text contains Japanese characters
   * @param {string} text - Input text
   * @returns {boolean} - True if text contains Japanese characters
   */
  containsJapanese(text) {
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japaneseRegex.test(text);
  }

  /**
   * Extract reading patterns for better search
   * @param {string} text - Input text
   * @returns {Promise<Object>} - Object with various reading patterns
   */
  async extractReadings(text) {
    if (!this.initialized) await this.initialize();

    try {
      const [hiragana, romaji, katakana] = await Promise.all([
        this.toHiragana(text),
        this.toRomaji(text),
        this.toKatakana(text)
      ]);

      return {
        original: text,
        hiragana,
        romaji,
        katakana,
        readings: [text, hiragana, romaji, katakana].filter((reading, index, arr) => 
          arr.indexOf(reading) === index
        )
      };
    } catch (error) {
      console.error('Error extracting readings:', error);
      return {
        original: text,
        hiragana: text,
        romaji: text,
        katakana: text,
        readings: [text]
      };
    }
  }
}

// Create singleton instance
const japaneseProcessor = new JapaneseTextProcessor();

module.exports = japaneseProcessor;
