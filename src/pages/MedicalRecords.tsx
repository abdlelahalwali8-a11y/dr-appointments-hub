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
import { FileText, Search, Plus, Calendar, User, Stethoscope, FileImage, Pill, Edit, Trash2, Eye, Activity, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import StatsBar from '@/components/common/StatsBar';

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

  useRealtimeSubscription({
    table: 'medical_records',
    onInsert: () => fetchRecords(),
    onUpdate: () => fetchRecords(),
    onDelete: () => fetchRecords(),
  });

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: formData.patient_id,
          doctor_id: formData.doctor_id,
          appointment_id: formData.appointment_id || null,
          visit_date: formData.visit_date,
          chief_complaint: formData.chief_complaint,
          diagnosis: formData.diagnosis,
          treatment_plan: formData.treatment_plan,
          prescribed_medications: formData.prescribed_medications,
          follow_up_instructions: formData.follow_up_instructions,
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
        title: "تم التعديل",
        description: "تم تعديل السجل الطبي بنجاح",
      });

      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تعديل السجل الطبي",
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
      patient_id: '',
      doctor_id: '',
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

  const filteredRecords = records.filter(record => {
    const search = searchTerm.toLowerCase();
    return (
      record.patients.full_name.toLowerCase().includes(search) ||
      record.patients.phone.includes(search) ||
      record.diagnosis?.toLowerCase().includes(search) ||
      record.chief_complaint?.toLowerCase().includes(search) ||
      record.treatment_plan?.toLowerCase().includes(search) ||
      record.prescribed_medications?.toLowerCase().includes(search) ||
      record.doctors.profiles.full_name.toLowerCase().includes(search) ||
      new Date(record.visit_date).toLocaleDateString('ar-SA').includes(search)
    );
  });

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
        {/* Stats Bar */}
        <StatsBar
          stats={[
            { label: 'إجمالي السجلات', value: records.length, icon: FileText, color: 'primary' },
            { label: 'سجلات هذا الشهر', value: records.filter(r => {
              const date = new Date(r.visit_date);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length, icon: TrendingUp, color: 'success' },
            { label: 'سجلات اليوم', value: records.filter(r => r.visit_date === new Date().toISOString().split('T')[0]).length, icon: Activity, color: 'info' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">السجلات الطبية</h1>
            <p className="text-muted-foreground mt-1">
              إدارة وعرض السجلات الطبية للمرضى
            </p>
          </div>
          {permissions.canCreateMedicalRecords && (
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="medical">
                  <Plus className="w-4 h-4 ml-2" />
                  سجل طبي جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة سجل طبي جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المريض *</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        value={formData.patient_id}
                        onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                        required
                      >
                        <option value="">اختر المريض</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>الطبيب *</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg bg-background"
                        value={formData.doctor_id}
                        onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                        required
                      >
                        <option value="">اختر الطبيب</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.profiles?.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>تاريخ الزيارة *</Label>
                    <Input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>الشكوى الرئيسية</Label>
                    <Textarea
                      value={formData.chief_complaint}
                      onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>التشخيص</Label>
                    <Textarea
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>خطة العلاج</Label>
                    <Textarea
                      value={formData.treatment_plan}
                      onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>الأدوية الموصوفة</Label>
                    <Textarea
                      value={formData.prescribed_medications}
                      onChange={(e) => setFormData({ ...formData, prescribed_medications: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} variant="medical">
                      {isSubmitting ? 'جاري الإضافة...' : 'إضافة السجل'}
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
                placeholder="البحث السريع والتفاعلي بالمريض، الطبيب، التشخيص، العلاج، الأدوية، التاريخ..."
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
              <div className="grid gap-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {record.patients.full_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-foreground">{record.patients.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{record.patients.phone}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(record.visit_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-primary" />
                            <span>{record.doctors.profiles.full_name}</span>
                          </div>
                        </div>

                        {record.diagnosis && (
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-primary/10">
                              {record.diagnosis}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
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
                            variant="ghost"
                            onClick={() => openEditDialog(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {permissions.canDeleteMedicalRecords && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا السجل الطبي؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRecord}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري الحذف...' : 'حذف'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل السجل الطبي</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المريض</Label>
                    <p className="text-foreground mt-1">{selectedRecord.patients.full_name}</p>
                  </div>
                  <div>
                    <Label>الطبيب</Label>
                    <p className="text-foreground mt-1">{selectedRecord.doctors.profiles.full_name}</p>
                  </div>
                </div>
                <div>
                  <Label>تاريخ الزيارة</Label>
                  <p className="text-foreground mt-1">{new Date(selectedRecord.visit_date).toLocaleDateString('ar-SA')}</p>
                </div>
                {selectedRecord.chief_complaint && (
                  <div>
                    <Label>الشكوى الرئيسية</Label>
                    <p className="text-foreground mt-1">{selectedRecord.chief_complaint}</p>
                  </div>
                )}
                {selectedRecord.diagnosis && (
                  <div>
                    <Label>التشخيص</Label>
                    <p className="text-foreground mt-1">{selectedRecord.diagnosis}</p>
                  </div>
                )}
                {selectedRecord.treatment_plan && (
                  <div>
                    <Label>خطة العلاج</Label>
                    <p className="text-foreground mt-1">{selectedRecord.treatment_plan}</p>
                  </div>
                )}
                {selectedRecord.prescribed_medications && (
                  <div>
                    <Label>الأدوية الموصوفة</Label>
                    <p className="text-foreground mt-1">{selectedRecord.prescribed_medications}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
