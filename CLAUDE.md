# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Animations**: Framer Motion, Lottie React
- **Form Handling**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

## Architecture Overview

### Frontend Structure
- **Single Page Application** with component-based architecture
- **Main Entry**: `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`
- **App.tsx** provides global providers: QueryClient, TooltipProvider, Toasters, BrowserRouter
- **Index.tsx** is the main landing page with sectioned layout using intersection observer for animations

### Component Organization
- `src/components/` - All React components
- `src/components/ui/` - shadcn/ui components (accordion, button, card, etc.)
- `src/hooks/` - Custom React hooks
- `src/lib/utils.ts` - Utility functions (includes cn helper for Tailwind)
- `src/pages/` - Route components (Index, NotFound)

### Supabase Integration
- **Database**: Single `waitlist` table with fields: id, full_name, email, company, created_at
- **Client**: `src/integrations/supabase/client.ts` - Pre-configured Supabase client
- **Types**: `src/integrations/supabase/types.ts` - Auto-generated TypeScript types
- **Edge Function**: `supabase/functions/waitlist-signup/index.ts` - Handles waitlist signup with validation
- **Migration**: Database schema in `supabase/migrations/` with RLS policies

### Key Features
- **Waitlist System**: Users can sign up with name, email, and optional company
- **Real-time Count**: `useWaitlistCount` hook displays current waitlist size
- **Animation System**: Intersection observer triggers fade-in animations on scroll
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Configuration Files

- `vite.config.ts` - Vite configuration with React SWC plugin
- `tailwind.config.ts` - Tailwind CSS configuration with shadcn/ui setup
- `components.json` - shadcn/ui component configuration
- `supabase/config.toml` - Supabase local development configuration

## Development Notes

- Project uses absolute imports with `@/` alias pointing to `src/`
- Components follow shadcn/ui patterns with Radix UI primitives
- All components use TypeScript with proper typing
- Database operations use Supabase client with Row Level Security enabled
- Form validation uses Zod schemas with React Hook Form integration