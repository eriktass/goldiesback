# GitHub Repository Explorer

## Overview

A comprehensive multi-platform GitHub repository management and analytics tool with support for desktop web, mobile web, Android clients, and Chromebook optimization. Features dual backend architecture (Node.js/Express and Python Flask), complete type safety, responsive design, and comprehensive GitHub API integration. The application provides advanced search, analytics, file browsing, repository comparison, and cross-platform compatibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for build tooling
- **Routing**: wouter for client-side routing 
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build System**: Vite with hot module replacement in development

### Backend Architecture
- **Primary Backend**: Node.js with Express.js framework and TypeScript
- **Alternative Backend**: Python Flask with SQLAlchemy ORM and Flask-Migrate
- **API Design**: RESTful APIs with comprehensive GitHub API integration
- **Error Handling**: Global error middleware with structured error responses
- **Logging**: Custom request/response logging middleware
- **Development**: Hot reload using tsx (Node.js) and Flask debug mode (Python)
- **Database Support**: Both Drizzle ORM (Node.js) and SQLAlchemy (Flask)

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for database connectivity
- **Storage Pattern**: Repository and SearchResult entities with typed schemas
- **Validation**: Zod schemas for runtime type validation

### External Dependencies
- **GitHub API**: Direct integration with GitHub REST API v3
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Token-based GitHub API authentication
- **Rate Limiting**: GitHub API rate limit handling
- **Icons**: Lucide React icons and react-icons for technology-specific icons
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: Replit integration with cartographer plugin and error overlay

### Platform Support
- **Desktop Web**: Full React application with comprehensive features
- **Mobile Web**: Responsive interface optimized for mobile browsers and Chromebooks
- **Android Client**: Native WebView wrapper with pull-to-refresh and deep links
- **Chromebook**: Touch and keyboard optimized interface for tablet mode
- **PWA**: Progressive Web App capabilities with offline support

### Key Design Patterns
- **Multi-Platform Architecture**: Dual backend support (Node.js/Flask) with platform-specific optimizations
- **Monorepo Structure**: Shared schema and types between client/server
- **Component Composition**: Highly reusable UI components with consistent API
- **Query Optimization**: Intelligent caching and stale-while-revalidate patterns
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes
- **Type Safety**: End-to-end type safety from database to UI components
- **Cross-Platform Compatibility**: Consistent experience across web, mobile, and native platforms