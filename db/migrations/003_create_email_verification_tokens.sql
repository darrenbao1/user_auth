create table
    email_verification_tokens (
        id uuid primary key,
        user_id uuid not null references users (id) on delete cascade,
        token_hash TEXT not null,
        expires_at timestamp not null,
        used_at timestamp,
        created_at timestamp default now ()
    );

create index idx_email_verification_user on email_verification_tokens (user_id);


ALTER TABLE email_verification_tokens
ALTER COLUMN id SET DEFAULT gen_random_uuid();
