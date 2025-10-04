import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Stethoscope, Calendar, Search, User, Phone, FileText, Pill } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  profiles?: { full_name: string };
}

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });

  const [quickBookingData, setQuickBookingData] = useState({
    fullName: '',
    age: '',
    phone: '',
    city: '',
    notes: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [showRecordsDialog, setShowRecordsDialog] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select(`
            id,
            user_id,
            specialization,
            profiles:user_id (
              full_name
            )
          `)
          .eq('is_available', true);

        if (error) throw error;
        if (mounted) {
          setDoctors(data || []);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    
    fetchDoctors();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    
    if (error) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الحساب",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const searchPatient = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = async (patient: any) => {
    setSelectedPatient(patient);
    setQuickBookingData({
      ...quickBookingData,
      fullName: patient.full_name,
      phone: patient.phone,
      age: patient.age?.toString() || '',
      city: patient.city || '',
      notes: patient.notes || ''
    });
    setSearchResults([]);

    // جلب السجلات الطبية للمريض
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctors (
            profiles (
              full_name
            )
          )
        `)
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const handleQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let patientId = selectedPatient?.id;

      // إذا لم يكن هناك مريض محدد، أنشئ مريض جديد
      if (!patientId) {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .insert({
            full_name: quickBookingData.fullName,
            phone: quickBookingData.phone,
            age: quickBookingData.age ? parseInt(quickBookingData.age) : null,
            city: quickBookingData.city || null,
            notes: quickBookingData.notes || null,
          })
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = patientData.id;
      }

      // إنشاء موعد
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          doctor_id: quickBookingData.doctorId,
          appointment_date: quickBookingData.appointmentDate,
          appointment_time: quickBookingData.appointmentTime,
          status: 'scheduled',
          notes: quickBookingData.notes || null,
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "تم الحجز بنجاح",
        description: selectedPatient 
          ? "تم حجز موعد جديد للمريض" 
          : "تم إضافة المريض وحجز الموعد بنجاح",
      });

      // Reset form
      setQuickBookingData({
        fullName: '',
        age: '',
        phone: '',
        city: '',
        notes: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
      });
      setSelectedPatient(null);
      setSearchResults([]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message.includes('unique') 
          ? "رقم الهاتف مسجل مسبقاً" 
          : error.message || "فشل في حجز الموعد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            مركز د أحمد قايد سالم الطبي
          </h1>
          <p className="text-muted-foreground mt-2">
            نظام إدارة المواعيد والمرضى
          </p>
        </div>

        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">مرحباً بك</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                <TabsTrigger value="booking">حجز موعد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="medical"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    تسجيل الدخول
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="medical"
                    className="w-full"
                    disabled={isLoading || signUpData.password !== signUpData.confirmPassword}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    إنشاء حساب
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="booking">
                <form onSubmit={handleQuickBooking} className="space-y-4">
                  {/* بحث عن مريض */}
                  <div>
                    <Label htmlFor="search-patient">
                      <Search className="inline w-4 h-4 ml-2" />
                      بحث عن مريض موجود
                    </Label>
                    <Input
                      id="search-patient"
                      type="text"
                      placeholder="ابحث بالاسم أو رقم الهاتف..."
                      onChange={(e) => searchPatient(e.target.value)}
                      className="mt-1"
                    />
                    {isSearching && (
                      <p className="text-xs text-muted-foreground mt-1">جاري البحث...</p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg mt-2 max-h-32 overflow-y-auto">
                        {searchResults.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 text-sm"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <p className="font-medium">{patient.full_name}</p>
                            <p className="text-xs text-muted-foreground">{patient.phone}</p>
                            {patient.age && <p className="text-xs text-muted-foreground">العمر: {patient.age}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedPatient && (
                    <Alert className="bg-primary/5">
                      <User className="h-4 w-4" />
                      <AlertDescription className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">مريض محدد: {selectedPatient.full_name}</span>
                          <div className="flex gap-2">
                            {patientRecords.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowRecordsDialog(true)}
                              >
                                <FileText className="w-3 h-3 ml-1" />
                                السجل الطبي ({patientRecords.length})
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(null);
                                setPatientRecords([]);
                                setQuickBookingData({
                                  ...quickBookingData,
                                  fullName: '',
                                  phone: '',
                                  age: '',
                                  city: '',
                                  notes: ''
                                });
                              }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">
                      {selectedPatient ? 'بيانات المريض' : 'مريض جديد'}
                    </h4>
                    <div>
                      <Label htmlFor="booking-name">الاسم الكامل</Label>
                      <Input
                        id="booking-name"
                        type="text"
                        value={quickBookingData.fullName}
                        onChange={(e) => setQuickBookingData({ ...quickBookingData, fullName: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking-age">العمر</Label>
                      <Input
                        id="booking-age"
                        type="number"
                        min="1"
                        max="150"
                        value={quickBookingData.age}
                        onChange={(e) => setQuickBookingData({ ...quickBookingData, age: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="booking-phone">
                        <Phone className="inline w-3 h-3 ml-1" />
                        رقم الهاتف
                      </Label>
                      <Input
                        id="booking-phone"
                        type="tel"
                        value={quickBookingData.phone}
                        onChange={(e) => setQuickBookingData({ ...quickBookingData, phone: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="booking-city">المدينة (اختياري)</Label>
                    <Input
                      id="booking-city"
                      type="text"
                      value={quickBookingData.city}
                      onChange={(e) => setQuickBookingData({ ...quickBookingData, city: e.target.value })}
                      className="mt-1"
                      placeholder="المدينة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="booking-notes">ملاحظات (اختياري)</Label>
                    <textarea
                      id="booking-notes"
                      value={quickBookingData.notes}
                      onChange={(e) => setQuickBookingData({ ...quickBookingData, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-background min-h-[60px] mt-1"
                      placeholder="الأعراض أو ملاحظات إضافية..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="booking-doctor">الطبيب</Label>
                    <Select
                      value={quickBookingData.doctorId}
                      onValueChange={(value) => setQuickBookingData({ ...quickBookingData, doctorId: value })}
                    >
                      <SelectTrigger className="mt-1" id="booking-doctor">
                        <SelectValue placeholder="اختر الطبيب" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.length > 0 ? (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.profiles?.full_name || 'غير معروف'} - {doctor.specialization}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-doctors" disabled>
                            لا يوجد أطباء متاحين
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking-date">تاريخ الموعد</Label>
                      <Input
                        id="booking-date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={quickBookingData.appointmentDate}
                        onChange={(e) => setQuickBookingData({ ...quickBookingData, appointmentDate: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="booking-time">وقت الموعد</Label>
                      <Input
                        id="booking-time"
                        type="time"
                        value={quickBookingData.appointmentTime}
                        onChange={(e) => setQuickBookingData({ ...quickBookingData, appointmentTime: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="medical"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Calendar className="w-4 h-4 ml-2" />}
                    حجز الموعد
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    سيتم التواصل معك لتأكيد الموعد
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Medical Records Dialog */}
        <Dialog open={showRecordsDialog} onOpenChange={setShowRecordsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                السجل الطبي - {selectedPatient?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {patientRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد سجلات طبية</p>
                </div>
              ) : (
                patientRecords.map((record) => (
                  <Card key={record.id} className="border-0 bg-accent/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {new Date(record.visit_date).toLocaleDateString('ar-SA')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          د. {record.doctors.profiles.full_name}
                        </span>
                      </div>
                      
                      {record.chief_complaint && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">الشكوى الرئيسية:</h4>
                          <p className="text-sm text-muted-foreground">{record.chief_complaint}</p>
                        </div>
                      )}
                      
                      {record.diagnosis && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">التشخيص:</h4>
                          <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        </div>
                      )}
                      
                      {record.treatment_plan && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">خطة العلاج:</h4>
                          <p className="text-sm text-muted-foreground">{record.treatment_plan}</p>
                        </div>
                      )}
                      
                      {record.prescribed_medications && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            الأدوية الموصوفة:
                          </h4>
                          <p className="text-sm text-muted-foreground">{record.prescribed_medications}</p>
                        </div>
                      )}
                      
                      {record.follow_up_instructions && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">تعليمات المتابعة:</h4>
                          <p className="text-sm text-muted-foreground">{record.follow_up_instructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;