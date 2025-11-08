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
  const { signIn, signInWithGoogle, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: '',
  });

  const [phoneData, setPhoneData] = useState({
    phone: '',
    otp: '',
    otpSent: false,
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
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
    
    const { error } = await signIn(signInData.identifier, signInData.password);
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // أو رابط إعادة توجيه محدد
      },
    });

    if (error) {
      toast({
        title: "خطأ في Google Sign-in",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!phoneData.otpSent) {
      // الخطوة 1: إرسال رمز التحقق
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneData.phone,
      });

      if (error) {
        toast({
          title: "خطأ في إرسال الرمز",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setPhoneData({ ...phoneData, otpSent: true });
        toast({
          title: "تم إرسال الرمز",
          description: "تم إرسال رمز التحقق إلى هاتفك.",
        });
      }
    } else {
      // الخطوة 2: التحقق من الرمز وتسجيل الدخول
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneData.phone,
        token: phoneData.otp,
        type: 'sms',
      });

      if (error) {
        toast({
          title: "خطأ في التحقق",
          description: error.message,
          variant: "destructive",
        });
      }
    }

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
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.fullName,
      signUpData.phone
    );
    
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
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="signin">بريد/كلمة مرور</TabsTrigger>
                <TabsTrigger value="phone-signin">هاتف/Google</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                <TabsTrigger value="booking">حجز موعد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-identifier">البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم</Label>
                    <Input
                      id="signin-identifier"
                      type="text"
                      value={signInData.identifier}
                      onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                      required
                      placeholder="أدخل البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم"
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : 'تسجيل الدخول'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone-signin">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleSignIn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,19.033-8.136,19.611-18.083V20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.945,12,24,12c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,1.372,0.206,2.71,0.583,4H12V20H4.389C4.143,18.67,4,17.34,4,16C4,14.67,4.143,13.34,4.389,12H6.306z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.69,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.002,0.003-0.003l6.19,5.238C36.921,39.556,44,34.778,44,24C44,22.67,43.857,21.34,43.611,20.083z"></path>
                    </svg>
                    تسجيل الدخول عبر Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        أو برقم الهاتف
                      </span>
                    </div>
                  </div>
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="phone-number">رقم الهاتف</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneData.phone}
                        onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="مثال: +966501234567"
                      />
                    </div>
                    {phoneData.otpSent && (
                      <div>
                        <Label htmlFor="otp">رمز التحقق (OTP)</Label>
                        <Input
                          id="otp"
                          type="text"
                          value={phoneData.otp}
                          onChange={(e) => setPhoneData({ ...phoneData, otp: e.target.value })}
                          required
                          className="mt-1"
                          placeholder="أدخل الرمز المكون من 6 أرقام"
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      variant="medical"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : phoneData.otpSent ? 'تأكيد الدخول' : 'إرسال رمز التحقق'}
                    </Button>
                  </form>
                </div>
              </TabsContent>             </form>
                </div>
              </TabsContent>

              <TabsContent value="phone-signin">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleSignIn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,19.033-8.136,19.611-18.083V20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.945,12,24,12c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,1.372,0.206,2.71,0.583,4H12V20H4.389C4.143,18.67,4,17.34,4,16C4,14.67,4.143,13.34,4.389,12H6.306z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.69,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.002,0.003-0.003l6.19,5.238C36.921,39.556,44,34.778,44,24C44,22.67,43.857,21.34,43.611,20.083z"></path>
                    </svg>
                    تسجيل الدخول عبر Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        أو برقم الهاتف
                      </span>
                    </div>
                  </div>
                  <form onSubmit={handlePhoneSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="phone-number">رقم الهاتف</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneData.phone}
                        onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="مثال: +966501234567"
                      />
                    </div>
                    {phoneData.otpSent && (
                      <div>
                        <Label htmlFor="otp">رمز التحقق (OTP)</Label>
                        <Input
                          id="otp"
                          type="text"
                          value={phoneData.otp}
                          onChange={(e) => setPhoneData({ ...phoneData, otp: e.target.value })}
                          required
                          className="mt-1"
                          placeholder="أدخل الرمز المكون من 6 أرقام"
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      variant="medical"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : phoneData.otpSent ? 'تأكيد الدخول' : 'إرسال رمز التحقق'}
                    </Button>
                  </form>
                </div>
              </TabsContent>
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
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    تسجيل الدخول بواسطة Google
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
                    <Label htmlFor="signup-phone">رقم الهاتف (اختياري)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      placeholder="مثال: +967xxxxxxxxx"
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
                      minLength={6}
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
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    التسجيل بواسطة Google
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