import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar, Clock, User, DollarSign, CheckCircle2, AlertCircle, Trash2, Edit,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useForm, FormErrors } from '@/hooks/useForm';
import { TextInput, TextAreaField, SelectField } from '@/components/common/FormField';
import { useCurrency } from '@/hooks/useCurrency';

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'waiting' | 'completed' | 'cancelled' | 'return';
  notes?: string;
  cost?: number;
  patients: {
    full_name: string;
    phone: string;
  };
  doctors: {
    consultation_fee: number;
    profiles: {
      full_name: string;
    };
  };
}

const AppointmentsAdvanced = () => {
  const permissions = usePermissions();
  const { formatCurrency } = useCurrency();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (full_name, phone),
          doctors (
            consultation_fee,
            profiles (full_name)
          )
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({ title: "خطأ", description: "فشل في تحميل المواعيد", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'appointments',
    onInsert: () => fetchAppointments(),
    onUpdate: () => fetchAppointments(),
    onDelete: () => fetchAppointments(),
  });

  // Update Appointment Status
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      let updateData: any = { status: newStatus };

      // Auto-calculate cost when marking as completed
      if (newStatus === 'completed') {
        const apt = appointments.find(a => a.id === appointmentId);
        if (apt) {
          updateData.cost = apt.doctors.consultation_fee;
        }
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      toast({ title: "تم التحديث", description: "تم تحديث حالة الموعد بنجاح" });
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في تحديث الموعد", variant: "destructive" });
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف الموعد بنجاح" });
      setIsDeleteOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في حذف الموعد", variant: "destructive" });
    }
  };

  // Search and Filter
  const { searchTerm: filteredSearchTerm, setSearchTerm: setFilteredSearchTerm, filteredData: searchedAppointments } = useSearch(appointments, {
    fields: ['patients.full_name', 'doctors.profiles.full_name', 'status'],
    minChars: 0,
  });

  // Calendar View
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 border rounded-lg min-h-24 ${isToday ? 'bg-primary/10 border-primary' : 'bg-accent/30'}`}
        >
          <p className={`font-semibold text-sm mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {day}
          </p>
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                onClick={() => {
                  setSelectedAppointment(apt);
                  setIsViewOpen(true);
                }}
                className="text-xs p-1 rounded bg-primary/20 text-primary cursor-pointer hover:bg-primary/30 truncate"
              >
                {apt.patients.full_name}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <p className="text-xs text-muted-foreground">+{dayAppointments.length - 2} أخرى</p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    return: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'مجدول',
    waiting: 'في الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    return: 'عودة',
  };

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
      <div className="p-2 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              إدارة شاملة لجدولة المواعيد ({appointments.length})
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant={viewMode === 'calendar' ? 'medical' : 'outline'}
              onClick={() => setViewMode('calendar')}
              className="flex-1 sm:flex-none text-xs md:text-sm"
            >
              <Calendar className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">تقويم</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'medical' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex-1 sm:flex-none text-xs md:text-sm"
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">قائمة</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={filteredSearchTerm}
          onChange={setFilteredSearchTerm}
          placeholder="البحث بالمريض، الطبيب، أو الحالة..."
        />

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card className="medical-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>التقويم</CardTitle>
                  <CardDescription>
                    {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    اليوم
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {searchedAppointments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>لا توجد مواعيد تطابق معايير البحث</AlertDescription>
              </Alert>
            ) : (
              searchedAppointments.map(apt => (
                <Card key={apt.id} className="medical-shadow hover:shadow-lg transition">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{apt.patients.full_name}</h3>
                          <Badge className={statusColors[apt.status]}>
                            {statusLabels[apt.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          د. {apt.doctors.profiles.full_name}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(apt.appointment_date).toLocaleDateString('ar-SA')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.appointment_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(apt.cost || apt.doctors.consultation_fee)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {permissions.canEditAppointments && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* View Appointment Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تفاصيل الموعد</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">المريض</p>
                  <p className="font-semibold">{selectedAppointment.patients.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الطبيب</p>
                  <p className="font-semibold">د. {selectedAppointment.doctors.profiles.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ والوقت</p>
                  <p className="font-semibold">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('ar-SA')} - {selectedAppointment.appointment_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge className={statusColors[selectedAppointment.status]}>
                    {statusLabels[selectedAppointment.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التكلفة</p>
                  <p className="font-semibold">{formatCurrency(selectedAppointment.cost || selectedAppointment.doctors.consultation_fee)}</p>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">ملاحظات</p>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
                {permissions.canEditAppointments && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold">تحديث الحالة</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={selectedAppointment.status === status ? 'medical' : 'outline'}
                          onClick={() => {
                            handleStatusChange(selectedAppointment.id, status);
                            setIsViewOpen(false);
                          }}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="حذف الموعد"
          description={`هل أنت متأكد من حذف موعد ${selectedAppointment?.patients.full_name}؟`}
          onConfirm={handleDeleteAppointment}
          confirmText="حذف نهائي"
          isDangerous
        />
      </div>
    </Layout>
  );
};

export default AppointmentsAdvanced;
