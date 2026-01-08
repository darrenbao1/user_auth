CREATE TABLE
    users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamp DEFAULT now ()
    );

ALTER TABLE users
ADD COLUMN email_verified boolean default false;


