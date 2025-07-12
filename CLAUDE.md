# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains **two separate applications**:

1. **Landing Page** (root `/`) - React TypeScript waitlist landing page
2. **SaaS Application** (`/app/`) - Complete Next.js polling/survey app with payment processing

## Development Commands

### Landing Page (Root Directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally

### SaaS Application (/app Directory)
- `cd app && npm run dev` - Start Next.js development server on port 3000
- `cd app && npm run build` - Build for production with sitemap generation
- `cd app && npm run start` - Start production server
- `cd app && npm run lint` - Run Next.js linting

## Technology Stack

### Landing Page (/)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Animations**: Framer Motion, Lottie React
- **Form Handling**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

### SaaS Application (/app)
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL) with auth helpers
- **Authentication**: Supabase Auth with OAuth
- **Payments**: Stripe (checkout, subscriptions, webhooks)
- **Email**: Mailgun with forwarding
- **Styling**: Tailwind CSS with DaisyUI
- **Analytics**: Plausible
- **Support**: Crisp Chat integration

## Architecture Overview

### Landing Page Architecture
- **Single Page Application** with component-based architecture
- **Entry Point**: `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`
- **Global Providers**: QueryClient, TooltipProvider, Toasters, BrowserRouter
- **Animation System**: Intersection observer for scroll-triggered animations
- **Component Structure**: 
  - `src/components/ui/` - shadcn/ui components (Radix UI primitives)
  - `src/components/` - Custom components (Hero, DetailsSection, etc.)
  - `src/hooks/` - Custom React hooks (`useWaitlistCount`)
  - `src/integrations/supabase/` - Database client and types

### SaaS Application Architecture
- **App Router Structure**: File-based routing with layouts
- **Authentication Flow**: Middleware → Layout protection → API routes
- **Data Flow**: Client → API routes → Supabase → Response
- **Payment Flow**: Stripe checkout → Webhook → User provisioning
- **Key Directories**:
  - `app/api/` - Backend API endpoints
  - `app/dashboard/` - Protected user interface
  - `app/[...survey]/` - Dynamic public poll pages
  - `components/` - Reusable UI components
  - `libs/` - External service integrations

## Database Architecture

### Landing Page Database
- **Single Table**: `waitlist` with fields: id, full_name, email, company, created_at
- **Validation**: Enhanced server-side validation in Supabase Edge Function
- **Security**: Row Level Security (RLS) policies enabled
- **Email Integration**: Resend API for welcome emails

### SaaS Application Database
- **Core Tables**:
  - `profiles` - User data with Stripe customer integration
  - `user_created_polls` - Poll definitions and metadata
  - `public_survey` - Vote counts and poll data
  - `leads` - Email capture from marketing
- **Authentication**: Supabase Auth with OAuth providers
- **Access Control**: Subscription-based via `has_access` flag

## API Endpoints (SaaS App)

### Authentication & User Management
- `POST /api/auth/callback` - OAuth callback handler
- `POST /api/user/createSurvey` - Create new polls (auth required)
- `GET /api/user/userSurvey` - Fetch user's polls with statistics
- `POST /api/user/deleteSurvey` - Delete user polls

### Public Poll Features
- `GET /api/public/getPublic` - Retrieve poll data by ID
- `POST /api/public/votePublic` - Submit votes to polls

### Payment Processing
- `POST /api/stripe/create-checkout` - Create Stripe checkout sessions
- `POST /api/stripe/create-portal` - Customer portal access
- `POST /api/webhook/stripe` - Handle payment events and user provisioning

### Lead & Communication
- `POST /api/lead` - Capture email leads
- `POST /api/webhook/mailgun` - Email forwarding for support

## Key Features

### Landing Page Features
- **Waitlist System**: Name, email, company collection with validation
- **Real-time Counter**: Live waitlist count display
- **Responsive Design**: Mobile-first with Tailwind breakpoints
- **Email Automation**: Welcome emails via Resend API
- **Analytics**: Vercel Analytics integration

### SaaS Application Features
- **Poll Creation**: 4-option surveys with custom titles
- **Public Voting**: Anonymous voting on shared poll URLs
- **User Dashboard**: Poll management and vote statistics
- **Subscription System**: Stripe-powered monetization
- **Blog System**: Content management with categories and authors
- **Email Integration**: Transactional emails and support forwarding

## Configuration Files

### Landing Page
- `vite.config.ts` - Vite configuration with React SWC plugin
- `tailwind.config.ts` - Tailwind with shadcn/ui theme
- `components.json` - shadcn/ui component configuration
- `supabase/config.toml` - Supabase local development

### SaaS Application
- `app/config.js` - Application configuration (Stripe, Mailgun, themes)
- `app/middleware.js` - Session refresh middleware
- `app/next.config.js` - Next.js configuration
- `app/tailwind.config.js` - Tailwind with DaisyUI themes

## Development Patterns

### Landing Page Patterns
- **Absolute Imports**: `@/` alias pointing to `src/`
- **Component Patterns**: shadcn/ui with Radix UI primitives
- **Type Safety**: Full TypeScript with Zod validation
- **State Management**: TanStack Query for server state
- **Animation**: Framer Motion with intersection observers

### SaaS Application Patterns
- **Server Components**: Default rendering strategy
- **Client Components**: Selective hydration for interactivity
- **Protected Routes**: Layout-based authentication checks
- **API Design**: RESTful endpoints with proper error handling
- **Security**: Webhook signature verification and input validation

## Email Configuration

### Landing Page (Resend)
- **Service**: Resend API for transactional emails
- **Environment**: `RESEND_API_KEY` in Supabase Edge Functions
- **Templates**: HTML welcome email templates
- **Domain Setup**: DNS records (SPF, DKIM) required

### SaaS Application (Mailgun)
- **Service**: Mailgun for email delivery and forwarding
- **Configuration**: Domain verification and webhook setup
- **Support Flow**: Customer emails forwarded to admin
- **Templates**: Transactional email templates

## Environment Setup

### Required Environment Variables
**Landing Page**: Configured in Supabase Edge Functions
**SaaS App**: Set in deployment environment or `.env.local`
- Stripe keys (public/secret)
- Supabase URL and anon key
- Mailgun API key and domain
- Crisp website ID (optional)

### Local Development
1. **Landing Page**: `npm install && npm run dev`
2. **SaaS App**: `cd app && npm install && npm run dev`
3. **Database**: Supabase local development or cloud instance
4. **Webhooks**: Use ngrok or similar for local webhook testing