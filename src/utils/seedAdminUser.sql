
-- Run this in the SQL editor to create or update an admin user
-- Make sure this username exists in your current system

INSERT INTO public.admin_credentials (username, password, role)
VALUES ('SwimmingSchool', '1234', 'admin')
ON CONFLICT (username) 
DO UPDATE SET password = '1234', role = 'admin';

-- If you already have a different username/password, replace the values above
