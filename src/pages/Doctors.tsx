import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Search, Plus, Phone, Mail, Clock, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

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

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    user_id: '',
    specialization: '',
    license_number: '',
    consultation_fee: '',
    return_days: '7',
    working_hours_start: '08:00',
    working_hours_end: '17:00',
    bio: '',
    experience_years: '',
  });

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
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
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

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First update the profile role to doctor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'doctor' })
        .eq('user_id', newDoctor.user_id);

      if (profileError) throw profileError;

      // Then create the doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([{
          user_id: newDoctor.user_id,
          specialization: newDoctor.specialization,
          license_number: newDoctor.license_number || null,
          consultation_fee: parseFloat(newDoctor.consultation_fee) || 0,
          return_days: parseInt(newDoctor.return_days) || 7,
          working_hours_start: newDoctor.working_hours_start,
          working_hours_end: newDoctor.working_hours_end,
          bio: newDoctor.bio || null,
          experience_years: parseInt(newDoctor.experience_years) || 0,
        }]);

      if (doctorError) throw doctorError;

      toast({
        title: "نجح الإضافة",
        description: "تم إضافة الطبيب بنجاح",
      });

      setIsDialogOpen(false);
      setNewDoctor({
        user_id: '',
        specialization: '',
        license_number: '',
        consultation_fee: '',
        return_days: '7',
        working_hours_start: '08:00',
        working_hours_end: '17:00',
        bio: '',
        experience_years: '',
      });
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الطبيب",
        variant: "destructive",
      });
    }
  };

  const toggleDoctorAvailability = async (doctorId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_available: !isAvailable })
        .eq('id', doctorId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${!isAvailable ? 'تفعيل' : 'إلغاء تفعيل'} الطبيب`,
      });
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطبيب",
        variant: "destructive",
      });
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الأطباء</h1>
            <p className="text-muted-foreground mt-1">
              إدارة بيانات الأطباء وتخصصاتهم
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="medical">
                <Plus className="w-4 h-4 ml-2" />
                طبيب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة طبيب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div>
                  <Label htmlFor="user_id">اختر المستخدم *</Label>
                  <select
                    id="user_id"
                    value={newDoctor.user_id}
                    onChange={(e) => setNewDoctor({ ...newDoctor, user_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    required
                  >
                    <option value="">اختر مستخدم</option>
                    {profiles.map((profile) => (
                      <option key={profile.user_id} value={profile.user_id}>
                        {profile.full_name} - {profile.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialization">التخصص *</Label>
                    <Input
                      id="specialization"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">رقم الترخيص</Label>
                    <Input
                      id="license_number"
                      value={newDoctor.license_number}
                      onChange={(e) => setNewDoctor({ ...newDoctor, license_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultation_fee">رسوم الكشف (ر.س)</Label>
                    <Input
                      id="consultation_fee"
                      type="number"
                      step="0.01"
                      value={newDoctor.consultation_fee}
                      onChange={(e) => setNewDoctor({ ...newDoctor, consultation_fee: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_days">أيام العودة المجانية</Label>
                    <Input
                      id="return_days"
                      type="number"
                      value={newDoctor.return_days}
                      onChange={(e) => setNewDoctor({ ...newDoctor, return_days: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="working_hours_start">بداية الدوام</Label>
                    <Input
                      id="working_hours_start"
                      type="time"
                      value={newDoctor.working_hours_start}
                      onChange={(e) => setNewDoctor({ ...newDoctor, working_hours_start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="working_hours_end">نهاية الدوام</Label>
                    <Input
                      id="working_hours_end"
                      type="time"
                      value={newDoctor.working_hours_end}
                      onChange={(e) => setNewDoctor({ ...newDoctor, working_hours_end: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">سنوات الخبرة</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={newDoctor.experience_years}
                      onChange={(e) => setNewDoctor({ ...newDoctor, experience_years: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">نبذة عن الطبيب</Label>
                  <textarea
                    id="bio"
                    value={newDoctor.bio}
                    onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
                    placeholder="خبرات، شهادات، تخصصات فرعية..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="medical" className="flex-1">
                    إضافة الطبيب
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
        </div>

        {/* Search */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو التخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              قائمة الأطباء ({filteredDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد بيانات أطباء</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                          د.{doctor.profiles.full_name.split(' ')[0][0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground">
                              د. {doctor.profiles.full_name}
                            </h4>
                            <p className="text-primary font-medium">{doctor.specialization}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={doctor.is_available ? "default" : "secondary"}>
                              {doctor.is_available ? "متاح" : "غير متاح"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleDoctorAvailability(doctor.id, doctor.is_available)}
                            >
                              {doctor.is_available ? "إلغاء التفعيل" : "تفعيل"}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>{doctor.consultation_fee} ر.س</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>عودة مجانية {doctor.return_days} أيام</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{doctor.working_hours_start} - {doctor.working_hours_end}</span>
                          </div>
                          {doctor.experience_years > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Stethoscope className="w-4 h-4" />
                              <span>{doctor.experience_years} سنوات خبرة</span>
                            </div>
                          )}
                        </div>
                        {doctor.bio && (
                          <p className="text-sm text-muted-foreground">{doctor.bio}</p>
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

export default Doctors;