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
- **Edge Function**: `supabase/functions/waitlist-signup/index.ts` - Handles waitlist signup with enhanced validation and sanitization
- **Migration**: Database schema in `supabase/migrations/` with RLS policies

#### Validation Rules
- **Full Name**: 2-50 characters, type validation, sanitization, pattern checks for repeated chars and special characters
- **Email**: Enhanced regex validation, length limits (100 chars), suspicious pattern detection, lowercase normalization
- **Company**: Optional field, 100 character limit, sanitization with empty string conversion to null

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

## Email Configuration

### Resend Integration
- **Service**: Resend email API for transactional emails
- **Environment Variable**: `RESEND_API_KEY` (configured in Supabase Edge Functions)
- **From Address**: Update `noreply@yourdomain.com` in waitlist-signup function to your verified domain
- **Features**: Welcome email with HTML template sent automatically on waitlist signup
- **Error Handling**: Email failures don't prevent waitlist signup completion

### Setup Requirements
1. Sign up for Resend account and verify your domain
2. Add `RESEND_API_KEY` to Supabase Edge Functions environment variables
3. Update the `from` email address in the waitlist-signup function
4. Configure DNS records (SPF, DKIM) for better deliverability

## Development Notes

- Project uses absolute imports with `@/` alias pointing to `src/`
- Components follow shadcn/ui patterns with Radix UI primitives
- All components use TypeScript with proper typing
- Database operations use Supabase client with Row Level Security enabled
- Form validation uses Zod schemas with React Hook Form integration