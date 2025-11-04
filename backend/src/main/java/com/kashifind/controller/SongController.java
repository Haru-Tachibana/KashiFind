package com.kashifind.controller;

import com.kashifind.dto.ApiResponse;
import com.kashifind.service.ExternalAPIsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    
    private final ExternalAPIsService externalAPIsService;
    
    public SongController(ExternalAPIsService externalAPIsService) {
        this.externalAPIsService = externalAPIsService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSongById(@PathVariable String id) {
        try {
            // Try to get from Spotify if it's a Spotify ID
            Map<String, Object> songDetails = externalAPIsService.getSpotifyTrackDetails(id);
            if (songDetails != null && !songDetails.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(songDetails));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Song not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch song", e.getMessage()));
        }
    }
    
    @GetMapping("/external/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExternalSong(@PathVariable String id) {
        try {
            Map<String, Object> songDetails = externalAPIsService.getSpotifyTrackDetails(id);
            if (songDetails != null && !songDetails.isEmpty()) {
                // Try to get lyrics from Spotify and other sources
                String title = String.valueOf(songDetails.getOrDefault("title", ""));
                String artist = String.valueOf(songDetails.getOrDefault("artist", ""));
                Map<String, String> lyrics = externalAPIsService.getLyrics(title, artist, id);
                
                if (lyrics != null && !lyrics.isEmpty()) {
                    songDetails.put("lyrics", lyrics);
                }
                songDetails.put("source", "spotify");
                songDetails.put("externalId", id);
                
                return ResponseEntity.ok(ApiResponse.success(songDetails));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("External song not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch external song", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/youtube")
    public ResponseEntity<ApiResponse<Object>> getYouTubeVideos(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist) {
        
        if (title == null || artist == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Title and artist are required"));
        }
        
        try {
            List<Map<String, Object>> videos = externalAPIsService.searchYouTube(
                title + " " + artist, 5
            );
            return ResponseEntity.ok(ApiResponse.success(videos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch YouTube videos", e.getMessage()));
        }
    }
}
