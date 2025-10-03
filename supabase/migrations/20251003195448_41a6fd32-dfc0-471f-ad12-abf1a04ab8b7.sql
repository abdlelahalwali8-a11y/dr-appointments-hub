-- إضافة حقلي العمر والمدينة إلى جدول المرضى
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- إضافة تعليق للحقول الجديدة
COMMENT ON COLUMN public.patients.age IS 'عمر المريض';
COMMENT ON COLUMN public.patients.city IS 'المدينة (اختياري)';
COMMENT ON COLUMN public.patients.notes IS 'ملاحظات إضافية (اختياري)';