import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Search, Plus, Filter, Clock, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patients.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-muted-foreground mt-1">
              إدارة وتتبع مواعيد المرضى
            </p>
          </div>
          <Button variant="medical">
            <Plus className="w-4 h-4 ml-2" />
            موعد جديد
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="all">جميع الحالات</option>
                <option value="scheduled">مجدول</option>
                <option value="waiting">في الانتظار</option>
                <option value="completed">مكتمل</option>
                <option value="return">عودة</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              المواعيد ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد مواعيد</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {appointment.patients.full_name.split(' ')[0][0]}
                        {appointment.patients.full_name.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {appointment.patients.full_name}
                        </h4>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="flex items-center gap-4">
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
                          {appointment.cost} ر.س
                        </div>
                      )}
                    </div>
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
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Appointments;