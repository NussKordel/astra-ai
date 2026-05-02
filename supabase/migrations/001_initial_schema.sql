-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  grade_level text,
  subjects text[],
  subscription_tier text not null default 'free',
  trial_ends_at timestamptz,
  is_admin boolean default false,
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
  module text not null,
  created_at timestamptz default now()
);
alter table conversations enable row level security;
create policy "Users own their conversations"
  on conversations for all using (auth.uid() = user_id);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  role text not null,
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
  sub_part text,
  subject_area text not null,
  requirement_level text not null,
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
