-- إنشاء أو تحديث المستخدم ليكون مديرًا
-- ملاحظة: هذا السكريبت سيحدث البروفايل إذا كان موجودًا أو ينشئه إذا لم يكن موجودًا

-- أولاً، نحتاج للتحقق من وجود المستخدم في جدول auth.users
-- إذا كان موجودًا، سنحدث دوره في جدول profiles
-- إذا لم يكن موجودًا، فالمستخدم سيحتاج للتسجيل من خلال واجهة المستخدم أولاً

-- نقوم بإنشاء دالة لتحديث أو إنشاء بروفايل المدير
CREATE OR REPLACE FUNCTION setup_admin_user(
  admin_email TEXT,
  admin_full_name TEXT DEFAULT 'المدير العام'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- البحث عن المستخدم في جدول auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = admin_email;

  -- إذا وُجد المستخدم
  IF user_uuid IS NOT NULL THEN
    -- تحديث أو إنشاء البروفايل
    INSERT INTO public.profiles (
      user_id,
      full_name,
      email,
      role,
      is_active
    ) VALUES (
      user_uuid,
      admin_full_name,
      admin_email,
      'admin',
      true
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      role = 'admin',
      is_active = true,
      email = admin_email,
      updated_at = now();

    RAISE NOTICE 'تم تحديث المستخدم % ليصبح مديرًا', admin_email;
  ELSE
    RAISE NOTICE 'المستخدم % غير موجود في النظام. يرجى التسجيل أولاً من خلال واجهة المستخدم', admin_email;
  END IF;
END;
$$;

-- محاولة إعداد المستخدم كمدير إذا كان موجودًا
SELECT setup_admin_user('abdlelah2024@gmail.com', 'عبدالإله');

-- إنشاء trigger لضمان أن المستخدم الأول يصبح admin تلقائياً
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- عد عدد المستخدمين الموجودين
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- إذا كان هذا أول مستخدم، اجعله admin
  IF user_count = 0 THEN
    NEW.role := 'admin';
    NEW.is_active := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger للمستخدم الأول
DROP TRIGGER IF EXISTS set_first_user_as_admin ON public.profiles;
CREATE TRIGGER set_first_user_as_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION make_first_user_admin();