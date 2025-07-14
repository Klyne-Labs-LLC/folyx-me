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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: connected_platforms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connected_platforms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    platform_type text NOT NULL,
    platform_username text,
    platform_user_id text,
    access_token text,
    refresh_token text,
    platform_data jsonb DEFAULT '{}'::jsonb,
    last_sync timestamp with time zone,
    sync_status text DEFAULT 'pending'::text,
    sync_error text,
    auto_sync_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
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

COPY public.connected_platforms (id, user_id, platform_type, platform_username, platform_user_id, access_token, refresh_token, platform_data, last_sync, sync_status, sync_error, auto_sync_enabled, created_at, updated_at) FROM stdin;
56ba1144-4f0e-444f-aeea-ae050f6e18f2	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	github	takitajwar17	\N	\N	\N	{"stats": {"languages": {"C": 1, "C#": 2, "CSS": 20359, "HTML": 2170, "Java": 2, "Ruby": 1, "Shell": 216, "Python": 30459, "JavaScript": 628299, "TypeScript": 1872256}, "total_forks": 8, "total_repos": 53, "total_stars": 5, "most_starred_repo": {"id": 971526470, "name": "lumenly.dev", "size": 732, "topics": [], "has_wiki": true, "homepage": "https://www.lumenly.dev", "html_url": "https://github.com/takitajwar17/lumenly.dev", "language": "TypeScript", "full_name": "takitajwar17/lumenly.dev", "has_pages": false, "languages": {"CSS": 3662, "HTML": 738, "JavaScript": 10297, "TypeScript": 253223}, "pushed_at": "2025-05-29T19:25:56Z", "created_at": "2025-04-23T16:51:04Z", "updated_at": "2025-05-29T19:25:59Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/lumenly.dev/languages", "default_branch": "main", "watchers_count": 2, "stargazers_count": 2, "open_issues_count": 0}}, "profile": {"id": 111155827, "bio": "Software Engineer | Open Source Contributor | AI Engineering Enthusiast", "blog": "takitajwar17.live", "name": "Taki Tajwaruzzaman Khan", "email": null, "login": "takitajwar17", "hireable": true, "location": "Bangladesh", "followers": 32, "following": 33, "avatar_url": "https://avatars.githubusercontent.com/u/111155827?v=4", "created_at": "2022-08-12T21:33:23Z", "updated_at": "2025-07-13T12:25:16Z", "public_gists": 0, "public_repos": 53}, "fetched_at": "2025-07-13T21:18:09.069Z", "repositories": [{"id": 573772991, "name": "takitajwar17", "size": 291, "topics": ["config", "github-config"], "has_wiki": false, "homepage": "https://github.com/TakiTajwar17", "html_url": "https://github.com/takitajwar17/takitajwar17", "language": null, "full_name": "takitajwar17/takitajwar17", "has_pages": false, "languages": {}, "pushed_at": "2025-07-13T12:56:53Z", "created_at": "2022-12-03T11:42:52Z", "updated_at": "2025-07-13T12:56:56Z", "description": "Config files for my GitHub profile.", "forks_count": 1, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/takitajwar17/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 923100841, "name": "SaaS-Boilerplate", "size": 4003, "topics": [], "has_wiki": true, "homepage": "https://react-saas.com/", "html_url": "https://github.com/takitajwar17/SaaS-Boilerplate", "language": "TypeScript", "full_name": "takitajwar17/SaaS-Boilerplate", "has_pages": false, "languages": {"CSS": 1522, "Shell": 216, "JavaScript": 4746, "TypeScript": 109368}, "pushed_at": "2025-07-05T15:34:07Z", "created_at": "2025-01-27T16:40:04Z", "updated_at": "2025-07-05T15:34:13Z", "description": "🚀🎉📚 SaaS Boilerplate built with Next.js + Tailwind CSS + Shadcn UI + TypeScript. ⚡️ Full-stack React application with Auth, Multi-tenancy, Roles & Permissions, i18n, Landing Page, DB, Logging, Testing", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/SaaS-Boilerplate/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 1014303557, "name": "gemini-bball", "size": 16109, "topics": [], "has_wiki": true, "homepage": null, "html_url": "https://github.com/takitajwar17/gemini-bball", "language": null, "full_name": "takitajwar17/gemini-bball", "has_pages": false, "languages": {"Python": 11446}, "pushed_at": "2025-07-02T04:32:07Z", "created_at": "2025-07-05T12:57:54Z", "updated_at": "2025-07-05T12:57:54Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/gemini-bball/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 1006447822, "name": "Problem-3-Handwritten-Digit-Generation-Web-App-", "size": 25241, "topics": [], "has_wiki": true, "homepage": "https://problem-3-handwritten-digit-generation-web-app.streamlit.app/", "html_url": "https://github.com/takitajwar17/Problem-3-Handwritten-Digit-Generation-Web-App-", "language": "Python", "full_name": "takitajwar17/Problem-3-Handwritten-Digit-Generation-Web-App-", "has_pages": false, "languages": {"Python": 19007}, "pushed_at": "2025-06-22T10:50:16Z", "created_at": "2025-06-22T09:43:50Z", "updated_at": "2025-06-23T20:21:47Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Problem-3-Handwritten-Digit-Generation-Web-App-/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 998555426, "name": "A17.chat", "size": 556, "topics": [], "has_wiki": true, "homepage": "https://www.a17.chat", "html_url": "https://github.com/takitajwar17/A17.chat", "language": "TypeScript", "full_name": "takitajwar17/A17.chat", "has_pages": false, "languages": {"CSS": 4164, "JavaScript": 13302, "TypeScript": 408285}, "pushed_at": "2025-06-15T11:11:11Z", "created_at": "2025-06-08T21:23:19Z", "updated_at": "2025-06-15T11:11:15Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/A17.chat/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 982908398, "name": "inherit-algoarena", "size": 3559, "topics": [], "has_wiki": true, "homepage": "https://inherit-xtradrill.vercel.app/", "html_url": "https://github.com/takitajwar17/inherit-algoarena", "language": "TypeScript", "full_name": "takitajwar17/inherit-algoarena", "has_pages": false, "languages": {"CSS": 3455, "HTML": 354, "TypeScript": 62985}, "pushed_at": "2025-05-18T18:45:25Z", "created_at": "2025-05-13T15:25:01Z", "updated_at": "2025-06-04T05:27:58Z", "description": "Inherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/inherit-algoarena/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 993825177, "name": "menoo", "size": 234, "topics": [], "has_wiki": false, "homepage": null, "html_url": "https://github.com/takitajwar17/menoo", "language": "TypeScript", "full_name": "takitajwar17/menoo", "has_pages": false, "languages": {"TypeScript": 120500}, "pushed_at": "2025-05-31T17:21:24Z", "created_at": "2025-05-31T15:51:29Z", "updated_at": "2025-05-31T17:21:27Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/menoo/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 971526470, "name": "lumenly.dev", "size": 732, "topics": [], "has_wiki": true, "homepage": "https://www.lumenly.dev", "html_url": "https://github.com/takitajwar17/lumenly.dev", "language": "TypeScript", "full_name": "takitajwar17/lumenly.dev", "has_pages": false, "languages": {"CSS": 3662, "HTML": 738, "JavaScript": 10297, "TypeScript": 253223}, "pushed_at": "2025-05-29T19:25:56Z", "created_at": "2025-04-23T16:51:04Z", "updated_at": "2025-05-29T19:25:59Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/lumenly.dev/languages", "default_branch": "main", "watchers_count": 2, "stargazers_count": 2, "open_issues_count": 0}, {"id": 878567042, "name": "inherit", "size": 3921, "topics": [], "has_wiki": true, "homepage": "https://inherit-xtradrill.vercel.app", "html_url": "https://github.com/takitajwar17/inherit", "language": "JavaScript", "full_name": "takitajwar17/inherit", "has_pages": false, "languages": {"CSS": 4168, "JavaScript": 593766}, "pushed_at": "2025-03-18T22:57:29Z", "created_at": "2024-10-25T16:20:13Z", "updated_at": "2025-05-26T04:41:47Z", "description": "Inherit is a modern educational platform built with Next.js, designed to provide an immersive and structured learning experience for aspiring developers. ", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/inherit/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 990242761, "name": "CampusConnect", "size": 694, "topics": [], "has_wiki": true, "homepage": null, "html_url": "https://github.com/takitajwar17/CampusConnect", "language": null, "full_name": "takitajwar17/CampusConnect", "has_pages": false, "languages": {"CSS": 3388, "HTML": 1075, "JavaScript": 6174, "TypeScript": 917884}, "pushed_at": "2025-05-25T00:48:15Z", "created_at": "2025-05-25T19:35:04Z", "updated_at": "2025-05-25T19:35:04Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/CampusConnect/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 985920795, "name": "system-prompts-and-models-of-ai-tools", "size": 361, "topics": [], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/system-prompts-and-models-of-ai-tools", "language": null, "full_name": "takitajwar17/system-prompts-and-models-of-ai-tools", "has_pages": false, "pushed_at": "2025-05-17T17:25:39Z", "created_at": "2025-05-18T19:45:49Z", "updated_at": "2025-05-18T19:45:49Z", "description": "FULL v0, Cursor, Manus, Same.dev, Lovable, Devin, Replit Agent, Windsurf Agent, VSCode Agent, Dia Browser & Trae AI (And other Open Sourced) System Prompts, Tools & AI Models.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/system-prompts-and-models-of-ai-tools/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 899314479, "name": "lyceum-iubat-hackathon", "size": 2159, "topics": ["education", "hackathon", "nextjs"], "has_wiki": true, "homepage": "https://lyceum-iubat-hackathon.vercel.app", "html_url": "https://github.com/takitajwar17/lyceum-iubat-hackathon", "language": "JavaScript", "full_name": "takitajwar17/lyceum-iubat-hackathon", "has_pages": false, "pushed_at": "2024-12-09T15:50:08Z", "created_at": "2024-12-06T02:42:53Z", "updated_at": "2025-04-12T11:33:14Z", "description": "Lyceum is an winning project developed by Team XtraDrill, champion of the Dhaka Divisional Hackathon 2024 - Technocrats v.2, recognized for its innovative approach to educational technology and exceptional implementation.", "forks_count": 1, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/lyceum-iubat-hackathon/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 938559536, "name": "FaceNet-RealTime-Attendance", "size": 92852, "topics": [], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/FaceNet-RealTime-Attendance", "language": "Python", "full_name": "takitajwar17/FaceNet-RealTime-Attendance", "has_pages": false, "pushed_at": "2025-03-26T15:02:58Z", "created_at": "2025-02-25T06:27:14Z", "updated_at": "2025-03-26T15:03:02Z", "description": "A real-time face recognition attendance system built with FaceNet (Inception-ResNet-V1), PyTorch, and OpenCV, leveraging fine-tuned VGGFace2 pretrained model with custom feature processing and data augmentation pipeline.", "forks_count": 1, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/FaceNet-RealTime-Attendance/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 885132875, "name": "inherit-ewu-hackathon-xtradrill", "size": 2162, "topics": [], "has_wiki": true, "homepage": "https://inherit-ewu-hackathon-xtra-drill.vercel.app", "html_url": "https://github.com/takitajwar17/inherit-ewu-hackathon-xtradrill", "language": "JavaScript", "full_name": "takitajwar17/inherit-ewu-hackathon-xtradrill", "has_pages": false, "pushed_at": "2024-11-23T12:57:26Z", "created_at": "2024-11-08T02:36:53Z", "updated_at": "2025-03-22T09:12:46Z", "description": "Inherit, developed by Team XtraDrill, is a unified learning and coding platform that won 1st Runner-Up at the National Hackathon at EWU National RoboFest 2024, leveraging technologies like Next.js, Express.js, and AI integration to bridge educational inequalities in Bangladesh's IT sector.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/inherit-ewu-hackathon-xtradrill/languages", "default_branch": "main", "watchers_count": 1, "stargazers_count": 1, "open_issues_count": 0}, {"id": 882990737, "name": "evently", "size": 3897, "topics": [], "has_wiki": true, "homepage": "https://evently-mu-henna.vercel.app", "html_url": "https://github.com/takitajwar17/evently", "language": "TypeScript", "full_name": "takitajwar17/evently", "has_pages": false, "pushed_at": "2025-02-22T14:17:51Z", "created_at": "2024-11-04T07:21:33Z", "updated_at": "2025-03-21T01:43:41Z", "description": "A full-stack event management platform built with Next.js 14, leveraging Server Actions for real-time operations, Clerk authentication, and MongoDB with Mongoose for data persistence.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/evently/languages", "default_branch": "main", "watchers_count": 1, "stargazers_count": 1, "open_issues_count": 0}, {"id": 948180274, "name": "astx", "size": 13497, "topics": [], "has_wiki": true, "homepage": "https://astx.arxlang.org/", "html_url": "https://github.com/takitajwar17/astx", "language": "Python", "full_name": "takitajwar17/astx", "has_pages": false, "pushed_at": "2025-03-15T02:03:07Z", "created_at": "2025-03-13T22:10:52Z", "updated_at": "2025-03-15T02:03:10Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/astx/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 826262802, "name": "CookConnect", "size": 24250, "topics": ["aws", "cloudfront-distribution", "custom-vpc", "django-rest-framework", "ec2-instance", "react-vite", "s3-bucket"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/CookConnect", "language": "Python", "full_name": "takitajwar17/CookConnect", "has_pages": false, "pushed_at": "2024-07-11T19:19:42Z", "created_at": "2024-07-09T11:20:53Z", "updated_at": "2025-03-11T15:20:47Z", "description": "CookConnect is a React.js and Django-based web app for discovering, sharing, and managing recipes, deployed on AWS. It leverages AWS S3 for storage, EC2 for hosting, CloudFront for content delivery, a custom VPC for networking, and PostgreSQL as the database. Built using Django REST Framework and React Vite.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/CookConnect/languages", "default_branch": "main", "watchers_count": 1, "stargazers_count": 1, "open_issues_count": 0}, {"id": 857616572, "name": "DP-Lab-146", "size": 245, "topics": ["design-patterns"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/DP-Lab-146", "language": "Java", "full_name": "takitajwar17/DP-Lab-146", "has_pages": false, "pushed_at": "2025-02-28T22:39:19Z", "created_at": "2024-09-15T06:12:17Z", "updated_at": "2025-02-28T22:39:22Z", "description": "This repository contains the solutions and implementations for various lab exercises in the SWE 4502: Design Patterns course. ", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/DP-Lab-146/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 868535805, "name": "Kolab-Dev-Classroom", "size": 3457, "topics": [], "has_wiki": true, "homepage": "https://kolab-dev-classroom.vercel.app", "html_url": "https://github.com/takitajwar17/Kolab-Dev-Classroom", "language": "JavaScript", "full_name": "takitajwar17/Kolab-Dev-Classroom", "has_pages": true, "pushed_at": "2025-02-27T10:45:24Z", "created_at": "2024-10-06T16:25:09Z", "updated_at": "2025-02-27T10:45:27Z", "description": null, "forks_count": 2, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Kolab-Dev-Classroom/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 926806769, "name": "cloudflare-workers-nextjs-saas-template", "size": 838, "topics": [], "has_wiki": true, "homepage": "https://saas-stack.startupstudio.dev/sign-in", "html_url": "https://github.com/takitajwar17/cloudflare-workers-nextjs-saas-template", "language": "TypeScript", "full_name": "takitajwar17/cloudflare-workers-nextjs-saas-template", "has_pages": false, "pushed_at": "2025-02-07T22:16:39Z", "created_at": "2025-02-03T22:17:34Z", "updated_at": "2025-02-07T22:16:50Z", "description": "Cloudflare Workers SaaS Template", "forks_count": 0, "is_template": true, "languages_url": "https://api.github.com/repos/takitajwar17/cloudflare-workers-nextjs-saas-template/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 908194069, "name": "xtradrill-learnathon", "size": 1914, "topics": [], "has_wiki": true, "homepage": "https://hiringai.vercel.app", "html_url": "https://github.com/takitajwar17/xtradrill-learnathon", "language": "JavaScript", "full_name": "takitajwar17/xtradrill-learnathon", "has_pages": false, "pushed_at": "2025-02-04T17:03:34Z", "created_at": "2024-12-25T12:05:33Z", "updated_at": "2025-02-04T17:03:38Z", "description": "Repository for team XtraDrill in Learnathon 3.0 organized in collaboration with Geeky Solutions and Brainstation 23.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/xtradrill-learnathon/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 923104228, "name": "shipfast-template", "size": 1285, "topics": [], "has_wiki": false, "homepage": null, "html_url": "https://github.com/takitajwar17/shipfast-template", "language": null, "full_name": "takitajwar17/shipfast-template", "has_pages": false, "pushed_at": "2024-04-15T03:24:08Z", "created_at": "2025-01-27T16:46:39Z", "updated_at": "2025-01-27T16:48:34Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/shipfast-template/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 923102943, "name": "shipfast-template-supabse", "size": 592, "topics": [], "has_wiki": true, "homepage": null, "html_url": "https://github.com/takitajwar17/shipfast-template-supabse", "language": null, "full_name": "takitajwar17/shipfast-template-supabse", "has_pages": false, "pushed_at": "2024-03-15T19:45:27Z", "created_at": "2025-01-27T16:44:08Z", "updated_at": "2025-01-27T16:44:08Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/shipfast-template-supabse/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 923102615, "name": "big-AGI", "size": 31222, "topics": [], "has_wiki": false, "homepage": "https://big-agi.com", "html_url": "https://github.com/takitajwar17/big-AGI", "language": null, "full_name": "takitajwar17/big-AGI", "has_pages": false, "pushed_at": "2025-01-25T18:14:51Z", "created_at": "2025-01-27T16:43:31Z", "updated_at": "2025-01-27T16:43:31Z", "description": "AI suite powered by state-of-the-art models and providing advanced AI/AGI functions. It features AI personas, AGI functions, multi-model chats, text-to-image, voice, response streaming, code highlighting and execution, PDF import, presets for developers, much more. Deploy on-prem or in the cloud.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/big-AGI/languages", "default_branch": "v2-dev", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 911475190, "name": "KUET-BitFest2025-Hackathon-XtraDrill", "size": 11031, "topics": [], "has_wiki": true, "homepage": "https://okkhor-xtradrill.vercel.app/", "html_url": "https://github.com/takitajwar17/KUET-BitFest2025-Hackathon-XtraDrill", "language": "JavaScript", "full_name": "takitajwar17/KUET-BitFest2025-Hackathon-XtraDrill", "has_pages": false, "pushed_at": "2025-01-26T10:04:58Z", "created_at": "2025-01-03T05:28:54Z", "updated_at": "2025-01-26T10:05:01Z", "description": "অক্ষর (Okkhor) is an innovative Bengali language learning platform that combines AI-powered features with real-time collaboration capabilities to make learning Bengali more accessible and interactive.", "forks_count": 2, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/KUET-BitFest2025-Hackathon-XtraDrill/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 914883580, "name": "browser-use", "size": 3990, "topics": [], "has_wiki": true, "homepage": "https://browser-use.com/", "html_url": "https://github.com/takitajwar17/browser-use", "language": null, "full_name": "takitajwar17/browser-use", "has_pages": false, "pushed_at": "2025-01-09T21:20:29Z", "created_at": "2025-01-10T14:02:16Z", "updated_at": "2025-01-10T14:02:16Z", "description": "Make websites accessible for AI agents", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/browser-use/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 906618761, "name": "KUET-Hackathon-Preli-XtraDrill", "size": 2927, "topics": [], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/KUET-Hackathon-Preli-XtraDrill", "language": "JavaScript", "full_name": "takitajwar17/KUET-Hackathon-Preli-XtraDrill", "has_pages": false, "pushed_at": "2024-12-21T16:06:38Z", "created_at": "2024-12-21T12:14:23Z", "updated_at": "2024-12-21T17:49:28Z", "description": "This repository contains the submission for the preliminary round of the KUET BitFest 2025 - Hackathon segment of team XtraDrill.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/KUET-Hackathon-Preli-XtraDrill/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 891201842, "name": "bolt.new-any-llm", "size": 3381, "topics": [], "has_wiki": false, "homepage": "https://bolt.new", "html_url": "https://github.com/takitajwar17/bolt.new-any-llm", "language": "TypeScript", "full_name": "takitajwar17/bolt.new-any-llm", "has_pages": false, "pushed_at": "2024-12-07T22:00:18Z", "created_at": "2024-11-19T22:56:16Z", "updated_at": "2024-12-11T14:43:46Z", "description": "Prompt, run, edit, and deploy full-stack web applications using any LLM you want!", "forks_count": 0, "is_template": true, "languages_url": "https://api.github.com/repos/takitajwar17/bolt.new-any-llm/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 821665517, "name": "personal-dev-portfolio", "size": 3206, "topics": ["portfolio-website", "responsive"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/personal-dev-portfolio", "language": "HTML", "full_name": "takitajwar17/personal-dev-portfolio", "has_pages": false, "pushed_at": "2024-07-01T12:45:41Z", "created_at": "2024-06-29T05:12:41Z", "updated_at": "2024-12-04T16:48:08Z", "description": "A responsive portfolio website showcasing work, skills, and projects, built using HTML, CSS, and JavaScript.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/personal-dev-portfolio/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 878689484, "name": "takitajwar17.live", "size": 20172, "topics": [], "has_wiki": true, "homepage": "https://takitajwar17.live", "html_url": "https://github.com/takitajwar17/takitajwar17.live", "language": "JavaScript", "full_name": "takitajwar17/takitajwar17.live", "has_pages": false, "pushed_at": "2024-12-04T10:27:55Z", "created_at": "2024-10-25T21:37:43Z", "updated_at": "2024-12-04T14:39:26Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/takitajwar17.live/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 898141232, "name": "battle-of-insights-takitajwar17", "size": 4425, "topics": ["data-science", "data-visualization"], "has_wiki": true, "homepage": "https://battle-of-insights-takitajwar17.vercel.app", "html_url": "https://github.com/takitajwar17/battle-of-insights-takitajwar17", "language": "HTML", "full_name": "takitajwar17/battle-of-insights-takitajwar17", "has_pages": false, "pushed_at": "2024-12-03T21:56:19Z", "created_at": "2024-12-03T21:30:51Z", "updated_at": "2024-12-03T22:03:48Z", "description": "An enterprise-grade retail analytics dashboard leveraging Python and Plotly to transform transaction data into actionable business insights through interactive visualizations", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/battle-of-insights-takitajwar17/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 864190794, "name": "CSE-4502-Operating-Systems", "size": 284, "topics": ["kernel", "operating-systems"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/CSE-4502-Operating-Systems", "language": "C", "full_name": "takitajwar17/CSE-4502-Operating-Systems", "has_pages": false, "pushed_at": "2024-11-22T14:44:33Z", "created_at": "2024-09-27T17:00:25Z", "updated_at": "2024-11-22T14:44:37Z", "description": "This repository contains the solutions and implementations for various lab exercises in the CSE-4502: Operating Systems course.", "forks_count": 1, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/CSE-4502-Operating-Systems/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 891121042, "name": "SWE-4502", "size": 20, "topics": [], "has_wiki": true, "homepage": null, "html_url": "https://github.com/takitajwar17/SWE-4502", "language": null, "full_name": "takitajwar17/SWE-4502", "has_pages": false, "pushed_at": "2024-11-16T17:42:34Z", "created_at": "2024-11-19T19:05:11Z", "updated_at": "2024-11-19T19:05:11Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/SWE-4502/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 888550151, "name": "envault", "size": 53, "topics": [], "has_wiki": true, "homepage": "https://envault-omega.vercel.app", "html_url": "https://github.com/takitajwar17/envault", "language": "TypeScript", "full_name": "takitajwar17/envault", "has_pages": false, "pushed_at": "2024-11-14T15:38:33Z", "created_at": "2024-11-14T15:36:47Z", "updated_at": "2024-11-14T15:38:57Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/envault/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 886590865, "name": "LegalPlain.ai", "size": 367, "topics": [], "has_wiki": true, "homepage": "https://legalplainai.vercel.app", "html_url": "https://github.com/takitajwar17/LegalPlain.ai", "language": "TypeScript", "full_name": "takitajwar17/LegalPlain.ai", "has_pages": false, "pushed_at": "2024-11-14T09:21:54Z", "created_at": "2024-11-11T08:53:21Z", "updated_at": "2024-11-14T09:21:58Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/LegalPlain.ai/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 888031744, "name": "AQI-Monitoring-and-Prediction-System", "size": 110, "topics": [], "has_wiki": true, "homepage": "https://aqi-monitoring-and-prediction-system.vercel.app", "html_url": "https://github.com/takitajwar17/AQI-Monitoring-and-Prediction-System", "language": "TypeScript", "full_name": "takitajwar17/AQI-Monitoring-and-Prediction-System", "has_pages": false, "pushed_at": "2024-11-13T17:50:51Z", "created_at": "2024-11-13T17:37:07Z", "updated_at": "2024-11-13T17:51:51Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/AQI-Monitoring-and-Prediction-System/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 785271154, "name": "CrackEd-App", "size": 6007, "topics": ["education", "full-stack-web-development", "mern-stack"], "has_wiki": true, "homepage": "https://crack-ed-app.vercel.app", "html_url": "https://github.com/takitajwar17/CrackEd-App", "language": "JavaScript", "full_name": "takitajwar17/CrackEd-App", "has_pages": false, "pushed_at": "2024-10-27T13:57:13Z", "created_at": "2024-04-11T14:48:52Z", "updated_at": "2024-10-27T13:57:16Z", "description": "CrackEd is a fullstack educational platform using the MERN stack (MongoDB, Express.js, React, Node.js) for IUT admission test preparation, featuring student, tutor, and admin functionalities.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/CrackEd-App/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 872130340, "name": "thismoviesucks.com", "size": 31081, "topics": [], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/thismoviesucks.com", "language": "JavaScript", "full_name": "takitajwar17/thismoviesucks.com", "has_pages": false, "pushed_at": "2024-10-14T13:44:59Z", "created_at": "2024-10-13T21:14:01Z", "updated_at": "2024-10-14T13:45:05Z", "description": "thismoviesucks.com is a user-friendly movie review platform where users can log in, browse movies by genre, leave reviews, and add films to their watchlists or favorites.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/thismoviesucks.com/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 828164476, "name": "chatwoot", "size": 131218, "topics": [], "has_wiki": true, "homepage": "https://www.chatwoot.com/help-center", "html_url": "https://github.com/takitajwar17/chatwoot", "language": "Ruby", "full_name": "takitajwar17/chatwoot", "has_pages": false, "pushed_at": "2024-09-16T12:01:17Z", "created_at": "2024-07-13T10:05:45Z", "updated_at": "2024-09-16T12:01:54Z", "description": "Open-source live-chat, email support, omni-channel desk. An alternative to Intercom, Zendesk, Salesforce Service Cloud etc. 🔥💬", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/chatwoot/languages", "default_branch": "develop", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 856211826, "name": "mcertikos", "size": 655, "topics": [], "has_wiki": true, "homepage": "http://flint.cs.yale.edu/cs422/", "html_url": "https://github.com/takitajwar17/mcertikos", "language": null, "full_name": "takitajwar17/mcertikos", "has_pages": false, "pushed_at": "2017-01-01T19:04:30Z", "created_at": "2024-09-12T07:24:54Z", "updated_at": "2024-09-12T07:24:54Z", "description": "Micro certified linux kernel, final project of CS 422/522 Operating System at Yale,  2015 Fall", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/mcertikos/languages", "default_branch": "master", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 752649327, "name": "skills-review-pull-requests", "size": 23, "topics": ["mlsa", "mlsa-technical-onboarding"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/skills-review-pull-requests", "language": "HTML", "full_name": "takitajwar17/skills-review-pull-requests", "has_pages": false, "pushed_at": "2024-02-04T12:57:20Z", "created_at": "2024-02-04T12:29:41Z", "updated_at": "2024-07-01T22:05:05Z", "description": "This repository is part of the Microsoft Learn training module \\"Manage repository changes by using pull requests on GitHub\\"", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/skills-review-pull-requests/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 752662237, "name": "studentambassadors", "size": 34601, "topics": ["mlsa"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/studentambassadors", "language": null, "full_name": "takitajwar17/studentambassadors", "has_pages": false, "pushed_at": "2024-01-31T08:28:09Z", "created_at": "2024-02-04T13:12:54Z", "updated_at": "2024-07-01T22:04:38Z", "description": "This repository is for Microsoft Learn Student Ambassadors. ", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/studentambassadors/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 720458528, "name": "QuizMasterAPI", "size": 445, "topics": ["api", "nodejs"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/QuizMasterAPI", "language": "JavaScript", "full_name": "takitajwar17/QuizMasterAPI", "has_pages": false, "pushed_at": "2024-01-26T12:59:32Z", "created_at": "2023-11-18T14:52:45Z", "updated_at": "2024-07-01T22:04:23Z", "description": "The QuizMasterAPI is a Node.js web application managing quizzes. It utilizes JSON files for data storage, featuring distinct controllers for user and admin functionalities. The backend implements token-based authentication, and the frontend communicates through HTTP requests for user registration, login, quiz-taking, and admin-related tasks.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/QuizMasterAPI/languages", "default_branch": "redeagle", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 737977571, "name": "Simple-Todo-List-Refactored", "size": 84, "topics": ["todolist"], "has_wiki": true, "homepage": "https://takitajwar17.github.io/Simple-Todo-List-Refactored/", "html_url": "https://github.com/takitajwar17/Simple-Todo-List-Refactored", "language": "JavaScript", "full_name": "takitajwar17/Simple-Todo-List-Refactored", "has_pages": true, "pushed_at": "2024-01-16T13:11:45Z", "created_at": "2024-01-02T05:47:45Z", "updated_at": "2024-07-01T22:03:53Z", "description": "This forked TODO list web app has undergone significant improvements to align with SOLID principles and clean code practices. The refined version offers an appealing UI for effortless management of to-dos, optimizing local storage for a seamless user experience.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Simple-Todo-List-Refactored/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 740052889, "name": "Happy-Birthday-Project", "size": 22, "topics": ["css", "html", "js"], "has_wiki": true, "homepage": "https://takitajwar17.github.io/Happy-Birthday-Project/", "html_url": "https://github.com/takitajwar17/Happy-Birthday-Project", "language": "JavaScript", "full_name": "takitajwar17/Happy-Birthday-Project", "has_pages": true, "pushed_at": "2024-01-08T19:03:52Z", "created_at": "2024-01-07T11:38:41Z", "updated_at": "2024-07-01T22:02:03Z", "description": "The Happy Birthday Project is an HTML5 Canvas and JavaScript-based web animation, creating a dynamic \\"Happy Birthday\\" wish with lively features like animated fireworks and floating balloons. Driven by the app.js logic, the project employs the HTML5 Canvas API for rendering dynamic elements, ensuring a responsive design for adaptability. ", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Happy-Birthday-Project/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 736798917, "name": "BinaryVision", "size": 30, "topics": ["java", "swing-gui"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/BinaryVision", "language": "Java", "full_name": "takitajwar17/BinaryVision", "has_pages": false, "pushed_at": "2024-01-01T13:44:51Z", "created_at": "2023-12-28T23:02:01Z", "updated_at": "2024-07-01T22:01:26Z", "description": "BinaryVision, a Java-based Binary Search Tree (BST) visualizer using Swing, showcases dynamic element addition and deletion with keyboard shortcuts. The program handles integer inputs and provides informative pop-ups. Additionally, it offers a comprehensive view of the tree through inorder, preorder, and postorder traversal.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/BinaryVision/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 621718528, "name": "Hackathon_Team_Aspirants", "size": 4925, "topics": ["dotnet", "hackathon"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/Hackathon_Team_Aspirants", "language": "C#", "full_name": "takitajwar17/Hackathon_Team_Aspirants", "has_pages": false, "pushed_at": "2023-11-08T21:24:05Z", "created_at": "2023-03-31T08:36:13Z", "updated_at": "2024-07-01T22:01:04Z", "description": "CV Generator, crafted by Team Aspirants for CodeRush 1.0, is a C# desktop app simplifying CV creation with a user-friendly template. Utilizing .NET Framework and GitHub, it offers features like template creation, data storage, and CV downloads, addressing essential needs within the hackathon's timeframe.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Hackathon_Team_Aspirants/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 815364964, "name": "machine-learning-specialization-andrew-ng", "size": 14367, "topics": ["andrew-ng-machine-learning", "machine-learning"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/machine-learning-specialization-andrew-ng", "language": null, "full_name": "takitajwar17/machine-learning-specialization-andrew-ng", "has_pages": false, "pushed_at": "2023-06-08T16:48:57Z", "created_at": "2024-06-15T00:42:32Z", "updated_at": "2024-07-01T22:00:23Z", "description": "A collection of notes and implementations of machine learning algorithms from Andrew Ng's machine learning specialization.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/machine-learning-specialization-andrew-ng/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 746160385, "name": "portfolio-project-js", "size": 27349, "topics": ["mlsa", "portfolio-website"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/portfolio-project-js", "language": "JavaScript", "full_name": "takitajwar17/portfolio-project-js", "has_pages": true, "pushed_at": "2024-02-04T12:15:13Z", "created_at": "2024-01-21T08:40:29Z", "updated_at": "2024-07-01T21:59:21Z", "description": "This repository is part of the Technical Onboarding of Microsoft Learn Student Ambassador Program", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/portfolio-project-js/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 807787872, "name": "AutomateWhatsapp", "size": 6, "topics": ["pywhatkit", "whatsapp-bot"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/AutomateWhatsapp", "language": "Python", "full_name": "takitajwar17/AutomateWhatsapp", "has_pages": false, "pushed_at": "2024-05-29T19:26:00Z", "created_at": "2024-05-29T19:16:03Z", "updated_at": "2024-07-01T21:56:58Z", "description": "Automates sending WhatsApp messages at set intervals using pywhatkit.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/AutomateWhatsapp/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 821250795, "name": "LLM-Financial-Advisor", "size": 477, "topics": ["aws", "fine-tuning", "generative-ai"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/LLM-Financial-Advisor", "language": "Jupyter Notebook", "full_name": "takitajwar17/LLM-Financial-Advisor", "has_pages": false, "pushed_at": "2024-07-01T16:42:30Z", "created_at": "2024-06-28T06:16:21Z", "updated_at": "2024-07-01T16:42:33Z", "description": "This project involves fine-tuning the Meta Llama 2 7B model using AWS SageMaker to develop domain-specific AI consultants in finance, medical, or IT, enhancing text generation and information delivery.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/LLM-Financial-Advisor/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 752312137, "name": "LeetCode-CodeForces", "size": 6, "topics": ["codeforces", "leetcode", "problem-solving"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/LeetCode-CodeForces", "language": "Python", "full_name": "takitajwar17/LeetCode-CodeForces", "has_pages": false, "pushed_at": "2024-06-30T12:42:43Z", "created_at": "2024-02-03T15:55:23Z", "updated_at": "2024-06-30T12:42:46Z", "description": "This repo hosts my Python solutions to LeetCode and CodeForces problems.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/LeetCode-CodeForces/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}, {"id": 646933430, "name": "Project-Skedule-4.0", "size": 6663, "topics": ["csharp", "dotnet-framework", "schedule", "student"], "has_wiki": true, "homepage": "", "html_url": "https://github.com/takitajwar17/Project-Skedule-4.0", "language": "C#", "full_name": "takitajwar17/Project-Skedule-4.0", "has_pages": false, "pushed_at": "2023-06-12T00:31:48Z", "created_at": "2023-05-29T17:15:54Z", "updated_at": "2023-05-29T18:19:20Z", "description": "Skedule is a C# desktop application utilizing the .NET framework, designed to centralize academic resources for students, featuring modules for routine management, announcements, event promotion, quiz/exam tracking, assignment organization, self-assessment, peer discussion, and an in-built clock functionality.", "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/Project-Skedule-4.0/languages", "default_branch": "main", "watchers_count": 0, "stargazers_count": 0, "open_issues_count": 0}]}	2025-07-13 21:18:09.069+00	completed	\N	t	2025-07-13 17:29:57.935222+00	2025-07-13 21:18:10.043298+00
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
6540cf6e-23c8-4c6d-a279-bb1521c15ba0	76a38c7e-9f1c-4265-ba67-337b779352c7	github	971526470	Lumenly.Dev	No description provided	\N	["TypeScript"]	[]	{"demo": "https://www.lumenly.dev", "live": null, "github": "https://github.com/takitajwar17/lumenly.dev"}	{"forks": 0, "stars": 2, "watchers": 2, "last_updated": "2025-05-29T19:25:59Z"}	t	0	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
c47b7ecb-d741-4af9-bf8d-81cd36495893	76a38c7e-9f1c-4265-ba67-337b779352c7	github	826262802	CookConnect	CookConnect is a React.js and Django-based web app for discovering, sharing, and managing recipes, deployed on AWS. It leverages AWS S3 for storage, EC2 for hosting, CloudFront for content delivery, a custom VPC for networking, and PostgreSQL as the database. Built using Django REST Framework and React Vite.	"Discover, share, and manage recipes with CookConnect, a sophisticated web app built with React.js and Django. Leveraging AWS services like S3, EC2, and CloudFront, along with a custom VPC and PostgreSQL database, CookConnect delivers a seamless user experience and powerful backend functionality."	["Python", "aws", "cloudfront-distribution", "custom-vpc", "django-rest-framework", "ec2-instance", "react-vite", "s3-bucket"]	[]	{"demo": null, "live": null, "github": "https://github.com/takitajwar17/CookConnect"}	{"forks": 0, "stars": 1, "watchers": 1, "last_updated": "2025-03-11T15:20:47Z"}	t	1	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
f5e64164-d5a0-4ecb-b5d7-91fc6b6b666b	76a38c7e-9f1c-4265-ba67-337b779352c7	github	885132875	Inherit Ewu Hackathon Xtradrill	Inherit, developed by Team XtraDrill, is a unified learning and coding platform that won 1st Runner-Up at the National Hackathon at EWU National RoboFest 2024, leveraging technologies like Next.js, Express.js, and AI integration to bridge educational inequalities in Bangladesh's IT sector.	"Inherit, a cutting-edge learning and coding platform developed by Team XtraDrill, secured 1st Runner-Up at the prestigious National Hackathon at EWU National RoboFest 2024. Leveraging Next.js, Express.js, and AI integration, Inherit aims to revolutionize the educational landscape in Bangladesh's IT sector by bridging inequalities and fostering technical proficiency."	["JavaScript"]	[]	{"demo": "https://inherit-ewu-hackathon-xtra-drill.vercel.app", "live": null, "github": "https://github.com/takitajwar17/inherit-ewu-hackathon-xtradrill"}	{"forks": 0, "stars": 1, "watchers": 1, "last_updated": "2025-03-22T09:12:46Z"}	t	2	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
7141a7e7-a4a2-4921-b18c-49c156144bb6	76a38c7e-9f1c-4265-ba67-337b779352c7	github	882990737	Evently	A full-stack event management platform built with Next.js 14, leveraging Server Actions for real-time operations, Clerk authentication, and MongoDB with Mongoose for data persistence.	"Revolutionize event management with our cutting-edge full-stack platform, powered by Next.js 14 and Server Actions for seamless real-time operations. Utilizing Clerk authentication and MongoDB with Mongoose, our platform delivers superior security and efficiency. Written in TypeScript for robust code quality. Join us and elevate your event planning experience."	["TypeScript"]	[]	{"demo": "https://evently-mu-henna.vercel.app", "live": null, "github": "https://github.com/takitajwar17/evently"}	{"forks": 0, "stars": 1, "watchers": 1, "last_updated": "2025-03-21T01:43:41Z"}	t	3	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
32765b55-9ba5-4960-839b-98d7b8887cd4	76a38c7e-9f1c-4265-ba67-337b779352c7	github	785271154	CrackEd App	CrackEd is a fullstack educational platform using the MERN stack (MongoDB, Express.js, React, Node.js) for IUT admission test preparation, featuring student, tutor, and admin functionalities.	"CrackEd is a cutting-edge educational platform built with the MERN stack, designed to streamline IUT admission test preparation with student, tutor, and admin capabilities. Leveraging JavaScript, this repository offers a comprehensive solution for full-stack web development in the education sector."	["JavaScript", "education", "full-stack-web-development", "mern-stack"]	[]	{"demo": "https://crack-ed-app.vercel.app", "live": null, "github": "https://github.com/takitajwar17/CrackEd-App"}	{"forks": 0, "stars": 0, "watchers": 0, "last_updated": "2024-10-27T13:57:16Z"}	f	4	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
2a93d247-7951-465b-aa18-ee5cbc9d1b42	76a38c7e-9f1c-4265-ba67-337b779352c7	github	821665517	Personal Dev Portfolio	A responsive portfolio website showcasing work, skills, and projects, built using HTML, CSS, and JavaScript.	"Craft a polished portfolio website to showcase your expertise and projects, utilizing the latest HTML, CSS, and JavaScript technologies for a seamless user experience. Elevate your professional presence with this responsive design that highlights your skills and accomplishments."	["HTML", "portfolio-website", "responsive"]	[]	{"demo": null, "live": null, "github": "https://github.com/takitajwar17/personal-dev-portfolio"}	{"forks": 0, "stars": 0, "watchers": 0, "last_updated": "2024-12-04T16:48:08Z"}	f	5	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
1a0ea346-4a6a-4c8c-a82d-aecb6f37f86b	76a38c7e-9f1c-4265-ba67-337b779352c7	github	746160385	Portfolio Project Js	This repository is part of the Technical Onboarding of Microsoft Learn Student Ambassador Program	"This repository showcases the JavaScript skills developed as part of the prestigious Microsoft Learn Student Ambassador Program, featuring a portfolio website project. Join us in exploring the intersection of technology and innovation in the MLSA community."	["JavaScript", "mlsa", "portfolio-website"]	[]	{"demo": null, "live": "https://takitajwar17.github.io/portfolio-project-js", "github": "https://github.com/takitajwar17/portfolio-project-js"}	{"forks": 0, "stars": 0, "watchers": 0, "last_updated": "2024-07-01T21:59:21Z"}	f	6	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
5f95872b-7107-4943-aa0d-960e2f03b948	76a38c7e-9f1c-4265-ba67-337b779352c7	github	923100841	SaaS Boilerplate	🚀🎉📚 SaaS Boilerplate built with Next.js + Tailwind CSS + Shadcn UI + TypeScript. ⚡️ Full-stack React application with Auth, Multi-tenancy, Roles & Permissions, i18n, Landing Page, DB, Logging, Testing	"Accelerate your SaaS development with our cutting-edge Next.js + Tailwind CSS + Shadcn UI + TypeScript boilerplate. This full-stack React application provides robust features like Auth, Multi-tenancy, Roles & Permissions, i18n, and more, ensuring a seamless user experience and efficient development process."	["TypeScript"]	[]	{"demo": "https://react-saas.com/", "live": null, "github": "https://github.com/takitajwar17/SaaS-Boilerplate"}	{"forks": 0, "stars": 0, "watchers": 0, "last_updated": "2025-07-05T15:34:13Z"}	f	7	2025-07-13 17:31:10.718175+00	2025-07-13 17:31:10.718175+00
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolios (id, user_id, title, slug, description, template_id, template_config, content_data, is_published, is_featured, custom_domain, seo_title, seo_description, view_count, last_generated_at, created_at, updated_at, subdomain) FROM stdin;
76a38c7e-9f1c-4265-ba67-337b779352c7	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	My github portfolio	my-github-portfolio		modern	{}	{"bio": "Taki Tajwaruzzaman Khan is a seasoned Software Engineer with a passion for AI Engineering based in Bangladesh. With 53 public repos and a dedicated following of 32, Taki's expertise in languages such as C, C#, CSS, HTML, and Java shines through in their impactful contributions to the open-source community. As an active open-source contributor and AI enthusiast, Taki is committed to pushing the boundaries of technology and innovation in the development world.", "stats": {"languages": {"C": 1, "C#": 2, "CSS": 20359, "HTML": 2170, "Java": 2, "Ruby": 1, "Shell": 216, "Python": 30459, "JavaScript": 628299, "TypeScript": 1872256}, "total_forks": 8, "total_repos": 53, "total_stars": 5, "most_starred_repo": {"id": 971526470, "name": "lumenly.dev", "size": 732, "topics": [], "has_wiki": true, "homepage": "https://www.lumenly.dev", "html_url": "https://github.com/takitajwar17/lumenly.dev", "language": "TypeScript", "full_name": "takitajwar17/lumenly.dev", "has_pages": false, "languages": {"CSS": 3662, "HTML": 738, "JavaScript": 10297, "TypeScript": 253223}, "pushed_at": "2025-05-29T19:25:56Z", "created_at": "2025-04-23T16:51:04Z", "updated_at": "2025-05-29T19:25:59Z", "description": null, "forks_count": 0, "is_template": false, "languages_url": "https://api.github.com/repos/takitajwar17/lumenly.dev/languages", "default_branch": "main", "watchers_count": 2, "stargazers_count": 2, "open_issues_count": 0}}, "skills": ["C", "C#", "CSS", "HTML", "Java", "Ruby", "Shell", "Python", "JavaScript", "TypeScript", "config", "education", "hackathon", "nextjs", "aws", "responsive", "kernel", "mlsa", "api", "nodejs"], "summary": "With 53 repositories and a total of 5 stars, this developer showcases a diverse range of technical skills in languages such as C, C#, CSS, HTML, and Java. Their most popular project, lumenly.dev, highlights their proficiency in web development and design. Recent projects like takitajwar17, SaaS-Boilerplate, and gemini-bball demonstrate their ability to create innovative solutions and contribute to a variety of software development projects. This developer's GitHub data reflects their strong technical expertise and experience in the field of software development.", "personal_info": {"name": "Taki Tajwaruzzaman Khan", "website": "takitajwar17.live", "location": "Bangladesh", "avatar_url": "https://avatars.githubusercontent.com/u/111155827?v=4", "github_url": "https://github.com/takitajwar17"}}	t	f	\N	\N	\N	0	2025-07-13 17:31:10.476+00	2025-07-13 17:30:50.060967+00	2025-07-13 17:31:36.032843+00	takitajwar17
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, full_name, avatar_url, customer_id, subscription_id, price_id, has_access, plan_type, onboarding_completed, created_at, updated_at) FROM stdin;
a7162ddb-8394-48ea-bb7b-bf8a508a8caa	tajwaruzzaman@iut-dhaka.edu	Taki Tajwaruzzaman Khan 210042146	https://lh3.googleusercontent.com/a/ACg8ocLE3SMvjBxJCYB4KFpjIcYIjR_lBHNoer9q20iOW0to4MF9IYYw=s96-c	\N	\N	\N	f	free	f	2025-07-13 01:10:39.773652+00	2025-07-13 01:10:39.773652+00
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
-- Name: idx_connected_platforms_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connected_platforms_type ON public.connected_platforms USING btree (platform_type);


--
-- Name: idx_connected_platforms_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connected_platforms_user_id ON public.connected_platforms USING btree (user_id);


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
-- Name: connected_platforms update_connected_platforms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_connected_platforms_updated_at BEFORE UPDATE ON public.connected_platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


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
    ADD CONSTRAINT connected_platforms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


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
-- Name: portfolios Users can delete their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


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
-- Name: connected_platforms Users can manage their own platform connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own platform connections" ON public.connected_platforms USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


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
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

