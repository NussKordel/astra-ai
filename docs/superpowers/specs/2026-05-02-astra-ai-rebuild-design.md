# Astra AI Rebuild — Design Spec
Date: 2026-05-02

## Overview
Full-clone rebuild of astra-ai.de as a Next.js 14 web application. An AI tutoring platform for German students (elementary through university) covering 13+ subjects, exam preparation, Abitur AI, progress tracking, and subscriptions. All AI completions go through OpenRouter.

---

## 1. Architecture

### Stack
- **Next.js 14** — App Router, Server Actions (no separate API server)
- **Supabase** — Postgres database, Row Level Security, Auth (email/password + Google OAuth)
- **OpenRouter** — all AI completions via single `OPENROUTER_API_KEY`
- **Stripe** — subscription billing (Astra Plus) + one-time purchase (Abitur AI)
- **Vercel** — deployment target
- **Tailwind CSS + shadcn/ui** — UI components

### Folder Structure
```
app/
  (marketing)/        # Landing page, pricing, blog
  (auth)/             # Login, signup, onboarding
  (app)/
    tutor/            # AI Tutor chat
    exam-prep/        # Prüfungstraining
    abitur/           # Abitur AI
    dashboard/        # Progress tracking
    settings/         # Account, subscription management
components/
lib/
  supabase/           # Supabase client + server helpers
  openrouter/         # AI client + prompts
  stripe/             # Stripe client + webhook handler
```

---

## 2. Feature Modules

### 2.1 Auth & Onboarding
- Supabase email/password + Google OAuth
- Onboarding flow collects: grade level, subjects of interest, learning goals
- Free trial activated automatically on signup

### 2.2 AI Tutor (KI-Nachhilfelehrer)
- Chat interface per subject (13+ subjects supported)
- System prompt dynamically includes subject + student grade level
- Step-by-step problem solving with streaming responses
- Image upload: student photographs a homework problem → AI solves it (uses vision model)
- AI-generated quizzes: multiple choice with per-answer feedback
- Podcast mode: AI response converted to audio via browser Web Speech API

### 2.3 Prüfungstraining (Exam Prep)
- AI generates structured exam sessions per subject
- Timed and untimed modes
- Per-question scoring and detailed feedback
- Session history saved to DB

### 2.4 Abitur AI
- 415+ real Abitur exam tasks stored in `abitur_tasks` table
- Covers: Analysis, Analytical Geometry, Stochastics
- Supports basic and advanced requirement levels
- AI tutor walks through each task step-by-step
- Score prediction based on completed exercises
- Content populated via admin PDF upload pipeline (see Section 4)

### 2.5 Progress Dashboard
- Mastery % per topic, updated after each session
- Streak tracking
- Recent sessions history

### 2.6 Payments
- **Astra AI Plus** — Stripe recurring subscription (pricing TBD)
- **Abitur AI** — one-time purchase at €147 (50% off from €294)
- Stripe Checkout Sessions for both flows
- Stripe webhook handler syncs subscription state to Supabase
- Feature gating enforced server-side based on subscription tier in DB

### 2.7 Admin Dashboard
- User management (view, search, suspend)
- Abitur exam content management: upload PDFs, trigger AI extraction, review/edit extracted tasks before publishing
- Content is not live until admin approves it

---

## 3. Data Models

```sql
-- Supabase Auth handles users table

profiles
  id uuid references auth.users
  grade_level text
  subjects text[]
  subscription_tier text  -- 'free' | 'plus' | 'abitur'
  trial_ends_at timestamptz
  created_at timestamptz

conversations
  id uuid
  user_id uuid references profiles
  subject text
  module text  -- 'tutor' | 'exam_prep' | 'abitur'
  created_at timestamptz

messages
  id uuid
  conversation_id uuid references conversations
  role text  -- 'user' | 'assistant'
  content text
  image_url text  -- nullable, for homework image uploads
  created_at timestamptz

abitur_exams
  id uuid
  year int
  state text  -- e.g. 'Bayern', 'NRW'
  file_url text  -- Supabase Storage URL of uploaded PDF
  processed_at timestamptz  -- null until extraction complete
  created_at timestamptz

abitur_tasks
  id uuid
  exam_id uuid references abitur_exams
  question_number int
  sub_part text  -- 'a' | 'b' | 'c' | null
  subject_area text  -- 'analysis' | 'geometry' | 'stochastics'
  requirement_level text  -- 'basic' | 'advanced'
  question_text text
  solution_text text
  published boolean  -- false until admin approves
  created_at timestamptz

progress
  id uuid
  user_id uuid references profiles
  subject text
  topic text
  mastery_pct int
  last_practiced_at timestamptz

subscriptions
  id uuid
  user_id uuid references profiles
  stripe_customer_id text
  stripe_subscription_id text
  tier text
  status text
  current_period_end timestamptz
```

---

## 4. AI & OpenRouter Integration

### Models
| Use Case | Model |
|---|---|
| Tutor chat, quizzes, exam prep | `deepseek/deepseek-v4-pro` |
| PDF extraction, image scanning | `google/gemini-3-flash-preview` |

### OpenRouter Client
- Uses `openai` npm package pointed at OpenRouter base URL
- `OPENROUTER_API_KEY` env variable
- Model selection centralized in `lib/openrouter/config.ts`

### Call Types
1. **Tutor chat** — streaming, system prompt includes subject + grade level, full conversation history as context
2. **Quiz generation** — single call returns JSON array: `{ question, options[], correct_index, explanation }`
3. **PDF extraction** — vision model receives PDF pages as images, returns JSON array per page: `{ question_number, sub_part, subject_area, requirement_level, question_text, solution_text }`

### Prompt Files
Stored in `lib/openrouter/prompts/`:
- `tutor.ts` — subject tutor system prompt
- `quiz.ts` — quiz generation prompt
- `exam-prep.ts` — exam session prompt
- `abitur.ts` — Abitur task walkthrough prompt
- `pdf-extraction.ts` — structured extraction prompt for Abitur PDFs

### PDF Extraction Pipeline
1. Admin uploads Abitur PDF via admin dashboard → stored in Supabase Storage
2. Server Action fetches PDF, converts pages to images
3. Each page image sent to `google/gemini-3-flash-preview` with extraction prompt
4. AI returns structured JSON; each task saved to `abitur_tasks` with `published = false`
5. Admin reviews extracted tasks in dashboard, edits if needed, then publishes

---

## 5. Pages & Routes

### Marketing
- `/` — Landing page (hero, features, testimonials, pricing, CTA)
- `/pricing` — Pricing page
- `/blog` — Blog listing + individual post pages

### Auth
- `/login`
- `/signup`
- `/onboarding` — grade level + subject selection

### App (authenticated)
- `/dashboard` — progress overview, streak, recent sessions
- `/tutor` — subject selector
- `/tutor/[subject]` — chat interface
- `/exam-prep` — subject + session configurator
- `/exam-prep/[sessionId]` — active exam session
- `/abitur` — task browser + score prediction
- `/abitur/[taskId]` — task walkthrough with AI
- `/settings` — account, subscription management

### Admin (admin role only)
- `/admin` — dashboard overview
- `/admin/users` — user management
- `/admin/abitur` — exam upload + task review

---

## 6. Error Handling & Edge Cases
- OpenRouter failures: surface user-friendly error in chat, log to console
- PDF extraction partial failure: save successfully extracted tasks, flag failed pages for admin review
- Stripe webhook idempotency: check event ID before processing
- Supabase RLS: all data access server-side, users can only read/write their own rows
- Trial expiry: checked server-side on every protected route, redirect to `/pricing` if expired

---

## 7. Out of Scope
- Mobile app (web only)
- Real-time collaborative features
- Custom video content
- Multi-language support (German-first)
