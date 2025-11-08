import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Plus, Clock, Phone, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrency } from '@/hooks/useCurrency';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'waiting' | 'completed' | 'return' | 'cancelled';
  notes?: string;
  cost?: number;
  patients: {
    full_name: string;
    phone: string;
  };
  doctors: {
    profiles: {
      full_name: string;
    };
    specialization: string;
  };
}

const Appointments = () => {
  const permissions = usePermissions();
  const { formatCurrency } = useCurrency();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  
  const { searchTerm, setSearchTerm, filteredData: searchedAppointments } = useSearch(appointments, {
    fields: ['patients.full_name', 'patients.phone', 'doctors.profiles.full_name'],
    minChars: 0,
  });

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            phone
          ),
          doctors (
            profiles (
              full_name
            ),
            specialization
          )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المواعيد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Real-time subscription for appointments
  useRealtimeSubscription({
    table: 'appointments',
    onInsert: () => fetchAppointments(),
    onUpdate: () => fetchAppointments(),
    onDelete: () => fetchAppointments(),
  });

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      scheduled: { label: 'مجدول', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      waiting: { label: 'في الانتظار', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'مكتمل', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      return: { label: 'عودة', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الموعد بنجاح",
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الموعد",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments = searchedAppointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || appointment.doctors.profiles.full_name === doctorFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const appointmentDate = new Date(appointment.appointment_date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (dateFilter === 'today') {
        matchesDate = appointmentDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'tomorrow') {
        matchesDate = appointmentDate.toDateString() === tomorrow.toDateString();
      } else if (dateFilter === 'upcoming') {
        matchesDate = appointmentDate >= today;
      }
    }
    
    return matchesStatus && matchesDoctor && matchesDate;
  });

  const uniqueDoctors = [...new Set(appointments.map(a => a.doctors.profiles.full_name))];

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-muted-foreground mt-1">
              إدارة وتتبع مواعيد المرضى ({filteredAppointments.length})
            </p>
          </div>
          <Button variant="medical" className="w-full md:w-auto">
            <Plus className="w-4 h-4 ml-2" />
            موعد جديد
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث عن الموعد..."
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="scheduled">مجدول</SelectItem>
              <SelectItem value="waiting">في الانتظار</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="return">عودة</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب التاريخ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التواريخ</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="tomorrow">غداً</SelectItem>
              <SelectItem value="upcoming">القادمة</SelectItem>
            </SelectContent>
          </Select>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الطبيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأطباء</SelectItem>
              {uniqueDoctors.map(doctor => (
                <SelectItem key={doctor} value={doctor}>
                  د. {doctor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لا توجد مواعيد تطابق معايير البحث
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="card-gradient border-0 medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                المواعيد ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {appointment.patients.full_name.split(' ')[0][0]}
                        {appointment.patients.full_name.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-foreground truncate">
                          {appointment.patients.full_name}
                        </h4>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          د. {appointment.doctors.profiles.full_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {appointment.patients.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-left">
                      <div className="font-semibold text-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.appointment_time}
                      </div>
                      {appointment.cost && (
                        <div className="text-sm text-success font-medium">
                          {formatCurrency(appointment.cost)}
                        </div>
                      )}
                    </div>
                    {permissions.canEditAppointments && (
                      <div className="flex gap-2">
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'waiting')}
                          >
                            انتظار
                          </Button>
                        )}
                        {appointment.status === 'waiting' && (
                          <Button
                            size="sm"
                            variant="medical"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            مكتمل
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
