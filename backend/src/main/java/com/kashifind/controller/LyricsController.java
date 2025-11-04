package com.kashifind.controller;

import com.kashifind.dto.ApiResponse;
import com.kashifind.service.JapaneseTextProcessor;
import com.kashifind.service.ExternalAPIsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lyrics")
public class LyricsController {
    
    private final JapaneseTextProcessor japaneseProcessor;
    private final ExternalAPIsService externalAPIsService;
    
    public LyricsController(JapaneseTextProcessor japaneseProcessor, ExternalAPIsService externalAPIsService) {
        this.japaneseProcessor = japaneseProcessor;
        this.externalAPIsService = externalAPIsService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLyrics(
            @PathVariable String id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist,
            @RequestParam(defaultValue = "original") String format,
            @RequestParam(defaultValue = "false") boolean showFurigana,
            @RequestParam(defaultValue = "false") boolean showRomaji) {
        
        if (!List.of("original", "hiragana", "romaji").contains(format)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid format. Must be one of: original, hiragana, romaji"));
        }
        
        if (title == null || artist == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Title and artist are required"));
        }
        
        try {
            // Get lyrics from external API
            Map<String, String> lyricsData = externalAPIsService.getLyrics(title, artist);
            
            if (lyricsData == null || lyricsData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Lyrics not found"));
            }
            
            String originalLyrics = lyricsData.get("original");
            if (originalLyrics == null || originalLyrics.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Lyrics not found"));
            }
            
            // Process lyrics if needed
            Map<String, Object> result = new HashMap<>();
            result.put(format, originalLyrics);
            
            if (showFurigana || format.equals("hiragana")) {
                var processed = japaneseProcessor.processLyrics(originalLyrics);
                result.put("hiragana", processed.hiragana());
            }
            
            if (showRomaji || format.equals("romaji")) {
                var processed = japaneseProcessor.processLyrics(originalLyrics);
                result.put("romaji", processed.romaji());
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("songId", id);
            data.put("title", title);
            data.put("artist", artist);
            data.put("lyrics", result);
            
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch lyrics", e.getMessage()));
        }
    }
    
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<JapaneseTextProcessor.ProcessedLyrics>> processText(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Text is required and must be a string"));
        }
        
        try {
            var processed = japaneseProcessor.processLyrics(text);
            return ResponseEntity.ok(ApiResponse.success(processed));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to process text", e.getMessage()));
        }
    }
    
    @PostMapping("/furigana")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateFurigana(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Text is required and must be a string"));
        }
        
        try {
            String furigana = japaneseProcessor.addFurigana(text);
            return ResponseEntity.ok(ApiResponse.success(Map.of("furigana", furigana)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate furigana", e.getMessage()));
        }
    }
}
