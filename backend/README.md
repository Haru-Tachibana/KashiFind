# KashiFind Backend (Java Spring Boot)

## Overview

This is the Java Spring Boot backend for KashiFind - a music, lyrics, and MV search application.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data MongoDB**
- **Maven**
- **MongoDB**
- **Kuromoji** (Japanese text processing)

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/kashifind/
│   │   │   ├── controller/     # REST controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # MongoDB repositories
│   │   │   ├── model/           # Data models
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── config/          # Configuration classes
│   │   │   └── util/            # Utility classes
│   │   └── resources/
│   │       └── application.yml   # Application configuration
│   └── test/                    # Test files
├── pom.xml                      # Maven dependencies
└── Dockerfile                   # Docker configuration
```

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Songs
- `GET /api/songs` - Get all songs (with pagination and filtering)
- `GET /api/songs/{id}` - Get song by ID
- `POST /api/songs` - Create a new song
- `PUT /api/songs/{id}` - Update a song
- `DELETE /api/songs/{id}` - Delete a song

### Search
- `GET /api/search?q={query}` - Search songs
- `GET /api/search/suggestions?q={query}` - Get search suggestions
- `GET /api/search/genres` - Get available genres
- `GET /api/search/years` - Get available years

### Lyrics
- `GET /api/lyrics/{id}?format={original|hiragana|romaji}` - Get lyrics in specific format
- `POST /api/lyrics/process` - Process text to generate hiragana and romaji
- `POST /api/lyrics/furigana` - Generate furigana for text

## Configuration

Configuration is managed via `application.yml` and environment variables:

- `SPRING_DATA_MONGODB_URI` - MongoDB connection string
- `APP_FRONTEND_URL` - Frontend URL for CORS
- `APP_JWT_SECRET` - JWT secret key
- `APP_EXTERNAL_APIS_*` - External API keys

## Building

```bash
# Build with Maven
mvn clean package

# Run locally
mvn spring-boot:run
```

## Docker

```bash
# Build Docker image
docker build -t kashifind-backend .

# Run container
docker run -p 3001:3001 kashifind-backend
```

## Development

### Prerequisites
- Java 17+
- Maven 3.6+
- MongoDB (local or remote)

### Running Locally

1. Start MongoDB
2. Update `application.yml` with your MongoDB URI
3. Run: `mvn spring-boot:run`

### Testing

```bash
mvn test
```

## Migration from Node.js

The backend has been migrated from Node.js/Express to Java/Spring Boot. Key changes:

- Routes → Controllers
- Mongoose models → Spring Data MongoDB entities
- Express middleware → Spring configuration
- Node utilities → Java services

The API endpoints remain compatible with the frontend.

