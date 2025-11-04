package com.kashifind.controller;

import com.kashifind.dto.ApiResponse;
import com.kashifind.dto.PaginationResponse;
import com.kashifind.service.ExternalAPIsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    private final ExternalAPIsService externalAPIsService;
    
    public SearchController(ExternalAPIsService externalAPIsService) {
        this.externalAPIsService = externalAPIsService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            // Calculate pagination
            int offset = (page - 1) * limit;
            int endOffset = offset + limit;
            
            // Search external APIs
            List<Map<String, Object>> allResults = externalAPIsService.searchMultipleSources(q, 500);
            
            // Apply pagination
            int total = allResults.size();
            List<Map<String, Object>> paginatedResults = allResults.subList(
                Math.min(offset, total), 
                Math.min(endOffset, total)
            );
            
            PaginationResponse pagination = new PaginationResponse(
                page, limit, total, (int) Math.ceil((double) total / limit)
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("external", paginatedResults);
            data.put("database", List.of()); // Empty database results
            data.put("total", total);
            data.put("pagination", pagination);
            data.put("query", q);
            
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Search failed", e.getMessage()));
        }
    }
    
    @GetMapping("/realtime")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchRealtime(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            // Calculate pagination
            int offset = (page - 1) * limit;
            int endOffset = offset + limit;
            
            // Fetch enough results to cover the requested page
            // Fetch at least (page * limit) results, up to a reasonable maximum (1000)
            int resultsToFetch = Math.min((page * limit) + limit, 1000);
            
            // Search external APIs - fetch enough to cover pagination
            List<Map<String, Object>> allResults = externalAPIsService.searchMultipleSources(q, resultsToFetch);
            
            // Apply pagination
            int total = allResults.size();
            int startIndex = Math.min(offset, total);
            int endIndex = Math.min(endOffset, total);
            
            List<Map<String, Object>> paginatedResults = new ArrayList<>();
            if (startIndex < total) {
                paginatedResults = allResults.subList(startIndex, endIndex);
            }
            
            // Calculate total pages - if we got less than requested, we might have more
            // For now, assume we got all available results if we got fewer than requested
            int totalPages = (int) Math.ceil((double) total / limit);
            
            PaginationResponse pagination = new PaginationResponse(
                page, limit, total, totalPages
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("external", paginatedResults);
            data.put("database", List.of());
            data.put("total", total);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("pagination", pagination);
            response.put("query", q);
            response.put("timestamp", java.time.Instant.now().toString());
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Real-time search failed", e.getMessage()));
        }
    }
    
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getSuggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        try {
            List<Map<String, Object>> results = externalAPIsService.searchMultipleSources(q.trim(), limit);
            List<Map<String, String>> suggestions = results.stream()
                .map(result -> {
                    Map<String, String> suggestion = new HashMap<>();
                    suggestion.put("title", String.valueOf(result.getOrDefault("title", "")));
                    suggestion.put("artist", String.valueOf(result.getOrDefault("artist", "")));
                    return suggestion;
                })
                .toList();
            
            return ResponseEntity.ok(ApiResponse.success(suggestions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch suggestions", e.getMessage()));
        }
    }
    
    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<String>>> getGenres() {
        // Return empty list since we don't have a database
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
    
    @GetMapping("/years")
    public ResponseEntity<ApiResponse<List<Integer>>> getYears() {
        // Return empty list since we don't have a database
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
}
