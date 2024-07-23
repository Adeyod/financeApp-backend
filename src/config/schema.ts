// create table accounts (
//    id serial primary key,
//    user_id serial references users(id) on delete cascade,
//    balance numeric(15, 2) default 0.00,
//    created_at timestamptz default current_timestamp,
//    updated_at timestamptz default current_timestamp);

//    CREATE TABLE users (
//     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     phone_number VARCHAR(50),
//     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
//     two_fa_enabled BOOLEAN DEFAULT FALSE,
//     biometric_enabled BOOLEAN DEFAULT FALSE
// is_verified boolean DEFAULT FALSE
//   );

// CREATE TABLE verificationCode (
//   id SERIAL PRIMARY KEY,
//   user_id SERIAL REFERENCES users(id) ON DELETE CASCADE,
//   token VARCHAR(255) NOT NULL,
//   purpose VARCHAR(255) NOT NULL,
//   created_at timestamptz not null default current_timestamp,
//   expires_at timestamptz not null
// )
