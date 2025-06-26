# AutoNews.AI - AI-Powered News & NFT Platform

## Overview

AutoNews.AI is a modern web application that combines AI-powered news analysis with NFT creation and trading capabilities. The platform aggregates news from various sources, analyzes content using advanced AI models, and allows users to create and trade NFTs based on news articles. Built with a full-stack TypeScript architecture, it features real-time analytics, sentiment analysis, fact-checking, and a comprehensive NFT marketplace.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Replit Auth integration with session-based authentication

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: Anthropic Claude API for content analysis
- **Authentication**: OpenID Connect (OIDC) with Replit Auth

### Database Design
The application uses a comprehensive PostgreSQL schema with the following key entities:
- **Users**: Authentication and profile management
- **Articles**: News content with AI analysis metadata
- **NFTs**: Blockchain-based digital assets linked to articles
- **News Sources**: RSS feed management and categorization
- **Transactions**: NFT trading and ownership history
- **Analytics**: System metrics and user engagement tracking

## Key Components

### AI Service Layer
- **Content Analysis**: Sentiment analysis, fact-checking, and trending score calculation
- **NFT Generation**: Automated metadata creation for news-based NFTs
- **Model**: Uses OpenAI GPT-4o for advanced AI capabilities (migrated from Claude per user preference)
- **Metrics**: Real-time performance and accuracy tracking

### News Aggregation System
- **RSS Integration**: Automated news collection from multiple sources
- **Content Processing**: Article parsing, categorization, and deduplication
- **Scheduling**: 15-minute intervals for news collection
- **Categories**: AI & Technology, Finance & Crypto, Startups, Science, Business, Health

### NFT Marketplace
- **Creation**: AI-powered NFT generation from news articles
- **Trading**: Buy/sell functionality with price management
- **Ownership**: User portfolio tracking and transaction history
- **Metadata**: Rich metadata generation including AI analysis scores

### Analytics Dashboard
- **Real-time Metrics**: System performance and user engagement
- **Content Analytics**: Article performance, sentiment trends, and fact-check scores
- **User Analytics**: Favorites, NFT portfolios, and trading activity
- **System Health**: API response times, cache hit rates, and model accuracy

## Data Flow

### News Processing Pipeline
1. RSS feeds are collected from configured news sources
2. Articles are parsed and stored in the database
3. AI analysis is performed (sentiment, fact-checking, trending score)
4. Results are cached and made available via API endpoints
5. Users can view analyzed articles and create NFTs

### NFT Creation Flow
1. User selects an article for NFT creation
2. AI generates metadata based on article content and analysis
3. NFT is minted and stored in the database
4. Transaction is recorded and user ownership is established
5. NFT becomes available in the marketplace

### Authentication Flow
1. User initiates login via Replit Auth
2. OIDC flow authenticates user with Replit services
3. User session is created and stored in PostgreSQL
4. Protected routes verify authentication via session middleware
5. User data is synchronized and profile is updated

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL for serverless database hosting
- **AI Provider**: OpenAI GPT-4o API for content analysis
- **Authentication**: Replit Auth for user management
- **UI Components**: Radix UI primitives via shadcn/ui

### Development Tools
- **Type Safety**: TypeScript for both frontend and backend
- **Database Management**: Drizzle ORM with migrations
- **Build Tools**: Vite for frontend, esbuild for backend
- **CSS Processing**: Tailwind CSS with PostCSS

### Runtime Environment
- **Platform**: Replit with Node.js 20
- **Modules**: PostgreSQL 16, Web server capabilities
- **Session Storage**: PostgreSQL-based session management
- **File Handling**: Static asset serving and build output management

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reloading**: Vite HMR for frontend, tsx for backend auto-restart
- **Database**: Local PostgreSQL connection via environment variables
- **Port Configuration**: Frontend on port 5000, backend as middleware

### Production Deployment
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Output Structure**: `dist/public` for frontend assets, `dist/index.js` for server
- **Deployment Target**: Replit autoscale deployment
- **Environment**: Production mode with optimized builds and caching

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL table for session persistence
- **Schema**: Shared schema definitions between frontend and backend

## Changelog

- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.