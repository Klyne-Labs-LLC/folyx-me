# 🚀 Folyx - Portfolio on Autopilot

**The Last Portfolio You'll Ever Need to Build**

Folyx is an AI-powered portfolio generation SaaS platform that automatically creates and maintains professional portfolios from your social profiles and resume data. Never rebuild your portfolio again!

## 🌟 What is Folyx?

Folyx transforms the tedious process of portfolio creation into an automated, intelligent system that:

- **🤖 AI-Powered Generation**: Automatically builds portfolios from your GitHub, LinkedIn, Dribbble, and other profiles
- **📄 Resume Parsing**: Upload your CV/resume and instantly generate portfolio content
- **🔄 Auto-Updates**: Keeps your portfolio fresh with automatic content updates
- **🎨 Professional Templates**: Choose from 15+ stunning, responsive templates
- **📊 Analytics**: Track portfolio performance and visitor engagement
- **🔗 Custom Domains**: Use your own domain for professional branding

## 🏗️ Architecture

This repository contains **two applications**:

### 📱 Landing Page (`/`)
- **URL**: [folyx.me](https://folyx.me)
- **Tech**: React + TypeScript + Vite
- **Purpose**: Marketing site and waitlist collection

### 💼 SaaS Application (`/application/`)
- **URL**: [app.folyx.me](https://app.folyx.me) 
- **Tech**: Next.js 14 + Supabase + Stripe
- **Purpose**: Portfolio builder dashboard and authentication

## 🛠️ Project info

**Landing Page URL**: https://lovable.dev/projects/35d72d2e-6e25-40e5-9b0c-c0d1a7c1b727

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/35d72d2e-6e25-40e5-9b0c-c0d1a7c1b727) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛡️ Tech Stack

### Landing Page (`/`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite with SWC
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (waitlist collection)
- **Animations**: Framer Motion + Lottie React
- **Analytics**: Vercel Analytics

### SaaS Application (`/application/`)
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL) with RLS
- **Authentication**: Supabase Auth (Google/GitHub OAuth)
- **Payments**: Stripe (subscriptions + webhooks)
- **Email**: Mailgun with forwarding
- **Styling**: Tailwind CSS + DaisyUI
- **Analytics**: Plausible

## 💳 Subscription Plans

- **Free**: 1 portfolio, basic templates, manual updates
- **Starter ($19/mo)**: 3 portfolios, all templates, platform integrations
- **Pro ($49/mo)**: Unlimited portfolios, advanced AI, analytics, CV parsing

## 🚀 Development Setup

### Landing Page Development
```bash
# Install dependencies
npm install

# Start development server (localhost:8080)
npm run dev

# Build for production
npm run build
```

### SaaS Application Development
```bash
# Navigate to application directory
cd application

# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build
```

## 🗄️ Database Setup

The application uses Supabase for database management:

1. **Profiles Table**: User data and subscription management
2. **Waitlist Table**: Landing page email collection
3. **Authentication**: Supabase Auth with OAuth providers
4. **Row Level Security**: Proper data access controls

## 📧 Environment Variables

### Landing Page (Supabase Edge Functions)
- `RESEND_API_KEY`: For transactional emails

### SaaS Application (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side operations
- `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY`: Payment processing
- `STRIPE_WEBHOOK_SECRET`: Webhook signature verification
- `MAILGUN_API_KEY`: Email delivery

## 🏗️ Deployment

### Landing Page
- **Platform**: Vercel (automatic from main branch)
- **Domain**: folyx.me
- **Build Command**: `npm run build`

### SaaS Application  
- **Platform**: Vercel (automatic from main branch)
- **Domain**: app.folyx.me
- **Build Command**: `cd application && npm run build`

## 📝 License

This project is proprietary software owned by Klyne Labs LLC.
