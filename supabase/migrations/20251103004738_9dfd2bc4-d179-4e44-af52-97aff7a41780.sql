-- 1. إنشاء جدول التخصصات الطبية
CREATE TABLE IF NOT EXISTS public.specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. إنشاء جدول أنواع المواعيد
CREATE TABLE IF NOT EXISTS public.appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. إنشاء جدول قوالب التشخيص
CREATE TABLE IF NOT EXISTS public.diagnosis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. إنشاء جدول قوالب العلاج
CREATE TABLE IF NOT EXISTS public.treatment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. إنشاء جدول الصلاحيات القابلة للتخصيص
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. إنشاء جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- 7. تفعيل RLS على الجداول الجديدة
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 8. سياسات RLS للتخصصات
CREATE POLICY "Staff can view specializations" ON public.specializations
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Admins can manage specializations" ON public.specializations
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 9. سياسات RLS لأنواع المواعيد
CREATE POLICY "Staff can view appointment types" ON public.appointment_types
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'doctor', 'receptionist')
  );

CREATE POLICY "Admins can manage appointment types" ON public.appointment_types
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 10. سياسات RLS لقوالب التشخيص
CREATE POLICY "Doctors can view diagnosis templates" ON public.diagnosis_templates
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'doctor')
  );

CREATE POLICY "Doctors can create diagnosis templates" ON public.diagnosis_templates
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'doctor')
  );

CREATE POLICY "Users can update their templates" ON public.diagnosis_templates
  FOR UPDATE USING (created_by = auth.uid() OR is_admin(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete templates" ON public.diagnosis_templates
  FOR DELETE USING (is_admin(auth.uid()));

-- 11. سياسات RLS لقوالب العلاج
CREATE POLICY "Doctors can view treatment templates" ON public.treatment_templates
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'doctor')
  );

CREATE POLICY "Doctors can create treatment templates" ON public.treatment_templates
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'doctor')
  );

CREATE POLICY "Users can update their treatment templates" ON public.treatment_templates
  FOR UPDATE USING (created_by = auth.uid() OR is_admin(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete treatment templates" ON public.treatment_templates
  FOR DELETE USING (is_admin(auth.uid()));

-- 12. سياسات RLS للصلاحيات
CREATE POLICY "Admins can view permissions" ON public.permissions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 13. سياسات RLS لربط الأدوار بالصلاحيات
CREATE POLICY "Admins can view role permissions" ON public.role_permissions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 14. إدراج بيانات أولية للصلاحيات
INSERT INTO public.permissions (name, name_ar, description, category) VALUES
  ('view_dashboard', 'عرض لوحة التحكم', 'القدرة على عرض لوحة التحكم الرئيسية', 'dashboard'),
  ('view_appointments', 'عرض المواعيد', 'القدرة على عرض المواعيد', 'appointments'),
  ('create_appointments', 'إنشاء المواعيد', 'القدرة على إنشاء مواعيد جديدة', 'appointments'),
  ('edit_appointments', 'تعديل المواعيد', 'القدرة على تعديل المواعيد', 'appointments'),
  ('delete_appointments', 'حذف المواعيد', 'القدرة على حذف المواعيد', 'appointments'),
  ('view_patients', 'عرض المرضى', 'القدرة على عرض بيانات المرضى', 'patients'),
  ('create_patients', 'إضافة المرضى', 'القدرة على إضافة مرضى جدد', 'patients'),
  ('edit_patients', 'تعديل المرضى', 'القدرة على تعديل بيانات المرضى', 'patients'),
  ('delete_patients', 'حذف المرضى', 'القدرة على حذف المرضى', 'patients'),
  ('view_doctors', 'عرض الأطباء', 'القدرة على عرض بيانات الأطباء', 'doctors'),
  ('manage_doctors', 'إدارة الأطباء', 'القدرة على إدارة الأطباء', 'doctors'),
  ('view_medical_records', 'عرض السجلات الطبية', 'القدرة على عرض السجلات الطبية', 'medical_records'),
  ('create_medical_records', 'إنشاء السجلات', 'القدرة على إنشاء سجلات طبية جديدة', 'medical_records'),
  ('edit_medical_records', 'تعديل السجلات', 'القدرة على تعديل السجلات الطبية', 'medical_records'),
  ('delete_medical_records', 'حذف السجلات', 'القدرة على حذف السجلات الطبية', 'medical_records'),
  ('view_reports', 'عرض التقارير', 'القدرة على عرض التقارير', 'reports'),
  ('export_reports', 'تصدير التقارير', 'القدرة على تصدير التقارير', 'reports'),
  ('manage_users', 'إدارة المستخدمين', 'القدرة على إدارة المستخدمين', 'users'),
  ('manage_permissions', 'إدارة الصلاحيات', 'القدرة على إدارة الصلاحيات والأدوار', 'permissions'),
  ('manage_settings', 'إدارة الإعدادات', 'القدرة على إدارة إعدادات النظام', 'settings'),
  ('view_notifications', 'عرض الإشعارات', 'القدرة على عرض الإشعارات', 'notifications'),
  ('send_notifications', 'إرسال الإشعارات', 'القدرة على إرسال إشعارات', 'notifications'),
  ('manage_waiting_list', 'إدارة قائمة الانتظار', 'القدرة على إدارة قائمة الانتظار', 'waiting_list')
ON CONFLICT (name) DO NOTHING;

-- 15. إدراج صلاحيات المدير
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- 16. إدراج صلاحيات الطبيب
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'doctor', id FROM public.permissions 
WHERE name IN (
  'view_dashboard', 'view_appointments', 'edit_appointments',
  'view_patients', 'view_doctors', 'view_medical_records',
  'create_medical_records', 'edit_medical_records',
  'view_reports', 'export_reports', 'view_notifications', 'send_notifications'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 17. إدراج صلاحيات موظف الاستقبال
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'receptionist', id FROM public.permissions 
WHERE name IN (
  'view_dashboard', 'view_appointments', 'create_appointments',
  'edit_appointments', 'delete_appointments', 'view_patients',
  'create_patients', 'edit_patients', 'view_doctors',
  'view_reports', 'view_notifications', 'send_notifications', 'manage_waiting_list'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- 18. دالة للتحقق من صلاحية معينة
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE rp.role = (SELECT role FROM public.profiles WHERE user_id = _user_id)
      AND p.name = _permission_name
      AND p.is_active = true
  )
$$;

-- 19. دالة لإرسال إشعار
CREATE OR REPLACE FUNCTION public.send_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  VALUES (_user_id, _title, _message, _type, _metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- 20. Trigger لإرسال إشعار عند إنشاء موعد جديد
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_user_id UUID;
  doctor_user_id UUID;
  patient_name TEXT;
  doctor_name TEXT;
BEGIN
  -- الحصول على معلومات المريض
  SELECT p.user_id, p.full_name INTO patient_user_id, patient_name
  FROM public.patients p
  WHERE p.id = NEW.patient_id;
  
  -- الحصول على معلومات الطبيب
  SELECT d.user_id, pr.full_name INTO doctor_user_id, doctor_name
  FROM public.doctors d
  JOIN public.profiles pr ON pr.user_id = d.user_id
  WHERE d.id = NEW.doctor_id;
  
  -- إرسال إشعار للمريض
  IF patient_user_id IS NOT NULL THEN
    PERFORM public.send_notification(
      patient_user_id,
      'موعد جديد',
      'تم حجز موعد لك مع الدكتور ' || doctor_name || ' بتاريخ ' || NEW.appointment_date::TEXT,
      'appointment',
      jsonb_build_object('appointment_id', NEW.id, 'type', 'new_appointment')
    );
  END IF;
  
  -- إرسال إشعار للطبيب
  IF doctor_user_id IS NOT NULL THEN
    PERFORM public.send_notification(
      doctor_user_id,
      'موعد جديد',
      'تم حجز موعد جديد مع المريض ' || patient_name || ' بتاريخ ' || NEW.appointment_date::TEXT,
      'appointment',
      jsonb_build_object('appointment_id', NEW.id, 'type', 'new_appointment')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_appointment();

-- 21. Trigger لإرسال إشعار عند تحديث حالة الموعد
CREATE OR REPLACE FUNCTION public.notify_appointment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_user_id UUID;
  patient_name TEXT;
  status_text TEXT;
BEGIN
  -- التحقق من تغير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- الحصول على معلومات المريض
    SELECT p.user_id, p.full_name INTO patient_user_id, patient_name
    FROM public.patients p
    WHERE p.id = NEW.patient_id;
    
    -- ترجمة الحالة
    status_text := CASE NEW.status
      WHEN 'scheduled' THEN 'مجدول'
      WHEN 'confirmed' THEN 'مؤكد'
      WHEN 'in_progress' THEN 'جاري'
      WHEN 'completed' THEN 'مكتمل'
      WHEN 'cancelled' THEN 'ملغي'
      WHEN 'no_show' THEN 'لم يحضر'
      ELSE 'غير معروف'
    END;
    
    -- إرسال إشعار للمريض
    IF patient_user_id IS NOT NULL THEN
      PERFORM public.send_notification(
        patient_user_id,
        'تحديث حالة الموعد',
        'تم تحديث حالة موعدك إلى: ' || status_text,
        'appointment',
        jsonb_build_object('appointment_id', NEW.id, 'type', 'status_change', 'status', NEW.status)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_appointment_status_change
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_appointment_status_change();

-- 22. إضافة triggers للتحديث التلقائي
CREATE TRIGGER update_specializations_updated_at
  BEFORE UPDATE ON public.specializations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointment_types_updated_at
  BEFORE UPDATE ON public.appointment_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnosis_templates_updated_at
  BEFORE UPDATE ON public.diagnosis_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_templates_updated_at
  BEFORE UPDATE ON public.treatment_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 23. إدراج بيانات أولية للتخصصات
INSERT INTO public.specializations (name, name_en, description) VALUES
  ('طب عام', 'General Practice', 'ممارس عام'),
  ('طب أطفال', 'Pediatrics', 'تخصص الأطفال'),
  ('جراحة عامة', 'General Surgery', 'جراحة عامة'),
  ('قلب وأوعية', 'Cardiology', 'أمراض القلب'),
  ('عظام', 'Orthopedics', 'جراحة العظام'),
  ('جلدية', 'Dermatology', 'أمراض الجلد'),
  ('نساء وولادة', 'Obstetrics & Gynecology', 'طب النساء'),
  ('عيون', 'Ophthalmology', 'طب العيون'),
  ('أنف وأذن وحنجرة', 'ENT', 'الأنف والأذن والحنجرة'),
  ('أسنان', 'Dentistry', 'طب الأسنان')
ON CONFLICT (name) DO NOTHING;

-- 24. إدراج بيانات أولية لأنواع المواعيد
INSERT INTO public.appointment_types (name, name_en, description, duration_minutes) VALUES
  ('كشف أول', 'Initial Consultation', 'كشف طبي للمرة الأولى', 30),
  ('كشف متابعة', 'Follow-up', 'كشف متابعة', 20),
  ('كشف عاجل', 'Emergency', 'كشف طارئ', 15),
  ('عملية جراحية', 'Surgery', 'إجراء جراحي', 120),
  ('فحص دوري', 'Checkup', 'فحص دوري روتيني', 20)
ON CONFLICT (name) DO NOTHING;
