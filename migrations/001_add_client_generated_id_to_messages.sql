-- Add client_generated_id column to messages table
alter table public.messages add column if not exists client_generated_id uuid;
create unique index if not exists messages_client_generated_id_key on public.messages(client_generated_id);