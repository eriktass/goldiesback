# GitHub Repository Explorer

## Overview

A full-stack web application for exploring GitHub repositories with advanced search, analytics, and repository browsing capabilities. Built using React with TypeScript on the frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. The application provides features like repository search, detailed repository analysis, file browsing, language analytics, and repository comparison tools.

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
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with GitHub API integration
- **Error Handling**: Global error middleware with structured error responses
- **Logging**: Custom request/response logging middleware
- **Development**: Hot reload using tsx in development mode

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

### Key Design Patterns
- **Monorepo Structure**: Shared schema and types between client/server
- **Component Composition**: Highly reusable UI components with consistent API
- **Query Optimization**: Intelligent caching and stale-while-revalidate patterns
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Type Safety**: End-to-end type safety from database to UI components