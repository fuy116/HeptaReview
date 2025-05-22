# Spaced Repetition Flashcard Application

## Overview

This application is a spaced repetition flashcard system that helps users study and retain information more effectively. It follows the principles of spaced repetition learning, where cards are reviewed at increasing intervals as users demonstrate familiarity with the content.

The application is built with a modern React frontend and an Express backend, using Drizzle ORM for database interactions, and features a clean, responsive UI with shadcn/ui components. The application stores flashcards, tracks review history, and schedules future reviews based on the user's self-reported familiarity with each card.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with a clear separation of concerns:

1. **Frontend**: React-based single-page application (SPA) with TailwindCSS for styling
2. **Backend**: Express.js server handling API requests
3. **Database**: PostgreSQL database (via Drizzle ORM) for storing flashcards, reviews, and subjects
4. **Communication**: REST API endpoints for data exchange between client and server
5. **State Management**: React Query for server state management, React hooks for local state

The system is built with TypeScript throughout for type safety and better developer experience. The project structure follows a modular approach with clear separation between client and server code.

## Key Components

### Frontend

1. **Pages**:
   - Dashboard: Overview of study statistics and cards due for review
   - CardManagement: Interface for creating, viewing, and managing flashcards
   - SubjectManagement: Interface for organizing cards by subject

2. **Components**:
   - UI Components: Based on shadcn/ui library (Button, Card, Dialog, etc.)
   - AddCardModal: Modal for creating new flashcards
   - ReviewCardModal: Interface for reviewing cards and recording familiarity
   - StatisticsCards: Visual display of study statistics
   - SubjectDistribution & FamiliarityDistribution: Charts showing card distribution

3. **Utilities**:
   - spaced-repetition.ts: Core algorithm for calculating review intervals
   - queryClient.ts: React Query configuration for API communication

### Backend

1. **API Routes**:
   - /api/cards: CRUD operations for flashcards
   - /api/reviews: Logging reviews and scheduling future reviews
   - /api/subjects: Managing card categories
   - /api/stats: Retrieving statistics for the dashboard

2. **Data Layer**:
   - Drizzle ORM for database interactions
   - Schema definitions for cards, reviews, and subjects

3. **Server Configuration**:
   - Express middleware setup
   - Vite integration for development

## Data Flow

1. **Card Creation**:
   - User creates a new card via the UI
   - Frontend sends data to the server via POST to /api/cards
   - Server validates and stores card in the database
   - UI is updated to reflect the new card

2. **Review Process**:
   - Dashboard displays cards due for review
   - User reviews a card and selects familiarity level
   - System calculates next review date using the spaced repetition algorithm
   - Review is recorded and next review is scheduled

3. **Statistics Generation**:
   - Server aggregates data from cards and reviews tables
   - Dashboard displays metrics like review completion rate, subject distribution, etc.

## External Dependencies

### Frontend
- React for UI components
- Wouter for routing
- React Query for data fetching and cache management
- shadcn/ui and Radix UI for component library
- TailwindCSS for styling
- date-fns for date manipulation

### Backend
- Express for the web server
- Drizzle ORM for database operations
- Zod for schema validation
- Vite for development and production builds

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Client: Vite builds the React frontend to static assets
   - Server: esbuild compiles the TypeScript server code

2. **Production Setup**:
   - Static assets are served by the Express server
   - API endpoints handle data operations
   - Database connection is established via environment variables

3. **Environment Configuration**:
   - DATABASE_URL for database connection
   - NODE_ENV to distinguish between development and production

The deployment uses Replit's autoscale feature and correctly sets up the HTTP port (5000 internal, 80 external).

## Database Schema

The application uses three main tables:

1. **cards**: Stores flashcard content with fields:
   - id (primary key)
   - cardName
   - subject
   - note
   - createdAt

2. **reviews**: Tracks review history and scheduling:
   - id (primary key)
   - cardId (reference to cards)
   - reviewDate
   - familiarityScore
   - interval
   - nextReviewDate

3. **subjects**: Organizes cards by topic:
   - id (primary key)
   - name (unique)

The schema is defined using Drizzle ORM with Zod for validation.