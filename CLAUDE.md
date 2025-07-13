# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains **two separate applications**:

1. **Landing Page** (root `/`) - React TypeScript waitlist landing page
2. **Portfolio Platform** (`/application/`) - AI-powered portfolio generation SaaS with payment processing

## Development Commands

### Landing Page (Root Directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint linting
- `npm run preview` - Preview production build locally

### Portfolio Platform (/application Directory)
- `cd application && npm run dev` - Start Next.js development server on port 3000
- `cd application && npm run build` - Build for production with sitemap generation
- `cd application && npm run start` - Start production server
- `cd application && npm run lint` - Run Next.js linting

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

### Portfolio Platform (/application)
- **Framework**: Next.js 14 with App Router and route groups
- **Database**: Supabase (PostgreSQL) with auth helpers
- **Authentication**: Supabase Auth with OAuth
- **Payments**: Stripe (checkout, subscriptions, webhooks) - currently disabled in config
- **AI Services**: OpenAI integration for content generation
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

### Portfolio Platform Architecture
- **App Router Structure**: File-based routing with layouts using route groups `(dashboard)`
- **Authentication Flow**: Route group layout `(dashboard)` → Middleware → Authentication check → Dashboard pages
- **Data Flow**: Client → API routes → Supabase → Response
- **Payment Flow**: Stripe checkout → Webhook → User provisioning (currently disabled)
- **Dashboard Structure**: Root path `/` is the main dashboard (moved from `/dashboard` to root)
- **Portfolio Hosting**: Subdomain-based hosting (e.g., username.folyx.me)
- **Key Directories**:
  - `application/app/api/` - Backend API endpoints
  - `application/app/(dashboard)/` - Protected dashboard interface (route group)
  - `application/app/[...slug]/` - Dynamic public portfolio pages
  - `application/components/` - Reusable UI components
  - `application/libs/` - External service integrations

## Database Architecture

### Landing Page Database
- **Single Table**: `waitlist` with fields: id, full_name, email, company, created_at
- **Validation**: Enhanced server-side validation in Supabase Edge Function
- **Security**: Row Level Security (RLS) policies enabled
- **Email Integration**: Resend API for welcome emails

### Portfolio Platform Database
- **Core Tables**:
  - `profiles` - User data with Stripe customer integration and subscription info
  - `portfolios` - Portfolio definitions and metadata with subdomain mapping
  - `portfolio_projects` - Individual projects within portfolios
  - `connected_platforms` - Platform integrations (GitHub, LinkedIn, etc.)
  - `leads` - Email capture from marketing
- **Authentication**: Supabase Auth with OAuth providers
- **Access Control**: Subscription-based via `has_access` flag (currently free access mode enabled)

## API Endpoints (Portfolio Platform)

### Authentication & User Management
- `POST /api/auth/callback` - OAuth callback handler
- `POST /api/user/ensure-profile` - Ensure user profile exists
- `GET /api/user/profile` - Fetch user profile data

### Portfolio Management
- `GET /api/portfolios` - List user's portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/[id]` - Get specific portfolio
- `PUT /api/portfolios/[id]` - Update portfolio
- `DELETE /api/portfolios/[id]` - Delete portfolio
- `POST /api/portfolios/[id]/generate` - Generate AI content for portfolio
- `GET /api/portfolios/check-subdomain` - Check subdomain availability

### Platform Integrations
- `POST /api/integrations/github/connect` - Connect GitHub account
- `POST /api/integrations/github/sync` - Sync GitHub data

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

### Portfolio Platform Features
- **Portfolio Creation**: AI-powered portfolio generation from connected platforms
- **Platform Integrations**: GitHub, LinkedIn, and other professional platforms
- **Custom Domains**: Subdomain-based portfolio hosting (e.g., username.folyx.me)
- **AI Content Generation**: OpenAI-powered project descriptions and bio enhancement
- **User Dashboard**: Compact portfolio management interface at root path
- **Subscription System**: Stripe-powered monetization (currently disabled for development)
- **Template System**: Multiple portfolio templates and themes
- **Email Integration**: Transactional emails and support forwarding
- **Analytics**: Portfolio performance tracking and insights

## Configuration Files

### Landing Page
- `vite.config.ts` - Vite configuration with React SWC plugin
- `tailwind.config.ts` - Tailwind with shadcn/ui theme
- `components.json` - shadcn/ui component configuration
- `supabase/config.toml` - Supabase local development

### Portfolio Platform
- `application/config.js` - Application configuration (Stripe, Mailgun, themes, payment toggles)
- `application/middleware.js` - Session refresh and subdomain routing middleware
- `application/next.config.js` - Next.js configuration
- `application/tailwind.config.js` - Tailwind with DaisyUI themes

## Development Patterns

### Landing Page Patterns
- **Absolute Imports**: `@/` alias pointing to `src/`
- **Component Patterns**: shadcn/ui with Radix UI primitives
- **Type Safety**: Full TypeScript with Zod validation
- **State Management**: TanStack Query for server state
- **Animation**: Framer Motion with intersection observers

### Portfolio Platform Patterns
- **Server Components**: Default rendering strategy with async data fetching
- **Client Components**: Selective hydration for interactivity
- **Protected Routes**: Route group layout-based authentication checks
- **API Design**: RESTful endpoints with proper error handling
- **Security**: Webhook signature verification and input validation
- **Route Groups**: `(dashboard)` for protected areas, dynamic routes for public portfolios

## Email Configuration

### Landing Page (Resend)
- **Service**: Resend API for transactional emails
- **Environment**: `RESEND_API_KEY` in Supabase Edge Functions
- **Templates**: HTML welcome email templates
- **Domain Setup**: DNS records (SPF, DKIM) required

### Portfolio Platform (Mailgun)
- **Service**: Mailgun for email delivery and forwarding
- **Configuration**: Domain verification and webhook setup
- **Support Flow**: Customer emails forwarded to admin
- **Templates**: Transactional email templates

## Environment Setup

### Required Environment Variables
**Landing Page**: Configured in Supabase Edge Functions
**Portfolio Platform**: Set in deployment environment or `.env.local`
- Stripe keys (public/secret)
- Supabase URL and anon key
- Mailgun API key and domain
- Crisp website ID (optional)

### Local Development
1. **Landing Page**: `npm install && npm run dev`
2. **Portfolio Platform**: `cd application && npm install && npm run dev`
3. **Database**: Supabase local development or cloud instance
4. **Webhooks**: Use ngrok or similar for local webhook testing

## Current Platform Status

### Development Configuration
- **Payments**: Currently disabled (`payments.enabled: false` in config.js)
- **Free Access Mode**: Enabled for all users during development
- **AI Integration**: OpenAI configured for content generation
- **Dashboard Location**: Moved from `/dashboard` to root path `/` using route groups

### Route Structure
- **Protected Dashboard**: `app/(dashboard)/` route group
  - `/` - Main dashboard (moved from `/dashboard`)
  - `/portfolios` - Portfolio management
  - `/portfolios/new` - Create new portfolio
  - `/settings` - User settings
- **Public Routes**: 
  - `app/[...slug]/` - Dynamic portfolio viewing
  - `app/signin` - Authentication
  - `app/blog/` - Blog system

### Icons and Assets
- **Favicon**: `app/icon.svg` - Custom Folyx logo
- **Public Assets**: `public/folyx-icon.svg` - Sidebar and component usage
- **Logo**: Dark background SVG with cream-colored Folyx branding

### Authentication Flow
1. User visits protected route in `(dashboard)` group
2. Layout checks for valid session
3. Redirects to `/signin` if not authenticated
4. After authentication, redirects to `/` (main dashboard)
5. User profile loaded from `profiles` table with fallbacks

### Payment System (Development)
- Stripe integration exists but disabled
- Two plans configured: Starter ($19) and Pro ($49)
- Webhooks ready for subscription management
- Free access granted to all users during development phase