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
-- Data for Name: connected_platforms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.connected_platforms (id, user_id, platform, platform_user_id, platform_username, platform_display_name, access_token, refresh_token, token_expires_at, profile_data, scope, verified_at, created_at, updated_at) FROM stdin;
635b1184-e4d5-4766-a51a-d11792c67020	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	github	111155827	takitajwar17	Taki Tajwaruzzaman Khan	public_access	\N	\N	{"id": 111155827, "bio": "Software Engineer | Open Source Contributor | AI Engineering Enthusiast", "blog": "takitajwar17.live", "name": "Taki Tajwaruzzaman Khan", "email": null, "avatar": "https://avatars.githubusercontent.com/u/111155827?v=4", "company": "Islamic University of Technology", "location": "Bangladesh", "username": "takitajwar17", "followers": 32, "following": 33, "created_at": "2022-08-12T21:33:23Z", "updated_at": "2025-07-13T12:25:16Z", "public_repos": 53}	\N	2025-07-14 05:34:21.491+00	2025-07-14 05:34:21.491+00	2025-07-14 05:34:21.491+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, full_name, avatar_url, customer_id, subscription_id, price_id, has_access, plan_type, onboarding_completed, created_at, updated_at) FROM stdin;
a7162ddb-8394-48ea-bb7b-bf8a508a8caa	tajwaruzzaman@iut-dhaka.edu	Taki Tajwaruzzaman Khan	https://avatars.githubusercontent.com/u/111155827?v=4	\N	\N	\N	t	free	f	2025-07-14 05:32:26.87+00	2025-07-14 05:32:26.87+00
\.


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.portfolios (id, user_id, title, slug, description, template_id, template_config, content_data, is_published, is_featured, custom_domain, seo_title, seo_description, view_count, last_generated_at, created_at, updated_at, subdomain) FROM stdin;
1b3e94d0-32f1-43b3-ae75-78da2fc1f3af	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	qwhjbdqwd	qwhjbdqwd		modern	{}	{"bio": "Taki Tajwaruzzaman Khan is a skilled and experienced software developer with a strong background in GitHub. With a passion for coding and problem-solving, Taki has a proven track record of delivering high-quality solutions. Their dedication to continuous learning and growth makes them a valuable asset to any team.", "stats": {}, "skills": [], "summary": "Taki Tajwaruzzaman Khan is a skilled software developer with a strong presence on GitHub, showcasing a portfolio of impressive projects. With a background in computer science and a passion for coding, Taki has demonstrated the ability to create innovative solutions and collaborate effectively with teams. Their commitment to continuous learning and dedication to excellence make them a valuable asset in any technical role.", "education": [], "experience": [], "personal_info": {"name": "Taki Tajwaruzzaman Khan", "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "website": null, "location": null, "avatar_url": "https://avatars.githubusercontent.com/u/111155827?v=4", "github_url": "github.com/takitajwar17", "linkedin_url": null}}	f	f	\N	\N	\N	0	2025-07-14 05:38:49.453+00	2025-07-14 05:38:42.613644+00	2025-07-14 05:38:51.398611+00	qdwqdwd
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
-- Data for Name: user_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_content (id, user_id, content_type, original_text, structured_data, metadata, created_at, updated_at) FROM stdin;
cb96710f-8828-4521-8031-858be48511b9	a7162ddb-8394-48ea-bb7b-bf8a508a8caa	resume	Taki Tajwaruzzaman Khan  Dhaka, Bangladesh     +880-1716-126988   #   tajwaruzzaman@iut-dhaka.edu   §   github.com/takitajwar17  Awards & Achievements  Champion (Best Overall Winner)   |   Convex Top Chef International Hackathon   |   Role: Solo Developer   May 2025, USA Champion (LevelUp 1st Place)   |   Outlier AI Level Up International Hackathon   |   Role: Solo Developer   May 2025, USA Global 4th & National Champion (Bangladesh)   |   PLEASE Hack - South Asia   |   Role: TPM   Apr. 2025, Sri Lanka Champion   |   NSU ACM SC - HackNSU Season 5 (2025)   |   Role: Team Leader, Full-Stack Developer   Mar. 2025 Champion   |   KUET BitFest 2025 - Hackathon   |   Role: Team Leader, Full-Stack Developer   Jan. 2025 Champion   |   4th Data Science Summit 2024, DIU - Data Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 Champion   |   Technocrats V.2, IUBAT- Dhaka Divisional Hackathon   |   Role: Team Leader, Full-Stack Developer   Dec. 2024 1st Runner-Up   |   Programming Hero National Hackathon, EWU RoboFest   |   Role: Team Leader, Full-Stack Developer   Nov. 2024  Experience  Booked For You (Startup)   Nov. 2024 – May. 2025  Product Engineer   Dhaka, Bangladesh   ·   Hybrid  •   Spearhead full-stack development using   React   and   Flask , while directing product strategy and roadmap for an event ticketing tech platform  •   Lead architecture decisions and manage a team of frontend developers, designers implementing   agile methodologies  DataCops   Jun. 2023 – Aug. 2023  Intern Software Engineer   Remote (Portugal)  •   Engineered an advanced bot detection module utilizing   Python   and   machine learning algorithms , reducing unauthorized scraping by 40%  •   Optimized CAPTCHA systems with   JavaScript   and AI technologies, achieving 98% user validation accuracy  Projects  Inherit: A Unified Learning & Coding Platform   |   Next.js, Express.js, Node.js, MongoDB   Aug. 2024  ∗   Architected a full-stack learning platform with   Next.js , integrating   YouTube Data API   and   Monaco Editor   for real-time collaborative coding  ∗   Implemented   WebSocket -based peer coding and   Meta LLaMA 2   powered code reviews, supporting 50+ concurrent sessions  CrackEd: Educational Platform   |   ReactJS, ExpressJS, NodeJS, MongoDB Atlas, Postman   Jan. 2024 – Present  ∗   Developed full-stack   MERN   application serving IUT admission test candidates with mock tests and doubt resolution  ∗   Implemented role-based access control system managing 3 user types (students, tutors, admins) with dedicated dashboards  LLM Financial Advisor: GenAI Model Fine-Tuning   |   AWS SageMaker, AWS EC2, Jupyter Notebook, Python   Jun. 2024  ∗   Fine-tuned   Meta Llama 2 7B model   on   AWS SageMaker   for finance-specific responses with 95% accuracy  ∗   Optimized deployment using   AWS EC2   and   IAM , reducing inference time by 30%  Technical Skills  Languages : Python, JavaScript, Java, C#, PosgreSQL, NoSQL (MongoDB), SQL  Developer Tools : Amazon Web Services (AWS), Docker, CI/CD, GitHub Actions  Technologies : Linux, GitHub, Postman, Jira, Asana  Frameworks : React, NextJS, Node.js, .NET, Django  Libraries : NumPy, Matplotlib  Education  Islamic University of Technology (IUT)   Expected Graduation: May, 2026  B.Sc. in Software Engineering   Gazipur, Bangladesh  ∗   Relevant Coursework:   Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Software Engineering, System Design, Machine Learning, Artificial Intelligence	{"skills": {"other": [], "tools": [], "languages": [], "technical": []}, "summary": null, "projects": [], "education": [], "experience": [], "achievements": [], "personalInfo": {"name": null, "email": "tajwaruzzaman@iut-dhaka.edu", "phone": null, "github": "github.com/takitajwar17", "website": "iut-dhaka.edu", "linkedin": null, "location": null}, "certifications": []}	{"fileName": "210042146_Taki Tajwaruzzaman Khan.pdf", "fileSize": 169432, "fileType": "pdf", "extractedAt": "2025-07-14T05:38:18.776Z", "extractionMethod": "client_side"}	2025-07-14 05:38:18.776+00	2025-07-14 05:38:18.776+00
\.


--
-- Data for Name: waitlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.waitlist (id, full_name, email, company, created_at) FROM stdin;
cb793ef3-5a45-4943-8651-1787f2880f63	Taki Tajwaruzzaman Khan	tajwaruzzaman@iut-dhaka.edu	\N	2025-07-13 01:55:16.051914+00
aaec0432-c1f3-4993-8203-4c0a630b2ac5	Ashrith Reddy A	ashrith2768@gmaiil.com	\N	2025-07-13 19:12:27.604703+00
\.


--
-- PostgreSQL database dump complete
--

