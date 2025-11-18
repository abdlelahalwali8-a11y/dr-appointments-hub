-- Seed initial data for the clinic management system

-- Insert sample doctors
INSERT INTO doctors (id, user_id, specialization, consultation_fee, available_days, available_hours, bio)
VALUES
  ('doc-001', NULL, 'طب عام', 150, '["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء"]', '["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]', 'طبيب عام متخصص في الرعاية الصحية الأولية'),
  ('doc-002', NULL, 'طب الأسنان', 200, '["السبت", "الاثنين", "الأربعاء", "الجمعة"]', '["10:00", "11:00", "14:00", "15:00", "16:00"]', 'طبيب أسنان متخصص في العلاجات التجميلية'),
  ('doc-003', NULL, 'أمراض النساء', 250, '["الأحد", "الثلاثاء", "الخميس"]', '["09:00", "10:00", "11:00", "14:00", "15:00"]', 'متخصصة في صحة المرأة والحمل والولادة'),
  ('doc-004', NULL, 'طب الأطفال', 180, '["السبت", "الأحد", "الاثنين", "الأربعاء", "الخميس"]', '["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]', 'متخصص في رعاية الأطفال والمراهقين'),
  ('doc-005', NULL, 'القلب والأوعية الدموية', 300, '["الأحد", "الثلاثاء", "الخميس"]', '["10:00", "11:00", "14:00", "15:00"]', 'استشاري أمراض القلب والأوعية الدموية')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (id, full_name, email, phone, date_of_birth, gender, address, medical_history, allergies, emergency_contact)
VALUES
  ('pat-001', 'أحمد محمد علي', 'ahmed@example.com', '0501234567', '1990-05-15', 'M', 'الرياض، حي النخيل', 'ارتفاع ضغط الدم', 'البنسلين', '0501234568'),
  ('pat-002', 'فاطمة عبدالله محمد', 'fatima@example.com', '0502345678', '1985-08-22', 'F', 'الرياض، حي الملز', 'السكري من النوع الثاني', 'لا توجد', '0502345679'),
  ('pat-003', 'محمد سالم خالد', 'mohammad@example.com', '0503456789', '1995-03-10', 'M', 'جدة، حي الشاطئ', 'لا توجد أمراض مزمنة', 'الأسبرين', '0503456790'),
  ('pat-004', 'سارة يوسف أحمد', 'sarah@example.com', '0504567890', '1992-11-30', 'F', 'الدمام، حي الخليج', 'الربو', 'لا توجد', '0504567891'),
  ('pat-005', 'علي حسن محمود', 'ali@example.com', '0505678901', '1988-07-18', 'M', 'الرياض، حي الروضة', 'ارتفاع الكوليسترول', 'لا توجد', '0505678902'),
  ('pat-006', 'نور خالد سعيد', 'noor@example.com', '0506789012', '2010-01-25', 'F', 'الرياض، حي النزهة', 'لا توجد أمراض مزمنة', 'لا توجد', '0506789013'),
  ('pat-007', 'عمر محمد فهد', 'omar@example.com', '0507890123', '1998-09-12', 'M', 'الرياض، حي الصفا', 'لا توجد أمراض مزمنة', 'لا توجد', '0507890124'),
  ('pat-008', 'ليلى أحمد علي', 'layla@example.com', '0508901234', '1993-04-08', 'F', 'جدة، حي الزهراء', 'قصور الغدة الدرقية', 'لا توجد', '0508901235')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, notes, cost)
VALUES
  ('apt-001', 'pat-001', 'doc-001', '2024-12-20', '09:00', 'pending', 'فحص دوري وقياس ضغط الدم', 150),
  ('apt-002', 'pat-002', 'doc-003', '2024-12-21', '10:00', 'completed', 'متابعة الحمل', 250),
  ('apt-003', 'pat-003', 'doc-002', '2024-12-22', '14:00', 'pending', 'تنظيف الأسنان', 200),
  ('apt-004', 'pat-004', 'doc-004', '2024-12-23', '11:00', 'completed', 'فحص شامل للطفل', 180),
  ('apt-005', 'pat-005', 'doc-005', '2024-12-24', '15:00', 'pending', 'فحص القلب والأوعية الدموية', 300),
  ('apt-006', 'pat-006', 'doc-004', '2024-12-25', '10:00', 'pending', 'فحص دوري للأطفال', 180),
  ('apt-007', 'pat-007', 'doc-001', '2024-12-26', '09:00', 'cancelled', 'فحص عام', 150),
  ('apt-008', 'pat-008', 'doc-003', '2024-12-27', '14:00', 'pending', 'متابعة الحمل', 250)
ON CONFLICT (id) DO NOTHING;

-- Insert sample medical records
INSERT INTO medical_records (id, patient_id, record_type, title, description, data, created_by)
VALUES
  ('rec-001', 'pat-001', 'diagnosis', 'ارتفاع ضغط الدم', 'تشخيص ارتفاع ضغط الدم من الدرجة الأولى', '{"systolic": 150, "diastolic": 95, "diagnosis": "ارتفاع ضغط الدم من الدرجة الأولى"}', 'doc-001'),
  ('rec-002', 'pat-002', 'vital_signs', 'العلامات الحيوية', 'قياس العلامات الحيوية للمريضة الحامل', '{"systolic": 120, "diastolic": 80, "heart_rate": 78, "temperature": 36.5}', 'doc-003'),
  ('rec-003', 'pat-003', 'prescription', 'وصفة طبية', 'وصفة لعلاج التهاب اللثة', '{"medication_name": "أموكسيسيلين", "dosage": "500 ملغ", "duration": "7 أيام"}', 'doc-002'),
  ('rec-004', 'pat-004', 'lab_test', 'فحص مخبري', 'فحص الدم الشامل', '{"test_name": "Complete Blood Count", "result": "طبيعي"}', 'doc-004'),
  ('rec-005', 'pat-005', 'vital_signs', 'العلامات الحيوية', 'قياس العلامات الحيوية', '{"systolic": 130, "diastolic": 85, "heart_rate": 72, "temperature": 36.8}', 'doc-005'),
  ('rec-006', 'pat-006', 'note', 'ملاحظة طبية', 'الطفل بصحة جيدة وينمو بشكل طبيعي', '{"note": "نمو طبيعي، لا توجد مشاكل صحية"}', 'doc-004'),
  ('rec-007', 'pat-007', 'prescription', 'وصفة طبية', 'وصفة لعلاج الزكام', '{"medication_name": "باراسيتامول", "dosage": "500 ملغ", "duration": "3 أيام"}', 'doc-001'),
  ('rec-008', 'pat-008', 'vital_signs', 'العلامات الحيوية', 'قياس العلامات الحيوية للمريضة الحامل', '{"systolic": 118, "diastolic": 78, "heart_rate": 80, "temperature": 36.6}', 'doc-003')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);
