# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

This is a Next.js 15 PWA (Progressive Web App) time tracking application that uses:

- **Next.js App Router** with React 19
- **IndexedDB** for client-side data persistence via custom service layer
- **Server Actions** for email functionality
- **TailwindCSS** for styling with dark mode support
- **PWA capabilities** with service worker and manifest

### Key Components Structure

- `app/` - Next.js App Router pages and layout
- `_components/` - React components (Timer, DataManager, DarkModeToggle)
- `_hooks/` - Custom React hooks (useTimeTracker, useDarkMode)
- `_lib/` - Utility services (idb-service for IndexedDB operations)
- `_actions/` - Next.js Server Actions (email functionality)

### Data Flow

1. **Timer Component** (`_components/timer.js`) - Main UI component
2. **useTimeTracker Hook** (`_hooks/use-time-tracker.js`) - State management and business logic
3. **IDB Service** (`_lib/idb-service.js`) - IndexedDB abstraction layer for data persistence
4. **DataManager Component** - Handles export/clear operations via Server Actions

### Time Entry Management

- Time entries are stored in IndexedDB with automatic 15-minute rounding
- Duration is calculated from start/stop times and rounded up to nearest 15-minute increment
- Most recent entries display at top (sorted by startTime descending)
- Entries can be edited inline (project name and duration)

### Email Export Feature

- Uses Server Actions to generate Excel files from time entries
- Requires SMTP environment variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SEND_TO`
- Automatically clears data after successful email send
- Excel export uses XLSX library to create `.xlsx` files

### Dark Mode

- Toggle button in Timer component header
- Uses `useDarkMode` hook with React Context for state management
- Persists preference in localStorage
- Detects system preference on first visit
- TailwindCSS configured with `darkMode: "class"`

### PWA Configuration

- Service worker registration in `app/layout.js`
- Manifest at `public/manifest.json`
- PWA disabled in development mode
- Icons and offline capabilities configured