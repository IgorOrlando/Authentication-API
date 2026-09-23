ALTER TABLE users
ADD CONSTRAINT users_phone_e164
CHECK (phone ~ '^\+[1-9][0-9]{1,14}$');