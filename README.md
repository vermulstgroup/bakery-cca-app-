# BISS Bakery App

A comprehensive bakery management application built with Next.js 15, Firebase, and AI-powered features using Google Genkit.

## Overview

BISS Bakery App is a full-stack Progressive Web Application (PWA) designed to help bakery businesses manage their daily operations including sales entry, expense tracking, and business analytics with AI-powered insights.

## Tech Stack

### Frontend
- **Next.js 15.3.6** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Recharts 2.15.1** - Charting library for analytics

### Backend & Services
- **Firebase 12.6.0** - Backend-as-a-Service (Firestore, Auth, App Hosting)
- **Google Genkit 1.20.0** - AI/ML integration for intelligent features

## Features

### Core Features
1. **Dashboard** - Overview of bakery performance metrics
2. **Daily Entry** - Record daily sales and production
3. **Expense Tracking** - Track and categorize business expenses
4. **Trends & Analytics** - Visualize business performance over time
5. **Settings** - Configure app preferences and pricing

### Technical Features
- PWA Support - Installable on mobile devices
- Dark/Light Mode - Theme switching support
- Responsive Design - Works on all screen sizes
- AI Integration - Smart features via Google Genkit

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled

### Installation

```bash
git clone https://github.com/vermulstgroup/biss-bakery-app.git
cd biss-bakery-app
npm install
npm run dev
```

### Available Scripts

```bash
npm run dev       # Start development server with Genkit
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── (main)/   # Main app routes (dashboard, entry, expenses, trends, settings)
│   └── (onboarding)/ # Onboarding flow
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks (useFirestore, use-mobile, etc.)
├── lib/           # Utilities (firebase/, types.ts, utils.ts)
└── providers/     # React context providers
```

## Development Notes for Claude Code

### Key Files
- `src/lib/firebase/config.ts` - Firebase initialization
- `src/lib/types.ts` - TypeScript type definitions
- `src/hooks/useFirestore.ts` - Firestore data operations
- `src/lib/data.ts` - Static data and constants

### Component Architecture
- UI components follow Shadcn/UI patterns
- Page components use Next.js App Router conventions

### Recent Changes
- Added Firebase integration with Firestore
- Created useFirestore hook for data operations
- Added PWA icon assets
- Updated trends, entry and expenses pages with Firebase

## TODO for Future Development

- [ ] Complete Firebase Authentication integration
- [ ] Add offline support with service workers
- [ ] Implement AI-powered sales predictions
- [ ] Add export functionality (PDF/CSV reports)
- [ ] Multi-bakery support for enterprise users

---

Built with Firebase Studio and Claude AI
