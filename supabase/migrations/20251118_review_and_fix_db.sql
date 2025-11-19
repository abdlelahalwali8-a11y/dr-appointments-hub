-- مراجعة وإصلاح قاعدة بيانات Supabase

-- 1. مراجعة الجداول والعلاقات
-- التأكد من وجود جميع الجداول الأساسية
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- التأكد من صحة العلاقات بين الجداول
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- 2. مراجعة سياسات أمان الصفوف (RLS)
-- التأكد من تفعيل RLS على جميع الجداول الحساسة
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r';

-- مراجعة السياسات المطبقة على كل جدول
-- (مثال لجدول appointments)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'appointments';

-- 3. مراجعة الوظائف والمشغلات
-- التأكد من وجود جميع الوظائف الأساسية
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE specific_schema = 'public';

-- التأكد من وجود جميع المشغلات الأساسية
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 4. إصلاحات مقترحة

-- إضافة سياسة RLS للسماح للمستخدمين بتحديث بياناتهم الشخصية فقط
-- (إذا لم تكن موجودة)
CREATE POLICY "Allow users to update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- إضافة فهرس لتحسين أداء الاستعلامات على جدول المواعيد
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- إضافة وظيفة للتحقق من وجود تداخل في المواعيد
CREATE OR REPLACE FUNCTION public.check_appointment_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE doctor_id = NEW.doctor_id
      AND appointment_date = NEW.appointment_date
      AND appointment_time = NEW.appointment_time
      AND status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'موعد محجوز بالفعل في هذا الوقت.';
  END IF;
  RETURN NEW;
END;
$$;

-- إنشاء مشغل للتحقق من تداخل المواعيد قبل إضافتها
CREATE TRIGGER check_appointment_conflict_trigger
BEFORE INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.check_appointment_conflict();

-- إضافة سياسة RLS للسماح للمستخدمين بقراءة إعدادات المركز
CREATE POLICY "Allow users to read center settings" ON public.center_settings
FOR SELECT USING (true);

-- إضافة سياسة RLS للسماح للمستخدمين بقراءة بيانات الأطباء
CREATE POLICY "Allow users to read doctors data" ON public.doctors
FOR SELECT USING (true);

-- تحديث سياسة RLS للسماح للموظفين بإدارة جميع السجلات الطبية
DROP POLICY IF EXISTS "Doctors can manage their patient records" ON public.medical_records;
CREATE POLICY "Staff can manage all medical records" ON public.medical_records
FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

-- تحديث سياسة RLS للسماح للموظفين بإدارة جميع المواعيد
DROP POLICY IF EXISTS "Staff can manage appointments" ON public.appointments;
CREATE POLICY "Staff can manage all appointments" ON public.appointments
FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

-- تحديث سياسة RLS للسماح للموظفين بإدارة جميع المرضى
DROP POLICY IF EXISTS "Staff can manage patients" ON public.patients;
CREATE POLICY "Staff can manage all patients" ON public.patients
FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'receptionist'));

-- تحديث سياسة RLS للسماح للموظفين بإدارة جميع الإشعارات
DROP POLICY IF EXISTS "Staff can create notifications" ON public.notifications;
CREATE POLICY "Staff can manage all notifications" ON public.notifications
FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist'));

-- تحديث سياسة RLS للسماح للموظفين بإدارة جميع الملفات الشخصية
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Staff can manage all profiles" ON public.profiles
FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'receptionist'));

