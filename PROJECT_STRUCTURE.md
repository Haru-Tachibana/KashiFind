# KashiFind Project Structure

## Overview

KashiFind is a music, lyrics, and MV search application with a clean separation between frontend and backend.

## Directory Structure

```
KashiFind/
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/       # Java source code
│   │       └── resources/  # Configuration files
│   ├── pom.xml            # Maven dependencies
│   └── Dockerfile         # Backend Docker image
│
├── frontend/              # React frontend
│   ├── src/              # React source code
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Frontend Docker image
│
├── docker-compose.yml     # Docker orchestration
└── README.md             # Main project documentation
```

## Backend (Java Spring Boot)

**Location**: `backend/`

- **Language**: Java 17
- **Framework**: Spring Boot 3.2.0
- **Database**: MongoDB
- **Build Tool**: Maven
- **Port**: 3001

### Key Components

- **Controllers**: REST API endpoints (`/api/*`)
- **Services**: Business logic and external API integration
- **Repositories**: MongoDB data access
- **Models**: Domain entities (Song, etc.)
- **DTOs**: Data Transfer Objects for API responses

## Frontend (React)

**Location**: `frontend/`

- **Language**: JavaScript/React
- **Build Tool**: npm/yarn
- **Port**: 3000 (development), 80 (production via Nginx)

### Key Components

- **Pages**: Route components
- **Components**: Reusable UI components
- **Utils**: API client and utilities
- **Hooks**: Custom React hooks

## Database

**MongoDB** - Document database

- **Collection**: `songs`
- **Port**: 27017

## Docker Setup

All services are containerized:

1. **MongoDB Container**: Database service
2. **Backend Container**: Java Spring Boot API
3. **Frontend Container**: React app served via Nginx

## Running the Project

### With Docker (Recommended)

```bash
docker-compose up -d
```

### Local Development

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## Migration Notes

The project has been restructured from a monolithic Node.js application to:

- **Separated frontend and backend**
- **Backend migrated from Node.js to Java**
- **Dockerized all services**
- **Clean project structure**

Old Node.js files are preserved in the root directory for reference but are no longer used.

