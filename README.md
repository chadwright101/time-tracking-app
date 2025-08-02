# Time Tracking App

A PWA (Progressive Web App) time tracking application built with Next.js 15 and React 19.

## Features

- ⏱️ Start/stop timer with project tracking
- 📊 Automatic 15-minute time rounding
- 💾 Client-side data persistence with IndexedDB
- ✏️ Inline editing of project names and durations
- 📧 Excel export via email
- 🌙 Dark mode support
- 📱 PWA capabilities (offline support, installable)

## Tech Stack

- **Next.js 15** with App Router
- **React 19**
- **IndexedDB** for data persistence
- **TailwindCSS** for styling
- **PWA** with service worker
- **Server Actions** for email functionality

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Email Export Setup

To enable email export functionality, set these environment variables:

```bash
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_SEND_TO=recipient@example.com
```

## Architecture

- `app/` - Next.js App Router pages and layout
- `_components/` - React components (Timer, DataManager, DarkModeToggle)
- `_hooks/` - Custom hooks (useTimeTracker, useDarkMode)
- `_lib/` - Services (IndexedDB abstraction)
- `_actions/` - Server Actions (email functionality)
