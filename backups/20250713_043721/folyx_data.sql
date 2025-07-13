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
\.


--
-- PostgreSQL database dump complete
--

