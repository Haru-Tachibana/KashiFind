#!/usr/bin/env python3
"""
Lyrics Service using lyricsgenius
A Python service to fetch lyrics from Genius API
"""

import sys
import json
import os
from lyricsgenius import Genius

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python lyrics_service.py 'song_title' 'artist_name'"}))
        sys.exit(1)
    
    song_title = sys.argv[1]
    artist_name = sys.argv[2]
    
    try:
        # Get Genius API token from environment variable
        genius_token = os.getenv('GENIUS_ACCESS_TOKEN')
        
        if not genius_token:
            print(json.dumps({"error": "GENIUS_ACCESS_TOKEN environment variable not set"}))
            sys.exit(1)
        
        # Initialize Genius client
        genius = Genius(genius_token)
        genius.verbose = False  # Turn off status messages
        genius.remove_section_headers = True  # Remove [Chorus] etc.
        genius.skip_non_songs = False  # Include all hits
        genius.timeout = 30  # Increase timeout to 30 seconds
        
        # Search for the song
        song = genius.search_song(song_title, artist_name)
        
        if song and song.lyrics:
            # Clean up the lyrics
            lyrics = song.lyrics.strip()
            
            # Remove common unwanted text
            unwanted_phrases = [
                "You might also like",
                "Embed",
                "Genius is the world",
                "About Genius",
                "Press",
                "Advertise",
                "Event Space",
                "Privacy Policy",
                "Terms of Service",
                "Community Guidelines",
                "Copyright Policy",
                "Language: English",
                "Don't have an account?",
                "Sign Up",
                "Sign In"
            ]
            
            for phrase in unwanted_phrases:
                lyrics = lyrics.replace(phrase, "")
            
            # Clean up extra whitespace
            lyrics = "\n".join(line.strip() for line in lyrics.split("\n") if line.strip())
            
            result = {
                "success": True,
                "lyrics": lyrics,
                "source": "genius",
                "song_title": song.title,
                "artist_name": song.artist
            }
            
            print(json.dumps(result))
        else:
            print(json.dumps({"success": False, "error": "No lyrics found"}))
            
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
