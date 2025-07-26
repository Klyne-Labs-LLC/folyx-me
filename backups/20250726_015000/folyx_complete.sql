--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: generate_unique_slug(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_unique_slug(input_title text, user_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(input_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM portfolios WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


--
-- Name: generate_unique_subdomain(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_unique_subdomain(input_subdomain text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean input subdomain: lowercase, alphanumeric + hyphens only
  base_subdomain := lower(regexp_replace(input_subdomain, '[^a-z0-9-]+', '', 'g'));
  base_subdomain := trim(both '-' from base_subdomain);
  
  -- Ensure it's not empty, fallback to 'portfolio'
  IF base_subdomain = '' OR length(base_subdomain) < 3 THEN
    base_subdomain := 'portfolio';
  END IF;
  
  -- Ensure max length of 63 characters (DNS limitation)
  base_subdomain := left(base_subdomain, 60);
  
  final_subdomain := base_subdomain;
  
  -- Check if subdomain exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.portfolios WHERE subdomain = final_subdomain) LOOP
    final_subdomain := base_subdomain || counter;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 9999 THEN
      final_subdomain := base_subdomain || '-' || extract(epoch from now())::bigint;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_connected_platforms_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_connected_platforms_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_user_content_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_content_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: connected_platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connected_platforms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    platform text NOT NULL,
    platform_user_id text NOT NULL,
    platform_username text NOT NULL,
    platform_display_name text,
    access_token text NOT NULL,
    refresh_token text,
    token_expires_at timestamp with time zone,
    profile_data jsonb DEFAULT '{}'::jsonb,
    scope text,
    verified_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT connected_platforms_platform_check CHECK ((platform = ANY (ARRAY['github'::text, 'linkedin'::text, 'dribbble'::text, 'twitter'::text, 'behance'::text])))
);


--
-- Name: portfolio_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid,
    visitor_id text,
    event_type text NOT NULL,
    event_data jsonb DEFAULT '{}'::jsonb,
    user_agent text,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: portfolio_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid,
    source_platform text,
    source_id text,
    title text NOT NULL,
    description text,
    enhanced_description text,
    technologies jsonb DEFAULT '[]'::jsonb,
    images jsonb DEFAULT '[]'::jsonb,
    links jsonb DEFAULT '{}'::jsonb,
    metrics jsonb DEFAULT '{}'::jsonb,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    template_id text DEFAULT 'modern'::text,
    template_config jsonb DEFAULT '{}'::jsonb,
    content_data jsonb DEFAULT '{}'::jsonb,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    custom_domain text,
    seo_title text,
    seo_description text,
    view_count integer DEFAULT 0,
    last_generated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subdomain text
);


--
-- Name: COLUMN portfolios.subdomain; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.portfolios.subdomain IS 'Unique subdomain for portfolio access (e.g., username.folyx.me)';


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    customer_id text,
    subscription_id text,
    price_id text,
    has_access boolean DEFAULT false,
    plan_type text DEFAULT 'free'::text,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content_type text NOT NULL,
    original_text text,
    structured_data jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_content_content_type_check CHECK ((content_type = ANY (ARRAY['resume'::text, 'cover_letter'::text, 'portfolio_text'::text, 'bio'::text])))
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    company text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: connected_platforms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.connected_platforms (id, user_id, platform, platform_user_id, platform_username, platform_display_name, access_token, refresh_token, token_expires_at, profile_data, scope, verified_at, created_at, updated_at) FROM stdin;
0be57432-dd80-43d6-ae57-764c265a60a7	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	github	111155827	takitajwar17	Taki Tajwaruzzaman Khan	public_access	\N	\N	{"skills": {"languages": [{"name": "JavaScript", "count": 14}, {"name": "TypeScript", "count": 11}, {"name": "Python", "count": 6}, {"name": "HTML", "count": 3}, {"name": "Java", "count": 2}, {"name": "C#", "count": 2}, {"name": "C", "count": 1}, {"name": "Ruby", "count": 1}, {"name": "Jupyter Notebook", "count": 1}], "technologies": ["config", "github-config", "education", "hackathon", "nextjs", "aws", "cloudfront-distribution", "custom-vpc", "django-rest-framework", "ec2-instance", "react-vite", "s3-bucket", "design-patterns", "portfolio-website", "responsive", "data-science", "data-visualization", "kernel", "operating-systems", "full-stack-web-development", "mern-stack", "mlsa", "mlsa-technical-onboarding", "api", "nodejs", "todolist", "css", "html", "js", "java", "swing-gui", "dotnet", "andrew-ng-machine-learning", "machine-learning", "pywhatkit", "whatsapp-bot", "fine-tuning", "generative-ai", "codeforces", "leetcode", "problem-solving", "csharp", "dotnet-framework", "schedule", "student"], "totalRepositories": 53}, "profile": {"id": 111155827, "bio": "Software Engineer | Open Source Contributor | AI Engineering Enthusiast", "blog": "takitajwar17.live", "name": "Taki Tajwaruzzaman Khan", "email": "tajwaruzzaman@iut-dhaka.edu", "avatar": "https://avatars.githubusercontent.com/u/111155827?v=4", "company": "Islamic University of Technology", "location": "Bangladesh", "username": "takitajwar17", "followers": 32, "following": 33, "created_at": "2022-08-12T21:33:23Z", "updated_at": "2025-07-13T12:25:16Z", "public_repos": 53}, "rawData": {"totalProjects": 32, "filterCriteria": {"sortBy": "stars", "minStars": 0, "maxProjects": 12, "includeForkedRepos": false}, "selectedProjects": 12}, "projects": [{"id": "github-971526470", "url": "https://github.com/takitajwar17/lumenly.dev", "dates": {"pushed": "2025-05-29T19:25:56Z", "created": "2025-04-23T16:51:04Z", "updated": "2025-05-29T19:25:59Z"}, "title": "lumenly.dev", "isFork": false, "topics": [], "demoUrl": "https://www.lumenly.dev", "license": "MIT License", "metrics": {"size": 732, "forks": 0, "stars": 2, "watchers": 2, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/lumenly.dev", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["TypeScript", "JavaScript", "CSS", "HTML"], "defaultBranch": "main", "languageStats": {"CSS": 3662, "HTML": 738, "JavaScript": 10297, "TypeScript": 253223}, "fullDescription": "# lumenly.dev\\n\\n<div align=\\"center\\">\\n  <img src=\\"public/android-chrome-192x192.png\\" alt=\\"lumenly.dev logo\\" width=\\"120\\" />\\n  \\n  <h3>Collaborative Cloud Coding with AI</h3>\\n  \\n  <p>A real-time collaborative code editor with integrated code execution and AI-powered reviews</p>\\n\\n  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)\\n  [![GitHub Stars](https://img.shields.io/github/stars/takitajwar17/lumenly.dev?style=social)](https://github.com/takitajwar17/lumenly.dev/stargazers)\\n  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=social&logo=linkedin)](https://www.linkedin.com/in/takitajwar17/)\\n  \\n  <a href=\\"https://www.lumenly.dev\\">🌐 Website</a> •\\n  <a href=\\"#detailed-documentation\\">📚 Documentation</a> •\\n  <a href=\\"#features\\">✨ Features</a> •\\n  <a href=\\"#core-components\\">🧩 Core Components</a> •\\n  <a href=\\"#getting-started\\">🚀 Getting Started</a> •\\n  <a href=\\"#usage\\">📖 Usage</a> •\\n  <a href=\\"#architecture\\">🏗️ Architecture</a> •\\n  <a href=\\"#contributing\\">👥 Contributing</a> •\\n  <a href=\\"#roadmap\\">🗺️ Roadmap</a>\\n</div>\\n\\n## 📚 Detailed Documentation\\n\\nFor a comprehensive breakdown of the project, visit our [DeepWiki](https://deepwiki.com/takitajwar17/lumenly.dev) covering topics like Technology Stack, Workspace Management, Code Execution, AI Integration, and more.\\n\\n## ✨ Features\\n\\nlumenly.dev is a cloud coding platform that makes collaboration effortless, with no setup required. It's like Google Docs for coding, but smarter and built specifically for developers.\\n\\n### 🤝 Real-time Collaboration\\n- **Live Collaborative Editing:** Multiple users can edit code simultaneously, with real-time updates\\n- **Cursor and Selection Tracking:** See where your collaborators are working in real-time\\n- **Presence Indicators:** Know who's online and actively working\\n- **Activity Tracking:** View your coding activity with GitHub-style contribution graphs\\n\\n### 🚀 Instant Code Execution\\n- **One-Click Execution:** Run your code directly in the browser with a single click\\n- **30+ Languages Support:** Code in JavaScript, TypeScript, Python, Java, C++, Rust, and many more\\n- **Real-time Output:** View execution results, errors, and compilation messages instantly\\n- **Performance Metrics:** Track execution time and resource usage\\n\\n### 🧠 AI-Powered Features\\n- **Code Reviews:** Get AI-powered feedback on your code quality, performance, and best practices\\n- **Suggestions & Improvements:** Receive actionable suggestions for making your code better\\n- **Issue Detection:** Automatically identify potential bugs, security issues, and performance bottlenecks\\n- **Smart Code Analysis:** Benefit from deep code understanding across multiple languages\\n\\n### 🛠️ Developer-Focused Experience\\n- **Syntax Highlighting:** Beautiful, language-specific code highlighting\\n- **Customizable Editor:** Light and dark themes with professional coding environments\\n- **Shareable Workspaces:** Easily share workspace links with collaborators\\n- **Persistent Storage:** Your code is automatically saved in real-time\\n\\n## 🧩 Core Components\\n\\nLumenly.dev is built around several key subsystems that work together to provide a seamless coding experience:\\n\\n### Workspace Management System\\n- Handles creation, joining, and management of collaborative workspaces\\n- Generates unique 6-character codes for easy sharing\\n- Maintains workspace state and synchronizes between users\\n\\n### Code Editor System\\n- Based on Monaco Editor (same as VS Code)\\n- Integrates with real-time collaboration features\\n- Provides syntax highlighting for 30+ programming languages\\n- Includes editor toolbar with actions for running code and requesting AI reviews\\n\\n### Activity Tracking\\n- Monitors user coding activity with GitHub-style contribution graphs\\n- Tracks presence information for all collaborators\\n- Shows cursor positions and selections in real-time\\n\\n### Real-time Collaboration\\n- Built on Convex's real-time database\\n- Synchronizes code changes instantly across all connected users\\n- Provides presence indicators and cursor tracking\\n- Ensures conflict-free collaborative editing\\n\\n### AI Integration\\n- Connects with Nebius API for code analysis\\n- Provides intelligent code reviews and suggestions\\n- Identifies potential bugs and performance issues\\n- Offers best practice recommendations\\n\\n## 🚀 Getting Started\\n\\n### Prerequisites\\n- Node.js (v18 or newer)\\n- npm or yarn\\n- A Convex account for the backend\\n- API keys for AI services (optional)\\n\\n### Installation\\n\\n1. Clone the repository:\\n```bash\\ngit clone https://github.com/takitajwar17/lumenly.dev.git\\ncd lumenly.dev\\n```\\n\\n2. Install dependencies:\\n```bash\\nnpm install\\n```\\n\\n3. Create and configure a Convex project:\\n```bash\\nnpx convex login\\nnpx convex init\\n```\\n\\n4. Create a `.env` file with your environment variables:\\n```\\nCONVEX_DEPLOYMENT=\\nCONVEX_NEBIUS_API_KEY=  # Optional, for AI code reviews\\n```\\n\\n5. Run the development server:\\n```bash\\nnpm run dev\\n```\\n\\nThe application will start at http://localhost:5173\\n\\n## 📖 Usage\\n\\n### User Flow\\n\\nThe typical user flow in lumenly.dev follows these paths:\\n\\n1. **Authentication Flow:**\\n   - User visits lumenly.dev\\n   - Authentication check determines if already signed in\\n   - If not authenticated, user proceeds to sign in\\n\\n2. **Workspace Selection:**\\n   - After authentication, user arrives at the Workspace Hub\\n   - Options include:\\n     - Creating a new workspace\\n     - Joining an existing workspace via code\\n     - Opening a previously saved workspace\\n\\n3. **Coding Environment:**\\n   - Inside the workspace, users interact with the Code Editor\\n   - Multiple users can collaborate simultaneously\\n   - Real-time changes are visible to all participants\\n\\n![User Flow Diagram](assets/images/Screenshot%202025-04-29%20152018.png)\\n\\n### Creating a Workspace\\n1. Visit the application and sign in\\n2. Click \\"Create a Workspace\\" to start a new coding space\\n3. Choose your preferred programming language\\n4. You'll receive a 6-character workspace code that you can share with collaborators\\n\\n### Inviting Collaborators\\n1. Share your workspace code or URL with others\\n2. Collaborators can join by entering the 6-character code on the home screen\\n3. You'll see real-time presence indicators and cursor positions as people join\\n\\n### Running Code\\n1. Write or paste your code in the editor\\n2. Click the \\"Run\\" button in the toolbar\\n3. View the execution results, including any output, errors, and execution time\\n\\n### Getting AI Reviews\\n1. Write your code in the editor\\n2. Click the \\"AI Review\\" button to get feedback\\n3. Review the suggestions, issues, and improvements identified by the AI\\n\\n## 🏗️ Architecture\\n\\nlumenly.dev is built with modern web technologies and a focus on real-time collaboration.\\n\\n### Tech Stack\\n- **Frontend:** React, TypeScript, TailwindCSS, Monaco Editor (VS Code's editor)\\n- **Backend:** Convex (real-time database and backend functions)\\n- **Code Execution:** Piston API (secure code execution environment)\\n- **AI Services:** Nebius API for code analysis and reviews\\n\\n### System Overview\\nThe high-level architecture of lumenly.dev consists of several interconnected layers:\\n\\n- **Frontend Layer:** React-based UI components and hooks\\n- **Core Components:** Workspace hub, code editor, toolbars, and panels\\n- **Backend Layer:** Convex backend for data management and real-time synchronization\\n- **External Services:** Piston API for code execution and Nebius API for AI code reviews\\n\\n### Key Components\\n- **Real-time Collaboration:** Built on Convex's real-time database for instant updates\\n- **Monaco Editor Integration:** Professional code editing with syntax highlighting\\n- **Presence System:** Track user activity and cursor positions in real-time\\n- **Code Execution Engine:** Secure, isolated environment for running code in 30+ languages\\n\\n### Component Interactions\\nDuring typical workflows like code execution and AI review:\\n\\n1. **Code Execution Flow:**\\n   - User clicks \\"Run Code\\" in the editor toolbar\\n   - Code is sent to the Convex backend\\n   - Convex sends the code to Piston API for execution\\n   - Results are returned to the frontend and displayed to the user\\n\\n2. **AI Review Flow:**\\n   - User clicks \\"AI Review\\" in the editor toolbar\\n   - Code is sent to the Convex backend\\n   - Convex forwards the code to Nebius API for analysis\\n   - AI feedback is formatted and displayed to the user\\n\\n![Component Interaction Diagram](assets/images/Screenshot%202025-04-29%20152139.png)\\n\\n### Real-time Collaboration Architecture\\nThe real-time collaboration features are powered by Convex backend:\\n\\n- Convex database synchronizes changes between all connected users\\n- Custom hooks like `useCodeSync` and `useEditorPresence` manage real-time state\\n- API endpoints in rooms.ts and userActivity.ts handle data operations\\n- Updates propagate automatically to all connected clients\\n\\n![Real-time Collaboration Architecture](assets/images/Screenshot%202025-04-29%20151530.png)\\n\\n### Codebase Organization\\nThe codebase follows a standard React application structure with Convex backend integration:\\n\\n- **/src:** Frontend React components and hooks\\n  - `/components`: UI components including editor, toolbar, and panels\\n  - `/hooks`: Custom React hooks for real-time synchronization\\n  - `/utils`: Helper functions and utilities\\n- **/convex:** Backend functions, schema definitions, and APIs\\n  - API endpoints for rooms, user activity, and code execution\\n  - Data schema and validation\\n- **/public:** Static assets and resources\\n\\n## 👥 Contributing\\n\\nContributions are welcome! Here's how you can help:\\n\\n1. Fork the repository\\n2. Create a feature branch (`git checkout -b feature/amazing-feature`)\\n3. Commit your changes (`git commit -m 'Add amazing feature'`)\\n4. Push to the branch (`git push origin feature/amazing-feature`)\\n5. Open a Pull Request\\n\\nPlease read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.\\n\\n## 🗺️ Roadmap\\n\\nOur plans for future development include:\\n\\n- **GitHub Integration:** Import projects directly from GitHub\\n- **Multifile Support:** Work with and execute complex projects with multiple files\\n- **Collaborative Code Reviews:** Request and provide reviews with inline comments\\n- **Advanced AI Features:** Code completion, refactoring suggestions, and more\\n- **Custom Themes:** Personalize your coding environment\\n- **Mobile Support:** Better experience on tablets and mobile devices\\n\\n## 📝 License\\n\\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\\n\\n## 🙏 Acknowledgements\\n\\n- [Convex](https://convex.dev) for the powerful real-time backend\\n- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience\\n- [Piston API](https://github.com/engineer-man/piston) for secure code execution\\n\\n---\\n\\n<div align=\\"center\\">\\n  <p>Made with ❤️ by <a href=\\"https://github.com/takitajwar17\\">Taki Tajwaruzzaman Khan</a></p>\\n  <p>\\n    <a href=\\"https://www.linkedin.com/in/takitajwar17/\\">LinkedIn</a> •\\n    <a href=\\"https://github.com/takitajwar17\\">GitHub</a>\\n  </p>\\n</div>\\n", "primaryLanguage": "TypeScript"}, {"id": "github-885132875", "url": "https://github.com/takitajwar17/inherit-ewu-hackathon-xtradrill", "dates": {"pushed": "2024-11-23T12:57:26Z", "created": "2024-11-08T02:36:53Z", "updated": "2025-03-22T09:12:46Z"}, "title": "inherit-ewu-hackathon-xtradrill", "isFork": false, "topics": [], "demoUrl": "https://inherit-ewu-hackathon-xtra-drill.vercel.app", "license": "MIT License", "metrics": {"size": 2162, "forks": 0, "stars": 1, "watchers": 1, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/inherit-ewu-hackathon-xtradrill", "isPrivate": false, "isArchived": false, "description": "Inherit, developed by Team XtraDrill, is a unified learning and coding platform that won 1st Runner-Up at the National Hackathon at EWU National RoboFest 2024, leveraging technologies like Next.js, Express.js, and AI integration to bridge educational inequalities in Bangladesh's IT sector.", "technologies": ["JavaScript", "CSS"], "defaultBranch": "main", "languageStats": {"CSS": 3939, "JavaScript": 103715}, "fullDescription": "# Inherit: A Unified Learning & Coding Platform\\n\\n## Update\\n\\nOur team, **XtraDrill**, consisting of **Ahabab Imtiaz Risat**, **Tasnim Ashraf**, and **Taki Tajwaruzzaman Khan**, achieved the **1st Runner-Up** position out of **178 participating teams** at the *Programming Hero presents National Hackathon at EWU National RoboFest 2024*. Our project, **Inherit**, is an integrated online platform designed to bridge the skills gap in Bangladesh's IT sector and reduce educational inequalities between urban and rural areas.\\n\\n![Team XtraDrill at EWU National RoboFest 2024](https://github.com/user-attachments/assets/5cfde8c2-2d5a-4fb2-b1d5-09fa98d944c2)\\n\\n---\\n\\n## Table of Contents\\n\\n- [Problem Statement](#problem-statement)\\n  - [Skills Gap in IT Sector](#skills-gap-in-it-sector)\\n  - [Educational Inequality](#educational-inequality)\\n- [Solution Overview](#solution-overview)\\n- [Platform Features](#platform-features)\\n  - [1. Interactive Learning Environment](#1-interactive-learning-environment)\\n    - [Learn Page](#learn-page)\\n    - [Video Page](#video-page)\\n  - [2. Real-Time Collaborative IDE](#2-real-time-collaborative-ide)\\n    - [Playground Page](#playground-page)\\n    - [Live Playground](#live-playground)\\n  - [3. Community Discussion Forum (DevDiscuss)](#3-community-discussion-forum-devdiscuss)\\n  - [4. AI Integration](#4-ai-integration)\\n    - [AI-Powered Code Review](#ai-powered-code-review)\\n    - [AI-Generated Forum Responses](#ai-generated-forum-responses)\\n- [Technology Stack](#technology-stack)\\n  - [Frontend](#frontend)\\n  - [Backend](#backend)\\n  - [APIs and Services](#apis-and-services)\\n  - [Database](#database)\\n  - [Real-Time Communication](#real-time-communication)\\n- [Installation and Setup](#installation-and-setup)\\n  - [Prerequisites](#prerequisites)\\n  - [Steps](#steps)\\n- [Usage Guide](#usage-guide)\\n  - [Accessing the Platform](#accessing-the-platform)\\n- [Additional Notes](#additional-notes)\\n  - [Live Deployment](#live-deployment)\\n  - [Future Work](#future-work)\\n\\n---\\n\\n\\n## Problem Statement\\n\\nBangladesh faces significant challenges in its IT sector and education system:\\n\\n### Skills Gap in IT Sector\\n\\n- There is an annual demand for approximately **7,500–8,000 technical professionals**, but a shortage of qualified candidates.\\n- Alarmingly, around **80% of computer science and engineering graduates struggle with basic coding skill tests**, highlighting deficiencies in their education.\\n\\n### Educational Inequality\\n\\nA stark disparity exists between urban and rural education:\\n\\n- Only **34% of university students come from rural areas**, even though nearly 70% of school-age children reside there.\\n- **80% of school dropouts originate from rural backgrounds**.\\n- **81% of rural children do not acquire basic numeracy skills**.\\n\\nThese statistics indicate systemic barriers that prevent rural students from accessing quality education and pursuing further studies, contributing to increased inequalities.\\n\\n**Sources:**\\n\\n- [Assessing Skill Gaps and Exploring Employment Opportunities in Bangladesh’s ICT Sector](https://inspira-bd.com/case-studies/addressing-skill-gaps-and-employment-opportunities/)\\n- [How to bridge the rural-urban education divide in Bangladesh | The Daily Star](https://www.thedailystar.net/opinion/views/news/how-bridge-the-rural-urban-education-divide-bangladesh-3621516)\\n- [Growing rural-urban education divide is hurting Bangladesh's future]([https://www.example.com](https://www.thedailystar.net/opinion/views/news/growing-rural-urban-education-divide-hurting-bangladeshs-future-3580771))\\n\\n---\\n\\n## Solution Overview\\n\\n**Inherit** is an integrated online platform focused on:\\n\\n- **SDG 4: Quality Education**\\n- **SDG 10: Reduced Inequalities**\\n\\n![SDG Goals](https://github.com/user-attachments/assets/d1c9f193-7121-45f1-9ec4-16bca5a0eb98)\\n\\nOur platform aims to:\\n\\n- **Enhance Coding Proficiency**: Equip users with the necessary skills to meet industry demands.\\n- **Reduce Educational Inequality**: Provide equal access to quality education resources for rural and urban students alike.\\n- **Promote Collaborative Learning**: Foster a supportive community that encourages mentorship and peer-to-peer learning.\\n- **Leverage AI for Personalized Education**: Utilize AI to offer tailored support and accelerate learning outcomes.\\n\\n---\\n\\n## Platform Features\\n\\n### 1. Interactive Learning Environment\\n\\n#### Learn Page\\n\\n- **Random Video Tutorials & Search Functionality**: Utilizes YouTube Data API to provide a curated list of coding-related tutorials, minimizing distractions from unrelated content.\\n\\n  ![Learn Page](https://github.com/user-attachments/assets/15dcae0c-4477-4654-b348-83aa2912c1ba)\\n\\n#### Video Page\\n\\n- **Embedded YouTube Videos**: Features embedded videos alongside an online code editor.\\n- **Online Code Editor**: Allows users to practice coding in real-time.\\n- **Note-Saving Feature**: Users can take and save notes for an interactive learning experience.\\n\\n  ![Video Page](https://github.com/user-attachments/assets/ba494034-36e7-4930-968a-c74d869b1e81)\\n\\n### 2. Real-Time Collaborative IDE\\n\\n#### Playground Page\\n\\n- **Session Management**: Users can create, save, and manage collaborative coding sessions.\\n\\n  ![Playground Page](https://github.com/user-attachments/assets/041a2b5b-d1fd-442b-9a3f-005815a9aaa2)\\n\\n#### Live Playground\\n\\n- **Real-Time Collaboration**: A real-time collaborative IDE where multiple users can edit code simultaneously.\\n- **Mentorship and Pair Programming**: Promotes mentoring and peer-to-peer learning.\\n\\n  ![Live Playground GIF](https://github.com/user-attachments/assets/7b526025-6471-4afc-9a20-b28733038602)\\n\\n### 3. Community Discussion Forum (DevDiscuss)\\n\\n- **Discussion Forum**: A community-driven Q&A section where users can ask questions and receive answers from peers, similar to Stack Overflow.\\n\\n  ![DevDiscuss Forum](https://github.com/user-attachments/assets/a4c41165-e9fd-405a-83d8-f6c179b2364f)\\n\\n- **AI Assistance**: Provides automatic AI-generated answers with disclaimers, offering immediate support while encouraging community engagement.\\n\\n  ![AI-Generated Answer](https://github.com/user-attachments/assets/fa4aa8dd-e810-4d9a-8117-fd786ec26561)\\n\\n  ![AI Disclaimer](https://github.com/user-attachments/assets/8c34617c-66b4-4b34-b47b-e8707df25dea)\\n\\n### 4. AI Integration\\n\\n#### AI-Powered Code Review\\n\\n- **Code Evaluation**: Offers evaluations of current code, suggests better approaches, and enhances coding practices.\\n- **Availability**: Integrated within the code editor on both the Video Page and Playground.\\n\\n#### AI-Generated Forum Responses\\n\\n- **Instant Answers**: In DevDiscuss, AI provides instant answers to user questions.\\n- **Disclaimers**: Responses are clearly marked to indicate they are AI-generated.\\n\\n---\\n\\n## Technology Stack\\n\\n### Frontend\\n\\n- [**Next.js**](https://nextjs.org/) - React framework for server-side rendering.\\n- [**shadcn**](https://ui.shadcn.com/) - For interactive UI components.\\n- [**Monaco Editor**](https://microsoft.github.io/monaco-editor/) - Code editor component.\\n\\n### Backend\\n\\n- [**Express.js**](https://expressjs.com/) - Web application framework for Node.js.\\n\\n### APIs and Services\\n\\n- **YouTube Data API v3** - Fetches curated coding tutorials.\\n- **Piston API** - Executes code snippets in various programming languages.\\n- **Groq API** - Integrates Meta LLaMA3 70B LLM model for AI features.\\n- **Clerk** - User authentication and management.\\n\\n### Database\\n\\n- **MongoDB Atlas** - Cloud-based NoSQL database.\\n\\n### Real-Time Communication\\n\\n- **WebSockets** - Enables real-time collaborative coding (Note: Limited in live deployment due to hosting constraints).\\n\\n---\\n\\n## Installation and Setup\\n\\n### Prerequisites\\n\\n- **Node.js** and **npm** installed on your machine.\\n- **API Keys** for the following services:\\n  - Clerk\\n  - MongoDB Atlas\\n  - YouTube Data API v3\\n  - Groq API (for Meta LLaMA3 70B LLM model)\\n  - Piston API\\n\\n### Steps\\n\\n1. **Clone the Repository**\\n\\n   ```bash\\n   git clone https://github.com/takitajwar17/inherit-ewu-hackathon-xtradrill.git\\n   cd inherit-ewu-hackathon-xtradrill\\n   ```\\n\\n2. **Install Dependencies**\\n\\n   ```bash\\n   npm install\\n   ```\\n\\n3. **Set Up Environment Variables**\\n\\n   Create a `.env` file in the root directory and fill it with the following variables:\\n\\n   ```env\\n   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\\n   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\\n   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard\\n   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard\\n   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key\\n\\n   CLERK_SECRET_KEY=your_clerk_secret_key\\n\\n   WEBHOOK_SECRET=your_webhook_secret\\n\\n   MONGODB_URI=your_mongodb_uri\\n\\n   GROQ_API_KEY=your_groq_api_key\\n   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key\\n\\n   NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3000\\n   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000\\n   ```\\n\\n   Replace `your_*` with your actual API keys and URIs.\\n\\n4. **Run the Development Server**\\n\\n   ```bash\\n   npm run dev\\n   ```\\n\\n   The application should now be running on `http://localhost:3000`.\\n\\n---\\n\\n## Usage Guide\\n\\n### Accessing the Platform\\n\\n1. **Sign Up / Sign In**\\n\\n   - Navigate to `/sign-up` to create a new account or `/sign-in` to log in.\\n   - Authentication is managed by Clerk.\\n\\n2. **Learn Page**\\n\\n   - Access a curated list of coding tutorials.\\n   - Use the search functionality to find specific topics.\\n\\n3. **Video Page**\\n\\n   - Watch embedded YouTube tutorials.\\n   - Practice coding in the adjacent code editor.\\n   - Save notes for future reference.\\n\\n4. **Playground**\\n\\n   - Create new coding sessions.\\n   - Collaborate in real-time with other users.\\n   - Save and manage your sessions.\\n\\n5. **DevDiscuss**\\n\\n   - Ask questions or share knowledge in the community forum.\\n   - Receive answers from peers or AI-generated responses.\\n\\n6. **AI Features**\\n\\n   - Utilize AI-powered code review within the code editor.\\n   - Get instant AI-generated answers in the discussion forum.\\n\\n---\\n\\n## Additional Notes\\n\\n### Live Deployment\\n\\nThe platform is live at [https://inherit-ewu-hackathon-xtra-drill.vercel.app](https://inherit-ewu-hackathon-xtra-drill.vercel.app).\\n\\n- **Limitations**:\\n  - The **socket part doesn't work** in the live link as Vercel doesn't support WebSocket connections.\\n  - The **YouTube API** has a limited number of free usage per day.\\n  - The website has some bugs; we are actively working on fixing them.\\n- **Recommendation**: It is recommended to run the project locally with your own API keys for full functionality.\\n\\n### Future Work\\n\\n- Fixing existing bugs and improving stability.\\n- Enhancing AI features for better personalization.\\n- Seeking partnerships with educational institutions and NGOs.\\n\\n---\\n\\nThank you for your interest in **Inherit**.\\n", "primaryLanguage": "JavaScript"}, {"id": "github-882990737", "url": "https://github.com/takitajwar17/evently", "dates": {"pushed": "2025-02-22T14:17:51Z", "created": "2024-11-04T07:21:33Z", "updated": "2025-03-21T01:43:41Z"}, "title": "evently", "isFork": false, "topics": [], "demoUrl": "https://evently-mu-henna.vercel.app", "license": "MIT License", "metrics": {"size": 3897, "forks": 0, "stars": 1, "watchers": 1, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/evently", "isPrivate": false, "isArchived": false, "description": "A full-stack event management platform built with Next.js 14, leveraging Server Actions for real-time operations, Clerk authentication, and MongoDB with Mongoose for data persistence.", "technologies": ["TypeScript", "CSS", "JavaScript"], "defaultBranch": "main", "languageStats": {"CSS": 5861, "JavaScript": 472, "TypeScript": 157381}, "fullDescription": "# Evently 🎉\\n\\nA modern event management platform built with Next.js 14, featuring real-time event creation, ticket management, and social interactions.\\n\\n## Features 🚀\\n\\n- **Authentication** - Secure user authentication powered by Clerk\\n- **Event Management** - Create, update, and delete events\\n- **Ticket System** - Generate and manage event tickets with QR codes\\n- **Payment Integration** - Seamless payment processing with Stripe\\n- **Comments & Social** - Rich commenting system with mentions and nested replies (up to 6 levels)\\n- **Real-time Updates** - Instant updates using Next.js server actions\\n- **Responsive Design** - Beautiful UI built with Tailwind CSS and Shadcn UI\\n- **File Upload** - Image upload functionality with uploadthing\\n- **Form Handling** - Robust form management with React Hook Form and Zod validation\\n- **Report Generation** - Comprehensive event reports for organizers with analytics\\n- **Ticket Management** - Download and share tickets in PDF format with QR codes\\n\\n## Tech Stack 💻\\n\\n- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)\\n- **Language**: TypeScript\\n- **Auth**: [Clerk](https://clerk.dev/)\\n- **Database**: MongoDB with Mongoose\\n- **Styling**: [Tailwind CSS](https://tailwindcss.com/)\\n- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)\\n- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)\\n- **Payments**: [Stripe](https://stripe.com/)\\n- **File Upload**: [uploadthing](https://uploadthing.com/)\\n- **QR Code**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)\\n- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)\\n\\n## Getting Started 🏁\\n\\n### Prerequisites\\n\\n- Node.js 18+\\n- MongoDB database\\n- Clerk account\\n- Stripe account\\n- Uploadthing account\\n\\n### Installation\\n\\n1. Clone the repository:\\n\\n```bash\\ngit clone https://github.com/takitajwar17/evently.git\\ncd evently\\n```\\n\\n2. Install dependencies:\\n\\n```bash\\nnpm install\\n```\\n\\n3. Set up environment variables:\\n   Create a `.env` file in the root directory with the following variables:\\n\\n```env\\n# Next.js\\nNEXT_PUBLIC_SERVER_URL=http://localhost:3000/\\n\\n# Clerk Authentication\\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key\\nCLERK_SECRET_KEY=your_secret_key\\nWEBHOOK_SECRET=your_webhook_secret\\n\\nNEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\\nNEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/\\n\\n# MongoDB\\nMONGODB_URI=your_mongodb_connection_string\\n\\n# Uploadthing\\nUPLOADTHING_SECRET=your_uploadthing_secret\\nUPLOADTHING_APP_ID=your_uploadthing_app_id\\n\\n# Stripe\\nSTRIPE_SECRET_KEY=your_stripe_secret_key\\nSTRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret\\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key\\n```\\n\\n> ⚠️ Never commit the `.env` file with real credentials. Make sure it's included in your `.gitignore`.\\n\\n4. Run the development server:\\n\\n```bash\\nnpm run dev\\n```\\n\\n5. Open [http://localhost:3000](http://localhost:3000) in your browser.\\n\\n## Project Structure 📁\\n\\n```\\nevently/\\n├── app/                   # Next.js app router pages\\n├── components/\\n│   ├── shared/           # Reusable components\\n│   └── ui/               # UI components (shadcn)\\n├── lib/\\n│   ├── actions/          # Server actions\\n│   ├── database/         # Database models and config\\n│   └── utils/            # Utility functions\\n├── public/               # Static assets\\n└── types/                # TypeScript type definitions\\n```\\n\\n## License 📝\\n\\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\\n\\n### Thank you 🙏\\n", "primaryLanguage": "TypeScript"}, {"id": "github-826262802", "url": "https://github.com/takitajwar17/CookConnect", "dates": {"pushed": "2024-07-11T19:19:42Z", "created": "2024-07-09T11:20:53Z", "updated": "2025-03-11T15:20:47Z"}, "title": "CookConnect", "isFork": false, "topics": ["aws", "cloudfront-distribution", "custom-vpc", "django-rest-framework", "ec2-instance", "react-vite", "s3-bucket"], "demoUrl": null, "license": null, "metrics": {"size": 24250, "forks": 0, "stars": 1, "watchers": 1, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/CookConnect", "isPrivate": false, "isArchived": false, "description": "CookConnect is a React.js and Django-based web app for discovering, sharing, and managing recipes, deployed on AWS. It leverages AWS S3 for storage, EC2 for hosting, CloudFront for content delivery, a custom VPC for networking, and PostgreSQL as the database. Built using Django REST Framework and React Vite.", "technologies": ["Python", "HTML", "JavaScript", "CSS", "PowerShell", "Batchfile"], "defaultBranch": "main", "languageStats": {"CSS": 122234, "HTML": 203789, "Python": 12333261, "Batchfile": 1362, "JavaScript": 161307, "PowerShell": 25697}, "fullDescription": "# CookConnect Documentation\\r\\n\\r\\n### Overview\\r\\nCookConnect is a web application designed for food enthusiasts to discover, share, and manage their favorite recipes. The platform features a user-friendly interface built with React.js and a robust backend powered by Django. It is deployed on AWS for scalability and reliability.\\r\\n\\r\\n### Tech Stack\\r\\n- **Frontend:** React.js, HTML, CSS, Material-UI\\r\\n- **Backend:** Django, Django REST Framework\\r\\n- **Database:** PostgreSQL\\r\\n- **Deployment:** AWS S3, AWS EC2, AWS CloudFront, Custom VPC\\r\\n\\r\\n### Features\\r\\n1. **Recipe List:** View a list of all recipes with basic information.\\r\\n2. **Recipe Detail:** Detailed view of selected recipes, including ingredients, steps, and user comments.\\r\\n3. **Add Recipe:** Form to add new recipes with title, ingredients, steps, category, and photo upload.\\r\\n4. **Recipe Search:** Search for recipes by name, category, or ingredients.\\r\\n\\r\\n### API Endpoints\\r\\n- **GET /recipe:** Fetch all recipes.\\r\\n- **POST /recipe:** Add a new recipe.\\r\\n- **GET /recipe/{id}:** Fetch details of a specific recipe.\\r\\n- **PUT /recipe/{id}:** Update a specific recipe.\\r\\n- **DELETE /recipe/{id}:** Delete a specific recipe.\\r\\n\\r\\n", "primaryLanguage": "Python"}, {"id": "github-573772991", "url": "https://github.com/takitajwar17/takitajwar17", "dates": {"pushed": "2025-07-14T10:23:50Z", "created": "2022-12-03T11:42:52Z", "updated": "2025-07-14T10:23:53Z"}, "title": "takitajwar17", "isFork": false, "topics": ["config", "github-config"], "demoUrl": "https://github.com/TakiTajwar17", "license": null, "metrics": {"size": 291, "forks": 1, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/takitajwar17", "isPrivate": false, "isArchived": false, "description": "Config files for my GitHub profile.", "technologies": [], "defaultBranch": "main", "languageStats": {}, "fullDescription": "<h1 align=\\"center\\">Hi there! <img src=\\"https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif\\" width=\\"32\\"> I'm Taki Tajwaruzzaman Khan</h1>\\n\\n<div align=\\"center\\">\\n  <img src=\\"https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=4000&pause=1000&color=6F9EE8&center=true&vCenter=true&random=false&width=435&lines=Product+Engineer;Full+Stack+Developer;Software+Engineer\\" alt=\\"Typing SVG\\" />\\n</div>\\n\\n<div align=\\"center\\">\\n  <a href=\\"https://linkedin.com/in/takitajwar17\\"><img src=\\"https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white\\" alt=\\"LinkedIn\\"/></a>\\n  <a href=\\"https://twitter.com/takitajwar17\\"><img src=\\"https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white\\" alt=\\"Twitter\\"/></a>\\n  <a href=\\"https://medium.com/@takitajwar17\\"><img src=\\"https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white\\" alt=\\"Medium\\"/></a>\\n  <a href=\\"mailto:tajwaruzzaman@iut-dhaka.edu\\"><img src=\\"https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white\\" alt=\\"Email\\"/></a>\\n  <img src=\\"https://komarev.com/ghpvc/?username=takitajwar17&style=for-the-badge&color=6F9EE8\\" alt=\\"Profile Views\\"/>\\n</div>\\n\\n<div style=\\"position: relative;\\">\\n  <img align=\\"right\\" alt=\\"Coding\\" width=\\"300\\" style=\\"position: absolute; right: 0; top: 0; z-index: 999;\\" src=\\"https://media.tenor.com/2uyENRmiUt0AAAAd/coding.gif\\">\\n\\n### 🚀 About Me\\n\\n- 🚀 Currently collaborating on **SaaS & AI applications** with **30+ projects** experience across diverse domains.\\n- 🏢 Former **Product Engineer** at [Booked For You](https://bookedforyou.com).\\n- 🔭 Passionate about **Full Stack Development & Cloud Technologies**\\n- 🌱 Currently exploring **AI Engineering and Ops**\\n- 📝 I sometimes write articles on [Medium](https://medium.com/@takitajwar17)\\n  \\n</div>\\n\\n<br>\\n\\n## 💬 What Clients Say\\n\\n<div align=\\"center\\">\\n  <table style=\\"width: 100%;\\">\\n    <tr>\\n      <td align=\\"center\\" width=\\"50%\\">\\n        <img src=\\"Razvan Onisca Romania.png\\" alt=\\"Client Review\\" width=\\"450\\" style=\\"border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\\"/>\\n        <br>\\n        <sub><i>\\"Taki, you are godsent. I can wait as long as its needed. Been struggling with this for two weeks now.\\"</i><br><strong>- Razvan Onisca, Romania</strong></sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"50%\\">\\n        <img src=\\"Elijah Rienks Canada.png\\" alt=\\"Client Review\\" width=\\"450\\" style=\\"border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);\\"/>\\n        <br>\\n        <sub><i>\\"I found it funny that you are one of the only people I messaged and you are up there too, killing it man good job!\\"</i><br><strong>- Elijah Rienks, Canada</strong></sub>\\n      </td>\\n    </tr>\\n  </table>\\n</div>\\n\\n## 🏆 Recent Achievements\\n\\n<div align=\\"center\\">\\n  <table style=\\"width: 100%;\\">\\n    <tr>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Best Overall App</strong>\\n        <br />\\n        <span>Convex Top Chef International</span>\\n        <br />\\n        <sub>May 2025, USA</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Level up 1st Place</strong>\\n        <br />\\n        <span>Outlier AI Level Up International</span>\\n        <br />\\n        <sub>May 2025, USA</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Global 4th & National Champion</strong>\\n        <br />\\n        <span>PLEASE Hack - South Asia</span>\\n        <br />\\n        <sub>Apr. 2025, Sri Lanka</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Champion</strong>\\n        <br />\\n        <span>HackNSU 2025</span>\\n        <br />\\n        <sub>NSU ACM SC - HackNSU Season 5 (Mar. 2025)</sub>\\n      </td>\\n    </tr>\\n    <tr>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Champion</strong>\\n        <br />\\n        <span>AI and API Hackathon</span>\\n        <br />\\n        <sub>KUET CSE BitFest 2025 (Jan. 2025)</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Champion</strong>\\n        <br />\\n        <span>Data Hackathon</span>\\n        <br />\\n        <sub>4th DIU Data Science Summit 2024 (Dec. 2024)</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>Champion</strong>\\n        <br />\\n        <span>Dhaka Divisional Hackathon</span>\\n        <br />\\n        <sub>Technocrats V.2 (Dec. 2024)</sub>\\n      </td>\\n      <td align=\\"center\\" width=\\"25%\\">\\n        <img src=\\"https://img.icons8.com/color/48/000000/trophy.png\\" width=\\"30\\"/>\\n        <br />\\n        <strong>1st Runner-Up</strong>\\n        <br />\\n        <span>Programming Hero National Hackathon</span>\\n        <br />\\n        <sub>EWU RoboFest (Nov. 2024)</sub>\\n      </td>\\n    </tr>\\n  </table>\\n</div>\\n\\n## 🛠️ Tech Stack\\n\\n<details open>\\n<summary>Programming Languages</summary>\\n<br>\\n\\n![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)\\n![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)\\n![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)\\n![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)\\n![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)\\n![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)\\n</details>\\n\\n<details open>\\n<summary>Frontend Development</summary>\\n<br>\\n\\n![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)\\n![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)\\n![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)\\n![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)\\n</details>\\n\\n<details open>\\n<summary>Backend & Cloud</summary>\\n<br>\\n\\n![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)\\n![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)\\n![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)\\n![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)\\n</details>\\n\\n<details open>\\n<summary>Database & Tools</summary>\\n<br>\\n\\n![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)\\n![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)\\n![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)\\n![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)\\n![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)\\n</details>\\n\\n## 📊 GitHub Stats\\n\\n\\n<p align=\\"center\\" width=\\"100%\\">\\n  <img align=\\"left\\" src=\\"https://github-readme-stats.vercel.app/api/top-langs?username=takitajwar17&show_icons=true&layout=compact&hide_progress=true&theme=tokyonight\\" alt=\\"takitajwar17\\" width=\\"44%\\">\\n</p>\\n<p>\\n  <a href=\\"https://github.com/takitajwar17\\">\\n    <img width=\\"52%\\" src=\\"https://github-readme-streak-stats.herokuapp.com/?user=takitajwar17&theme=tokyonight\\">\\n  </a>\\n</p>\\n\\n[![Taki's GitHub Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=takitajwar17&theme=tokyo-night)](https://github.com/ashutosh00710/github-readme-activity-graph)\\n\\n---\\n\\n<div align=\\"center\\">\\n  <i>Let's connect and build something amazing together!</i>\\n  <br>\\n  <a href=\\"https://github.com/takitajwar17?tab=repositories\\">Check out my repositories</a>\\n</div>\\n", "primaryLanguage": null}, {"id": "github-1006447822", "url": "https://github.com/takitajwar17/Problem-3-Handwritten-Digit-Generation-Web-App-", "dates": {"pushed": "2025-06-22T10:50:16Z", "created": "2025-06-22T09:43:50Z", "updated": "2025-06-23T20:21:47Z"}, "title": "Problem-3-Handwritten-Digit-Generation-Web-App-", "isFork": false, "topics": [], "demoUrl": "https://problem-3-handwritten-digit-generation-web-app.streamlit.app/", "license": null, "metrics": {"size": 25241, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/Problem-3-Handwritten-Digit-Generation-Web-App-", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["Python"], "defaultBranch": "main", "languageStats": {"Python": 19007}, "fullDescription": "# 🤖 MNIST Handwritten Digit Generator\\n\\nA web application that generates realistic handwritten digits using a Variational Autoencoder (VAE) trained on the MNIST dataset.\\n\\n## ✨ Features\\n\\n- **AI-Powered Generation**: Uses a trained VAE model to generate realistic handwritten digits\\n- **Digit-Specific Patterns**: Extracts and uses digit-specific latent patterns for better quality\\n- **Interactive Web Interface**: Clean, user-friendly Streamlit interface\\n- **Download Capability**: Download generated images as PNG files\\n- **Real-time Generation**: Generate 5 variations of any digit (0-9) instantly\\n\\n## 🚀 Live Demo\\n\\n[View the deployed app here](https://your-app-url.streamlit.app) _(Replace with actual deployment URL)_\\n\\n## 📁 Project Structure\\n\\n```\\n├── app.py                    # Main Streamlit application\\n├── extract_patterns.py       # Script to extract digit-specific patterns\\n├── mnist_vae_model.pth       # Pre-trained VAE model weights\\n├── digit_patterns.json       # Extracted digit patterns (generated)\\n├── requirements.txt          # Python dependencies\\n├── .streamlit/config.toml    # Streamlit configuration\\n└── README.md                 # This file\\n```\\n\\n## 🛠️ Local Setup\\n\\n### Prerequisites\\n- Python 3.8+\\n- pip\\n\\n### Installation\\n\\n1. **Clone the repository**\\n   ```bash\\n   git clone <your-repo-url>\\n   cd Problem-3-Handwritten-Digit-Generation-Web-App-\\n   ```\\n\\n2. **Install dependencies**\\n   ```bash\\n   pip install -r requirements.txt\\n   ```\\n\\n3. **Extract digit patterns** (if not already done)\\n   ```bash\\n   python extract_patterns.py\\n   ```\\n\\n4. **Run the application**\\n   ```bash\\n   streamlit run app.py\\n   ```\\n\\n5. **Open your browser** and navigate to `http://localhost:8501`\\n\\n## 🌐 Deployment Options\\n\\n### Option 1: Streamlit Cloud (Recommended)\\n1. Push your code to GitHub\\n2. Visit [share.streamlit.io](https://share.streamlit.io)\\n3. Connect your GitHub repository\\n4. Deploy with one click!\\n\\n### Option 2: Railway\\n1. Push to GitHub\\n2. Visit [railway.app](https://railway.app)\\n3. Connect repository and deploy\\n\\n### Option 3: Render\\n1. Push to GitHub\\n2. Visit [render.com](https://render.com)\\n3. Create new web service from repository\\n\\n### Option 4: Heroku\\n1. Install Heroku CLI\\n2. Create `Procfile`: `web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0`\\n3. Deploy to Heroku\\n\\n## 🧠 Model Architecture\\n\\nThe application uses a Variational Autoencoder (VAE) with:\\n- **Encoder**: 784 → 400 → 20 (latent dimensions)\\n- **Decoder**: 20 → 400 → 784\\n- **Latent Space**: 20-dimensional for efficient representation\\n- **Training**: MNIST dataset (60,000 training images)\\n\\n## 📊 How It Works\\n\\n1. **Pattern Extraction**: `extract_patterns.py` analyzes the trained model and extracts digit-specific latent patterns\\n2. **Generation Process**: For each digit, the app samples from the learned latent distribution\\n3. **Decoding**: The VAE decoder converts latent vectors back to 28×28 pixel images\\n4. **Display**: Generated images are displayed in the web interface\\n\\n## 🔧 Configuration\\n\\nThe app includes several configurations in `.streamlit/config.toml`:\\n- Optimized for web deployment\\n- Custom theme colors\\n- Performance settings\\n\\n## 📝 Dependencies\\n\\n- `streamlit>=1.28.0` - Web framework\\n- `torch>=2.0.0` - PyTorch for model inference\\n- `torchvision>=0.15.0` - Computer vision utilities\\n- `numpy>=1.21.0` - Numerical computations\\n- `matplotlib>=3.5.0` - Plotting and visualization\\n- `Pillow>=9.0.0` - Image processing\\n\\n## 🐛 Common Issues\\n\\n### OpenMP Runtime Error\\nIf you encounter OpenMP initialization errors:\\n- The app automatically sets `KMP_DUPLICATE_LIB_OK=TRUE`\\n- This is a known issue with PyTorch on Windows\\n\\n### Model File Size\\n- The model file (`mnist_vae_model.pth`) is ~1MB\\n- Most deployment platforms support this size\\n- For GitHub, ensure Git LFS is configured if needed\\n\\n## 🤝 Contributing\\n\\n1. Fork the repository\\n2. Create a feature branch\\n3. Make your changes\\n4. Submit a pull request\\n\\n## 📄 License\\n\\nThis project is open source and available under the [MIT License](LICENSE).\\n\\n## 👨‍💻 Author\\n\\nBuilt with ❤️ using PyTorch and Streamlit\\n\\n---\\n\\n**Note**: Make sure to run `extract_patterns.py` before deploying to generate the `digit_patterns.json` file required for optimal digit generation. ", "primaryLanguage": "Python"}, {"id": "github-998555426", "url": "https://github.com/takitajwar17/A17.chat", "dates": {"pushed": "2025-06-15T11:11:11Z", "created": "2025-06-08T21:23:19Z", "updated": "2025-06-15T11:11:15Z"}, "title": "A17.chat", "isFork": false, "topics": [], "demoUrl": "https://www.a17.chat", "license": null, "metrics": {"size": 556, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/A17.chat", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["TypeScript", "JavaScript", "CSS"], "defaultBranch": "main", "languageStats": {"CSS": 4164, "JavaScript": 13302, "TypeScript": 408285}, "fullDescription": "# A17 Chat", "primaryLanguage": "TypeScript"}, {"id": "github-982908398", "url": "https://github.com/takitajwar17/inherit-algoarena", "dates": {"pushed": "2025-05-18T18:45:25Z", "created": "2025-05-13T15:25:01Z", "updated": "2025-06-04T05:27:58Z"}, "title": "inherit-algoarena", "isFork": false, "topics": [], "demoUrl": "https://inherit-xtradrill.vercel.app/", "license": "GNU General Public License v3.0", "metrics": {"size": 3559, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/inherit-algoarena", "isPrivate": false, "isArchived": false, "description": "Inherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers.", "technologies": ["TypeScript", "CSS", "HTML"], "defaultBranch": "main", "languageStats": {"CSS": 3455, "HTML": 354, "TypeScript": 62985}, "fullDescription": "# Inherit - AI-Powered Personalized Coding Education Platform\\n\\nInherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers. Named after Aristotle's ancient school, Inherit combines traditional learning principles with modern technology to create an engaging educational journey.\\n![image](https://github.com/user-attachments/assets/7a77c43c-1c3f-4df2-ab9a-e219304dce8f)\\n\\n## 🚀 Features\\n\\n### Learning Platform\\n\\n- Curated educational videos from top programming channels\\n- Video search functionality\\n- Organized learning materials by topic\\n- Interactive video lessons with detailed descriptions\\n\\n#### Learning Platform Flow:\\n\\n1. Browse curated videos\\n   ![image](https://github.com/user-attachments/assets/f6b93293-bc01-42be-b539-41d884887614)\\n\\n2. View a video:\\n   ![image](https://github.com/user-attachments/assets/9b63ccf2-50a2-4b81-b538-8ff8473fa7f7)\\n\\n3. Run Code:\\n   ![image](https://github.com/user-attachments/assets/bbaf050c-3c4e-4e27-b39d-0e974f2d0f0d)\\n\\n4. Get Review:\\n   ![image](https://github.com/user-attachments/assets/43829586-e45e-4c3b-a980-2fef6c2fa590)\\n\\n### Roadmaps\\n\\n- AI-powered learning path generation\\n- Custom roadmap creation based on your goals\\n- Progress tracking for each roadmap\\n- Detailed step-by-step guidance\\n- Share and explore community roadmaps\\n\\n#### Roadmap Creation Flow:\\n\\n1. Create custom roadmap\\n   ![image](https://github.com/user-attachments/assets/70152519-4bb0-475a-bf7b-1aedf5980330)\\n\\n2. View generated roadmap\\n   ![image](https://github.com/user-attachments/assets/d8ba1523-7694-4aae-8bcb-f4339e8477b3)\\n\\n3. Track your progress\\n   ![image](https://github.com/user-attachments/assets/03a09c4c-35ad-4e83-a48a-b4853e264303)\\n\\n### Quest System\\n\\n- Time-based coding challenges\\n- Categorized quests (Upcoming, Active, Past)\\n- Real-time quest status tracking\\n- Detailed quest descriptions and requirements\\n- Quest completion tracking\\n\\n#### Quest System Flow:\\n\\n1. Browse available quests\\n   ![image](https://github.com/user-attachments/assets/6506f188-fba9-4793-b367-e8713fdbef99)\\n\\n2. View quest details\\n   ![WhatsApp Image 2024-12-06 at 17 23 06_2af1fdc2](https://github.com/user-attachments/assets/2e91ff0f-1fa6-476e-9b9c-a8da88f8fae2)\\n\\n3. Track quest marks\\n   ![image](https://github.com/user-attachments/assets/7207e281-bd75-4585-8663-a98f4e9f9a70)\\n\\n4. Track quest evaluation\\n   ![image](https://github.com/user-attachments/assets/4b01d1c2-9745-4384-b4d8-c343e3d985fa)\\n\\n### AI Assistant (Future Scope)\\n\\n- Intelligent learning support\\n- Code explanation and debugging help\\n- Personalized learning recommendations\\n- Interactive problem-solving guidance\\n- Quick answers to programming questions\\n\\n### Authentication\\n\\n- Secure user authentication powered by Clerk\\n- User profile management\\n- Role-based access control\\n- Secure session handling\\n- Social login integration\\n\\n#### Authentication Flow:\\n\\n![image](https://github.com/user-attachments/assets/f820978b-8b7b-473a-b317-a7869b868d5f)\\n\\n## 📁 Project Structure\\n\\n```\\n├── app/\\n│   ├── admin/         # Admin panel components\\n│   ├── api/          # API routes\\n│   ├── components/   # Reusable UI components\\n│   ├── dashboard/    # User dashboard\\n│   ├── learn/        # Learning platform\\n│   ├── quests/       # Quest system\\n│   ├── roadmaps/     # Learning roadmaps\\n│   └── layout.jsx    # Root layout component\\n├── lib/             # Utility functions and actions\\n├── public/          # Static assets\\n└── components/      # Shared components\\n```\\n\\n## 🛠️ Tech Stack\\n\\n- **Framework**: Next.js 14\\n- **Authentication**: Clerk\\n- **Styling**: Tailwind CSS\\n- **UI Components**:\\n  - Radix UI\\n  - Chakra UI\\n  - Framer Motion\\n- **Database**: MongoDB with Mongoose\\n- **Code Editor**: Monaco Editor\\n- **Markdown**: React Markdown with GFM\\n- **Analytics**: Vercel Analytics & Speed Insights\\n- **AI Services**: Groq AI, Plagiarism Check, OpenAI\\n\\n## 🚦 Getting Started\\n\\n1. **Clone the repository**\\n\\n```bash\\ngit clone https://github.com/takitajwar17/inherit.git\\n```\\n\\n2. **Install dependencies**\\n\\n```bash\\nnpm install\\n```\\n\\n3. **Set up environment variables**\\n   Create a `.env.local` file with the following variables:\\n\\n```env\\n# Clerk Authentication\\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key\\nCLERK_SECRET_KEY=your_clerk_secret_key\\nWEBHOOK_SECRET=your_webhook_secret\\n\\n# MongoDB\\nMONGODB_URI=your_mongodb_uri\\n\\n# AI Services\\nGROQ_API_KEY=your_groq_api_key\\nPLAGIARISM_CHECK_API_KEY=your_plagiarism_check_api_key\\n\\n# URLs\\nNEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3000\\nNEXT_PUBLIC_FRONTEND_URL=http://localhost:3000\\n\\n# Clerk Redirect URLs\\nNEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\\nNEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard\\n\\n# YouTube API\\nNEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key\\n```\\n\\nYou can find an example in the `.env.example` file. Make sure to replace all placeholder values with your actual API keys and credentials.\\n\\n4. **Run the development server**\\n\\n```bash\\nnpm run dev\\n```\\n\\n5. **Build for production**\\n\\n```bash\\nnpm run build\\n```\\n\\n## 📝 Scripts\\n\\n- `npm run dev` - Start development server\\n- `npm run build` - Build for production\\n- `npm start` - Start production server\\n- `npm run lint` - Run ESLint\\n\\n## 📜 License\\n\\nThis project is licensed under the MIT License.\\n", "primaryLanguage": "TypeScript"}, {"id": "github-993825177", "url": "https://github.com/takitajwar17/menoo", "dates": {"pushed": "2025-05-31T17:21:24Z", "created": "2025-05-31T15:51:29Z", "updated": "2025-05-31T17:21:27Z"}, "title": "menoo", "isFork": false, "topics": [], "demoUrl": null, "license": "MIT License", "metrics": {"size": 234, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/menoo", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["TypeScript"], "defaultBranch": "main", "languageStats": {"TypeScript": 120500}, "fullDescription": "# Menoo - Restaurant Management App\\n\\nA modern restaurant management application built with React Native and Expo, designed to help restaurant owners and staff manage their operations efficiently.\\n\\n## Features\\n\\n- 📱 Cross-platform support (iOS, Android, Web)\\n- 🎨 Beautiful, modern UI with smooth animations\\n- 🔒 Secure QR code generation for tables\\n- 📊 Real-time analytics and reporting\\n- 🍽️ Menu management system\\n- 🎯 Table management with status tracking\\n- 📋 Order management system\\n\\n## Tech Stack\\n\\n- React Native\\n- Expo Router\\n- TypeScript\\n- Lucide Icons\\n- Expo Google Fonts\\n- React Native Reanimated\\n- React Native Gesture Handler\\n\\n## Getting Started\\n\\n### Prerequisites\\n\\n- Node.js (v18 or newer)\\n- npm or yarn\\n- Expo CLI\\n\\n### Installation\\n\\n1. Clone the repository:\\n   ```bash\\n   git clone https://github.com/yourusername/menoo-restaurant-app.git\\n   ```\\n\\n2. Install dependencies:\\n   ```bash\\n   npm install\\n   ```\\n\\n3. Start the development server:\\n   ```bash\\n   npm run dev\\n   ```\\n\\n## Project Structure\\n\\n```\\napp/\\n├── _layout.tsx              # Root layout\\n├── +not-found.tsx          # 404 page\\n├── index.tsx               # Entry point\\n├── (tabs)/                 # Tab navigation\\n│   ├── _layout.tsx         # Tab layout\\n│   ├── index.tsx           # Dashboard\\n│   ├── menus.tsx          # Menu management\\n│   ├── orders.tsx         # Order management\\n│   ├── tables.tsx         # Table management\\n│   ├── analytics.tsx      # Analytics\\n│   └── settings.tsx       # Settings\\n├── menu/                   # Menu routes\\n│   └── [id].tsx           # Menu details\\n├── qr-scanner.tsx         # QR Scanner\\n└── qr-generator.tsx       # QR Generator\\n\\ncomponents/               # Reusable components\\n├── analytics/           # Analytics components\\n├── dashboard/          # Dashboard components\\n├── menus/             # Menu components\\n├── orders/           # Order components\\n└── ui/              # UI components\\n```\\n\\n## Contributing\\n\\n1. Fork the repository\\n2. Create your feature branch (`git checkout -b feature/AmazingFeature`)\\n3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)\\n4. Push to the branch (`git push origin feature/AmazingFeature`)\\n5. Open a Pull Request\\n\\n## License\\n\\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.", "primaryLanguage": "TypeScript"}, {"id": "github-878567042", "url": "https://github.com/takitajwar17/inherit", "dates": {"pushed": "2025-03-18T22:57:29Z", "created": "2024-10-25T16:20:13Z", "updated": "2025-05-26T04:41:47Z"}, "title": "inherit", "isFork": false, "topics": [], "demoUrl": "https://inherit-xtradrill.vercel.app", "license": "GNU General Public License v3.0", "metrics": {"size": 3921, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/inherit", "isPrivate": false, "isArchived": false, "description": "Inherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers. ", "technologies": ["JavaScript", "CSS"], "defaultBranch": "main", "languageStats": {"CSS": 4168, "JavaScript": 593766}, "fullDescription": "# Inherit - AI-Powered Personalized Coding Education Platform\\n\\nInherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers. Named after Aristotle's ancient school, Inherit combines traditional learning principles with modern technology to create an engaging educational journey.\\n![image](https://github.com/user-attachments/assets/7a77c43c-1c3f-4df2-ab9a-e219304dce8f)\\n\\n## 🚀 Features\\n\\n### Learning Platform\\n\\n- Curated educational videos from top programming channels\\n- Video search functionality\\n- Organized learning materials by topic\\n- Interactive video lessons with detailed descriptions\\n\\n#### Learning Platform Flow:\\n\\n1. Browse curated videos\\n   ![image](https://github.com/user-attachments/assets/f6b93293-bc01-42be-b539-41d884887614)\\n\\n2. View a video:\\n   ![image](https://github.com/user-attachments/assets/9b63ccf2-50a2-4b81-b538-8ff8473fa7f7)\\n\\n3. Run Code:\\n   ![image](https://github.com/user-attachments/assets/bbaf050c-3c4e-4e27-b39d-0e974f2d0f0d)\\n\\n4. Get Review:\\n   ![image](https://github.com/user-attachments/assets/43829586-e45e-4c3b-a980-2fef6c2fa590)\\n\\n### Roadmaps\\n\\n- AI-powered learning path generation\\n- Custom roadmap creation based on your goals\\n- Progress tracking for each roadmap\\n- Detailed step-by-step guidance\\n- Share and explore community roadmaps\\n\\n#### Roadmap Creation Flow:\\n\\n1. Create custom roadmap\\n   ![image](https://github.com/user-attachments/assets/70152519-4bb0-475a-bf7b-1aedf5980330)\\n\\n2. View generated roadmap\\n   ![image](https://github.com/user-attachments/assets/d8ba1523-7694-4aae-8bcb-f4339e8477b3)\\n\\n3. Track your progress\\n   ![image](https://github.com/user-attachments/assets/03a09c4c-35ad-4e83-a48a-b4853e264303)\\n\\n### Quest System\\n\\n- Time-based coding challenges\\n- Categorized quests (Upcoming, Active, Past)\\n- Real-time quest status tracking\\n- Detailed quest descriptions and requirements\\n- Quest completion tracking\\n\\n#### Quest System Flow:\\n\\n1. Browse available quests\\n   ![image](https://github.com/user-attachments/assets/6506f188-fba9-4793-b367-e8713fdbef99)\\n\\n2. View quest details\\n   ![WhatsApp Image 2024-12-06 at 17 23 06_2af1fdc2](https://github.com/user-attachments/assets/2e91ff0f-1fa6-476e-9b9c-a8da88f8fae2)\\n\\n3. Track quest marks\\n   ![image](https://github.com/user-attachments/assets/7207e281-bd75-4585-8663-a98f4e9f9a70)\\n\\n4. Track quest evaluation\\n   ![image](https://github.com/user-attachments/assets/4b01d1c2-9745-4384-b4d8-c343e3d985fa)\\n\\n### AI Assistant (Future Scope)\\n\\n- Intelligent learning support\\n- Code explanation and debugging help\\n- Personalized learning recommendations\\n- Interactive problem-solving guidance\\n- Quick answers to programming questions\\n\\n### Authentication\\n\\n- Secure user authentication powered by Clerk\\n- User profile management\\n- Role-based access control\\n- Secure session handling\\n- Social login integration\\n\\n#### Authentication Flow:\\n\\n![image](https://github.com/user-attachments/assets/f820978b-8b7b-473a-b317-a7869b868d5f)\\n\\n## 📁 Project Structure\\n\\n```\\n├── app/\\n│   ├── admin/         # Admin panel components\\n│   ├── api/          # API routes\\n│   ├── components/   # Reusable UI components\\n│   ├── dashboard/    # User dashboard\\n│   ├── learn/        # Learning platform\\n│   ├── quests/       # Quest system\\n│   ├── roadmaps/     # Learning roadmaps\\n│   └── layout.jsx    # Root layout component\\n├── lib/             # Utility functions and actions\\n├── public/          # Static assets\\n└── components/      # Shared components\\n```\\n\\n## 🛠️ Tech Stack\\n\\n- **Framework**: Next.js 14\\n- **Authentication**: Clerk\\n- **Styling**: Tailwind CSS\\n- **UI Components**:\\n  - Radix UI\\n  - Chakra UI\\n  - Framer Motion\\n- **Database**: MongoDB with Mongoose\\n- **Code Editor**: Monaco Editor\\n- **Markdown**: React Markdown with GFM\\n- **Analytics**: Vercel Analytics & Speed Insights\\n- **AI Services**: Groq AI, Plagiarism Check, OpenAI\\n\\n## 🚦 Getting Started\\n\\n1. **Clone the repository**\\n\\n```bash\\ngit clone https://github.com/takitajwar17/inherit.git\\n```\\n\\n2. **Install dependencies**\\n\\n```bash\\nnpm install\\n```\\n\\n3. **Set up environment variables**\\n   Create a `.env.local` file with the following variables:\\n\\n```env\\n# Clerk Authentication\\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key\\nCLERK_SECRET_KEY=your_clerk_secret_key\\nWEBHOOK_SECRET=your_webhook_secret\\n\\n# MongoDB\\nMONGODB_URI=your_mongodb_uri\\n\\n# AI Services\\nGROQ_API_KEY=your_groq_api_key\\nPLAGIARISM_CHECK_API_KEY=your_plagiarism_check_api_key\\n\\n# URLs\\nNEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3000\\nNEXT_PUBLIC_FRONTEND_URL=http://localhost:3000\\n\\n# Clerk Redirect URLs\\nNEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\\nNEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard\\n\\n# YouTube API\\nNEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key\\n```\\n\\nYou can find an example in the `.env.example` file. Make sure to replace all placeholder values with your actual API keys and credentials.\\n\\n4. **Run the development server**\\n\\n```bash\\nnpm run dev\\n```\\n\\n5. **Build for production**\\n\\n```bash\\nnpm run build\\n```\\n\\n## 📝 Scripts\\n\\n- `npm run dev` - Start development server\\n- `npm run build` - Build for production\\n- `npm start` - Start production server\\n- `npm run lint` - Run ESLint\\n\\n## 📜 License\\n\\nThis project is licensed under the MIT License.\\n", "primaryLanguage": "JavaScript"}, {"id": "github-899314479", "url": "https://github.com/takitajwar17/lyceum-iubat-hackathon", "dates": {"pushed": "2024-12-09T15:50:08Z", "created": "2024-12-06T02:42:53Z", "updated": "2025-04-12T11:33:14Z"}, "title": "lyceum-iubat-hackathon", "isFork": false, "topics": ["education", "hackathon", "nextjs"], "demoUrl": "https://lyceum-iubat-hackathon.vercel.app", "license": "MIT License", "metrics": {"size": 2159, "forks": 1, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/lyceum-iubat-hackathon", "isPrivate": false, "isArchived": false, "description": "Lyceum is an winning project developed by Team XtraDrill, champion of the Dhaka Divisional Hackathon 2024 - Technocrats v.2, recognized for its innovative approach to educational technology and exceptional implementation.", "technologies": ["JavaScript", "CSS"], "defaultBranch": "main", "languageStats": {"CSS": 3939, "JavaScript": 172954}, "fullDescription": "# Lyceum - Your Interactive Coding and Learning Platform\\n\\n> 🏆 Created by Team XtraDrill for IUBAT Hackathon\\n> \\n> 🎉 **Champion of Dhaka Divisional Hackathon 2024 - Technocrats v.2 organized by IIEC IUBAT** - Recognized for innovation in educational technology and exceptional implementation!\\n\\nLyceum is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers. Named after Aristotle's ancient school, Lyceum combines traditional learning principles with modern technology to create an engaging educational journey.\\n![image](https://github.com/user-attachments/assets/7a77c43c-1c3f-4df2-ab9a-e219304dce8f)\\n\\n\\n## 🚀 Features\\n\\n### Learning Platform\\n- Curated educational videos from top programming channels\\n- Video search functionality\\n- Organized learning materials by topic\\n- Interactive video lessons with detailed descriptions\\n\\n#### Learning Platform Flow:\\n1. Browse curated videos\\n![image](https://github.com/user-attachments/assets/f6b93293-bc01-42be-b539-41d884887614)\\n\\n2. View a video:\\n![image](https://github.com/user-attachments/assets/9b63ccf2-50a2-4b81-b538-8ff8473fa7f7)\\n\\n3. Run Code:\\n![image](https://github.com/user-attachments/assets/bbaf050c-3c4e-4e27-b39d-0e974f2d0f0d)\\n\\n4. Get Review:\\n![image](https://github.com/user-attachments/assets/43829586-e45e-4c3b-a980-2fef6c2fa590)\\n\\n### Roadmaps\\n- AI-powered learning path generation\\n- Custom roadmap creation based on your goals\\n- Progress tracking for each roadmap\\n- Detailed step-by-step guidance\\n- Share and explore community roadmaps\\n\\n#### Roadmap Creation Flow:\\n1. Create custom roadmap\\n![image](https://github.com/user-attachments/assets/70152519-4bb0-475a-bf7b-1aedf5980330)\\n\\n2. View generated roadmap\\n![image](https://github.com/user-attachments/assets/d8ba1523-7694-4aae-8bcb-f4339e8477b3)\\n\\n3. Track your progress\\n![image](https://github.com/user-attachments/assets/03a09c4c-35ad-4e83-a48a-b4853e264303)\\n\\n### Quest System\\n- Time-based coding challenges\\n- Categorized quests (Upcoming, Active, Past)\\n- Real-time quest status tracking\\n- Detailed quest descriptions and requirements\\n- Quest completion tracking\\n\\n#### Quest System Flow:\\n1. Browse available quests\\n![image](https://github.com/user-attachments/assets/6506f188-fba9-4793-b367-e8713fdbef99)\\n\\n2. View quest details\\n![WhatsApp Image 2024-12-06 at 17 23 06_2af1fdc2](https://github.com/user-attachments/assets/2e91ff0f-1fa6-476e-9b9c-a8da88f8fae2)\\n\\n3. Track quest marks\\n![image](https://github.com/user-attachments/assets/7207e281-bd75-4585-8663-a98f4e9f9a70)\\n\\n4. Track quest evaluation\\n![image](https://github.com/user-attachments/assets/4b01d1c2-9745-4384-b4d8-c343e3d985fa)\\n\\n### AI Assistant (Future Scope)\\n- Intelligent learning support\\n- Code explanation and debugging help\\n- Personalized learning recommendations\\n- Interactive problem-solving guidance\\n- Quick answers to programming questions\\n\\n### Authentication\\n- Secure user authentication powered by Clerk\\n- User profile management\\n- Role-based access control\\n- Secure session handling\\n- Social login integration\\n\\n#### Authentication Flow:\\n![image](https://github.com/user-attachments/assets/f820978b-8b7b-473a-b317-a7869b868d5f)\\n\\n## 📁 Project Structure\\n\\n```\\n├── app/\\n│   ├── admin/         # Admin panel components\\n│   ├── api/          # API routes\\n│   ├── components/   # Reusable UI components\\n│   ├── dashboard/    # User dashboard\\n│   ├── learn/        # Learning platform\\n│   ├── quests/       # Quest system\\n│   ├── roadmaps/     # Learning roadmaps\\n│   └── layout.jsx    # Root layout component\\n├── lib/             # Utility functions and actions\\n├── public/          # Static assets\\n└── components/      # Shared components\\n```\\n\\n## 🛠️ Tech Stack\\n\\n- **Framework**: Next.js 14\\n- **Authentication**: Clerk\\n- **Styling**: Tailwind CSS\\n- **UI Components**: \\n  - Radix UI\\n  - Chakra UI\\n  - Framer Motion\\n- **Database**: MongoDB with Mongoose\\n- **Code Editor**: Monaco Editor\\n- **Markdown**: React Markdown with GFM\\n- **Analytics**: Vercel Analytics & Speed Insights\\n\\n## 🚦 Getting Started\\n\\n1. **Clone the repository**\\n```bash\\ngit clone https://github.com/takitajwar17/lyceum-iubat-hackathon.git\\n```\\n\\n2. **Install dependencies**\\n```bash\\nnpm install\\n```\\n\\n3. **Set up environment variables**\\nCreate a `.env.local` file with the following variables:\\n\\n```env\\n# Clerk Authentication\\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key\\nCLERK_SECRET_KEY=your_clerk_secret_key\\nWEBHOOK_SECRET=your_webhook_secret\\n\\n# MongoDB\\nMONGODB_URI=your_mongodb_uri\\n\\n# AI Services\\nGROQ_API_KEY=your_groq_api_key\\nPLAGIARISM_CHECK_API_KEY=your_plagiarism_check_api_key\\n\\n# URLs\\nNEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3000\\nNEXT_PUBLIC_FRONTEND_URL=http://localhost:3000\\n\\n# Clerk Redirect URLs\\nNEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\\nNEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard\\nNEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard\\n\\n# YouTube API\\nNEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key\\n```\\n\\nYou can find an example in the `.env.example` file. Make sure to replace all placeholder values with your actual API keys and credentials.\\n\\n4. **Run the development server**\\n```bash\\nnpm run dev\\n```\\n\\n5. **Build for production**\\n```bash\\nnpm run build\\n```\\n\\n## 📝 Scripts\\n\\n- `npm run dev` - Start development server\\n- `npm run build` - Build for production\\n- `npm start` - Start production server\\n- `npm run lint` - Run ESLint\\n\\n## 📜 License\\n\\nThis project is licensed under the MIT License.\\n\\n---\\nCreated with 💻 by Team XtraDrill for IUBAT Hackathon\\n", "primaryLanguage": "JavaScript"}, {"id": "github-938559536", "url": "https://github.com/takitajwar17/FaceNet-RealTime-Attendance", "dates": {"pushed": "2025-03-26T15:02:58Z", "created": "2025-02-25T06:27:14Z", "updated": "2025-03-26T15:03:02Z"}, "title": "FaceNet-RealTime-Attendance", "isFork": false, "topics": [], "demoUrl": null, "license": "MIT License", "metrics": {"size": 92852, "forks": 1, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/FaceNet-RealTime-Attendance", "isPrivate": false, "isArchived": false, "description": "A real-time face recognition attendance system built with FaceNet (Inception-ResNet-V1), PyTorch, and OpenCV, leveraging fine-tuned VGGFace2 pretrained model with custom feature processing and data augmentation pipeline.", "technologies": ["Python", "TeX"], "defaultBranch": "main", "languageStats": {"TeX": 34920, "Python": 39643}, "fullDescription": "# FaceNet Real-Time Attendance System\\n\\nA real-time face recognition attendance system built with FaceNet (Inception-ResNet-V1), PyTorch, and OpenCV, leveraging fine-tuned VGGFace2 pretrained model with custom feature processing and data augmentation pipeline.\\n\\n## Table of Contents\\n\\n- [Features](#features)\\n- [Installation](#installation)\\n- [Usage](#usage)\\n- [Technical Details](#technical-details)\\n- [Project Structure](#project-structure)\\n- [License](#license)\\n\\n## Features\\n\\n### Core Functionality\\n\\n- Real-time face detection using MTCNN\\n- Face recognition with fine-tuned FaceNet model\\n- Automated attendance logging with CSV export\\n- Student information management system\\n- Real-time visual feedback and confidence scores\\n\\n### Technical Features\\n\\n- Custom feature processing pipeline\\n- Multi-loss training (Softmax + Center Loss + Triplet Loss)\\n- Extensive data augmentation for robustness\\n- Early stopping and learning rate scheduling\\n- Model checkpointing and best model saving\\n\\n## Installation\\n\\n### Prerequisites\\n\\n- Python 3.8 or higher\\n- CUDA-capable GPU (recommended)\\n- Webcam for attendance capture\\n\\n### Setup\\n\\n1. Clone the repository:\\n\\n```bash\\ngit clone https://github.com/takitajwar17/FaceNet-RealTime-Attendance.git\\ncd FaceNet-RealTime-Attendance\\n```\\n\\n2. Install dependencies:\\n\\n```bash\\npip install -r requirements.txt\\n```\\n\\n## Usage\\n\\n### Automated Pipeline\\n\\n1. **Preprocess Images and Train Model (automated)**\\n```bash\\npython run.py  # Runs complete pipeline\\n```\\n2. **Run Attendance System**\\n\\n```bash\\npython src/attendance.py\\n```\\n\\n### Manual Setup\\n\\n1. **Preprocess Images**\\n\\n```bash\\npython src/preprocess.py\\n```\\n\\n2. **Train Model**\\n\\n```bash\\npython src/train.py\\n```\\n\\n3. **Run Attendance System**\\n\\n```bash\\npython src/attendance.py\\n```\\n\\n## Technical Details\\n\\n### Model Architecture\\n\\n- **Base Model**: FaceNet (Inception-ResNet-V1)\\n- **Pretrained**: VGGFace2\\n- **Custom Layers**:\\n  - Feature Processing Pipeline\\n  - Batch Normalization\\n  - Dropout (0.7, 0.5)\\n  - Custom Classifier\\n\\n### Training Parameters\\n\\n- Batch Size: 16\\n- Learning Rate: 1e-3 (feature processor), 1e-4 (backbone)\\n- Weight Decay: 5e-4\\n- Validation Split: 20%\\n- Early Stopping Patience: 8 epochs\\n\\n### Loss Functions\\n\\n- Cross Entropy Loss (main classification)\\n- Center Loss (feature clustering)\\n- Triplet Loss (margin: 0.3)\\n\\n### Data Augmentation\\n\\n- Geometric: rotation, scale, shift\\n- Lighting: brightness, contrast, gamma\\n- Environmental: shadows, fog\\n- Noise: Gaussian noise, blur\\n- Color: hue, saturation, value\\n\\n### Recognition Parameters\\n\\n- Confidence Threshold: 0.3\\n- Margin Threshold: 0.1\\n- Detection Cooldown: 30 seconds\\n- Face Detection Parameters:\\n  - Margin: 20\\n  - Min Face Size: 50\\n  - MTCNN Thresholds: [0.5, 0.6, 0.6]\\n\\n## Project Structure\\n\\n```\\n.\\n├── dataset/                  # Raw student images\\n├── processed_dataset/        # Preprocessed face images\\n├── models/                   # Trained models\\n│   └── best_model.pth        # Best model checkpoint\\n├── prev_models/              # Previously trained models with accuracy\\n├── attendance/               # Attendance records\\n├── logs/                     # Preprocessing and Training logs\\n├── src/\\n│   ├── preprocess.py       # Face detection & augmentation\\n│   ├── train.py           # Model training pipeline\\n│   ├── attendance.py      # Real-time recognition system\\n│   └── student_info.py    # Student data management\\n├── run.py                  # Automated pipeline\\n└── requirements.txt        # Dependencies\\n```\\n\\n## License\\n\\nThis project is licensed under the MIT License - see the LICENSE file for details.\\n", "primaryLanguage": "Python"}], "achievements": [{"type": "prolific", "title": "Prolific Developer", "metric": 53, "description": "53 public repositories"}], "socialMetrics": {"followers": 32, "following": 33, "accountAge": 2, "totalForks": 8, "totalStars": 5, "recentActivity": 79, "totalRepositories": 53, "publicRepositories": 53}, "portfolioMetrics": {"totalForks": 3, "totalStars": 5, "topLanguages": [{"count": 5, "language": "TypeScript"}, {"count": 3, "language": "JavaScript"}, {"count": 3, "language": "Python"}], "recentActivity": 12, "mostPopularRepo": {"id": "github-971526470", "url": "https://github.com/takitajwar17/lumenly.dev", "dates": {"pushed": "2025-05-29T19:25:56Z", "created": "2025-04-23T16:51:04Z", "updated": "2025-05-29T19:25:59Z"}, "title": "lumenly.dev", "isFork": false, "topics": [], "demoUrl": "https://www.lumenly.dev", "license": "MIT License", "metrics": {"size": 732, "forks": 0, "stars": 2, "watchers": 2, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/takitajwar17/lumenly.dev", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["TypeScript", "JavaScript", "CSS", "HTML"], "defaultBranch": "main", "languageStats": {"CSS": 3662, "HTML": 738, "JavaScript": 10297, "TypeScript": 253223}, "fullDescription": "# lumenly.dev\\n\\n<div align=\\"center\\">\\n  <img src=\\"public/android-chrome-192x192.png\\" alt=\\"lumenly.dev logo\\" width=\\"120\\" />\\n  \\n  <h3>Collaborative Cloud Coding with AI</h3>\\n  \\n  <p>A real-time collaborative code editor with integrated code execution and AI-powered reviews</p>\\n\\n  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)\\n  [![GitHub Stars](https://img.shields.io/github/stars/takitajwar17/lumenly.dev?style=social)](https://github.com/takitajwar17/lumenly.dev/stargazers)\\n  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=social&logo=linkedin)](https://www.linkedin.com/in/takitajwar17/)\\n  \\n  <a href=\\"https://www.lumenly.dev\\">🌐 Website</a> •\\n  <a href=\\"#detailed-documentation\\">📚 Documentation</a> •\\n  <a href=\\"#features\\">✨ Features</a> •\\n  <a href=\\"#core-components\\">🧩 Core Components</a> •\\n  <a href=\\"#getting-started\\">🚀 Getting Started</a> •\\n  <a href=\\"#usage\\">📖 Usage</a> •\\n  <a href=\\"#architecture\\">🏗️ Architecture</a> •\\n  <a href=\\"#contributing\\">👥 Contributing</a> •\\n  <a href=\\"#roadmap\\">🗺️ Roadmap</a>\\n</div>\\n\\n## 📚 Detailed Documentation\\n\\nFor a comprehensive breakdown of the project, visit our [DeepWiki](https://deepwiki.com/takitajwar17/lumenly.dev) covering topics like Technology Stack, Workspace Management, Code Execution, AI Integration, and more.\\n\\n## ✨ Features\\n\\nlumenly.dev is a cloud coding platform that makes collaboration effortless, with no setup required. It's like Google Docs for coding, but smarter and built specifically for developers.\\n\\n### 🤝 Real-time Collaboration\\n- **Live Collaborative Editing:** Multiple users can edit code simultaneously, with real-time updates\\n- **Cursor and Selection Tracking:** See where your collaborators are working in real-time\\n- **Presence Indicators:** Know who's online and actively working\\n- **Activity Tracking:** View your coding activity with GitHub-style contribution graphs\\n\\n### 🚀 Instant Code Execution\\n- **One-Click Execution:** Run your code directly in the browser with a single click\\n- **30+ Languages Support:** Code in JavaScript, TypeScript, Python, Java, C++, Rust, and many more\\n- **Real-time Output:** View execution results, errors, and compilation messages instantly\\n- **Performance Metrics:** Track execution time and resource usage\\n\\n### 🧠 AI-Powered Features\\n- **Code Reviews:** Get AI-powered feedback on your code quality, performance, and best practices\\n- **Suggestions & Improvements:** Receive actionable suggestions for making your code better\\n- **Issue Detection:** Automatically identify potential bugs, security issues, and performance bottlenecks\\n- **Smart Code Analysis:** Benefit from deep code understanding across multiple languages\\n\\n### 🛠️ Developer-Focused Experience\\n- **Syntax Highlighting:** Beautiful, language-specific code highlighting\\n- **Customizable Editor:** Light and dark themes with professional coding environments\\n- **Shareable Workspaces:** Easily share workspace links with collaborators\\n- **Persistent Storage:** Your code is automatically saved in real-time\\n\\n## 🧩 Core Components\\n\\nLumenly.dev is built around several key subsystems that work together to provide a seamless coding experience:\\n\\n### Workspace Management System\\n- Handles creation, joining, and management of collaborative workspaces\\n- Generates unique 6-character codes for easy sharing\\n- Maintains workspace state and synchronizes between users\\n\\n### Code Editor System\\n- Based on Monaco Editor (same as VS Code)\\n- Integrates with real-time collaboration features\\n- Provides syntax highlighting for 30+ programming languages\\n- Includes editor toolbar with actions for running code and requesting AI reviews\\n\\n### Activity Tracking\\n- Monitors user coding activity with GitHub-style contribution graphs\\n- Tracks presence information for all collaborators\\n- Shows cursor positions and selections in real-time\\n\\n### Real-time Collaboration\\n- Built on Convex's real-time database\\n- Synchronizes code changes instantly across all connected users\\n- Provides presence indicators and cursor tracking\\n- Ensures conflict-free collaborative editing\\n\\n### AI Integration\\n- Connects with Nebius API for code analysis\\n- Provides intelligent code reviews and suggestions\\n- Identifies potential bugs and performance issues\\n- Offers best practice recommendations\\n\\n## 🚀 Getting Started\\n\\n### Prerequisites\\n- Node.js (v18 or newer)\\n- npm or yarn\\n- A Convex account for the backend\\n- API keys for AI services (optional)\\n\\n### Installation\\n\\n1. Clone the repository:\\n```bash\\ngit clone https://github.com/takitajwar17/lumenly.dev.git\\ncd lumenly.dev\\n```\\n\\n2. Install dependencies:\\n```bash\\nnpm install\\n```\\n\\n3. Create and configure a Convex project:\\n```bash\\nnpx convex login\\nnpx convex init\\n```\\n\\n4. Create a `.env` file with your environment variables:\\n```\\nCONVEX_DEPLOYMENT=\\nCONVEX_NEBIUS_API_KEY=  # Optional, for AI code reviews\\n```\\n\\n5. Run the development server:\\n```bash\\nnpm run dev\\n```\\n\\nThe application will start at http://localhost:5173\\n\\n## 📖 Usage\\n\\n### User Flow\\n\\nThe typical user flow in lumenly.dev follows these paths:\\n\\n1. **Authentication Flow:**\\n   - User visits lumenly.dev\\n   - Authentication check determines if already signed in\\n   - If not authenticated, user proceeds to sign in\\n\\n2. **Workspace Selection:**\\n   - After authentication, user arrives at the Workspace Hub\\n   - Options include:\\n     - Creating a new workspace\\n     - Joining an existing workspace via code\\n     - Opening a previously saved workspace\\n\\n3. **Coding Environment:**\\n   - Inside the workspace, users interact with the Code Editor\\n   - Multiple users can collaborate simultaneously\\n   - Real-time changes are visible to all participants\\n\\n![User Flow Diagram](assets/images/Screenshot%202025-04-29%20152018.png)\\n\\n### Creating a Workspace\\n1. Visit the application and sign in\\n2. Click \\"Create a Workspace\\" to start a new coding space\\n3. Choose your preferred programming language\\n4. You'll receive a 6-character workspace code that you can share with collaborators\\n\\n### Inviting Collaborators\\n1. Share your workspace code or URL with others\\n2. Collaborators can join by entering the 6-character code on the home screen\\n3. You'll see real-time presence indicators and cursor positions as people join\\n\\n### Running Code\\n1. Write or paste your code in the editor\\n2. Click the \\"Run\\" button in the toolbar\\n3. View the execution results, including any output, errors, and execution time\\n\\n### Getting AI Reviews\\n1. Write your code in the editor\\n2. Click the \\"AI Review\\" button to get feedback\\n3. Review the suggestions, issues, and improvements identified by the AI\\n\\n## 🏗️ Architecture\\n\\nlumenly.dev is built with modern web technologies and a focus on real-time collaboration.\\n\\n### Tech Stack\\n- **Frontend:** React, TypeScript, TailwindCSS, Monaco Editor (VS Code's editor)\\n- **Backend:** Convex (real-time database and backend functions)\\n- **Code Execution:** Piston API (secure code execution environment)\\n- **AI Services:** Nebius API for code analysis and reviews\\n\\n### System Overview\\nThe high-level architecture of lumenly.dev consists of several interconnected layers:\\n\\n- **Frontend Layer:** React-based UI components and hooks\\n- **Core Components:** Workspace hub, code editor, toolbars, and panels\\n- **Backend Layer:** Convex backend for data management and real-time synchronization\\n- **External Services:** Piston API for code execution and Nebius API for AI code reviews\\n\\n### Key Components\\n- **Real-time Collaboration:** Built on Convex's real-time database for instant updates\\n- **Monaco Editor Integration:** Professional code editing with syntax highlighting\\n- **Presence System:** Track user activity and cursor positions in real-time\\n- **Code Execution Engine:** Secure, isolated environment for running code in 30+ languages\\n\\n### Component Interactions\\nDuring typical workflows like code execution and AI review:\\n\\n1. **Code Execution Flow:**\\n   - User clicks \\"Run Code\\" in the editor toolbar\\n   - Code is sent to the Convex backend\\n   - Convex sends the code to Piston API for execution\\n   - Results are returned to the frontend and displayed to the user\\n\\n2. **AI Review Flow:**\\n   - User clicks \\"AI Review\\" in the editor toolbar\\n   - Code is sent to the Convex backend\\n   - Convex forwards the code to Nebius API for analysis\\n   - AI feedback is formatted and displayed to the user\\n\\n![Component Interaction Diagram](assets/images/Screenshot%202025-04-29%20152139.png)\\n\\n### Real-time Collaboration Architecture\\nThe real-time collaboration features are powered by Convex backend:\\n\\n- Convex database synchronizes changes between all connected users\\n- Custom hooks like `useCodeSync` and `useEditorPresence` manage real-time state\\n- API endpoints in rooms.ts and userActivity.ts handle data operations\\n- Updates propagate automatically to all connected clients\\n\\n![Real-time Collaboration Architecture](assets/images/Screenshot%202025-04-29%20151530.png)\\n\\n### Codebase Organization\\nThe codebase follows a standard React application structure with Convex backend integration:\\n\\n- **/src:** Frontend React components and hooks\\n  - `/components`: UI components including editor, toolbar, and panels\\n  - `/hooks`: Custom React hooks for real-time synchronization\\n  - `/utils`: Helper functions and utilities\\n- **/convex:** Backend functions, schema definitions, and APIs\\n  - API endpoints for rooms, user activity, and code execution\\n  - Data schema and validation\\n- **/public:** Static assets and resources\\n\\n## 👥 Contributing\\n\\nContributions are welcome! Here's how you can help:\\n\\n1. Fork the repository\\n2. Create a feature branch (`git checkout -b feature/amazing-feature`)\\n3. Commit your changes (`git commit -m 'Add amazing feature'`)\\n4. Push to the branch (`git push origin feature/amazing-feature`)\\n5. Open a Pull Request\\n\\nPlease read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.\\n\\n## 🗺️ Roadmap\\n\\nOur plans for future development include:\\n\\n- **GitHub Integration:** Import projects directly from GitHub\\n- **Multifile Support:** Work with and execute complex projects with multiple files\\n- **Collaborative Code Reviews:** Request and provide reviews with inline comments\\n- **Advanced AI Features:** Code completion, refactoring suggestions, and more\\n- **Custom Themes:** Personalize your coding environment\\n- **Mobile Support:** Better experience on tablets and mobile devices\\n\\n## 📝 License\\n\\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\\n\\n## 🙏 Acknowledgements\\n\\n- [Convex](https://convex.dev) for the powerful real-time backend\\n- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editing experience\\n- [Piston API](https://github.com/engineer-man/piston) for secure code execution\\n\\n---\\n\\n<div align=\\"center\\">\\n  <p>Made with ❤️ by <a href=\\"https://github.com/takitajwar17\\">Taki Tajwaruzzaman Khan</a></p>\\n  <p>\\n    <a href=\\"https://www.linkedin.com/in/takitajwar17/\\">LinkedIn</a> •\\n    <a href=\\"https://github.com/takitajwar17\\">GitHub</a>\\n  </p>\\n</div>\\n", "primaryLanguage": "TypeScript"}, "repositoryCount": 12, "languageDiversity": 3, "averageStarsPerRepo": 0}}	\N	2025-07-14 11:00:33.345+00	2025-07-14 11:00:33.345+00	2025-07-14 11:00:33.345+00
a87c37a5-da03-4c28-8235-200b7b61b6ef	4e4f3a5d-adee-4bed-a99d-32c1d55b393b	github	146696509	Morgen33	Morgen V	public_access	\N	\N	{"skills": {"languages": [{"name": "TypeScript", "count": 2}, {"name": "MDX", "count": 1}], "technologies": ["config", "github-config"], "totalRepositories": 18}, "profile": {"id": 146696509, "bio": null, "blog": "", "name": "Morgen V", "email": null, "avatar": "https://avatars.githubusercontent.com/u/146696509?v=4", "company": null, "location": "New Jersey ", "username": "Morgen33", "followers": 6, "following": 20, "created_at": "2023-10-02T05:09:17Z", "updated_at": "2025-06-28T16:19:18Z", "public_repos": 18}, "rawData": {"totalProjects": 3, "filterCriteria": {"sortBy": "stars", "minStars": 0, "maxProjects": 12, "includeForkedRepos": false}, "selectedProjects": 3}, "projects": [{"id": "github-965617905", "url": "https://github.com/Morgen33/docs", "dates": {"pushed": "2025-04-13T15:00:51Z", "created": "2025-04-13T15:00:49Z", "updated": "2025-04-13T15:00:54Z"}, "title": "docs", "isFork": false, "topics": [], "demoUrl": null, "license": null, "metrics": {"size": 352, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/Morgen33/docs", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["MDX"], "defaultBranch": "main", "languageStats": {"MDX": 30293}, "fullDescription": "# Mintlify Starter Kit\\n\\nClick on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including\\n\\n- Guide pages\\n- Navigation\\n- Customizations\\n- API Reference pages\\n- Use of popular components\\n\\n### Development\\n\\nInstall the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command\\n\\n```\\nnpm i -g mintlify\\n```\\n\\nRun the following command at the root of your documentation (where docs.json is)\\n\\n```\\nmintlify dev\\n```\\n\\n### Publishing Changes\\n\\nInstall our Github App to auto propagate changes from your repo to your deployment. Changes will be deployed to production automatically after pushing to the default branch. Find the link to install on your dashboard. \\n\\n#### Troubleshooting\\n\\n- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.\\n- Page loads as a 404 - Make sure you are running in a folder with `docs.json`\\n", "primaryLanguage": "MDX"}, {"id": "github-799944025", "url": "https://github.com/Morgen33/skills-introduction-to-github", "dates": {"pushed": "2024-05-13T12:06:03Z", "created": "2024-05-13T12:05:33Z", "updated": "2024-05-13T12:06:06Z"}, "title": "skills-introduction-to-github", "isFork": false, "topics": [], "demoUrl": null, "license": "MIT License", "metrics": {"size": 786, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/Morgen33/skills-introduction-to-github", "isPrivate": false, "isArchived": false, "description": "My clone repository", "technologies": [], "defaultBranch": "main", "languageStats": {}, "fullDescription": "<header>\\n\\n<!--\\n  <<< Author notes: Course header >>>\\n  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.\\n  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.\\n  Add your open source license, GitHub uses MIT license.\\n-->\\n\\n# Introduction to GitHub\\n\\n_Get started using GitHub in less than an hour._\\n\\n</header>\\n\\n<!--\\n  <<< Author notes: Step 1 >>>\\n  Choose 3-5 steps for your course.\\n  The first step is always the hardest, so pick something easy!\\n  Link to docs.github.com for further explanations.\\n  Encourage users to open new tabs for steps!\\n-->\\n\\n## Step 1: Create a branch\\n\\n_Welcome to \\"Introduction to GitHub\\"! :wave:_\\n\\n**What is GitHub?**: GitHub is a collaboration platform that uses _[Git](https://docs.github.com/get-started/quickstart/github-glossary#git)_ for versioning. GitHub is a popular place to share and contribute to [open-source](https://docs.github.com/get-started/quickstart/github-glossary#open-source) software.\\n<br>:tv: [Video: What is GitHub?](https://www.youtube.com/watch?v=pBy1zgt0XPc)\\n\\n**What is a repository?**: A _[repository](https://docs.github.com/get-started/quickstart/github-glossary#repository)_ is a project containing files and folders. A repository tracks versions of files and folders. For more information, see \\"[About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories)\\" from GitHub Docs.\\n\\n**What is a branch?**: A _[branch](https://docs.github.com/en/get-started/quickstart/github-glossary#branch)_ is a parallel version of your repository. By default, your repository has one branch named `main` and it is considered to be the definitive branch. Creating additional branches allows you to copy the `main` branch of your repository and safely make any changes without disrupting the main project. Many people use branches to work on specific features without affecting any other parts of the project.\\n\\nBranches allow you to separate your work from the `main` branch. In other words, everyone's work is safe while you contribute. For more information, see \\"[About branches](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches)\\".\\n\\n**What is a profile README?**: A _[profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)_ is essentially an \\"About me\\" section on your GitHub profile where you can share information about yourself with the community on GitHub.com. GitHub shows your profile README at the top of your profile page. For more information, see \\"[Managing your profile README](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)\\".\\n\\n![profile-readme-example](/images/profile-readme-example.png)\\n\\n### :keyboard: Activity: Your first branch\\n\\n1. Open a new browser tab and navigate to your newly made repository. Then, work on the steps in your second tab while you read the instructions in this tab.\\n2. Navigate to the **< > Code** tab in the header menu of your repository.\\n\\n   ![code-tab](/images/code-tab.png)\\n\\n3. Click on the **main** branch drop-down.\\n\\n   ![main-branch-dropdown](/images/main-branch-dropdown.png)\\n\\n4. In the field, name your branch `my-first-branch`. In this case, the name must be `my-first-branch` to trigger the course workflow.\\n5. Click **Create branch: my-first-branch** to create your branch.\\n\\n   ![create-branch-button](/images/create-branch-button.png)\\n\\n   The branch will automatically switch to the one you have just created.\\n   The **main** branch drop-down bar will reflect your new branch and display the new branch name.\\n\\n6. Wait about 20 seconds then refresh this page (the one you're following instructions from). [GitHub Actions](https://docs.github.com/en/actions) will automatically update to the next step.\\n\\n<footer>\\n\\n<!--\\n  <<< Author notes: Footer >>>\\n  Add a link to get support, GitHub status page, code of conduct, license link.\\n-->\\n\\n---\\n\\nGet help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/introduction-to-github) &bull; [Review the GitHub status page](https://www.githubstatus.com/)\\n\\n&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)\\n\\n</footer>\\n", "primaryLanguage": null}, {"id": "github-738061276", "url": "https://github.com/Morgen33/Morgen33", "dates": {"pushed": "2024-01-02T10:25:10Z", "created": "2024-01-02T10:23:47Z", "updated": "2024-01-02T10:23:47Z"}, "title": "Morgen33", "isFork": false, "topics": ["config", "github-config"], "demoUrl": "https://github.com/Morgen33", "license": null, "metrics": {"size": 0, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/Morgen33/Morgen33", "isPrivate": false, "isArchived": false, "description": "Config files for my GitHub profile.", "technologies": [], "defaultBranch": "main", "languageStats": {}, "fullDescription": "- 👋 Hi, I’m @Morgen33\\n- 👀 I’m interested in AI, Art, Social Media \\n- 🌱 I’m currently learning how to code\\n- 💞️ I’m looking to connect with people and network. \\n- 📫 How to reach me on X @morgenvictoria3\\n\\n<!---\\nMorgen33/Morgen33 is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.\\nYou can click the Preview link to take a look at your changes.\\n--->\\n", "primaryLanguage": null}], "achievements": [], "socialMetrics": {"followers": 6, "following": 20, "accountAge": 1, "totalForks": 2, "totalStars": 4, "recentActivity": 4, "totalRepositories": 18, "publicRepositories": 18}, "portfolioMetrics": {"totalForks": 0, "totalStars": 0, "topLanguages": [{"count": 1, "language": "MDX"}], "recentActivity": 1, "mostPopularRepo": {"id": "github-965617905", "url": "https://github.com/Morgen33/docs", "dates": {"pushed": "2025-04-13T15:00:51Z", "created": "2025-04-13T15:00:49Z", "updated": "2025-04-13T15:00:54Z"}, "title": "docs", "isFork": false, "topics": [], "demoUrl": null, "license": null, "metrics": {"size": 352, "forks": 0, "stars": 0, "watchers": 0, "openIssues": 0}, "platform": "github", "githubUrl": "https://github.com/Morgen33/docs", "isPrivate": false, "isArchived": false, "description": "No description provided", "technologies": ["MDX"], "defaultBranch": "main", "languageStats": {"MDX": 30293}, "fullDescription": "# Mintlify Starter Kit\\n\\nClick on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including\\n\\n- Guide pages\\n- Navigation\\n- Customizations\\n- API Reference pages\\n- Use of popular components\\n\\n### Development\\n\\nInstall the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command\\n\\n```\\nnpm i -g mintlify\\n```\\n\\nRun the following command at the root of your documentation (where docs.json is)\\n\\n```\\nmintlify dev\\n```\\n\\n### Publishing Changes\\n\\nInstall our Github App to auto propagate changes from your repo to your deployment. Changes will be deployed to production automatically after pushing to the default branch. Find the link to install on your dashboard. \\n\\n#### Troubleshooting\\n\\n- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.\\n- Page loads as a 404 - Make sure you are running in a folder with `docs.json`\\n", "primaryLanguage": "MDX"}, "repositoryCount": 3, "languageDiversity": 1, "averageStarsPerRepo": 0}}	\N	2025-07-14 14:07:28.982+00	2025-07-14 14:07:28.982+00	2025-07-14 14:07:28.982+00
\.


--
-- Data for Name: portfolio_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolio_analytics (id, portfolio_id, visitor_id, event_type, event_data, user_agent, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: portfolio_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolio_projects (id, portfolio_id, source_platform, source_id, title, description, enhanced_description, technologies, images, links, metrics, is_featured, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolios (id, user_id, title, slug, description, template_id, template_config, content_data, is_published, is_featured, custom_domain, seo_title, seo_description, view_count, last_generated_at, created_at, updated_at, subdomain) FROM stdin;
fc9f5757-b9cc-48a3-9f91-b66bc764cb22	f0c1caac-ed35-403d-a53f-3a1ad0ce4e34	test	test	test	creative	{}	{}	t	f	\N	\N	\N	0	\N	2025-07-23 01:21:03.965499+00	2025-07-23 01:21:12.084566+00	tttt
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, full_name, avatar_url, customer_id, subscription_id, price_id, has_access, plan_type, onboarding_completed, created_at, updated_at) FROM stdin;
a7162ddb-8394-48ea-bb7b-bf8a508a8caa	tajwaruzzaman@iut-dhaka.edu	Taki Tajwaruzzaman Khan	https://avatars.githubusercontent.com/u/111155827?v=4	\N	\N	\N	t	free	f	2025-07-14 05:32:26.87+00	2025-07-14 05:32:26.87+00
4ff7d21f-ddd8-499d-8362-e1bf467380b0	jhansisiripura@gmail.com	\N	\N	\N	\N	\N	f	free	f	2025-07-14 07:51:04.036336+00	2025-07-14 07:51:04.036336+00
f061601f-2432-4b16-8934-07b7b3c0cf43	razwan.onisca@gmail.com	Razvan Onisca	https://lh3.googleusercontent.com/a/ACg8ocK3eZ45p-eSZ0SI2X0OAxeoDa_k5TTzBaQroj5FBbrCBW_bQHTj=s96-c	\N	\N	\N	f	free	f	2025-07-14 10:34:36.874936+00	2025-07-14 10:34:36.874936+00
4e4f3a5d-adee-4bed-a99d-32c1d55b393b	igottaguyoh@gmail.com	Morgen V	https://avatars.githubusercontent.com/u/146696509?v=4	\N	\N	\N	f	free	f	2025-07-14 14:06:25.932787+00	2025-07-14 14:06:25.932787+00
a6ae9257-caea-4094-b742-34acd9b0ada7	mrbloomx1@gmail.com	Mr Bloom X	https://lh3.googleusercontent.com/a/ACg8ocIdJkgQxqRCb2qpwxuwglHh0jyeVYygJXy4QyXWn7Bn_UOw4g=s96-c	\N	\N	\N	f	free	f	2025-07-15 22:14:19.835358+00	2025-07-15 22:14:19.835358+00
1e95277b-c345-4baa-af34-245166cbb5d9	jeremylasne0@gmail.com	Jeremy Lasne	https://lh3.googleusercontent.com/a/ACg8ocLqAPAUc4E9PcS6pLubB6EpwiChsZTx_0v9ifZGRiXuIE-aw4RU=s96-c	\N	\N	\N	f	free	f	2025-07-16 17:06:40.087261+00	2025-07-16 17:06:40.087261+00
24dde84c-51cc-4058-9208-38a31369bc17	yogendrarana9595@gmail.com	Yogendra Rana	https://lh3.googleusercontent.com/a/ACg8ocLnKnGgAJqDjBc6QylcbbrdcQXp3mrnfPwdopRjEEvn8p7wLnZm=s96-c	\N	\N	\N	f	free	f	2025-07-19 03:35:05.681155+00	2025-07-19 03:35:05.681155+00
9c9a9551-7468-4d37-b8db-0f772f9ecfa2	andreas@joinlovable.com	\N	\N	\N	\N	\N	f	free	f	2025-07-19 07:01:38.60844+00	2025-07-19 07:01:38.60844+00
41758f4f-8958-46b1-86c7-4709b7f63ae7	saadmansakib@iut-dhaka.edu	Saadman Sakib Dipto 210042165	https://lh3.googleusercontent.com/a/ACg8ocJP43gQUvAapPT4k68hFAnLlh5uXiq8ujLVG9zt0WRQz3a7eg=s96-c	\N	\N	\N	f	free	f	2025-07-22 16:54:34.319262+00	2025-07-22 16:54:34.319262+00
f0c1caac-ed35-403d-a53f-3a1ad0ce4e34	mahmoudhalat1@gmail.com	\N	\N	\N	\N	\N	f	free	f	2025-07-23 01:20:04.591423+00	2025-07-23 01:20:04.591423+00
867157c8-55d7-4e7a-aa7e-9bdd4dc9f19a	elevateyourconversions@gmail.com	Tich	https://lh3.googleusercontent.com/a/ACg8ocIYoEzQoik_VErnYg7nmkxQ3UP7Tx9lZpQZdO0R3GBsw-MlgQ=s96-c	\N	\N	\N	f	free	f	2025-07-24 06:50:12.197151+00	2025-07-24 06:50:12.197151+00
\.


--
-- Data for Name: user_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_content (id, user_id, content_type, original_text, structured_data, metadata, created_at, updated_at) FROM stdin;
f8480098-3afa-4da1-9ba9-c2dbb695495d	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	resume	Taki Tajwaruzzaman Khan  Dhaka, Bangladesh     +880-1716-126988   #   tajwaruzzaman@iut-dhaka.edu   §   github.com/takitajwar17  Awards & Achievements  Champion (Best Overall Winner)   |   Convex Top Chef International Hackathon   |   Role: Solo Developer   May 2025, USA Champion (LevelUp 1st Place)   |   Outlier AI Level Up International Hackathon   |   Role: Solo Developer   May 2025, USA Global 4th & National Champion (Bangladesh)   |   PLEASE Hack - South Asia   |   Role: TPM   Apr. 2025, Sri Lanka Champion   |   NSU ACM SC - HackNSU Season 5 (2025)   |   Role: Team Leader, Full-Stack Developer   Mar. 2025 Champion   |   KUET BitFest 2025 - Hackathon   |   Role: Team Leader, Full-Stack Developer   Jan. 2025 Champion   |   4th Data Science Summit 2024, DIU - Data Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 Champion   |   Technocrats V.2, IUBAT- Dhaka Divisional Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 1st Runner-Up   |   Programming Hero National Hackathon, EWU RoboFest   |   Role: Team Leader, Full-Stack Developer   Nov. 2024  Experience  Booked For You (Startup)   Nov. 2024 – May. 2025  Product Engineer   Dhaka, Bangladesh   ·   Hybrid  •   Spearhead full-stack development using   React   and   Flask , while directing product strategy and roadmap for an event ticketing tech platform  •   Lead architecture decisions and manage a team of frontend developers, designers implementing   agile methodologies  DataCops   Jun. 2023 – Aug. 2023  Intern Software Engineer   Remote (Portugal)  •   Engineered an advanced bot detection module utilizing   Python   and   machine learning algorithms , reducing unauthorized scraping by 40%  •   Optimized CAPTCHA systems with   JavaScript   and AI technologies, achieving 98% user validation accuracy  Projects  Inherit: A Unified Learning & Coding Platform   |   Next.js, Express.js, Node.js, MongoDB   Aug. 2024  ∗   Architected a full-stack learning platform with   Next.js , integrating   YouTube Data API   and   Monaco Editor   for real-time collaborative coding  ∗   Implemented   WebSocket -based peer coding and   Meta LLaMA 2   powered code reviews, supporting 50+ concurrent sessions  CrackEd: Educational Platform   |   ReactJS, ExpressJS, NodeJS, MongoDB Atlas, Postman   Jan. 2024 – Present  ∗   Developed full-stack   MERN   application serving IUT admission test candidates with mock tests and doubt resolution  ∗   Implemented role-based access control system managing 3 user types (students, tutors, admins) with dedicated dashboards  LLM Financial Advisor: GenAI Model Fine-Tuning   |   AWS SageMaker, AWS EC2, Jupyter Notebook, Python   Jun. 2024  ∗   Fine-tuned   Meta Llama 2 7B model   on   AWS SageMaker   for finance-specific responses with 95% accuracy  ∗   Optimized deployment using   AWS EC2   and   IAM , reducing inference time by 30%  Technical Skills  Languages : Python, JavaScript, Java, C#, PosgreSQL, NoSQL (MongoDB), SQL  Developer Tools : Amazon Web Services (AWS), Docker, CI/CD, GitHub Actions  Technologies : Linux, GitHub, Postman, Jira, Asana  Frameworks : React, NextJS, Node.js, .NET, Django  Libraries : NumPy, Matplotlib  Education  Islamic University of Technology (IUT)   Expected Graduation: May, 2026  B.Sc. in Software Engineering   Gazipur, Bangladesh  ∗   Relevant Coursework:   Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Software Engineering, System Design, Machine Learning, Artificial Intelligence	{"skills": {"other": [], "tools": [], "languages": [], "technical": []}, "summary": null, "projects": [], "education": [], "experience": [], "achievements": [], "personalInfo": {"name": null, "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "github": "github.com/takitajwar17", "website": "iut-dhaka.edu", "linkedin": null, "location": null}, "certifications": []}	{"fileName": "210042146_Taki Tajwaruzzaman Khan.pdf", "fileSize": 169432, "fileType": "pdf", "extractedAt": "2025-07-14T11:01:38.258Z", "extractionMethod": "client_side"}	2025-07-14 11:01:38.258+00	2025-07-14 11:01:38.258+00
c2f0ca4d-8ff2-4f37-b536-f64fe8d560f0	24dde84c-51cc-4058-9208-38a31369bc17	resume	Yogendra Rana  yogendrarana.com.np yogendrarana.mail@gmail.com Mobile: +977 9825159891 GitHub: github.com/yogendrarana LinkedIn: linkedin.com/in/yogendra-rana  Summary  Full-stack developer with 2+ years of experience using React and Node.js. Proficient in JavaScript/TypeScript, modern frameworks like Express.js, Next.js, and database systems including PostgreSQL and MongoDB.  Experience  Full-Stack Developer, Okhati Technology   Apr 2024 – Present – Worked with React, Node and Express.js to build features for billing, OPD, IPD and lab modules – Reviewed code written by other developers and cleaned up old code to reduce technical debt – Played a key role in designing the HR and payroll management system, including leave and attendance features  MERN Developer, Rangin Technology   Mar 2023 – Apr 2024 – Built full-stack web apps for small businesses and schools to help them improve their online presence – Joined client meetings to understand their needs and help plan new features  Projects  Okhati App   (okhati.app)   React.js, Node.js, Express.js, PostgreSQL – Implemented SSF claims processing and multi-credit note functionality, enabling flexible billing adjustments – Developed dynamic commission calculator for medical service providers that factors in lab charges, material costs, and TDS deductions etc. – Upgraded front-end setup from Webpack 4 to 5 and React 17 to 18, resulting in much faster builds  Node Blueprint   (node-blueprint.vercel.app)   Node.js, TypeScript – Created a CLI tool to scaffold Node.js back-ends with the user’s preferred framework, database, and ORM and published the tool to npm registry. – Included authentication, docker and logger features reducing boilerplate setup time.  Craft UI   (craft-dot-ui.vercel.app)   Next.js, Tailwind, Framer Motion – Built an open-source React component library with 30+ reusable UI components. – Created detailed documentation with usage examples for each component.  Technical Skills  Languages : JavaScript, TypeScript  Frameworks : React.js, Next.js, Node.js, Express.js  Databases : PostgreSQL, MongoDB, Redis, Prisma/Drizzle ORM  Developer Tools : Tailwind, Radix UI, Git, GitHub Actions, Docker, Nginx, Digital Ocean  Education  Tribhuvan University   Pokhara, Gandaki B.Sc. Computer Science and Information Technology  SOS Hermann Gmeiner Gandaki   Pokhara, Gandaki +2 Science	{"skills": {"other": [], "tools": [], "languages": [], "technical": []}, "summary": "", "projects": [], "education": [], "experience": [], "achievements": [], "personalInfo": {"name": null, "email": "yogendrarana.mail@gmail.com", "phone": "9825159891", "github": "github.com/yogendrarana", "website": "yogendrarana.com", "linkedin": "linkedin.com/in/yogendra-rana", "location": null}, "certifications": []}	{"fileName": "Yogendra_Rana.pdf", "fileSize": 69495, "fileType": "pdf", "extractedAt": "2025-07-19T03:35:36.495Z", "extractionMethod": "client_side"}	2025-07-19 03:35:36.496+00	2025-07-19 03:35:36.496+00
\.


--
-- Data for Name: waitlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.waitlist (id, full_name, email, company, created_at) FROM stdin;
cb793ef3-5a45-4943-8651-1787f2880f63	Taki Tajwaruzzaman Khan	tajwaruzzaman@iut-dhaka.edu	\N	2025-07-13 01:55:16.051914+00
aaec0432-c1f3-4993-8203-4c0a630b2ac5	Ashrith Reddy A	ashrith2768@gmaiil.com	\N	2025-07-13 19:12:27.604703+00
\.


--
-- Name: connected_platforms connected_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connected_platforms
    ADD CONSTRAINT connected_platforms_pkey PRIMARY KEY (id);


--
-- Name: connected_platforms connected_platforms_user_id_platform_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connected_platforms
    ADD CONSTRAINT connected_platforms_user_id_platform_key UNIQUE (user_id, platform);


--
-- Name: portfolio_analytics portfolio_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_analytics
    ADD CONSTRAINT portfolio_analytics_pkey PRIMARY KEY (id);


--
-- Name: portfolio_projects portfolio_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_projects
    ADD CONSTRAINT portfolio_projects_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_slug_key UNIQUE (slug);


--
-- Name: portfolios portfolios_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_subdomain_key UNIQUE (subdomain);


--
-- Name: profiles profiles_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_customer_id_key UNIQUE (customer_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: user_content user_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_content
    ADD CONSTRAINT user_content_pkey PRIMARY KEY (id);


--
-- Name: user_content user_content_user_id_content_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_content
    ADD CONSTRAINT user_content_user_id_content_type_key UNIQUE (user_id, content_type);


--
-- Name: waitlist waitlist_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_email_key UNIQUE (email);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: idx_connected_platforms_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connected_platforms_platform ON public.connected_platforms USING btree (platform);


--
-- Name: idx_connected_platforms_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connected_platforms_user_id ON public.connected_platforms USING btree (user_id);


--
-- Name: idx_connected_platforms_verified_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connected_platforms_verified_at ON public.connected_platforms USING btree (verified_at);


--
-- Name: idx_portfolio_analytics_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_analytics_event_type ON public.portfolio_analytics USING btree (event_type);


--
-- Name: idx_portfolio_analytics_portfolio_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_analytics_portfolio_id ON public.portfolio_analytics USING btree (portfolio_id);


--
-- Name: idx_portfolio_projects_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_projects_featured ON public.portfolio_projects USING btree (is_featured);


--
-- Name: idx_portfolio_projects_portfolio_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolio_projects_portfolio_id ON public.portfolio_projects USING btree (portfolio_id);


--
-- Name: idx_portfolios_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolios_published ON public.portfolios USING btree (is_published);


--
-- Name: idx_portfolios_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolios_slug ON public.portfolios USING btree (slug);


--
-- Name: idx_portfolios_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolios_subdomain ON public.portfolios USING btree (subdomain);


--
-- Name: idx_portfolios_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portfolios_user_id ON public.portfolios USING btree (user_id);


--
-- Name: idx_user_content_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_content_created_at ON public.user_content USING btree (created_at);


--
-- Name: idx_user_content_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_content_type ON public.user_content USING btree (content_type);


--
-- Name: idx_user_content_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_content_user_id ON public.user_content USING btree (user_id);


--
-- Name: idx_waitlist_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_created_at ON public.waitlist USING btree (created_at);


--
-- Name: idx_waitlist_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_waitlist_email ON public.waitlist USING btree (email);


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: connected_platforms trigger_connected_platforms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_connected_platforms_updated_at BEFORE UPDATE ON public.connected_platforms FOR EACH ROW EXECUTE FUNCTION public.update_connected_platforms_updated_at();


--
-- Name: user_content trigger_user_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_user_content_updated_at BEFORE UPDATE ON public.user_content FOR EACH ROW EXECUTE FUNCTION public.update_user_content_updated_at();


--
-- Name: portfolio_projects update_portfolio_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: portfolios update_portfolios_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: connected_platforms connected_platforms_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connected_platforms
    ADD CONSTRAINT connected_platforms_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: portfolio_analytics portfolio_analytics_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_analytics
    ADD CONSTRAINT portfolio_analytics_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolio_projects portfolio_projects_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_projects
    ADD CONSTRAINT portfolio_projects_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: portfolios portfolios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_content user_content_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_content
    ADD CONSTRAINT user_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: portfolio_analytics Allow analytics insertion; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow analytics insertion" ON public.portfolio_analytics FOR INSERT WITH CHECK (true);


--
-- Name: waitlist Anyone can join waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);


--
-- Name: portfolio_projects Public can view projects for published portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view projects for published portfolios" ON public.portfolio_projects FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = portfolio_projects.portfolio_id) AND (portfolios.is_published = true)))));


--
-- Name: waitlist Public can view waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view waitlist" ON public.waitlist FOR SELECT USING (true);


--
-- Name: portfolios Published portfolios are publicly viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published portfolios are publicly viewable" ON public.portfolios FOR SELECT USING ((is_published = true));


--
-- Name: portfolios Published portfolios viewable by subdomain; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published portfolios viewable by subdomain" ON public.portfolios FOR SELECT USING (((is_published = true) AND (subdomain IS NOT NULL)));


--
-- Name: user_content Users can delete their own content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own content" ON public.user_content FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: connected_platforms Users can delete their own platform connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own platform connections" ON public.connected_platforms FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: portfolios Users can delete their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_content Users can insert their own content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own content" ON public.user_content FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: connected_platforms Users can insert their own platform connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own platform connections" ON public.connected_platforms FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: portfolios Users can insert their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own portfolios" ON public.portfolios FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: portfolio_projects Users can manage projects for their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage projects for their portfolios" ON public.portfolio_projects USING ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = portfolio_projects.portfolio_id) AND (portfolios.user_id = auth.uid())))));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_content Users can update their own content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own content" ON public.user_content FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: connected_platforms Users can update their own platform connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own platform connections" ON public.connected_platforms FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: portfolios Users can update their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own portfolios" ON public.portfolios FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: portfolio_analytics Users can view analytics for their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view analytics for their portfolios" ON public.portfolio_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = portfolio_analytics.portfolio_id) AND (portfolios.user_id = auth.uid())))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_content Users can view their own content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own content" ON public.user_content FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: connected_platforms Users can view their own platform connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own platform connections" ON public.connected_platforms FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: portfolios Users can view their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own portfolios" ON public.portfolios FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: connected_platforms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connected_platforms ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolio_projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

--
-- Name: portfolios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

