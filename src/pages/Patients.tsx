import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Phone, Mail, MapPin, Calendar, Heart, FileText, TrendingUp, Activity, UserCheck, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MedicalRecordDialog from '@/components/medical/MedicalRecordDialog';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import StatsBar from '@/components/common/StatsBar';
import SearchBar from '@/components/common/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Patient {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  blood_type?: string;
  chronic_conditions?: string;
  insurance_info?: string;
  created_at: string;
  updated_at: string;
}

const Patients = () => {
  const permissions = usePermissions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [filterGender, setFilterGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState(false);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<Patient | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    medical_history: '',
    allergies: '',
    current_medications: '',
    blood_type: '',
    chronic_conditions: '',
    insurance_info: '',
  });

  const { searchTerm, setSearchTerm, filteredData: searchedPatients } = useSearch(patients, {
    fields: ['full_name', 'phone', 'email', 'address', 'emergency_contact'],
    minChars: 0,
  });

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المرضى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'patients',
    onInsert: () => fetchPatients(),
    onUpdate: () => fetchPatients(),
    onDelete: () => fetchPatients(),
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.phone.trim()) {
      toast({
        title: "خطأ",
        description: "الاسم ورقم الهاتف مطلوبان",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', editingPatient.id);

        if (error) throw error;

        toast({
          title: "نجح التحديث",
          description: "تم تحديث بيانات المريض بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "نجح الإضافة",
          description: "تم إضافة المريض بنجاح",
        });
      }

      setIsDialogOpen(false);
      setEditingPatient(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast({
        title: "خطأ",
        description: error.message.includes('unique') ? "رقم الهاتف مسجل مسبقاً" : "فشل في حفظ بيانات المريض",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact: '',
      medical_history: '',
      allergies: '',
      current_medications: '',
      blood_type: '',
      chronic_conditions: '',
      insurance_info: '',
    });
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
      current_medications: patient.current_medications || '',
      blood_type: patient.blood_type || '',
      chronic_conditions: patient.chronic_conditions || '',
      insurance_info: patient.insurance_info || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('هل أنت متأكد من حذف بيانات هذا المريض؟')) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "نجح الحذف",
        description: "تم حذف بيانات المريض بنجاح",
      });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف بيانات المريض",
        variant: "destructive",
      });
    }
  };

  // Apply filters and sorting
  let filteredPatients = searchedPatients;

  if (filterGender !== 'all') {
    filteredPatients = filteredPatients.filter(p => p.gender === filterGender);
  }

  if (sortBy === 'newest') {
    filteredPatients = [...filteredPatients].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sortBy === 'oldest') {
    filteredPatients = [...filteredPatients].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } else if (sortBy === 'name') {
    filteredPatients = [...filteredPatients].sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    );
  }

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
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Bar */}
        <StatsBar
          stats={[
            { label: 'إجمالي المرضى', value: patients.length, icon: Users, color: 'primary' },
            { label: 'المرضى النشطين', value: patients.filter(p => p.user_id).length, icon: UserCheck, color: 'success' },
            { label: 'مرضى جدد هذا الشهر', value: patients.filter(p => {
              const created = new Date(p.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length, icon: TrendingUp, color: 'info' },
            { label: 'الإجمالي المتوقع', value: patients.length, icon: Activity, color: 'warning' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة المرضى</h1>
            <p className="text-muted-foreground mt-1">
              إدارة بيانات وسجلات المرضى ({filteredPatients.length})
            </p>
          </div>
          {permissions.canCreatePatients && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingPatient(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="medical" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 ml-2" />
                  مريض جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPatient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">الاسم الكامل *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                        placeholder="البريد الإلكتروني"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">النوع</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="blood_type">فصيلة الدم</Label>
                      <Select value={formData.blood_type} onValueChange={(value) => setFormData({ ...formData, blood_type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="اختر فصيلة الدم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1"
                      placeholder="العنوان الكامل"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact">جهة الاتصال في الطوارئ</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="mt-1"
                      placeholder="الاسم ورقم الهاتف"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medical_history">التاريخ الطبي</Label>
                    <Textarea
                      id="medical_history"
                      value={formData.medical_history}
                      onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                      className="mt-1"
                      placeholder="الأمراض السابقة والعمليات الجراحية"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">الحساسيات</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="mt-1"
                      placeholder="الحساسيات من الأدوية والمواد"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="current_medications">الأدوية الحالية</Label>
                    <Textarea
                      id="current_medications"
                      value={formData.current_medications}
                      onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                      className="mt-1"
                      placeholder="الأدوية التي يتناولها المريض حالياً"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chronic_conditions">الأمراض المزمنة</Label>
                    <Textarea
                      id="chronic_conditions"
                      value={formData.chronic_conditions}
                      onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                      className="mt-1"
                      placeholder="السكري، ارتفاع ضغط الدم، إلخ"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insurance_info">معلومات التأمين</Label>
                    <Textarea
                      id="insurance_info"
                      value={formData.insurance_info}
                      onChange={(e) => setFormData({ ...formData, insurance_info: e.target.value })}
                      className="mt-1"
                      placeholder="رقم البطاقة والشركة"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="medical" className="flex-1">
                      {editingPatient ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث عن المريض..."
            className="md:col-span-1"
          />
          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              <SelectItem value="name">الاسم (أبجدي)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا توجد بيانات مرضى تطابق معايير البحث
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {patient.full_name.split(' ')[0]?.[0] || 'P'}
                          {patient.full_name.split(' ')[1]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{patient.full_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                      </div>
                    </div>
                    {permissions.canUpdatePatients && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                        className="p-1 h-auto"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  )}
                  {patient.blood_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>فصيلة الدم: {patient.blood_type}</span>
                    </div>
                  )}
                  {patient.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{new Date(patient.date_of_birth).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setSelectedPatientForRecord(patient);
                        setIsMedicalRecordOpen(true);
                      }}
                    >
                      <FileText className="w-3 h-3 ml-1" />
                      السجل الطبي
                    </Button>
                    {permissions.canDeletePatients && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Medical Record Dialog */}
      {selectedPatientForRecord && (
        <MedicalRecordDialog
          patient={selectedPatientForRecord}
          isOpen={isMedicalRecordOpen}
          onOpenChange={setIsMedicalRecordOpen}
        />
      )}
    </Layout>
  );
};

export default Patients;
