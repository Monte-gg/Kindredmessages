create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 40),
  avatar_path text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists avatar_path text;

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

create table if not exists public.account_activity (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('signup', 'login', 'suspended', 'restored')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists account_activity_created_at_idx
  on public.account_activity (created_at desc);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

alter table public.conversation_members
  add column if not exists last_read_at timestamptz;

create index if not exists conversation_members_user_id_idx
  on public.conversation_members (user_id, conversation_id);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create unique index if not exists friend_requests_active_pair_unique
  on public.friend_requests (
    least(sender_id::text, recipient_id::text),
    greatest(sender_id::text, recipient_id::text)
  )
  where status in ('pending', 'accepted');

create index if not exists friend_requests_recipient_status_idx
  on public.friend_requests (recipient_id, status, created_at desc);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size bigint,
  created_at timestamptz not null default now(),
  constraint message_content_length check (content is null or char_length(content) <= 2000),
  constraint message_has_content check (
    nullif(btrim(content), '') is not null or attachment_path is not null
  ),
  constraint message_attachment_metadata check (
    (attachment_path is null and attachment_name is null and attachment_type is null and attachment_size is null)
    or
    (attachment_path is not null and attachment_name is not null and attachment_type is not null
      and attachment_size is not null and attachment_size between 1 and 26214400)
  )
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.account_activity enable row level security;
alter table public.app_admins enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.friend_requests enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Authenticated users can view member directory" on public.profiles;
create policy "Authenticated users can view member directory"
  on public.profiles for select to authenticated
  using (true);

drop function if exists public.update_my_profile(text);
create or replace function public.update_my_profile(new_username text, new_avatar_path text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned_username text := btrim(coalesce(new_username, ''));
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;
  if char_length(cleaned_username) not between 1 and 40 then
    raise exception 'Your username must be between 1 and 40 characters';
  end if;
  if new_avatar_path is not null and (
    pg_catalog.split_part(new_avatar_path, '/', 1) <> auth.uid()::text
    or not exists (
      select 1
      from storage.objects as object
      where object.bucket_id = 'kindred-profile-pictures'
        and object.name = new_avatar_path
        and object.owner_id = auth.uid()::text
    )
  ) then
    raise exception 'Choose a valid profile picture before saving';
  end if;

  update public.profiles
  set username = cleaned_username,
      avatar_path = coalesce(new_avatar_path, avatar_path)
  where user_id = auth.uid();
  if not found then
    raise exception 'Your profile could not be found';
  end if;
  return cleaned_username;
exception
  when unique_violation then
    raise exception 'That username is already taken. Choose another one';
end;
$$;

revoke all on function public.update_my_profile(text, text) from public, anon;
grant execute on function public.update_my_profile(text, text) to authenticated;

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members as member
    where member.conversation_id = target_conversation_id
      and member.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;

drop policy if exists "Members can view their friend requests" on public.friend_requests;
create policy "Members can view their friend requests"
  on public.friend_requests for select to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

drop function if exists public.search_kindred_members(text);
create function public.search_kindred_members(search_query text)
returns table (user_id uuid, username text, avatar_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.user_id, profile.username, profile.avatar_path
  from public.profiles as profile
  join auth.users as account on account.id = profile.user_id
  where (select auth.uid()) is not null
    and profile.user_id <> (select auth.uid())
    and char_length(btrim(coalesce(search_query, ''))) between 2 and 254
    and (
      pg_catalog.strpos(
        pg_catalog.lower(profile.username),
        pg_catalog.lower(btrim(search_query))
      ) > 0
      or pg_catalog.lower(account.email) = pg_catalog.lower(btrim(search_query))
    )
  order by profile.username
  limit 50;
$$;

revoke all on function public.search_kindred_members(text) from public, anon;
grant execute on function public.search_kindred_members(text) to authenticated;

create or replace function public.send_friend_request(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if target_user_id is null or target_user_id = current_user_id then
    raise exception 'Choose another user';
  end if;
  if not exists (select 1 from public.profiles where user_id = target_user_id) then
    raise exception 'That user is not available';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      least(current_user_id::text, target_user_id::text) || ':' ||
      greatest(current_user_id::text, target_user_id::text),
      0
    )
  );

  if exists (
    select 1
    from public.friend_requests as request
    where request.status in ('pending', 'accepted')
      and (
        (request.sender_id = current_user_id and request.recipient_id = target_user_id)
        or (request.sender_id = target_user_id and request.recipient_id = current_user_id)
      )
  ) then
    raise exception 'A friend request or friendship already exists';
  end if;

  insert into public.friend_requests (sender_id, recipient_id)
  values (current_user_id, target_user_id)
  returning id into request_id;
  return request_id;
end;
$$;

create or replace function public.respond_to_friend_request(
  target_request_id uuid,
  accept_request boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  update public.friend_requests
  set status = case when accept_request then 'accepted' else 'declined' end
  where id = target_request_id
    and recipient_id = current_user_id
    and status = 'pending';
  if not found then
    raise exception 'That friend request is no longer available';
  end if;
end;
$$;

revoke all on function public.send_friend_request(uuid) from public, anon;
grant execute on function public.send_friend_request(uuid) to authenticated;
revoke all on function public.respond_to_friend_request(uuid, boolean) from public, anon;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;

drop policy if exists "Members can view their conversations" on public.conversations;
create policy "Members can view their conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_member(id));

drop policy if exists "Members can view conversation participants" on public.conversation_members;
create policy "Members can view conversation participants"
  on public.conversation_members for select to authenticated
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Members can update their own read position" on public.conversation_members;
create policy "Members can update their own read position"
  on public.conversation_members for update to authenticated
  using (
    user_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  )
  with check (
    user_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  );

drop policy if exists "Members can view conversation messages" on public.messages;
create policy "Members can view conversation messages"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Members can send messages as themselves" on public.messages;
create policy "Members can send messages as themselves"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  );

drop policy if exists "Senders can delete their own messages" on public.messages;
create policy "Senders can delete their own messages"
  on public.messages for delete to authenticated
  using (
    sender_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  );

create or replace function public.create_direct_conversation(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if target_user_id is null or target_user_id = current_user_id then
    raise exception 'Choose another user';
  end if;
  if not exists (select 1 from public.profiles where user_id = target_user_id) then
    raise exception 'That user is not available';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      least(current_user_id::text, target_user_id::text) || ':' ||
      greatest(current_user_id::text, target_user_id::text),
      0
    )
  );

  select own_member.conversation_id into conversation_id
  from public.conversation_members as own_member
  join public.conversation_members as other_member
    on other_member.conversation_id = own_member.conversation_id
  where own_member.user_id = current_user_id
    and other_member.user_id = target_user_id
  limit 1;

  if conversation_id is null then
    insert into public.conversations default values returning id into conversation_id;
    insert into public.conversation_members (conversation_id, user_id)
    values (conversation_id, current_user_id), (conversation_id, target_user_id);
  end if;

  return conversation_id;
end;
$$;

revoke all on function public.create_direct_conversation(uuid) from public, anon;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

grant select on table public.conversations, public.conversation_members, public.messages to authenticated;
grant insert on table public.messages to authenticated;
grant delete on table public.messages to authenticated;
grant usage, select on sequence public.messages_id_seq to authenticated;
revoke all on table public.conversations, public.conversation_members from anon, authenticated;
grant select on table public.conversations, public.conversation_members to authenticated;
grant update (last_read_at) on table public.conversation_members to authenticated;
revoke all on table public.messages from anon, authenticated;
grant select, insert, delete on table public.messages to authenticated;
revoke all on table public.friend_requests from anon, authenticated;
grant select on table public.friend_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('kindred-chat-files', 'kindred-chat-files', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = 26214400;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kindred-profile-pictures', 'kindred-profile-pictures', true, 5242880, array['image/jpeg'])
on conflict (id) do update
set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Members can read profile pictures" on storage.objects;
create policy "Members can read profile pictures"
  on storage.objects for select to authenticated
  using (bucket_id = 'kindred-profile-pictures');

drop policy if exists "Users can upload their own profile pictures" on storage.objects;
create policy "Users can upload their own profile pictures"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'kindred-profile-pictures'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can remove their own profile pictures" on storage.objects;
create policy "Users can remove their own profile pictures"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'kindred-profile-pictures'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.is_conversation_attachment_member(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  conversation_folder text := (storage.foldername(object_name))[1];
begin
  if conversation_folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return public.is_conversation_member(conversation_folder::uuid);
end;
$$;

revoke all on function public.is_conversation_attachment_member(text) from public, anon;
grant execute on function public.is_conversation_attachment_member(text) to authenticated;

drop policy if exists "Members can read chat attachments" on storage.objects;
create policy "Members can read chat attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'kindred-chat-files'
    and public.is_conversation_attachment_member(name)
  );

drop policy if exists "Members can upload chat attachments" on storage.objects;
create policy "Members can upload chat attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'kindred-chat-files'
    and owner_id = (select auth.uid())::text
    and public.is_conversation_attachment_member(name)
  );

drop policy if exists "Uploaders can remove their chat attachments" on storage.objects;
create policy "Uploaders can remove their chat attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'kindred-chat-files'
    and owner_id = (select auth.uid())::text
    and public.is_conversation_attachment_member(name)
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'friend_requests'
  ) then
    alter publication supabase_realtime add table public.friend_requests;
  end if;
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversation_members'
  ) then
    alter publication supabase_realtime add table public.conversation_members;
  end if;
end;
$$;

create or replace function public.handle_new_kindred_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := nullif(btrim(new.raw_user_meta_data ->> 'username'), '');
  if requested_username is null or char_length(requested_username) > 40 then
    raise exception 'A username between 1 and 40 characters is required';
  end if;

  insert into public.profiles (user_id, username)
  values (new.id, requested_username);

  insert into public.account_activity (user_id, event_type, details)
  values (new.id, 'signup', jsonb_build_object('username', requested_username));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kindred on auth.users;
create trigger on_auth_user_created_kindred
  after insert on auth.users
  for each row execute function public.handle_new_kindred_user();

with missing_profiles as (
  select
    users.id,
    left(
      coalesce(
        nullif(btrim(users.raw_user_meta_data ->> 'username'), ''),
        nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
        'user'
      ),
      40
    ) as base_username
  from auth.users as users
  where not exists (
    select 1 from public.profiles as profile where profile.user_id = users.id
  )
),
prepared_profiles as (
  select
    missing_profiles.id,
    case
      when count(*) over (partition by lower(missing_profiles.base_username)) > 1
        or exists (
          select 1
          from public.profiles as existing
          where lower(existing.username) = lower(missing_profiles.base_username)
        )
      then left(missing_profiles.base_username, 32) || '-' || left(missing_profiles.id::text, 7)
      else missing_profiles.base_username
    end as username
  from missing_profiles
)
insert into public.profiles (user_id, username)
select id, username
from prepared_profiles
on conflict (user_id) do nothing;

create or replace function public.record_login_event()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  insert into public.account_activity (user_id, event_type)
  values (auth.uid(), 'login');
end;
$$;

revoke all on function public.record_login_event() from public, anon;
grant execute on function public.record_login_event() to authenticated;
revoke all on table public.account_activity from anon, authenticated;
revoke all on table public.app_admins from anon, authenticated;
revoke all on table public.profiles from anon;
grant select on table public.profiles to authenticated;

notify pgrst, 'reload schema';
