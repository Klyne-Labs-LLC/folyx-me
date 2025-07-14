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
635b1184-e4d5-4766-a51a-d11792c67020	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	github	111155827	takitajwar17	Taki Tajwaruzzaman Khan	public_access	\N	\N	{"id": 111155827, "bio": "Software Engineer | Open Source Contributor | AI Engineering Enthusiast", "blog": "takitajwar17.live", "name": "Taki Tajwaruzzaman Khan", "email": null, "avatar": "https://avatars.githubusercontent.com/u/111155827?v=4", "company": "Islamic University of Technology", "location": "Bangladesh", "username": "takitajwar17", "followers": 32, "following": 33, "created_at": "2022-08-12T21:33:23Z", "updated_at": "2025-07-13T12:25:16Z", "public_repos": 53}	\N	2025-07-14 05:34:21.491+00	2025-07-14 05:34:21.491+00	2025-07-14 05:34:21.491+00
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
1b3e94d0-32f1-43b3-ae75-78da2fc1f3af	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	qwhjbdqwd	qwhjbdqwd		modern	{}	{"bio": "Taki Tajwaruzzaman Khan is a skilled and experienced software developer with a strong background in GitHub. With a passion for coding and problem-solving, Taki has a proven track record of delivering high-quality solutions. Their dedication to continuous learning and growth makes them a valuable asset to any team.", "stats": {}, "skills": [], "summary": "Taki Tajwaruzzaman Khan is a skilled software developer with a strong presence on GitHub, showcasing a portfolio of impressive projects. With a background in computer science and a passion for coding, Taki has demonstrated the ability to create innovative solutions and collaborate effectively with teams. Their commitment to continuous learning and dedication to excellence make them a valuable asset in any technical role.", "education": [], "experience": [], "personal_info": {"name": "Taki Tajwaruzzaman Khan", "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "website": null, "location": null, "avatar_url": "https://avatars.githubusercontent.com/u/111155827?v=4", "github_url": "github.com/takitajwar17", "linkedin_url": null}}	f	f	\N	\N	\N	0	2025-07-14 05:38:49.453+00	2025-07-14 05:38:42.613644+00	2025-07-14 05:38:51.398611+00	qdwqdwd
1b4c3cae-aa0b-4e9c-80a8-bc15c5edd186	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	erg54g3f3	erg54g3f3		modern	{}	{"bio": "Taki Tajwaruzzaman Khan is a talented Software Engineer from Bangladesh with a passion for AI engineering and open source contributions. With a strong background in software development and a commitment to innovation, Taki is dedicated to pushing the boundaries of technology and making a meaningful impact in the industry. Connect with Taki on GitHub to see their impressive contributions firsthand.", "stats": {}, "skills": ["Python", "JavaScript", "Java", "C#", "PosgreSQL", "NoSQL (MongoDB)", "SQL  Developer Tools : Amazon Web Services (AWS)", "Docker", "CI/CD", "GitHub Actions  Technologies : Linux", "GitHub", "Postman", "Jira", "Asana  Frameworks : React", "NextJS", "Node.js", ".NET", "Django  Libraries : NumPy", "Matplotlib  Education  Islamic University of Technology (IUT)   Expected Graduation: May", "2026  B.Sc. in Software Engineering   Gazipur", "Bangladesh  ∗   Relevant Coursework:   Data Structures & Algorithms", "Object-Oriented Programming", "Database Management Systems", "Operating Systems", "Software Engineering"], "summary": "Taki Tajwaruzzaman Khan is a highly skilled Software Engineer with a passion for AI engineering and open source contributions. With a strong background in developing innovative solutions and collaborating on various projects, Taki has demonstrated a commitment to advancing the field of technology. Their expertise in software development and dedication to open source initiatives make them a valuable asset to any team.", "education": [], "experience": [], "personal_info": {"name": "Taki Tajwaruzzaman Khan", "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "website": "takitajwar17.live", "location": "Bangladesh", "avatar_url": "https://avatars.githubusercontent.com/u/111155827?v=4", "github_url": "https://github.com/takitajwar17", "linkedin_url": null}}	t	f	\N	\N	\N	0	2025-07-14 05:47:26.086+00	2025-07-14 05:47:18.788045+00	2025-07-14 05:47:46.549972+00	eewfewf
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, full_name, avatar_url, customer_id, subscription_id, price_id, has_access, plan_type, onboarding_completed, created_at, updated_at) FROM stdin;
a7162ddb-8394-48ea-bb7b-bf8a508a8caa	tajwaruzzaman@iut-dhaka.edu	Taki Tajwaruzzaman Khan	https://avatars.githubusercontent.com/u/111155827?v=4	\N	\N	\N	t	free	f	2025-07-14 05:32:26.87+00	2025-07-14 05:32:26.87+00
\.


--
-- Data for Name: user_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_content (id, user_id, content_type, original_text, structured_data, metadata, created_at, updated_at) FROM stdin;
cb96710f-8828-4521-8031-858be48511b9	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	resume	Taki Tajwaruzzaman Khan  Dhaka, Bangladesh     +880-1716-126988   #   tajwaruzzaman@iut-dhaka.edu   §   github.com/takitajwar17  Awards & Achievements  Champion (Best Overall Winner)   |   Convex Top Chef International Hackathon   |   Role: Solo Developer   May 2025, USA Champion (LevelUp 1st Place)   |   Outlier AI Level Up International Hackathon   |   Role: Solo Developer   May 2025, USA Global 4th & National Champion (Bangladesh)   |   PLEASE Hack - South Asia   |   Role: TPM   Apr. 2025, Sri Lanka Champion   |   NSU ACM SC - HackNSU Season 5 (2025)   |   Role: Team Leader, Full-Stack Developer   Mar. 2025 Champion   |   KUET BitFest 2025 - Hackathon   |   Role: Team Leader, Full-Stack Developer   Jan. 2025 Champion   |   4th Data Science Summit 2024, DIU - Data Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 Champion   |   Technocrats V.2, IUBAT- Dhaka Divisional Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 1st Runner-Up   |   Programming Hero National Hackathon, EWU RoboFest   |   Role: Team Leader, Full-Stack Developer   Nov. 2024  Experience  Booked For You (Startup)   Nov. 2024 – May. 2025  Product Engineer   Dhaka, Bangladesh   ·   Hybrid  •   Spearhead full-stack development using   React   and   Flask , while directing product strategy and roadmap for an event ticketing tech platform  •   Lead architecture decisions and manage a team of frontend developers, designers implementing   agile methodologies  DataCops   Jun. 2023 – Aug. 2023  Intern Software Engineer   Remote (Portugal)  •   Engineered an advanced bot detection module utilizing   Python   and   machine learning algorithms , reducing unauthorized scraping by 40%  •   Optimized CAPTCHA systems with   JavaScript   and AI technologies, achieving 98% user validation accuracy  Projects  Inherit: A Unified Learning & Coding Platform   |   Next.js, Express.js, Node.js, MongoDB   Aug. 2024  ∗   Architected a full-stack learning platform with   Next.js , integrating   YouTube Data API   and   Monaco Editor   for real-time collaborative coding  ∗   Implemented   WebSocket -based peer coding and   Meta LLaMA 2   powered code reviews, supporting 50+ concurrent sessions  CrackEd: Educational Platform   |   ReactJS, ExpressJS, NodeJS, MongoDB Atlas, Postman   Jan. 2024 – Present  ∗   Developed full-stack   MERN   application serving IUT admission test candidates with mock tests and doubt resolution  ∗   Implemented role-based access control system managing 3 user types (students, tutors, admins) with dedicated dashboards  LLM Financial Advisor: GenAI Model Fine-Tuning   |   AWS SageMaker, AWS EC2, Jupyter Notebook, Python   Jun. 2024  ∗   Fine-tuned   Meta Llama 2 7B model   on   AWS SageMaker   for finance-specific responses with 95% accuracy  ∗   Optimized deployment using   AWS EC2   and   IAM , reducing inference time by 30%  Technical Skills  Languages : Python, JavaScript, Java, C#, PosgreSQL, NoSQL (MongoDB), SQL  Developer Tools : Amazon Web Services (AWS), Docker, CI/CD, GitHub Actions  Technologies : Linux, GitHub, Postman, Jira, Asana  Frameworks : React, NextJS, Node.js, .NET, Django  Libraries : NumPy, Matplotlib  Education  Islamic University of Technology (IUT)   Expected Graduation: May, 2026  B.Sc. in Software Engineering   Gazipur, Bangladesh  ∗   Relevant Coursework:   Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Software Engineering, System Design, Machine Learning, Artificial Intelligence	{"skills": {"other": [], "tools": [], "languages": [], "technical": []}, "summary": null, "projects": [], "education": [], "experience": [], "achievements": [], "personalInfo": {"name": null, "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "github": "github.com/takitajwar17", "website": "iut-dhaka.edu", "linkedin": null, "location": null}, "certifications": []}	{"fileName": "210042146_Taki Tajwaruzzaman Khan.pdf", "fileSize": 169432, "fileType": "pdf", "extractedAt": "2025-07-14T05:46:48.733Z", "extractionMethod": "client_side"}	2025-07-14 05:46:48.733+00	2025-07-14 05:46:50.818212+00
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

