# Astra AI — Full Rebuild Prompt

You are building a full-stack AI tutoring web application called **Astra AI** — a clone of astra-ai.de targeting German students from elementary school through university. The app helps students learn 13+ subjects via AI tutoring, exam preparation, and a specialized Abitur exam trainer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router + Server Actions) |
| Language | TypeScript |
| Database + Auth | Supabase (Postgres + Row Level Security + Auth) |
| AI | OpenRouter API (OpenAI-compatible SDK) |
| Payments | Stripe |
| UI | Tailwind CSS + shadcn/ui |
| Storage | Supabase Storage (PDF uploads, homework images) |
| Deployment | Vercel |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter
OPENROUTER_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## AI Models

- **Default model** (tutor chat, quizzes, exam prep): `deepseek/deepseek-v4-pro`
- **Vision model** (PDF extraction, homework image scanning): `google/gemini-3-flash-preview`

All AI calls go through OpenRouter. Use the `openai` npm package pointed at the OpenRouter base URL:

```ts
// lib/openrouter/client.ts
import OpenAI from 'openai'

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const MODELS = {
  default: 'deepseek/deepseek-v4-pro',
  vision: 'google/gemini-3-flash-preview',
}
```

---

## Folder Structure

```
app/
  (marketing)/
    page.tsx                  # Landing page
    pricing/page.tsx
    blog/
      page.tsx
      [slug]/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
    onboarding/page.tsx
  (app)/
    dashboard/page.tsx
    tutor/
      page.tsx                # Subject selector
      [subject]/page.tsx      # Chat interface
    exam-prep/
      page.tsx
      [sessionId]/page.tsx
    abitur/
      page.tsx
      [taskId]/page.tsx
    settings/page.tsx
  admin/
    page.tsx
    users/page.tsx
    abitur/
      page.tsx
      [examId]/page.tsx
  api/
    webhooks/stripe/route.ts

components/
  ui/                         # shadcn/ui components
  chat/
  dashboard/
  abitur/
  admin/

lib/
  supabase/
    client.ts                 # Browser client
    server.ts                 # Server client (Server Actions / RSC)
  openrouter/
    client.ts
    prompts/
      tutor.ts
      quiz.ts
      exam-prep.ts
      abitur.ts
      pdf-extraction.ts
  stripe/
    client.ts
    webhooks.ts

types/
  database.ts                 # Generated Supabase types
  index.ts
```

---

## Database Schema

Run these migrations in Supabase:

```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  grade_level text,
  subjects text[],
  subscription_tier text not null default 'free',  -- 'free' | 'plus' | 'abitur'
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read/update own profile"
  on profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, trial_ends_at)
  values (new.id, now() + interval '7 days');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null,
  subject text not null,
  module text not null,  -- 'tutor' | 'exam_prep' | 'abitur'
  created_at timestamptz default now()
);
alter table conversations enable row level security;
create policy "Users own their conversations"
  on conversations for all using (auth.uid() = user_id);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  role text not null,  -- 'user' | 'assistant'
  content text not null,
  image_url text,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Users can access messages in their conversations"
  on messages for all
  using (exists (
    select 1 from conversations
    where conversations.id = messages.conversation_id
    and conversations.user_id = auth.uid()
  ));

-- Abitur Exams (admin-uploaded PDFs)
create table abitur_exams (
  id uuid default gen_random_uuid() primary key,
  year int not null,
  state text not null,
  file_url text not null,
  processed_at timestamptz,
  created_at timestamptz default now()
);
alter table abitur_exams enable row level security;
create policy "Anyone can read exams" on abitur_exams for select using (true);
create policy "Only service role can write" on abitur_exams for insert with check (false);

-- Abitur Tasks (AI-extracted from PDFs)
create table abitur_tasks (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid references abitur_exams on delete cascade not null,
  question_number int not null,
  sub_part text,  -- 'a' | 'b' | 'c' | null
  subject_area text not null,  -- 'analysis' | 'geometry' | 'stochastics'
  requirement_level text not null,  -- 'basic' | 'advanced'
  question_text text not null,
  solution_text text not null,
  published boolean default false,
  created_at timestamptz default now()
);
alter table abitur_tasks enable row level security;
create policy "Anyone can read published tasks"
  on abitur_tasks for select using (published = true);

-- Progress
create table progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null,
  subject text not null,
  topic text not null,
  mastery_pct int default 0,
  last_practiced_at timestamptz default now(),
  unique(user_id, subject, topic)
);
alter table progress enable row level security;
create policy "Users own their progress"
  on progress for all using (auth.uid() = user_id);

-- Subscriptions
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text,
  status text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "Users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);
```

---

## Implementation To-Do List

Work through these phases in order. Each phase produces a working slice of the app. Commit after every task.

---

### Phase 1: Project Setup

- [ ] Run `npx create-next-app@latest astra-ai --typescript --tailwind --app --src-dir=false`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr openai stripe @stripe/stripe-js
  npx shadcn@latest init
  npx shadcn@latest add button card input textarea label badge avatar separator tabs
  ```
- [ ] Create `.env.local` with all environment variables listed above
- [ ] Create `lib/supabase/client.ts` — browser Supabase client using `createBrowserClient`
- [ ] Create `lib/supabase/server.ts` — server Supabase client using `createServerClient` with cookie handling
- [ ] Create `lib/openrouter/client.ts` — OpenRouter client + MODELS config (see code above)
- [ ] Create `middleware.ts` — protect all `/(app)` and `/admin` routes, redirect unauthenticated users to `/login`
- [ ] Run the database schema SQL in Supabase SQL editor
- [ ] Commit: `feat: project setup and infrastructure`

---

### Phase 2: Auth & Onboarding

- [ ] Build `/login` page — email/password form + Google OAuth button, calls Supabase `signInWithPassword` / `signInWithOAuth`
- [ ] Build `/signup` page — same fields, calls `signUp`, redirects to `/onboarding`
- [ ] Build `/onboarding` page — step 1: select grade level (dropdown: Klasse 1–13, Uni); step 2: select subjects (multi-select from the 13 subjects); saves to `profiles` table via Server Action, redirects to `/dashboard`
- [ ] Add auth callback route at `app/auth/callback/route.ts` to handle OAuth redirect and exchange code for session
- [ ] Add logout button in app layout that calls `supabase.auth.signOut()` and redirects to `/`
- [ ] Commit: `feat: auth and onboarding flow`

---

### Phase 3: Landing Page & Marketing

- [ ] Build `app/(marketing)/page.tsx` — landing page with:
  - Hero section: headline "Verbessere deine Noten 2x schneller", CTA buttons "Kostenlos starten" and "Preise ansehen"
  - Features section: 6 feature cards (AI Tutor, Prüfungstraining, Abitur AI, Fortschrittsverfolgung, Bild-Scan, Podcast-Modus)
  - Social proof: "1.000.000+ Schüler", "4.87 Sterne", 3 testimonial cards
  - Pricing section (see Phase 8 for details — placeholder cards are fine here)
  - Footer with links
- [ ] Build `app/(marketing)/pricing/page.tsx` — three cards: Free, Astra Plus (subscription), Abitur AI (€147 one-time)
- [ ] Commit: `feat: marketing pages`

---

### Phase 4: AI Tutor (Core Feature)

**Subjects list** (use this constant throughout the app):
```ts
// lib/constants.ts
export const SUBJECTS = [
  'Mathematik', 'Englisch', 'Chemie', 'Physik', 'Biologie',
  'Geographie', 'Geschichte', 'Wirtschaft', 'Informatik',
  'Philosophie', 'Psychologie', 'Spanisch', 'Französisch',
]
```

- [ ] Create `lib/openrouter/prompts/tutor.ts`:
  ```ts
  export function tutorSystemPrompt(subject: string, gradeLevel: string) {
    return `Du bist ein geduldiger, ermutigender KI-Nachhilfelehrer für das Fach ${subject}. 
  Der Schüler ist in ${gradeLevel}. 
  Erkläre Konzepte Schritt für Schritt auf Deutsch. 
  Wenn der Schüler einen Fehler macht, erkläre freundlich warum und zeige den richtigen Lösungsweg.
  Nutze einfache Sprache und konkrete Beispiele.`
  }
  ```
- [ ] Build `app/(app)/tutor/page.tsx` — grid of subject cards, each links to `/tutor/[subject]`
- [ ] Build `app/(app)/tutor/[subject]/page.tsx` — chat interface:
  - Message list (user messages right-aligned, assistant left-aligned)
  - Input box with send button and image upload button (paperclip icon)
  - On send: creates/reuses conversation in DB, saves user message, streams AI response via Server Action, saves assistant message
- [ ] Create `app/(app)/tutor/[subject]/actions.ts` — Server Actions:
  - `sendMessage(conversationId, content, imageUrl?)` — calls OpenRouter with streaming, returns stream
  - `uploadHomeworkImage(file)` — uploads to Supabase Storage `homework-images` bucket, returns public URL
- [ ] Create `components/chat/ChatMessage.tsx` — renders a single message with markdown support (`npm install react-markdown`)
- [ ] Create `components/chat/ChatInput.tsx` — textarea with send on Enter, image upload preview
- [ ] Add podcast mode: "Vorlesen" button on each assistant message that calls `window.speechSynthesis.speak()` with the message text
- [ ] Commit: `feat: AI tutor chat with image upload and podcast mode`

---

### Phase 5: Quiz Generation

- [ ] Create `lib/openrouter/prompts/quiz.ts`:
  ```ts
  export function quizPrompt(subject: string, topic: string, count: number) {
    return `Erstelle ${count} Multiple-Choice-Fragen auf Deutsch zum Thema "${topic}" im Fach ${subject}.
  Antworte NUR mit einem JSON-Array in diesem Format:
  [
    {
      "question": "Frage hier",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Erklärung warum diese Antwort richtig ist"
    }
  ]`
  }
  ```
- [ ] Add "Quiz starten" button to each subject's tutor page
- [ ] Build `components/chat/QuizCard.tsx` — shows one question at a time, highlights correct/wrong answer after selection, shows explanation, "Nächste Frage" button
- [ ] Server Action `generateQuiz(subject, topic, count)` — calls OpenRouter with `quizPrompt`, parses JSON response
- [ ] Commit: `feat: AI quiz generation`

---

### Phase 6: Prüfungstraining (Exam Prep)

- [ ] Create `lib/openrouter/prompts/exam-prep.ts`:
  ```ts
  export function examPrepPrompt(subject: string, gradeLevel: string, timed: boolean) {
    return `Du bist ein Prüfungscoach für ${subject} (${gradeLevel}).
  Erstelle eine strukturierte Prüfungsaufgabe mit 3-5 Teilaufgaben.
  Antworte auf Deutsch. Sei präzise und schulgerecht.
  ${timed ? 'Der Schüler hat begrenzte Zeit, halte die Aufgaben klar und kompakt.' : ''}`
  }
  ```
- [ ] Build `app/(app)/exam-prep/page.tsx` — subject selector + timed/untimed toggle + "Prüfung starten" button, creates session in DB, redirects to `/exam-prep/[sessionId]`
- [ ] Build `app/(app)/exam-prep/[sessionId]/page.tsx` — shows AI-generated exam questions one by one, student types answers, on submit AI grades the answer and gives feedback, shows score at the end
- [ ] Commit: `feat: Prüfungstraining exam prep module`

---

### Phase 7: Abitur AI

#### 7a: PDF Upload & AI Extraction Pipeline

- [ ] Create Supabase Storage bucket `abitur-pdfs` (private, service role only)
- [ ] Create `lib/openrouter/prompts/pdf-extraction.ts`:
  ```ts
  export const pdfExtractionPrompt = `Du analysierst eine Seite eines Abitur-Mathematik-Klausur-PDFs.
  Extrahiere ALLE Aufgaben auf dieser Seite.
  Antworte NUR mit einem JSON-Array in diesem Format:
  [
    {
      "question_number": 1,
      "sub_part": "a",
      "subject_area": "analysis",
      "requirement_level": "basic",
      "question_text": "vollständiger Aufgabentext",
      "solution_text": "vollständiger Lösungsweg falls vorhanden, sonst leer"
    }
  ]
  subject_area muss einer dieser Werte sein: "analysis" | "geometry" | "stochastics"
  requirement_level muss einer dieser Werte sein: "basic" | "advanced"
  sub_part ist null wenn keine Teilaufgabe.`
  ```
- [ ] Install PDF-to-image library: `npm install pdf2pic` (requires GraphicsMagick: `sudo apt-get install graphicsmagick`)
- [ ] Create `app/admin/abitur/actions.ts` — Server Actions:
  - `uploadAbiturExam(formData)` — saves PDF to Supabase Storage, creates `abitur_exams` row, triggers extraction
  - `extractTasksFromExam(examId)` — fetches PDF, converts each page to image using `pdf2pic`, sends each page image to `google/gemini-3-flash-preview` with `pdfExtractionPrompt`, saves extracted tasks to `abitur_tasks` with `published = false`, updates `processed_at`
  - `publishTask(taskId)` — sets `published = true`
  - `updateTask(taskId, data)` — admin can edit question/solution text before publishing

#### 7b: Admin Exam Management UI

- [ ] Build `app/admin/abitur/page.tsx` — list of uploaded exams with status (processed/unprocessed), upload form (year, state, PDF file), "Extrahieren" button per exam
- [ ] Build `app/admin/abitur/[examId]/page.tsx` — table of extracted tasks for that exam, each row shows question text preview, subject area, requirement level, published toggle, edit button
- [ ] Build edit modal in `components/admin/EditTaskModal.tsx` — textarea for question_text and solution_text, save button

#### 7c: Student Abitur Interface

- [ ] Create `lib/openrouter/prompts/abitur.ts`:
  ```ts
  export function abiturTutorPrompt(subjectArea: string, requirementLevel: string) {
    return `Du bist ein spezialisierter Abitur-Mathe-Tutor für ${subjectArea} auf ${requirementLevel === 'basic' ? 'Grundkurs' : 'Leistungskurs'}-Niveau.
  Erkläre die Lösung Schritt für Schritt auf Deutsch.
  Beziehe dich auf typische Abitur-Bewertungskriterien.
  Wenn der Schüler einen Schritt selbst versucht, gib gezieltes Feedback.`
  }
  ```
- [ ] Build `app/(app)/abitur/page.tsx` — filter bar (subject area, requirement level), grid of task cards showing question number + subject area, score prediction widget (% of tasks completed × estimated grade)
- [ ] Build `app/(app)/abitur/[taskId]/page.tsx` — shows full question text on left, chat panel on right where AI walks through the solution step-by-step; "Nächste Aufgabe" button at bottom
- [ ] Commit: `feat: Abitur AI with PDF extraction pipeline`

---

### Phase 8: Progress Dashboard

- [ ] Build `app/(app)/dashboard/page.tsx`:
  - Welcome header with user's name and subscription tier badge
  - Progress cards per subject (mastery %, last practiced date) — fetched from `progress` table
  - Streak counter (count consecutive days with at least one session by querying `conversations`)
  - "Zuletzt gelernt" section: last 5 conversations with subject + module + date
- [ ] Create Server Action `updateProgress(subject, topic, correct, total)` — upserts `progress` row, calculates mastery as `(correct / total) * 100`, called at end of quiz and exam prep sessions
- [ ] Commit: `feat: progress dashboard`

---

### Phase 9: Payments & Subscription Gating

- [ ] Create `lib/stripe/client.ts` — Stripe client using `STRIPE_SECRET_KEY`
- [ ] Create two Stripe products in Stripe dashboard:
  - **Astra Plus** — recurring monthly subscription
  - **Abitur AI** — one-time price at €147
- [ ] Build `app/(app)/settings/page.tsx` — shows current plan, subscription end date, "Upgrade" button (links to Stripe Checkout), "Kündigen" button (calls cancel Server Action)
- [ ] Create Server Actions in `app/(app)/settings/actions.ts`:
  - `createCheckoutSession(priceId)` — creates Stripe Checkout Session, returns URL
  - `createBillingPortalSession()` — opens Stripe Customer Portal for managing subscription
- [ ] Build `app/api/webhooks/stripe/route.ts` — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`:
  - On checkout complete: update `subscriptions` table and `profiles.subscription_tier`
  - On subscription update/delete: sync status and tier
- [ ] Add feature gating utility `lib/subscription.ts`:
  ```ts
  export async function requireTier(userId: string, minTier: 'plus' | 'abitur') {
    // fetch profile, check tier, throw redirect to /pricing if insufficient
  }
  ```
- [ ] Call `requireTier` in Abitur AI and Exam Prep Server Actions
- [ ] Commit: `feat: Stripe payments and subscription gating`

---

### Phase 10: Admin Dashboard

- [ ] Add admin role check: add `is_admin boolean default false` column to `profiles`, add server-side check in admin layout that redirects non-admins to `/dashboard`
- [ ] Build `app/admin/page.tsx` — stats overview: total users, active subscriptions, total Abitur tasks published
- [ ] Build `app/admin/users/page.tsx` — searchable table of users (email, grade, subscription tier, joined date), server-side pagination using Supabase service role client
- [ ] Commit: `feat: admin dashboard`

---

### Phase 11: Polish & Deployment

- [ ] Add loading states to all chat interfaces (streaming spinner while AI responds)
- [ ] Add error boundaries to all app pages — catch OpenRouter failures and show "KI momentan nicht verfügbar, bitte versuche es erneut"
- [ ] Add `robots.txt` and `sitemap.xml` for marketing pages
- [ ] Set up Vercel project, add all environment variables
- [ ] Configure Supabase auth redirect URLs for production domain
- [ ] Configure Stripe webhook endpoint pointing at production URL `/api/webhooks/stripe`
- [ ] Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts` to generate DB types
- [ ] Final smoke test: signup → onboarding → tutor chat → quiz → exam prep → abitur task → check dashboard progress → upgrade to Plus → admin PDF upload → task extraction → publish task
- [ ] Commit: `feat: production-ready polish and deployment`

---

## Key Implementation Notes

1. **All AI calls are Server Actions** — never call OpenRouter from the client directly (API key stays server-side)
2. **Streaming responses** — use `ReadableStream` in Server Actions and the `useChat`-style pattern or manual stream reading in the client
3. **Supabase RLS** — always use the server client (with service role) for admin actions, browser client for user-facing actions
4. **PDF extraction is async** — for large PDFs, run extraction as a background process and poll for completion; use Supabase Realtime or simple polling on the admin page
5. **Image uploads for homework** — store in Supabase Storage `homework-images` bucket (public), pass the public URL as the `image_url` in the OpenRouter vision call
6. **OpenRouter vision call format**:
   ```ts
   const response = await openrouter.chat.completions.create({
     model: MODELS.vision,
     messages: [{
       role: 'user',
       content: [
         { type: 'text', text: prompt },
         { type: 'image_url', image_url: { url: imageUrl } }
       ]
     }]
   })
   ```
