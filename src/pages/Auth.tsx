import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Stethoscope, Calendar } from 'lucide-react';
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
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
  });

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

  const handleQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create patient first
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert({
          full_name: quickBookingData.fullName,
          phone: quickBookingData.phone,
          date_of_birth: new Date(new Date().getFullYear() - parseInt(quickBookingData.age), 0, 1).toISOString().split('T')[0],
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          doctor_id: quickBookingData.doctorId,
          appointment_date: quickBookingData.appointmentDate,
          appointment_time: quickBookingData.appointmentTime,
          status: 'scheduled',
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "تم الحجز بنجاح",
        description: "سيتم التواصل معك قريباً لتأكيد الموعد",
      });

      // Reset form
      setQuickBookingData({
        fullName: '',
        age: '',
        phone: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حجز الموعد",
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
                      <Label htmlFor="booking-phone">رقم الهاتف</Label>
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
      </div>
    </div>
  );
};

export default Auth;