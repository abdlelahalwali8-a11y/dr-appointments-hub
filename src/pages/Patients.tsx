import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, Plus, Phone, Mail, MapPin, Calendar, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Pencil, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    medical_history: '',
    allergies: '',
    blood_type: '',
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

    try {
      if (editingPatient) {
        // Update existing patient
        const { error } = await supabase
          .from('patients')
          .update({
            ...newPatient,
            date_of_birth: newPatient.date_of_birth || null,
            gender: newPatient.gender || null,
          })
          .eq('id', editingPatient.id);

        if (error) throw error;

        toast({
          title: "نجح التحديث",
          description: "تم تحديث بيانات المريض بنجاح",
        });
      } else {
        // Add new patient
        const { error } = await supabase
          .from('patients')
          .insert([{
            ...newPatient,
            date_of_birth: newPatient.date_of_birth || null,
            gender: newPatient.gender || null,
          }]);

        if (error) throw error;

        toast({
          title: "نجح الإضافة",
          description: "تم إضافة المريض بنجاح",
        });
      }

      setIsDialogOpen(false);
      setEditingPatient(null);
      setNewPatient({
        full_name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        gender: '',
        address: '',
        medical_history: '',
        allergies: '',
        blood_type: '',
      });
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast({
        title: "خطأ",
        description: error.message.includes('unique') ? "رقم الهاتف مسجل مسبقاً" : "فشل في حفظ بيانات المريض",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setNewPatient({
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
      blood_type: patient.blood_type || '',
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

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-foreground">إدارة المرضى</h1>
            <p className="text-muted-foreground mt-1">
              إدارة بيانات وسجلات المرضى
            </p>
          </div>
          {permissions.canCreatePatients && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingPatient(null);
                setNewPatient({
                  full_name: '',
                  phone: '',
                  email: '',
                  date_of_birth: '',
                  gender: '',
                  address: '',
                  medical_history: '',
                  allergies: '',
                  blood_type: '',
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="medical">
                  <Plus className="w-4 h-4 ml-2" />
                  مريض جديد
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">الاسم الكامل *</Label>
                    <Input
                      id="full_name"
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">الجنس</Label>
                    <select
                      id="gender"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="">اختر الجنس</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="blood_type">فصيلة الدم</Label>
                    <Input
                      id="blood_type"
                      value={newPatient.blood_type}
                      onChange={(e) => setNewPatient({ ...newPatient, blood_type: e.target.value })}
                      placeholder="مثل: O+, A-, B+"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="medical_history">التاريخ الطبي</Label>
                  <textarea
                    id="medical_history"
                    value={newPatient.medical_history}
                    onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
                    placeholder="الأمراض السابقة، العمليات، إلخ..."
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">الحساسية</Label>
                  <textarea
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[60px]"
                    placeholder="الحساسية من الأدوية أو الأطعمة..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="medical" className="flex-1">
                    {editingPatient ? 'حفظ التعديلات' : 'إضافة المريض'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
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
                placeholder="البحث بالاسم أو رقم الهاتف أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              قائمة المرضى ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد بيانات مرضى</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                          {patient.full_name.split(' ')[0][0]}
                          {patient.full_name.split(' ')[1]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-foreground">
                            {patient.full_name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {new Date(patient.created_at).toLocaleDateString('ar-SA')}
                            </div>
                            {permissions.canEditPatients && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPatient(patient)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {permissions.canDeletePatients && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeletePatient(patient.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          {patient.date_of_birth && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(patient.date_of_birth).toLocaleDateString('ar-SA')}</span>
                            </div>
                          )}
                          {patient.blood_type && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Heart className="w-4 h-4" />
                              <span>{patient.blood_type}</span>
                            </div>
                          )}
                        </div>
                        {patient.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <MapPin className="w-4 h-4" />
                            <span>{patient.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Patients;