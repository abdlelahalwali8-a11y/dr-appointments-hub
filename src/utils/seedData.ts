import { supabase } from '@/integrations/supabase/client';

export const seedSampleData = async () => {
  try {
    console.log('بدء زرع البيانات التجريبية...');

    // Sample patients
    const samplePatients = [
      {
        full_name: 'أحمد محمد علي',
        phone: '0501234567',
        email: 'ahmed@example.com',
        date_of_birth: '1985-03-15',
        gender: 'male',
        address: 'الرياض، حي النرجس',
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

    // Get current user to create sample admin and doctors
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update current user role to admin
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', user.id);

      console.log('تم تحديث المستخدم الحالي كمدير');
    }

    // Create sample appointments if we have patients and doctors
    if (insertedPatients && insertedPatients.length > 0) {
      // Get doctors
      const { data: doctors } = await supabase
        .from('doctors')
        .select('id')
        .limit(1);

      if (doctors && doctors.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sampleAppointments = [
          {
            patient_id: insertedPatients[0].id,
            doctor_id: doctors[0].id,
            appointment_date: today.toISOString().split('T')[0],
            appointment_time: '09:30',
            status: 'waiting' as const,
            notes: 'كشف عام'
          },
          {
            patient_id: insertedPatients[1].id,
            doctor_id: doctors[0].id,
            appointment_date: today.toISOString().split('T')[0],
            appointment_time: '10:00',
            status: 'scheduled' as const,
            notes: 'متابعة ضغط الدم'
          },
          {
            patient_id: insertedPatients[2].id,
            doctor_id: doctors[0].id,
            appointment_date: yesterday.toISOString().split('T')[0],
            appointment_time: '10:30',
            status: 'completed' as const,
            notes: 'فحص السكري',
            cost: 250
          },
          {
            patient_id: insertedPatients[3].id,
            doctor_id: doctors[0].id,
            appointment_date: tomorrow.toISOString().split('T')[0],
            appointment_time: '11:00',
            status: 'scheduled' as const,
            notes: 'استشارة طبية'
          }
        ];

        const { data: insertedAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .insert(sampleAppointments);

        if (appointmentsError) {
          console.error('خطأ في إدخال المواعيد:', appointmentsError);
        } else {
          console.log('تم إدخال المواعيد التجريبية');
        }
      }
    }

    console.log('تم زرع البيانات التجريبية بنجاح!');
    return true;

  } catch (error) {
    console.error('خطأ في زرع البيانات:', error);
    return false;
  }
};