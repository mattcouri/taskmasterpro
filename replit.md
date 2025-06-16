# Daily Organizer - Replit Development Guide

## Overview

Daily Organizer is a comprehensive personal productivity application built with React, TypeScript, and Express.js. It provides users with tools to manage their daily schedules, tasks, passwords, goals, finances, and health metrics in a unified interface with a modern, gradient-themed design.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom pink/orange gradient theme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Drag & Drop**: @dnd-kit for interactive scheduling features
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful endpoints following conventional patterns
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite integration

### Build System
- **Development**: Vite for frontend bundling and hot reload
- **Production Build**: Vite for client, esbuild for server
- **TypeScript**: Shared types between client and server via `shared/` directory

## Key Components

### Application Modules
1. **Daily Planner** (`/`) - Main dashboard with drag-drop scheduling
2. **Calendar** (`/calendar`) - Meeting and appointment management
3. **Todo Lists** (`/tasks`) - Task management with projects and priorities
4. **Password Tracker** (`/passwords`) - Secure password storage
5. **Goals & Habits** (`/goals`) - Goal setting and habit tracking
6. **Finance Tracker** (`/finance`) - Financial management and budgeting
7. **Health Tracker** (`/health`) - Multi-dimensional health scoring

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: Basic user authentication and profiles
- **Meetings**: Calendar events with time, duration, and colors
- **Todos**: Tasks with priority, projects, and due dates
- **Projects**: Task organization and categorization
- **Scheduled Items**: Unified scheduling for meetings and tasks
- **Passwords**: Encrypted password storage with metadata
- **Goals**: Goal tracking with categories and progress metrics
- **Habit Tracking**: Daily habit logging with custom icons
- **Financial Data**: Accounts, transactions, and financial goals
- **Health Scores**: Multi-dimensional health tracking

### UI/UX Design
- **Theme**: Modern gradient design with pink-to-orange color scheme
- **Responsive**: Mobile-first design with adaptive layouts
- **Accessibility**: Full keyboard navigation and screen reader support
- **Animations**: Smooth transitions and loading states
- **Dark Mode**: Theme provider with system preference detection

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints under `/api/*` prefix
2. **Query Management**: TanStack Query handles caching, background updates, and optimistic updates
3. **Form Handling**: React Hook Form with Zod validation before API calls
4. **Error Handling**: Centralized error boundaries and toast notifications

### State Management Flow
1. **Server State**: TanStack Query manages all server data with automatic caching
2. **Form State**: React Hook Form handles form data and validation
3. **UI State**: React useState and useContext for local component state
4. **Theme State**: Context provider with localStorage persistence

### Drag & Drop Workflow
1. **Source Detection**: Items can be dragged from todo lists or meeting panels
2. **Drop Validation**: Timeline validates time slots and prevents conflicts
3. **Optimistic Updates**: UI updates immediately with server sync
4. **Conflict Resolution**: Server-side validation with rollback on errors

## External Dependencies

### Core Frontend Dependencies
- **React Ecosystem**: react, react-dom, react-router (wouter)
- **UI Components**: @radix-ui/* components, lucide-react icons
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Forms & Validation**: react-hook-form, @hookform/resolvers, zod
- **Data Fetching**: @tanstack/react-query
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Charts**: recharts for data visualization
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Server Framework**: express with TypeScript support
- **Database**: drizzle-orm, @neondatabase/serverless
- **Session Management**: express-session, connect-pg-simple
- **Development**: tsx for TypeScript execution, esbuild for building

### Development Tools
- **Build System**: vite, @vitejs/plugin-react
- **TypeScript**: typescript with strict configuration
- **Linting**: Built into editor configuration
- **Database**: drizzle-kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module with automatic provisioning
- **Port Configuration**: Development server on port 5000
- **Hot Reload**: Vite middleware integration for instant updates

### Production Build Process
1. **Client Build**: Vite bundles React app to `dist/public`
2. **Server Build**: esbuild compiles Express server to `dist/index.js`
3. **Static Assets**: Served directly from build output
4. **Database Migrations**: Drizzle handles schema updates

### Environment Configuration
- **Database URL**: Automatically provisioned via Replit PostgreSQL module
- **Session Secret**: Generated automatically for development
- **Build Commands**: `npm run build` for production, `npm run dev` for development
- **Deployment Target**: Autoscale with health checks

### Performance Optimizations
- **Code Splitting**: Vite handles automatic chunking
- **Asset Optimization**: Built-in minification and compression
- **Caching Strategy**: TanStack Query with stale-while-revalidate
- **Database Indexing**: Optimized queries via Drizzle ORM

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.