-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'receptionist', 'patient');

-- Create appointment status enum  
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'waiting', 'completed', 'return', 'cancelled');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  return_days INTEGER NOT NULL DEFAULT 7,
  working_days TEXT[] DEFAULT ARRAY['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  working_hours_start TIME DEFAULT '08:00',
  working_hours_end TIME DEFAULT '17:00',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  blood_type TEXT,
  chronic_conditions TEXT,
  insurance_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  diagnosis TEXT,
  treatment TEXT,
  prescribed_medications TEXT,
  follow_up_date DATE,
  cost DECIMAL(10,2),
  is_return_visit BOOLEAN DEFAULT false,
  original_appointment_id UUID REFERENCES public.appointments(id),
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  chief_complaint TEXT,
  vital_signs JSONB,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescribed_medications TEXT,
  lab_results TEXT,
  images_urls TEXT[],
  follow_up_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create center settings table
CREATE TABLE public.center_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name TEXT NOT NULL DEFAULT 'مركز د أحمد قايد سالم الطبي',
  center_phone TEXT,
  center_email TEXT,
  center_address TEXT,
  center_logo_url TEXT,
  working_hours_start TIME DEFAULT '08:00',
  working_hours_end TIME DEFAULT '17:00',
  working_days TEXT[] DEFAULT ARRAY['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  appointment_duration INTEGER DEFAULT 30,
  max_advance_booking_days INTEGER DEFAULT 30,
  cancellation_hours INTEGER DEFAULT 24,
  sms_notifications_enabled BOOLEAN DEFAULT false,
  email_notifications_enabled BOOLEAN DEFAULT true,
  whatsapp_notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'reminder', 'system', 'alert')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for doctors
CREATE POLICY "Everyone can view active doctors" ON public.doctors
  FOR SELECT USING (is_available = true);

CREATE POLICY "Doctors can view their own info" ON public.doctors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for patients
CREATE POLICY "Patients can view their own info" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all patients" ON public.patients
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

CREATE POLICY "Staff can manage patients" ON public.patients
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'receptionist'));

-- RLS Policies for appointments
CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.doctors d 
      WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage appointments" ON public.appointments
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

-- RLS Policies for medical records
CREATE POLICY "Patients can view their records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = medical_records.patient_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage their patient records" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors d 
      WHERE d.id = medical_records.doctor_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all records" ON public.medical_records
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for center settings
CREATE POLICY "Staff can view settings" ON public.center_settings
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

CREATE POLICY "Admins can manage settings" ON public.center_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_center_settings_updated_at
  BEFORE UPDATE ON public.center_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'patient'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically calculate appointment cost
CREATE OR REPLACE FUNCTION public.calculate_appointment_cost()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  doctor_fee DECIMAL(10,2);
  return_period INTEGER;
  original_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get doctor's fee and return period
  SELECT consultation_fee, return_days INTO doctor_fee, return_period
  FROM public.doctors WHERE id = NEW.doctor_id;
  
  -- If status is completed and it's not a return visit
  IF NEW.status = 'completed' AND NOT NEW.is_return_visit THEN
    NEW.cost = doctor_fee;
  -- If it's a return visit within the return period
  ELSIF NEW.status = 'completed' AND NEW.is_return_visit AND NEW.original_appointment_id IS NOT NULL THEN
    SELECT created_at INTO original_date
    FROM public.appointments WHERE id = NEW.original_appointment_id;
    
    -- Check if within free return period
    IF (NOW() - original_date) <= (return_period || ' days')::INTERVAL THEN
      NEW.cost = 0; -- Free return visit
    ELSE
      NEW.cost = doctor_fee; -- Charge full fee if outside return period
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic cost calculation
CREATE TRIGGER calculate_appointment_cost_trigger
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.calculate_appointment_cost();

-- Insert default center settings
INSERT INTO public.center_settings (center_name, center_phone, center_address)
VALUES ('مركز د أحمد قايد سالم الطبي', '+966501234567', 'الرياض، المملكة العربية السعودية');

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.doctors REPLICA IDENTITY FULL;
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.medical_records REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;