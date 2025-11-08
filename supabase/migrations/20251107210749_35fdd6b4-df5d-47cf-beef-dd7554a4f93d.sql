-- Add explicit anonymous access denial policies to all sensitive tables
-- This creates defense-in-depth protection ensuring anonymous users cannot access data

-- Profiles table (contains emails, phone numbers)
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles
  FOR ALL TO anon
  USING (false);

-- Patients table (highly sensitive medical data)
CREATE POLICY "Deny anonymous access to patients"
  ON public.patients
  FOR ALL TO anon
  USING (false);

-- Doctors table
CREATE POLICY "Deny anonymous access to doctors"
  ON public.doctors
  FOR ALL TO anon
  USING (false);

-- Appointments table
CREATE POLICY "Deny anonymous access to appointments"
  ON public.appointments
  FOR ALL TO anon
  USING (false);

-- Medical records table
CREATE POLICY "Deny anonymous access to medical_records"
  ON public.medical_records
  FOR ALL TO anon
  USING (false);

-- Notifications table
CREATE POLICY "Deny anonymous access to notifications"
  ON public.notifications
  FOR ALL TO anon
  USING (false);

-- Center settings table
CREATE POLICY "Deny anonymous access to center_settings"
  ON public.center_settings
  FOR ALL TO anon
  USING (false);

-- Permissions table
CREATE POLICY "Deny anonymous access to permissions"
  ON public.permissions
  FOR ALL TO anon
  USING (false);

-- User roles table
CREATE POLICY "Deny anonymous access to user_roles"
  ON public.user_roles
  FOR ALL TO anon
  USING (false);

-- Diagnosis templates table
CREATE POLICY "Deny anonymous access to diagnosis_templates"
  ON public.diagnosis_templates
  FOR ALL TO anon
  USING (false);

-- Treatment templates table
CREATE POLICY "Deny anonymous access to treatment_templates"
  ON public.treatment_templates
  FOR ALL TO anon
  USING (false);

-- Specializations table
CREATE POLICY "Deny anonymous access to specializations"
  ON public.specializations
  FOR ALL TO anon
  USING (false);

-- Appointment types table
CREATE POLICY "Deny anonymous access to appointment_types"
  ON public.appointment_types
  FOR ALL TO anon
  USING (false);

-- Role permissions table
CREATE POLICY "Deny anonymous access to role_permissions"
  ON public.role_permissions
  FOR ALL TO anon
  USING (false);