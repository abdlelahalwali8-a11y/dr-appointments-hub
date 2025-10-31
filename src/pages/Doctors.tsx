import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, Phone, Mail, Clock, DollarSign, Calendar, Edit, Trash2, FileText, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import DataTable, { Column } from '@/components/common/DataTable';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useForm, FormErrors } from '@/hooks/useForm';
import { TextInput, TextAreaField, SelectField } from '@/components/common/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  license_number?: string;
  consultation_fee: number;
  return_days: number;
  working_days: string[];
  working_hours_start: string;
  working_hours_end: string;
  bio?: string;
  experience_years: number;
  is_available: boolean;
  profiles: {
    full_name: string;
    phone?: string;
    email?: string;
  };
}

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
}

const Doctors = () => {
  const permissions = usePermissions();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({ title: "خطأ", description: "فشل في تحميل بيانات الأطباء", variant: "destructive" });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .neq('role', 'doctor') // Fetch users who are not doctors yet
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchProfiles();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'doctors',
    onInsert: () => fetchDoctors(),
    onUpdate: () => fetchDoctors(),
    onDelete: () => fetchDoctors(),
  });

  // --- Add Doctor Form ---
  const initialAddValues = {
    user_id: '',
    specialization: '',
    license_number: '',
    consultation_fee: 0,
    return_days: 7,
    working_hours_start: '08:00',
    working_hours_end: '17:00',
    bio: '',
    experience_years: 0,
  };

  const validateAdd = (values: typeof initialAddValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.user_id) errors.user_id = 'يجب اختيار مستخدم.';
    if (!values.specialization) errors.specialization = 'التخصص مطلوب.';
    if (values.consultation_fee < 0) errors.consultation_fee = 'الرسوم لا يمكن أن تكون سالبة.';
    return errors;
  };

  const handleAddDoctor = async (values: typeof initialAddValues) => {
    try {
      // 1. Update the profile role to doctor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'doctor' })
        .eq('user_id', values.user_id);

      if (profileError) throw profileError;

      // 2. Create the doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([{
          user_id: values.user_id,
          specialization: values.specialization,
          license_number: values.license_number || null,
          consultation_fee: values.consultation_fee,
          return_days: values.return_days,
          working_hours_start: values.working_hours_start,
          working_hours_end: values.working_hours_end,
          bio: values.bio || null,
          experience_years: values.experience_years,
        }]);

      if (doctorError) throw doctorError;

      // 3. Add doctor role to user_roles (if applicable)
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: values.user_id, role: 'doctor' });

      if (roleError) throw roleError;

      toast({ title: "نجح الإضافة", description: "تم إضافة الطبيب بنجاح" });
      setIsDialogOpen(false);
      addForm.resetForm();
      fetchProfiles(); // Refresh profiles list
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast({ title: "خطأ", description: error.message || "فشل في إضافة الطبيب", variant: "destructive" });
    }
  };

  const addForm = useForm({
    initialValues: initialAddValues,
    onSubmit: handleAddDoctor,
    validate: validateAdd,
  });

  // --- Edit Doctor Form ---
  const initialEditValues = useMemo(() => ({
    id: selectedDoctor?.id || '',
    specialization: selectedDoctor?.specialization || '',
    license_number: selectedDoctor?.license_number || '',
    consultation_fee: selectedDoctor?.consultation_fee || 0,
    return_days: selectedDoctor?.return_days || 7,
    working_hours_start: selectedDoctor?.working_hours_start || '08:00',
    working_hours_end: selectedDoctor?.working_hours_end || '17:00',
    bio: selectedDoctor?.bio || '',
    experience_years: selectedDoctor?.experience_years || 0,
  }), [selectedDoctor]);

  const validateEdit = (values: typeof initialEditValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.specialization) errors.specialization = 'التخصص مطلوب.';
    if (values.consultation_fee < 0) errors.consultation_fee = 'الرسوم لا يمكن أن تكون سالبة.';
    return errors;
  };

  const handleEditDoctor = async (values: typeof initialEditValues) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          specialization: values.specialization,
          license_number: values.license_number || null,
          consultation_fee: values.consultation_fee,
          return_days: values.return_days,
          working_hours_start: values.working_hours_start,
          working_hours_end: values.working_hours_end,
          bio: values.bio || null,
          experience_years: values.experience_years,
        })
        .eq('id', values.id);

      if (error) throw error;

      toast({ title: "تم التحديث", description: "تم تحديث بيانات الطبيب بنجاح" });
      setIsEditDialogOpen(false);
      setSelectedDoctor(null);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث بيانات الطبيب", variant: "destructive" });
    }
  };

  const editForm = useForm({
    initialValues: initialEditValues,
    onSubmit: handleEditDoctor,
    validate: validateEdit,
  });

  useEffect(() => {
    if (selectedDoctor) {
      editForm.setValues(initialEditValues);
    }
  }, [selectedDoctor]);

  // --- Delete Doctor ---
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      // 1. Delete the doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', selectedDoctor.id);

      if (doctorError) throw doctorError;

      // 2. Update the profile role back (optional, depending on system logic)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'user' }) // Assuming 'user' is the default role
        .eq('user_id', selectedDoctor.user_id);

      if (profileError) console.error('Error updating profile role:', profileError);

      // 3. Remove doctor role from user_roles (if applicable)
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedDoctor.user_id)
        .eq('role', 'doctor');

      if (roleError) console.error('Error removing user role:', roleError);

      toast({ title: "تم الحذف", description: "تم حذف الطبيب بنجاح" });
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
      fetchProfiles(); // Refresh profiles list
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في حذف الطبيب", variant: "destructive" });
    }
  };

  // --- Availability Toggle ---
  const toggleDoctorAvailability = async (doctor: Doctor) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_available: !doctor.is_available })
        .eq('id', doctor.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${!doctor.is_available ? 'تفعيل' : 'إلغاء تفعيل'} الطبيب: د. ${doctor.profiles.full_name}`,
      });
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      toast({ title: "خطأ", description: "فشل في تحديث حالة الطبيب", variant: "destructive" });
    }
  };

  // --- Search and Filter ---
  const { searchTerm, setSearchTerm, filteredData: searchedDoctors } = useSearch(doctors, {
    fields: ['profiles.full_name', 'specialization', 'profiles.email'],
    minChars: 0,
  });

  // --- DataTable Columns ---
  const columns: Column<Doctor>[] = [
    {
      key: 'profiles.full_name',
      label: 'الطبيب',
      width: '25%',
      render: (_, doctor) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              د.{doctor.profiles.full_name.split(' ')[0][0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">د. {doctor.profiles.full_name}</h4>
            <p className="text-sm text-muted-foreground">{doctor.profiles.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'التخصص',
      width: '20%',
      render: (specialization) => <Badge variant="secondary">{specialization}</Badge>,
    },
    {
      key: 'consultation_fee',
      label: 'رسوم الكشف',
      width: '15%',
      render: (fee) => <span className="font-medium text-primary">{fee} ر.س</span>,
    },
    {
      key: 'is_available',
      label: 'الحالة',
      width: '10%',
      render: (is_available) => (
        <Badge variant={is_available ? "default" : "destructive"}>
          {is_available ? "متاح" : "غير متاح"}
        </Badge>
      ),
    },
    {
      key: 'experience_years',
      label: 'الخبرة',
      width: '10%',
      render: (years) => <span>{years} سنوات</span>,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة الأطباء</h1>
            <p className="text-muted-foreground mt-1">
              إدارة بيانات الأطباء وتخصصاتهم ({doctors.length})
            </p>
          </div>
          {permissions.canManageDoctors && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="medical" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 ml-2" />
                  طبيب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة طبيب جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={addForm.handleSubmit} className="space-y-4">
                  <SelectField
                    label="اختر المستخدم"
                    required
                    value={addForm.values.user_id}
                    onValueChange={(value) => addForm.setFieldValue('user_id', value)}
                    options={profiles.map(p => ({ value: p.user_id, label: `${p.full_name} - ${p.email}` }))}
                    error={addForm.errors.user_id}
                    placeholder="اختر مستخدمًا غير طبيب"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="التخصص"
                      required
                      name="specialization"
                      value={addForm.values.specialization}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                      error={addForm.errors.specialization}
                    />
                    <TextInput
                      label="رقم الترخيص"
                      name="license_number"
                      value={addForm.values.license_number}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                    />
                    <TextInput
                      label="رسوم الكشف (ر.س)"
                      type="number"
                      name="consultation_fee"
                      value={addForm.values.consultation_fee.toString()}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                      error={addForm.errors.consultation_fee}
                    />
                    <TextInput
                      label="أيام العودة المجانية"
                      type="number"
                      name="return_days"
                      value={addForm.values.return_days.toString()}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                    />
                    <TextInput
                      label="بداية الدوام"
                      type="time"
                      name="working_hours_start"
                      value={addForm.values.working_hours_start}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                    />
                    <TextInput
                      label="نهاية الدوام"
                      type="time"
                      name="working_hours_end"
                      value={addForm.values.working_hours_end}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                    />
                    <TextInput
                      label="سنوات الخبرة"
                      type="number"
                      name="experience_years"
                      value={addForm.values.experience_years.toString()}
                      onChange={addForm.handleChange}
                      onBlur={addForm.handleBlur}
                    />
                  </div>
                  <TextAreaField
                    label="نبذة عن الطبيب"
                    name="bio"
                    value={addForm.values.bio}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="خبرات، شهادات، تخصصات فرعية..."
                  />
                  <DialogFooter>
                    <Button type="submit" variant="medical" disabled={addForm.isSubmitting}>
                      {addForm.isSubmitting ? "جاري الإضافة..." : "إضافة الطبيب"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="البحث بالاسم، التخصص، أو البريد الإلكتروني..."
        />

        {/* Doctors List (DataTable) */}
        <DataTable
          title="قائمة الأطباء"
          columns={columns}
          data={searchedDoctors}
          loading={loading}
          emptyMessage="لا توجد بيانات أطباء تطابق معايير البحث"
          className="medical-shadow"
          actions={(doctor) => (
            <div className="flex gap-2 justify-center">
              {permissions.canEditDoctors && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDoctorAvailability(doctor)}
                    title={doctor.is_available ? "إلغاء التفعيل" : "تفعيل"}
                  >
                    {doctor.is_available ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-success" />}
                  </Button>
                </>
              )}
              {permissions.canDeleteDoctors && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الطبيب: د. {selectedDoctor?.profiles.full_name}</DialogTitle>
            </DialogHeader>
            {selectedDoctor && (
              <form onSubmit={editForm.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="التخصص"
                    required
                    name="specialization"
                    value={editForm.values.specialization}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                    error={editForm.errors.specialization}
                  />
                  <TextInput
                    label="رقم الترخيص"
                    name="license_number"
                    value={editForm.values.license_number}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                  />
                  <TextInput
                    label="رسوم الكشف (ر.س)"
                    type="number"
                    name="consultation_fee"
                    value={editForm.values.consultation_fee.toString()}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                    error={editForm.errors.consultation_fee}
                  />
                  <TextInput
                    label="أيام العودة المجانية"
                    type="number"
                    name="return_days"
                    value={editForm.values.return_days.toString()}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                  />
                  <TextInput
                    label="بداية الدوام"
                    type="time"
                    name="working_hours_start"
                    value={editForm.values.working_hours_start}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                  />
                  <TextInput
                    label="نهاية الدوام"
                    type="time"
                    name="working_hours_end"
                    value={editForm.values.working_hours_end}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                  />
                  <TextInput
                    label="سنوات الخبرة"
                    type="number"
                    name="experience_years"
                    value={editForm.values.experience_years.toString()}
                    onChange={editForm.handleChange}
                    onBlur={editForm.handleBlur}
                  />
                </div>
                <TextAreaField
                  label="نبذة عن الطبيب"
                  name="bio"
                  value={editForm.values.bio}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />
                <DialogFooter>
                  <Button type="submit" variant="medical" disabled={editForm.isSubmitting}>
                    {editForm.isSubmitting ? "جاري التحديث..." : "تحديث البيانات"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`حذف الطبيب: د. ${selectedDoctor?.profiles.full_name}`}
          description="هل أنت متأكد من حذف هذا الطبيب؟ سيتم حذف جميع بياناته ولن تتمكن من التراجع عن هذا الإجراء."
          onConfirm={handleDeleteDoctor}
          confirmText="حذف نهائي"
          isDangerous
          isLoading={editForm.isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default Doctors;
