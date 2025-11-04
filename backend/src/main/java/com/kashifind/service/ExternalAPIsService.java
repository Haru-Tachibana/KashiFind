package com.kashifind.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExternalAPIsService {
    
    @Value("${app.external-apis.spotify.client-id:}")
    private String spotifyClientId;
    
    @Value("${app.external-apis.spotify.client-secret:}")
    private String spotifyClientSecret;
    
    @Value("${app.external-apis.youtube.api-key:}")
    private String youtubeApiKey;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private String spotifyAccessToken;
    private long spotifyTokenExpiry = 0;
    
    public ExternalAPIsService() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }
    
    // ========== Spotify API ==========
    
    private String getSpotifyToken() {
        if (spotifyAccessToken != null && System.currentTimeMillis() < spotifyTokenExpiry) {
            return spotifyAccessToken;
        }
        
        if (spotifyClientId == null || spotifyClientId.isEmpty() || 
            spotifyClientSecret == null || spotifyClientSecret.isEmpty()) {
            return null;
        }
        
        try {
            String credentials = Base64.getEncoder().encodeToString(
                (spotifyClientId + ":" + spotifyClientSecret).getBytes()
            );
            
            String response = webClient.post()
                .uri("https://accounts.spotify.com/api/token")
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue("grant_type=client_credentials")
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode json = objectMapper.readTree(response);
                spotifyAccessToken = json.get("access_token").asText();
                int expiresIn = json.get("expires_in").asInt();
                spotifyTokenExpiry = System.currentTimeMillis() + (expiresIn - 60) * 1000; // 60s buffer
                return spotifyAccessToken;
            }
        } catch (Exception e) {
            System.err.println("Failed to get Spotify token: " + e.getMessage());
        }
        return null;
    }
    
    public List<Map<String, Object>> searchSpotify(String query, int limit) {
        if (spotifyClientId == null || spotifyClientId.isEmpty()) {
            return new ArrayList<>();
        }
        
        String token = getSpotifyToken();
        if (token == null) {
            return new ArrayList<>();
        }
        
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format("https://api.spotify.com/v1/search?q=%s&type=track&limit=%d", 
                encodedQuery, Math.min(limit, 50));
            
            String response = webClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode json = objectMapper.readTree(response);
                JsonNode tracks = json.get("tracks").get("items");
                
                List<Map<String, Object>> results = new ArrayList<>();
                for (JsonNode track : tracks) {
                    Map<String, Object> song = new HashMap<>();
                    song.put("id", track.get("id").asText());
                    song.put("title", track.get("name").asText());
                    song.put("artist", track.get("artists").get(0).get("name").asText());
                    song.put("album", track.get("album").get("name").asText());
                    song.put("duration", track.get("duration_ms").asInt() / 1000);
                    song.put("previewUrl", track.has("preview_url") ? track.get("preview_url").asText() : null);
                    song.put("imageUrl", track.get("album").get("images").get(0).get("url").asText());
                    song.put("externalUrl", track.get("external_urls").get("spotify").asText());
                    song.put("source", "spotify");
                    results.add(song);
                }
                return results;
            }
        } catch (Exception e) {
            System.err.println("Spotify search error: " + e.getMessage());
        }
        return new ArrayList<>();
    }
    
    public Map<String, Object> getSpotifyTrackDetails(String trackId) {
        String token = getSpotifyToken();
        if (token == null) {
            return new HashMap<>();
        }
        
        try {
            String response = webClient.get()
                .uri("https://api.spotify.com/v1/tracks/" + trackId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode track = objectMapper.readTree(response);
                Map<String, Object> song = new HashMap<>();
                song.put("id", track.get("id").asText());
                song.put("title", track.get("name").asText());
                song.put("artist", track.get("artists").get(0).get("name").asText());
                song.put("album", track.get("album").get("name").asText());
                song.put("year", track.get("album").get("release_date").asText().split("-")[0]);
                song.put("duration", track.get("duration_ms").asInt() / 1000);
                song.put("previewUrl", track.has("preview_url") ? track.get("preview_url").asText() : null);
                song.put("imageUrl", track.get("album").get("images").get(0).get("url").asText());
                song.put("externalUrl", track.get("external_urls").get("spotify").asText());
                return song;
            }
        } catch (Exception e) {
            System.err.println("Spotify track details error: " + e.getMessage());
        }
        return new HashMap<>();
    }
    
    // ========== YouTube API ==========
    
    public List<Map<String, Object>> searchYouTube(String query, int limit) {
        if (youtubeApiKey == null || youtubeApiKey.isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(
                "https://www.googleapis.com/youtube/v3/search?part=snippet&q=%s&type=video&maxResults=%d&key=%s",
                encodedQuery, Math.min(limit, 50), youtubeApiKey
            );
            
            String response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode json = objectMapper.readTree(response);
                JsonNode items = json.get("items");
                
                List<Map<String, Object>> results = new ArrayList<>();
                for (JsonNode item : items) {
                    Map<String, Object> video = new HashMap<>();
                    JsonNode snippet = item.get("snippet");
                    video.put("id", item.get("id").get("videoId").asText());
                    video.put("title", snippet.get("title").asText());
                    video.put("channelTitle", snippet.get("channelTitle").asText());
                    video.put("thumbnail", snippet.get("thumbnails").get("medium").get("url").asText());
                    video.put("publishedAt", snippet.get("publishedAt").asText());
                    video.put("url", "https://www.youtube.com/watch?v=" + item.get("id").get("videoId").asText());
                    video.put("source", "youtube");
                    results.add(video);
                }
                return results;
            }
        } catch (Exception e) {
            System.err.println("YouTube search error: " + e.getMessage());
        }
        return new ArrayList<>();
    }
    
    // ========== Lyrics APIs ==========
    
    public Map<String, String> getLyrics(String songTitle, String artist, String spotifyTrackId) {
        // Try Spotify Lyrics API first (if track ID provided)
        if (spotifyTrackId != null && !spotifyTrackId.isEmpty()) {
            try {
                String token = getSpotifyToken();
                if (token != null) {
                    // Try Spotify's lyrics endpoint (available in some regions)
                    // Note: This endpoint may not be publicly available in all regions
                    String lyricsUrl = String.format("https://spclient.wg.spotify.com/lyrics/v1/track/%s", spotifyTrackId);
                    
                    try {
                        String response = webClient.get()
                            .uri(lyricsUrl)
                            .header("Authorization", "Bearer " + token)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();
                        
                        if (response != null) {
                            JsonNode json = objectMapper.readTree(response);
                            if (json.has("lyrics")) {
                                Map<String, String> result = new HashMap<>();
                                result.put("original", json.get("lyrics").asText());
                                result.put("source", "spotify");
                                return result;
                            }
                        }
                    } catch (Exception e) {
                        // Spotify lyrics endpoint may not be available, try alternative
                    }
                }
            } catch (Exception e) {
                // Continue to next source
            }
        }
        
        // Try lyrics.ovh (free, no API key needed)
        try {
            String url = String.format("https://api.lyrics.ovh/v1/%s/%s", 
                encodeURIComponent(artist), encodeURIComponent(songTitle));
            
            String response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode json = objectMapper.readTree(response);
                if (json.has("lyrics") && !json.get("lyrics").asText().isEmpty()) {
                    Map<String, String> result = new HashMap<>();
                    result.put("original", json.get("lyrics").asText());
                    result.put("source", "lyrics.ovh");
                    return result;
                }
            }
        } catch (Exception e) {
            // Continue to next source
        }
        
        return new HashMap<>();
    }
    
    // Overload for backward compatibility
    public Map<String, String> getLyrics(String songTitle, String artist) {
        return getLyrics(songTitle, artist, null);
    }
    
    // ========== Combined Search ==========
    
    public List<Map<String, Object>> searchMultipleSources(String query, int limit) {
        List<Map<String, Object>> allResults = new ArrayList<>();
        
        // Search Spotify
        List<Map<String, Object>> spotifyResults = searchSpotify(query, limit);
        allResults.addAll(spotifyResults);
        
        // Search YouTube
        List<Map<String, Object>> youtubeResults = searchYouTube(query, limit);
        allResults.addAll(youtubeResults);
        
        // Remove duplicates based on title and artist
        return allResults.stream()
            .collect(Collectors.toMap(
                song -> song.get("title") + "|" + song.get("artist"),
                song -> song,
                (existing, replacement) -> existing
            ))
            .values()
            .stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    private String encodeURIComponent(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
