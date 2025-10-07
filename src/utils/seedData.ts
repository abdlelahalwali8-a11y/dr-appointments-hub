import { supabase } from '@/integrations/supabase/client';

export const seedSampleData = async () => {
  try {
    console.log('بدء زرع البيانات التجريبية...');

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('لا يوجد مستخدم مسجل دخول');
      return false;
    }

    // 1. Setup admin role for current user
    await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });

    console.log('تم تحديث المستخدم الحالي كمدير');

    // 2. Insert center settings if not exists
    const { data: existingSettings } = await supabase
      .from('center_settings')
      .select('id')
      .limit(1);

    if (!existingSettings || existingSettings.length === 0) {
      await supabase
        .from('center_settings')
        .insert({
          center_name: 'مركز د أحمد قايد سالم الطبي',
          center_phone: '0123456789',
          center_email: 'info@medical-center.com',
          center_address: 'الرياض، المملكة العربية السعودية',
          working_hours_start: '08:00',
          working_hours_end: '17:00',
          working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
          appointment_duration: 30,
          max_advance_booking_days: 30,
          cancellation_hours: 24,
          email_notifications_enabled: true,
          sms_notifications_enabled: false,
          whatsapp_notifications_enabled: false
        });
      console.log('تم إدخال إعدادات المركز');
    }

    // 3. Create sample doctor
    const { data: existingDoctors } = await supabase
      .from('doctors')
      .select('id')
      .limit(1);

    let doctorId: string;
    
    if (!existingDoctors || existingDoctors.length === 0) {
      const { data: insertedDoctor, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          specialization: 'طب عام',
          license_number: 'DOC-2024-001',
          consultation_fee: 200,
          return_days: 7,
          experience_years: 10,
          bio: 'طبيب عام متخصص في الرعاية الصحية الشاملة',
          working_hours_start: '08:00',
          working_hours_end: '17:00',
          working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
          is_available: true
        })
        .select()
        .single();

      if (doctorError) {
        console.error('خطأ في إدخال الطبيب:', doctorError);
        doctorId = '';
      } else {
        doctorId = insertedDoctor.id;
        console.log('تم إدخال طبيب تجريبي');
        
        // Add doctor role
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.id, role: 'doctor' }, { onConflict: 'user_id,role' });
      }
    } else {
      doctorId = existingDoctors[0].id;
    }

    // 4. Sample patients
    const samplePatients = [
      {
        full_name: 'أحمد محمد علي',
        phone: '0501234567',
        email: 'ahmed@example.com',
        date_of_birth: '1985-03-15',
        gender: 'male',
        address: 'الرياض، حي النرجس',
        city: 'الرياض',
        blood_type: 'O+',
        medical_history: 'لا توجد أمراض مزمنة',
        allergies: 'حساسية من البنسلين'
      },
      {
        full_name: 'فاطمة حسن محمد',
        phone: '0507654321',
        email: 'fatima@example.com',
        date_of_birth: '1990-07-22',
        gender: 'female',
        address: 'الرياض، حي الملز',
        city: 'الرياض',
        blood_type: 'A+',
        medical_history: 'ضغط دم مرتفع',
        allergies: 'لا توجد حساسية معروفة'
      },
      {
        full_name: 'خالد عبدالله سالم',
        phone: '0509876543',
        email: 'khalid@example.com',
        date_of_birth: '1978-12-10',
        gender: 'male',
        address: 'الرياض، حي العليا',
        city: 'الرياض',
        blood_type: 'B+',
        medical_history: 'داء السكري النوع الثاني',
        allergies: 'حساسية من الأسبرين'
      },
      {
        full_name: 'نورا سالم أحمد',
        phone: '0502345678',
        email: 'nora@example.com',
        date_of_birth: '1995-05-18',
        gender: 'female',
        address: 'الرياض، حي الروضة',
        city: 'الرياض',
        blood_type: 'AB+',
        medical_history: 'لا توجد أمراض مزمنة',
        allergies: 'حساسية من المكسرات'
      },
      {
        full_name: 'محمد عبدالرحمن قايد',
        phone: '0508765432',
        email: 'mohammed@example.com',
        date_of_birth: '1982-09-25',
        gender: 'male',
        address: 'الرياض، حي الشفا',
        city: 'الرياض',
        blood_type: 'O-',
        medical_history: 'ربو بروكي',
        allergies: 'حساسية من الغبار'
      }
    ];

    // Insert patients
    const { data: insertedPatients, error: patientsError } = await supabase
      .from('patients')
      .insert(samplePatients)
      .select();

    if (patientsError) {
      console.error('خطأ في إدخال المرضى:', patientsError);
      return false;
    }

    console.log(`تم إدخال ${insertedPatients?.length} مريض`);

    // 5. Create sample appointments if we have patients and doctor
    if (insertedPatients && insertedPatients.length > 0 && doctorId) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

      const sampleAppointments = [
        {
          patient_id: insertedPatients[0].id,
          doctor_id: doctorId,
          appointment_date: today.toISOString().split('T')[0],
          appointment_time: '09:30',
          status: 'waiting' as const,
          notes: 'كشف عام',
          created_by: user.id
        },
        {
          patient_id: insertedPatients[1].id,
          doctor_id: doctorId,
          appointment_date: today.toISOString().split('T')[0],
          appointment_time: '10:00',
          status: 'scheduled' as const,
          notes: 'متابعة ضغط الدم',
          created_by: user.id
        },
        {
          patient_id: insertedPatients[2].id,
          doctor_id: doctorId,
          appointment_date: yesterday.toISOString().split('T')[0],
          appointment_time: '10:30',
          status: 'completed' as const,
          notes: 'فحص السكري',
          cost: 250,
          created_by: user.id
        },
        {
          patient_id: insertedPatients[3].id,
          doctor_id: doctorId,
          appointment_date: tomorrow.toISOString().split('T')[0],
          appointment_time: '11:00',
          status: 'scheduled' as const,
          notes: 'استشارة طبية',
          created_by: user.id
        },
        {
          patient_id: insertedPatients[4].id,
          doctor_id: doctorId,
          appointment_date: today.toISOString().split('T')[0],
          appointment_time: '11:30',
          status: 'return' as const,
          notes: 'زيارة متابعة',
          is_return_visit: true,
          original_appointment_id: null,
          created_by: user.id
        }
      ];

      const { error: appointmentsError } = await supabase
        .from('appointments')
        .insert(sampleAppointments);

      if (appointmentsError) {
        console.error('خطأ في إدخال المواعيد:', appointmentsError);
      } else {
        console.log('تم إدخال المواعيد التجريبية');
      }
    }
    
    // 6. Sample notifications
    const sampleNotifications = [
      {
        user_id: user.id,
        title: 'موعد جديد اليوم',
        message: 'لديك موعد مع أحمد محمد علي في تمام الساعة 9:30 صباحاً',
        type: 'appointment'
      },
      {
        user_id: user.id,
        title: 'تذكير مهم',
        message: 'لا تنس تحديث بيانات المرضى الجديدة',
        type: 'reminder'
      },
      {
        user_id: user.id,
        title: 'تحديث النظام',
        message: 'تم تحديث النظام بنجاح مع ميزات جديدة',
        type: 'system'
      }
    ];

    const { error: notificationsError } = await supabase
      .from('notifications')
      .insert(sampleNotifications);

    if (notificationsError) {
      console.error('خطأ في إدخال الإشعارات:', notificationsError);
    } else {
      console.log('تم إدخال الإشعارات التجريبية');
    }

    console.log('تم زرع البيانات التجريبية بنجاح!');
    return true;

  } catch (error) {
    console.error('خطأ في زرع البيانات:', error);
    return false;
  }
};