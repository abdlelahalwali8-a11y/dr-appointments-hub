-- Add currency and advanced settings to center_settings
ALTER TABLE public.center_settings
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'YER',
ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'ر.ي',
ADD COLUMN IF NOT EXISTS currency_name TEXT DEFAULT 'ريال يمني',
ADD COLUMN IF NOT EXISTS auto_create_medical_records BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_appointment_confirmation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_online_booking BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_doctor_availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_sms_reminders BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_hours_before INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS max_appointments_per_day INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT;

-- Update existing settings with Yemeni currency
UPDATE public.center_settings
SET 
  currency_code = 'YER',
  currency_symbol = 'ر.ي',
  currency_name = 'ريال يمني',
  auto_create_medical_records = true
WHERE currency_code IS NULL OR currency_code = 'SAR';

-- Create function to auto-create medical record when appointment is completed
CREATE OR REPLACE FUNCTION public.auto_create_medical_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_auto_create BOOLEAN;
BEGIN
  -- Check if auto-create is enabled
  SELECT auto_create_medical_records INTO settings_auto_create
  FROM public.center_settings
  LIMIT 1;

  -- If status changed to completed and auto-create is enabled
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND settings_auto_create THEN
    -- Check if medical record doesn't already exist for this appointment
    IF NOT EXISTS (
      SELECT 1 FROM public.medical_records 
      WHERE appointment_id = NEW.id
    ) THEN
      -- Create medical record
      INSERT INTO public.medical_records (
        patient_id,
        doctor_id,
        appointment_id,
        visit_date,
        chief_complaint,
        diagnosis,
        treatment_plan,
        prescribed_medications
      ) VALUES (
        NEW.patient_id,
        NEW.doctor_id,
        NEW.id,
        NEW.appointment_date,
        'زيارة متابعة',
        NEW.diagnosis,
        NEW.treatment,
        NEW.prescribed_medications
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating medical records
DROP TRIGGER IF EXISTS trigger_auto_create_medical_record ON public.appointments;
CREATE TRIGGER trigger_auto_create_medical_record
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_medical_record();