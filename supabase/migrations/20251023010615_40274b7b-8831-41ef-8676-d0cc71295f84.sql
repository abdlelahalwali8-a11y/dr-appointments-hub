-- Fix all RLS policies to require authentication
-- This migration ensures all tables require authenticated users

-- Drop existing policies and recreate with proper authentication requirements

-- 1. Appointments table
DROP POLICY IF EXISTS "Doctors can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON public.appointments;

CREATE POLICY "Doctors can view their appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = appointments.doctor_id 
    AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = appointments.patient_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
)
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
);

-- 2. Center Settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.center_settings;
DROP POLICY IF EXISTS "Staff can view settings" ON public.center_settings;

CREATE POLICY "Admins can manage settings"
ON public.center_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view settings"
ON public.center_settings
FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
);

-- 3. Doctors table
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can view their own info" ON public.doctors;
DROP POLICY IF EXISTS "Everyone can view active doctors" ON public.doctors;

CREATE POLICY "Admins can manage doctors"
ON public.doctors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Doctors can view their own info"
ON public.doctors
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can view active doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (is_available = true);

-- 4. Medical Records
DROP POLICY IF EXISTS "Admins can manage all records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can manage their patient records" ON public.medical_records;
DROP POLICY IF EXISTS "Patients can view their records" ON public.medical_records;

CREATE POLICY "Admins can manage all records"
ON public.medical_records
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Doctors can manage their patient records"
ON public.medical_records
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = medical_records.doctor_id 
    AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = medical_records.doctor_id 
    AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = medical_records.patient_id 
    AND p.user_id = auth.uid()
  )
);

-- 5. Notifications
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Staff can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;

CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Staff can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
);

CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Patients
DROP POLICY IF EXISTS "Patients can view their own info" ON public.patients;
DROP POLICY IF EXISTS "Staff can manage patients" ON public.patients;
DROP POLICY IF EXISTS "Staff can view all patients" ON public.patients;

CREATE POLICY "Patients can view their own info"
ON public.patients
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can manage patients"
ON public.patients
FOR ALL
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'receptionist')
)
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('admin', 'receptionist')
);

CREATE POLICY "Staff can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (
  public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
);

-- 7. Profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8. User Roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));