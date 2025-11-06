-- تفعيل Realtime على الجداول
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.medical_records REPLICA IDENTITY FULL;

-- إضافة الجداول التي ليست في publication
DO $$
BEGIN
    -- محاولة إضافة notifications
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    -- محاولة إضافة patients
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    
    -- محاولة إضافة medical_records
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;