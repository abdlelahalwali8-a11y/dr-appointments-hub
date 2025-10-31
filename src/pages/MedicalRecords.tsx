import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, User, Stethoscope, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  visit_date: string;
  chief_complaint?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescribed_medications?: string;
  follow_up_instructions?: string;
  vital_signs?: {
    blood_pressure?: string;
    temperature?: string;
    heart_rate?: string;
    weight?: string;
  };
  patients: {
    id: string;
    full_name: string;
    phone: string;
  };
  doctors: {
    id: string;
    profiles: {
      full_name: string;
    };
  };
}

interface Patient {
  id: string;
  full_name: string;
  phone: string;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  };
}

const MedicalRecords = () => {
  const permissions = usePermissions();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (
            id,
            full_name,
            phone
          ),
          doctors (
            id,
            profiles (
              full_name
            )
          )
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({ title: "خطأ", description: "فشل في تحميل السجلات الطبية", variant: "destructive" });
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          profiles (
            full_name
          )
        `)
        .order('created_at');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'medical_records',
    onInsert: () => fetchRecords(),
    onUpdate: () => fetchRecords(),
    onDelete: () => fetchRecords(),
  });

  // --- Add Record Form ---
  const initialAddValues = {
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    prescribed_medications: '',
    follow_up_instructions: '',
    blood_pressure: '',
    temperature: '',
    heart_rate: '',
    weight: '',
  };

  const validateAdd = (values: typeof initialAddValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.patient_id) errors.patient_id = 'يجب اختيار مريض.';
    if (!values.doctor_id) errors.doctor_id = 'يجب اختيار طبيب.';
    if (!values.visit_date) errors.visit_date = 'تاريخ الزيارة مطلوب.';
    return errors;
  };

  const handleAddRecord = async (values: typeof initialAddValues) => {
    try {
      const vital_signs = {
        blood_pressure: values.blood_pressure || null,
        temperature: values.temperature || null,
        heart_rate: values.heart_rate || null,
        weight: values.weight || null,
      };

      const { error } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: values.patient_id,
          doctor_id: values.doctor_id,
          appointment_id: values.appointment_id || null,
          visit_date: values.visit_date,
          chief_complaint: values.chief_complaint || null,
          diagnosis: values.diagnosis || null,
          treatment_plan: values.treatment_plan || null,
          prescribed_medications: values.prescribed_medications || null,
          follow_up_instructions: values.follow_up_instructions || null,
          vital_signs,
        }]);

      if (error) throw error;

      toast({ title: "نجح الإضافة", description: "تم إضافة السجل الطبي بنجاح" });
      setIsDialogOpen(false);
      addForm.resetForm();
    } catch (error: any) {
      console.error('Error adding record:', error);
      toast({ title: "خطأ", description: error.message || "فشل في إضافة السجل الطبي", variant: "destructive" });
    }
  };

  const addForm = useForm({
    initialValues: initialAddValues,
    onSubmit: handleAddRecord,
    validate: validateAdd,
  });

  // --- Edit Record Form ---
  const initialEditValues = useMemo(() => ({
    id: selectedRecord?.id || '',
    patient_id: selectedRecord?.patient_id || '',
    doctor_id: selectedRecord?.doctor_id || '',
    appointment_id: selectedRecord?.appointment_id || '',
    visit_date: selectedRecord?.visit_date || new Date().toISOString().split('T')[0],
    chief_complaint: selectedRecord?.chief_complaint || '',
    diagnosis: selectedRecord?.diagnosis || '',
    treatment_plan: selectedRecord?.treatment_plan || '',
    prescribed_medications: selectedRecord?.prescribed_medications || '',
    follow_up_instructions: selectedRecord?.follow_up_instructions || '',
    blood_pressure: selectedRecord?.vital_signs?.blood_pressure || '',
    temperature: selectedRecord?.vital_signs?.temperature || '',
    heart_rate: selectedRecord?.vital_signs?.heart_rate || '',
    weight: selectedRecord?.vital_signs?.weight || '',
  }), [selectedRecord]);

  const validateEdit = (values: typeof initialEditValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.visit_date) errors.visit_date = 'تاريخ الزيارة مطلوب.';
    return errors;
  };

  const handleEditRecord = async (values: typeof initialEditValues) => {
    try {
      const vital_signs = {
        blood_pressure: values.blood_pressure || null,
        temperature: values.temperature || null,
        heart_rate: values.heart_rate || null,
        weight: values.weight || null,
      };

      const { error } = await supabase
        .from('medical_records')
        .update({
          chief_complaint: values.chief_complaint || null,
          diagnosis: values.diagnosis || null,
          treatment_plan: values.treatment_plan || null,
          prescribed_medications: values.prescribed_medications || null,
          follow_up_instructions: values.follow_up_instructions || null,
          vital_signs,
        })
        .eq('id', values.id);

      if (error) throw error;

      toast({ title: "تم التحديث", description: "تم تحديث السجل الطبي بنجاح" });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث السجل الطبي", variant: "destructive" });
    }
  };

  const editForm = useForm({
    initialValues: initialEditValues,
    onSubmit: handleEditRecord,
    validate: validateEdit,
  });

  useEffect(() => {
    if (selectedRecord) {
      editForm.setValues(initialEditValues);
    }
  }, [selectedRecord]);

  // --- Delete Record ---
  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف السجل الطبي بنجاح" });
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في حذف السجل الطبي", variant: "destructive" });
    }
  };

  // --- Search and Filter ---
  const { searchTerm, setSearchTerm, filteredData: searchedRecords } = useSearch(records, {
    fields: ['patients.full_name', 'patients.phone', 'doctors.profiles.full_name', 'diagnosis'],
    minChars: 0,
  });

  // --- DataTable Columns ---
  const columns: Column<MedicalRecord>[] = [
    {
      key: 'patients.full_name',
      label: 'المريض',
      width: '25%',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {record.patients.full_name.split(' ')[0][0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{record.patients.full_name}</h4>
            <p className="text-sm text-muted-foreground">{record.patients.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'visit_date',
      label: 'تاريخ الزيارة',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      key: 'diagnosis',
      label: 'التشخيص',
      width: '20%',
      render: (diagnosis) => <span className="line-clamp-2">{diagnosis || '-'}</span>,
    },
    {
      key: 'doctors.profiles.full_name',
      label: 'الطبيب',
      width: '20%',
      render: (_, record) => <span>د. {record.doctors.profiles.full_name}</span>,
    },
    {
      key: 'chief_complaint',
      label: 'الشكوى الرئيسية',
      width: '20%',
      render: (complaint) => <span className="line-clamp-2">{complaint || '-'}</span>,
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">السجلات الطبية</h1>
            <p className="text-muted-foreground mt-1">
              إدارة السجلات الطبية للمرضى ({records.length})
            </p>
          </div>
          {permissions.canCreateMedicalRecords && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="medical" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 ml-2" />
                  سجل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة سجل طبي جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={addForm.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="المريض"
                      required
                      value={addForm.values.patient_id}
                      onValueChange={(value) => addForm.setFieldValue('patient_id', value)}
                      options={patients.map(p => ({ value: p.id, label: p.full_name }))}
                      error={addForm.errors.patient_id}
                      placeholder="اختر مريضًا"
                    />
                    <SelectField
                      label="الطبيب"
                      required
                      value={addForm.values.doctor_id}
                      onValueChange={(value) => addForm.setFieldValue('doctor_id', value)}
                      options={doctors.map(d => ({ value: d.id, label: `د. ${d.profiles.full_name}` }))}
                      error={addForm.errors.doctor_id}
                      placeholder="اختر طبيبًا"
                    />
                  </div>

                  <TextInput
                    label="تاريخ الزيارة"
                    required
                    type="date"
                    name="visit_date"
                    value={addForm.values.visit_date}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    error={addForm.errors.visit_date}
                  />

                  <TextAreaField
                    label="الشكوى الرئيسية"
                    name="chief_complaint"
                    value={addForm.values.chief_complaint}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="وصف شكوى المريض الرئيسية..."
                  />

                  <TextAreaField
                    label="التشخيص"
                    name="diagnosis"
                    value={addForm.values.diagnosis}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="التشخيص الطبي..."
                  />

                  <TextAreaField
                    label="خطة العلاج"
                    name="treatment_plan"
                    value={addForm.values.treatment_plan}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="خطة العلاج والإجراءات..."
                  />

                  <TextAreaField
                    label="الأدوية الموصوفة"
                    name="prescribed_medications"
                    value={addForm.values.prescribed_medications}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="الأدوية والجرعات..."
                  />

                  <TextAreaField
                    label="تعليمات المتابعة"
                    name="follow_up_instructions"
                    value={addForm.values.follow_up_instructions}
                    onChange={addForm.handleChange}
                    onBlur={addForm.handleBlur}
                    placeholder="تعليمات المتابعة والنصائح..."
                  />

                  {/* Vital Signs */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-foreground mb-4">العلامات الحيوية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        label="ضغط الدم"
                        name="blood_pressure"
                        value={addForm.values.blood_pressure}
                        onChange={addForm.handleChange}
                        placeholder="مثال: 120/80"
                      />
                      <TextInput
                        label="درجة الحرارة (°م)"
                        name="temperature"
                        type="number"
                        step="0.1"
                        value={addForm.values.temperature}
                        onChange={addForm.handleChange}
                      />
                      <TextInput
                        label="نبضات القلب (نبضة/دقيقة)"
                        name="heart_rate"
                        type="number"
                        value={addForm.values.heart_rate}
                        onChange={addForm.handleChange}
                      />
                      <TextInput
                        label="الوزن (كغ)"
                        name="weight"
                        type="number"
                        step="0.1"
                        value={addForm.values.weight}
                        onChange={addForm.handleChange}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" variant="medical" disabled={addForm.isSubmitting}>
                      {addForm.isSubmitting ? "جاري الإضافة..." : "إضافة السجل"}
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
          placeholder="البحث بالمريض، الطبيب، أو التشخيص..."
        />

        {/* Medical Records Table */}
        <DataTable
          title="السجلات الطبية"
          columns={columns}
          data={searchedRecords}
          loading={loading}
          emptyMessage="لا توجد سجلات طبية تطابق معايير البحث"
          className="medical-shadow"
          actions={(record) => (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRecord(record);
                  setIsViewDialogOpen(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {permissions.canEditMedicalRecords && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {permissions.canDeleteMedicalRecords && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        />

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>عرض السجل الطبي</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">بيانات المريض</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">الاسم</p>
                        <p className="font-semibold">{selectedRecord.patients.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الهاتف</p>
                        <p className="font-semibold">{selectedRecord.patients.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">بيانات الطبيب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">الاسم</p>
                        <p className="font-semibold">د. {selectedRecord.doctors.profiles.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ الزيارة</p>
                        <p className="font-semibold">{new Date(selectedRecord.visit_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Medical Information */}
                {selectedRecord.chief_complaint && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">الشكوى الرئيسية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRecord.chief_complaint}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedRecord.diagnosis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">التشخيص</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRecord.diagnosis}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedRecord.treatment_plan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">خطة العلاج</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRecord.treatment_plan}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedRecord.prescribed_medications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">الأدوية الموصوفة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedRecord.prescribed_medications}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Vital Signs */}
                {selectedRecord.vital_signs && Object.values(selectedRecord.vital_signs).some(v => v) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">العلامات الحيوية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedRecord.vital_signs.blood_pressure && (
                          <div>
                            <p className="text-sm text-muted-foreground">ضغط الدم</p>
                            <p className="font-semibold">{selectedRecord.vital_signs.blood_pressure}</p>
                          </div>
                        )}
                        {selectedRecord.vital_signs.temperature && (
                          <div>
                            <p className="text-sm text-muted-foreground">درجة الحرارة</p>
                            <p className="font-semibold">{selectedRecord.vital_signs.temperature}°م</p>
                          </div>
                        )}
                        {selectedRecord.vital_signs.heart_rate && (
                          <div>
                            <p className="text-sm text-muted-foreground">نبضات القلب</p>
                            <p className="font-semibold">{selectedRecord.vital_signs.heart_rate} نبضة/دقيقة</p>
                          </div>
                        )}
                        {selectedRecord.vital_signs.weight && (
                          <div>
                            <p className="text-sm text-muted-foreground">الوزن</p>
                            <p className="font-semibold">{selectedRecord.vital_signs.weight} كغ</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل السجل الطبي</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <form onSubmit={editForm.handleSubmit} className="space-y-4">
                <TextAreaField
                  label="الشكوى الرئيسية"
                  name="chief_complaint"
                  value={editForm.values.chief_complaint}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />

                <TextAreaField
                  label="التشخيص"
                  name="diagnosis"
                  value={editForm.values.diagnosis}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />

                <TextAreaField
                  label="خطة العلاج"
                  name="treatment_plan"
                  value={editForm.values.treatment_plan}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />

                <TextAreaField
                  label="الأدوية الموصوفة"
                  name="prescribed_medications"
                  value={editForm.values.prescribed_medications}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />

                <TextAreaField
                  label="تعليمات المتابعة"
                  name="follow_up_instructions"
                  value={editForm.values.follow_up_instructions}
                  onChange={editForm.handleChange}
                  onBlur={editForm.handleBlur}
                />

                {/* Vital Signs */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-foreground mb-4">العلامات الحيوية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="ضغط الدم"
                      name="blood_pressure"
                      value={editForm.values.blood_pressure}
                      onChange={editForm.handleChange}
                    />
                    <TextInput
                      label="درجة الحرارة (°م)"
                      name="temperature"
                      type="number"
                      step="0.1"
                      value={editForm.values.temperature}
                      onChange={editForm.handleChange}
                    />
                    <TextInput
                      label="نبضات القلب (نبضة/دقيقة)"
                      name="heart_rate"
                      type="number"
                      value={editForm.values.heart_rate}
                      onChange={editForm.handleChange}
                    />
                    <TextInput
                      label="الوزن (كغ)"
                      name="weight"
                      type="number"
                      step="0.1"
                      value={editForm.values.weight}
                      onChange={editForm.handleChange}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" variant="medical" disabled={editForm.isSubmitting}>
                    {editForm.isSubmitting ? "جاري التحديث..." : "تحديث السجل"}
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
          title="حذف السجل الطبي"
          description={`هل أنت متأكد من حذف السجل الطبي للمريض: ${selectedRecord?.patients.full_name}؟ سيتم حذف جميع البيانات ولن تتمكن من التراجع عن هذا الإجراء.`}
          onConfirm={handleDeleteRecord}
          confirmText="حذف نهائي"
          isDangerous
          isLoading={editForm.isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default MedicalRecords;
