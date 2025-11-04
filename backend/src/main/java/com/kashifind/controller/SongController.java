package com.kashifind.controller;

import com.kashifind.dto.ApiResponse;
import com.kashifind.service.ExternalAPIsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
            // ONLY use Spotify for song details - YouTube is only for video player
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
                .body(ApiResponse.error("Song not found in Spotify"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch song from Spotify", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/youtube")
    public ResponseEntity<ApiResponse<Object>> getYouTubeVideosPost(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return getYouTubeVideos(id, body.get("title"), body.get("artist"));
    }
    
    @GetMapping("/{id}/youtube")
    public ResponseEntity<ApiResponse<Object>> getYouTubeVideos(
            @PathVariable String id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist) {
        
        if (title == null || artist == null || title.isEmpty() || artist.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Title and artist are required"));
        }
        
        try {
            // Clean title and artist for better search results
            String cleanTitle = title != null ? title.trim() : "";
            String cleanArtist = artist != null ? artist.trim() : "";
            
            if (cleanTitle.isEmpty() || cleanArtist.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Title and artist cannot be empty"));
            }
            
            // Search for most relevant video - try multiple strategies
            List<Map<String, Object>> videos = null;
            
            // Search for most relevant video - always include both title and artist
            // This ensures we get the correct video for the specific artist's song
            
            // Strategy 1: Try artist + title + "official" (most relevant)
            videos = externalAPIsService.searchYouTube(
                cleanArtist + " " + cleanTitle + " official", 1
            );
            
            // Strategy 2: Try artist + title + "MV"
            if (videos == null || videos.isEmpty()) {
                videos = externalAPIsService.searchYouTube(
                    cleanArtist + " " + cleanTitle + " MV", 1
                );
            }
            
            // Strategy 3: Try artist + title (most reliable combination)
            if (videos == null || videos.isEmpty()) {
                videos = externalAPIsService.searchYouTube(
                    cleanArtist + " " + cleanTitle, 1
                );
            }
            
            // Strategy 4: Try title + artist (alternative order)
            if (videos == null || videos.isEmpty()) {
                videos = externalAPIsService.searchYouTube(
                    cleanTitle + " " + cleanArtist, 1
                );
            }
            
            // Strategy 5: Try title + artist + "official"
            if (videos == null || videos.isEmpty()) {
                videos = externalAPIsService.searchYouTube(
                    cleanTitle + " " + cleanArtist + " official", 1
                );
            }
            
            // Strategy 6: Last resort - try title only (but prefer to avoid this)
            if (videos == null || videos.isEmpty()) {
                videos = externalAPIsService.searchYouTube(cleanTitle, 1);
            }
            
            return ResponseEntity.ok(ApiResponse.success(videos != null ? videos : new ArrayList<>()));
        } catch (Exception e) {
            System.err.println("Error fetching YouTube videos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch YouTube videos", e.getMessage()));
        }
    }
}
