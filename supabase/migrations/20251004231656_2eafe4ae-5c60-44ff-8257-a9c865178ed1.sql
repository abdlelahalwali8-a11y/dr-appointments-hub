-- Enable full admin control on all tables

-- Profiles table: Add UPDATE and DELETE policies for admin
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Notifications table: Add DELETE policy for admin
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Ensure admin has UPDATE policy on notifications
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
CREATE POLICY "Admins can update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Ensure admin has SELECT policy on notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- User roles: Ensure complete admin control (already exists but let's be explicit)
-- Already has "Admins can manage all roles" with ALL command

-- Patients: Ensure admin can do everything (already covered by "Staff can manage patients")

-- Medical records: Already has "Admins can manage all records" with ALL

-- Doctors: Already has "Admins can manage doctors" with ALL

-- Appointments: Already has "Staff can manage appointments" with ALL for admin

-- Center settings: Already has "Admins can manage settings" with ALL