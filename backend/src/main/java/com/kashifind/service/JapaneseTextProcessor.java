package com.kashifind.service;

import com.atilika.kuromoji.ipadic.Token;
import com.atilika.kuromoji.ipadic.Tokenizer;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class JapaneseTextProcessor {
    
    private final Tokenizer tokenizer;
    private static final Pattern JAPANESE_PATTERN = Pattern.compile("[\\p{IsHiragana}\\p{IsKatakana}\\p{IsHan}]");
    
    public JapaneseTextProcessor() {
        this.tokenizer = new Tokenizer.Builder().build();
    }
    
    public boolean containsJapanese(String text) {
        return text != null && JAPANESE_PATTERN.matcher(text).find();
    }
    
    public ProcessedLyrics processLyrics(String text) {
        if (text == null || text.isEmpty()) {
            return new ProcessedLyrics("", "", "");
        }
        
        List<Token> tokens = tokenizer.tokenize(text);
        StringBuilder hiragana = new StringBuilder();
        StringBuilder romaji = new StringBuilder();
        
        for (Token token : tokens) {
            String reading = token.getReading();
            String surface = token.getSurface();
            
            if (reading != null && !reading.isEmpty()) {
                hiragana.append(reading);
                romaji.append(toRomaji(reading));
            } else {
                hiragana.append(surface);
                romaji.append(surface);
            }
        }
        
        return new ProcessedLyrics(text, hiragana.toString(), romaji.toString());
    }
    
    private String toRomaji(String hiragana) {
        // Basic romaji conversion - simplified version
        // For production, consider using a library like kuromoji-analyzer with romaji conversion
        Map<String, String> romajiMap = new HashMap<>();
        romajiMap.put("あ", "a"); romajiMap.put("い", "i"); romajiMap.put("う", "u");
        romajiMap.put("え", "e"); romajiMap.put("お", "o");
        // Add more mappings as needed
        
        StringBuilder result = new StringBuilder();
        for (char c : hiragana.toCharArray()) {
            result.append(romajiMap.getOrDefault(String.valueOf(c), String.valueOf(c)));
        }
        return result.toString();
    }
    
    public String addFurigana(String text) {
        // Simplified furigana addition
        // Returns text with furigana annotations
        return processLyrics(text).hiragana();
    }
    
    public record ProcessedLyrics(String original, String hiragana, String romaji) {}
}

