# SmileCare Dental Application

## Overview

This is a comprehensive dental practice management system built with a modern full-stack architecture. The application provides patient portal functionality, appointment booking, team management, educational resources, and an AI-powered chatbot for patient inquiries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful APIs with JSON responses

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: Neon serverless connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **User Roles**: Patient and admin role-based access control
- **Security**: HTTP-only cookies with secure settings for production

### Patient Portal Features
- **Appointment Booking**: Interactive calendar with real-time availability
- **Appointment Management**: View, track, and manage appointments
- **Profile Management**: User profile with Replit integration
- **Resource Access**: Educational materials and dental care information

### Admin Panel
- **Team Management**: CRUD operations for dental team members
- **Resource Management**: Upload and manage educational content
- **Appointment Oversight**: View and manage all patient appointments
- **Content Administration**: Manage chatbot responses and FAQs

### AI Chatbot
- **Functionality**: Keyword-based response system for common dental questions
- **Integration**: Real-time chat interface with persistent conversation
- **Management**: Admin-configurable responses and knowledge base

### UI/UX Components
- **Design System**: Shadcn/ui with custom medical/dental theming
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure WCAG compliance
- **Theming**: CSS variables for light/dark mode support

## Data Flow

### Authentication Flow
1. User attempts to access protected route
2. System checks for valid session cookie
3. If unauthorized, redirects to Replit Auth login
4. Upon successful authentication, creates/updates user record
5. Establishes secure session with PostgreSQL storage

### Appointment Booking Flow
1. Patient selects date from interactive calendar
2. System fetches available time slots from database
3. Patient completes appointment form with treatment details
4. Backend validates and stores appointment with pending status
5. Admin can review and confirm appointments

### Content Management Flow
1. Admin accesses management panels
2. CRUD operations update database records
3. Changes immediately reflect in patient-facing views
4. File uploads handled through configured storage system

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and schema management
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI primitive components
- **wouter**: Lightweight client-side routing
- **openid-client**: OpenID Connect authentication

### Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Type safety and developer experience
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Authentication Integration
- **Replit Auth**: Primary authentication provider
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with environment-based connection strings
- **Authentication**: Replit Auth with development-specific configuration

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: ESBuild compilation to single JavaScript bundle
- **Static Assets**: Served through Express with proper caching headers
- **Environment**: Node.js production server with process management

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit environment identifier for auth
- **NODE_ENV**: Environment mode (development/production)

### Database Management
- **Migrations**: Drizzle Kit for schema changes and versioning
- **Seeding**: Initial data population through storage layer
- **Backup**: Automated through Neon Database platform
- **Scaling**: Serverless connection pooling for high availability

The application follows modern web development best practices with a focus on type safety, developer experience, and user security. The modular architecture allows for easy maintenance and feature expansion while maintaining performance and reliability.