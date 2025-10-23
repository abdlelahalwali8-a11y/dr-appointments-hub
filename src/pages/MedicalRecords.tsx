import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Search, Plus, Calendar, User, Stethoscope, FileImage, Pill, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';

interface MedicalRecord {
  id: string;
  visit_date: string;
  chief_complaint?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescribed_medications?: string;
  follow_up_instructions?: string;
  vital_signs?: any;
  patients: {
    full_name: string;
    phone: string;
  };
  doctors: {
    profiles: {
      full_name: string;
    };
  };
}

const MedicalRecords = () => {
  const permissions = usePermissions();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    prescribed_medications: '',
    follow_up_instructions: '',
    vital_signs: {
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      weight: '',
    }
  });

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (
            full_name,
            phone
          ),
          doctors (
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
      toast({
        title: "خطأ",
        description: "فشل في تحميل السجلات الطبية",
        variant: "destructive",
      });
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
        .select('id, profiles(full_name), specialization')
        .eq('is_available', true);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, patient_id, doctor_id, appointment_date, patients(full_name)')
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          ...formData,
          vital_signs: formData.vital_signs,
        }]);

      if (error) throw error;

      toast({
        title: "تم الإضافة",
        description: "تم إضافة السجل الطبي بنجاح",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchRecords();
    } catch (error: any) {
      console.error('Error adding medical record:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          chief_complaint: formData.chief_complaint,
          diagnosis: formData.diagnosis,
          treatment_plan: formData.treatment_plan,
          prescribed_medications: formData.prescribed_medications,
          follow_up_instructions: formData.follow_up_instructions,
          vital_signs: formData.vital_signs,
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث السجل الطبي بنجاح",
      });

      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف السجل الطبي بنجاح",
      });

      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_id: '',
      visit_date: new Date().toISOString().split('T')[0],
      chief_complaint: '',
      diagnosis: '',
      treatment_plan: '',
      prescribed_medications: '',
      follow_up_instructions: '',
      vital_signs: {
        blood_pressure: '',
        temperature: '',
        heart_rate: '',
        weight: '',
      }
    });
  };

  const openEditDialog = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      patient_id: record.patients ? record.patients.full_name : '',
      doctor_id: record.doctors ? record.doctors.profiles.full_name : '',
      appointment_id: '',
      visit_date: record.visit_date,
      chief_complaint: record.chief_complaint || '',
      diagnosis: record.diagnosis || '',
      treatment_plan: record.treatment_plan || '',
      prescribed_medications: record.prescribed_medications || '',
      follow_up_instructions: record.follow_up_instructions || '',
      vital_signs: record.vital_signs || {
        blood_pressure: '',
        temperature: '',
        heart_rate: '',
        weight: '',
      }
    });
    setIsEditDialogOpen(true);
  };

  // Real-time subscription
  useRealtimeSubscription({
    table: 'medical_records',
    onInsert: () => fetchRecords(),
    onUpdate: () => fetchRecords(),
    onDelete: () => fetchRecords(),
  });

  const filteredRecords = records.filter(record =>
    record.patients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patients.phone.includes(searchTerm) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">السجلات الطبية</h1>
            <p className="text-muted-foreground mt-1">
              إدارة ومراجعة السجلات الطبية للمرضى
            </p>
          </div>
          {permissions.canCreateMedicalRecords && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="medical">
                  <Plus className="w-4 h-4 ml-2" />
                  سجل طبي جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة سجل طبي جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient_id">المريض *</Label>
                      <select
                        id="patient_id"
                        value={formData.patient_id}
                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        required
                      >
                        <option value="">اختر مريض</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.full_name} - {patient.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="doctor_id">الطبيب *</Label>
                      <select
                        id="doctor_id"
                        value={formData.doctor_id}
                        onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        required
                      >
                        <option value="">اختر طبيب</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.profiles.full_name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="appointment_id">الموعد</Label>
                      <select
                        id="appointment_id"
                        value={formData.appointment_id}
                        onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                      >
                        <option value="">اختر موعد (اختياري)</option>
                        {appointments.map((appointment) => (
                          <option key={appointment.id} value={appointment.id}>
                            {appointment.patients?.full_name} - {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="visit_date">تاريخ الزيارة *</Label>
                      <Input
                        id="visit_date"
                        type="date"
                        value={formData.visit_date}
                        onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">العلامات الحيوية</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="blood_pressure">ضغط الدم</Label>
                        <Input
                          id="blood_pressure"
                          placeholder="120/80"
                          value={formData.vital_signs.blood_pressure}
                          onChange={(e) => setFormData({
                            ...formData,
                            vital_signs: { ...formData.vital_signs, blood_pressure: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="temperature">درجة الحرارة (°C)</Label>
                        <Input
                          id="temperature"
                          placeholder="37"
                          value={formData.vital_signs.temperature}
                          onChange={(e) => setFormData({
                            ...formData,
                            vital_signs: { ...formData.vital_signs, temperature: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="heart_rate">معدل النبض</Label>
                        <Input
                          id="heart_rate"
                          placeholder="72"
                          value={formData.vital_signs.heart_rate}
                          onChange={(e) => setFormData({
                            ...formData,
                            vital_signs: { ...formData.vital_signs, heart_rate: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">الوزن (كجم)</Label>
                        <Input
                          id="weight"
                          placeholder="70"
                          value={formData.vital_signs.weight}
                          onChange={(e) => setFormData({
                            ...formData,
                            vital_signs: { ...formData.vital_signs, weight: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="chief_complaint">الشكوى الرئيسية</Label>
                    <Textarea
                      id="chief_complaint"
                      value={formData.chief_complaint}
                      onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diagnosis">التشخيص</Label>
                    <Textarea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment_plan">خطة العلاج</Label>
                    <Textarea
                      id="treatment_plan"
                      value={formData.treatment_plan}
                      onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prescribed_medications">الأدوية الموصوفة</Label>
                    <Textarea
                      id="prescribed_medications"
                      value={formData.prescribed_medications}
                      onChange={(e) => setFormData({ ...formData, prescribed_medications: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="follow_up_instructions">تعليمات المتابعة</Label>
                    <Textarea
                      id="follow_up_instructions"
                      value={formData.follow_up_instructions}
                      onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="medical" disabled={isSubmitting}>
                      {isSubmitting ? "جاري الإضافة..." : "إضافة السجل"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو رقم الهاتف أو التشخيص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              السجلات الطبية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات طبية</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {record.patients.full_name.split(' ')[0][0]}
                        {record.patients.full_name.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">
                            {record.patients.full_name}
                          </h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {new Date(record.visit_date).toLocaleDateString('ar-SA')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                          {permissions.canEditMedicalRecords && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(record)}
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              تعديل
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
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>د. {record.doctors.profiles.full_name}</span>
                        </div>
                        {record.chief_complaint && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            <span>{record.chief_complaint}</span>
                          </div>
                        )}
                        {record.diagnosis && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{record.diagnosis}</span>
                          </div>
                        )}
                        {record.prescribed_medications && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Pill className="w-4 h-4" />
                            <span>{record.prescribed_medications.substring(0, 50)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* View Record Dialog */}
        {selectedRecord && (
          <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedRecord(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  السجل الطبي - {selectedRecord.patients.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    معلومات المريض
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">الاسم: </span>
                      {selectedRecord.patients.full_name}
                    </div>
                    <div>
                      <span className="font-medium">الهاتف: </span>
                      {selectedRecord.patients.phone}
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الزيارة: </span>
                      {new Date(selectedRecord.visit_date).toLocaleDateString('ar-SA')}
                    </div>
                    <div>
                      <span className="font-medium">الطبيب المعالج: </span>
                      د. {selectedRecord.doctors.profiles.full_name}
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                {selectedRecord.vital_signs && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      العلامات الحيوية
                    </h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedRecord.vital_signs.blood_pressure && (
                          <div>
                            <span className="font-medium">ضغط الدم: </span>
                            {selectedRecord.vital_signs.blood_pressure}
                          </div>
                        )}
                        {selectedRecord.vital_signs.temperature && (
                          <div>
                            <span className="font-medium">درجة الحرارة: </span>
                            {selectedRecord.vital_signs.temperature} °C
                          </div>
                        )}
                        {selectedRecord.vital_signs.heart_rate && (
                          <div>
                            <span className="font-medium">معدل النبض: </span>
                            {selectedRecord.vital_signs.heart_rate}
                          </div>
                        )}
                        {selectedRecord.vital_signs.weight && (
                          <div>
                            <span className="font-medium">الوزن: </span>
                            {selectedRecord.vital_signs.weight} كجم
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chief Complaint */}
                {selectedRecord.chief_complaint && (
                  <div>
                    <h3 className="font-semibold mb-3">الشكوى الرئيسية</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.chief_complaint}</p>
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedRecord.diagnosis && (
                  <div>
                    <h3 className="font-semibold mb-3">التشخيص</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.diagnosis}</p>
                    </div>
                  </div>
                )}

                {/* Treatment Plan */}
                {selectedRecord.treatment_plan && (
                  <div>
                    <h3 className="font-semibold mb-3">خطة العلاج</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.treatment_plan}</p>
                    </div>
                  </div>
                )}

                {/* Prescribed Medications */}
                {selectedRecord.prescribed_medications && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      الأدوية الموصوفة
                    </h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.prescribed_medications}</p>
                    </div>
                  </div>
                )}

                {/* Follow-up Instructions */}
                {selectedRecord.follow_up_instructions && (
                  <div>
                    <h3 className="font-semibold mb-3">تعليمات المتابعة</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.follow_up_instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Record Dialog */}
        {selectedRecord && (
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedRecord(null);
              resetForm();
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل السجل الطبي</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditRecord} className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">العلامات الحيوية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_blood_pressure">ضغط الدم</Label>
                      <Input
                        id="edit_blood_pressure"
                        placeholder="120/80"
                        value={formData.vital_signs.blood_pressure}
                        onChange={(e) => setFormData({
                          ...formData,
                          vital_signs: { ...formData.vital_signs, blood_pressure: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_temperature">درجة الحرارة (°C)</Label>
                      <Input
                        id="edit_temperature"
                        placeholder="37"
                        value={formData.vital_signs.temperature}
                        onChange={(e) => setFormData({
                          ...formData,
                          vital_signs: { ...formData.vital_signs, temperature: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_heart_rate">معدل النبض</Label>
                      <Input
                        id="edit_heart_rate"
                        placeholder="72"
                        value={formData.vital_signs.heart_rate}
                        onChange={(e) => setFormData({
                          ...formData,
                          vital_signs: { ...formData.vital_signs, heart_rate: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_weight">الوزن (كجم)</Label>
                      <Input
                        id="edit_weight"
                        placeholder="70"
                        value={formData.vital_signs.weight}
                        onChange={(e) => setFormData({
                          ...formData,
                          vital_signs: { ...formData.vital_signs, weight: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_chief_complaint">الشكوى الرئيسية</Label>
                  <Textarea
                    id="edit_chief_complaint"
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_diagnosis">التشخيص</Label>
                  <Textarea
                    id="edit_diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_treatment_plan">خطة العلاج</Label>
                  <Textarea
                    id="edit_treatment_plan"
                    value={formData.treatment_plan}
                    onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_prescribed_medications">الأدوية الموصوفة</Label>
                  <Textarea
                    id="edit_prescribed_medications"
                    value={formData.prescribed_medications}
                    onChange={(e) => setFormData({ ...formData, prescribed_medications: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_follow_up_instructions">تعليمات المتابعة</Label>
                  <Textarea
                    id="edit_follow_up_instructions"
                    value={formData.follow_up_instructions}
                    onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="medical" disabled={isSubmitting}>
                    {isSubmitting ? "جاري التحديث..." : "تحديث السجل"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف السجل الطبي نهائياً ولا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRecord}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? "جاري الحذف..." : "حذف"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
