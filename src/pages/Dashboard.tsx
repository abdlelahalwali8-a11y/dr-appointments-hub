import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, Calendar, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle2,
  Activity, Phone, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  todayRevenue: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  activeUsers: number;
  appointmentsByStatus: { status: string; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  appointmentsByDoctor: { doctor: string; count: number }[];
  upcomingAppointments: any[];
  alerts: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    todayRevenue: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    activeUsers: 0,
    appointmentsByStatus: [],
    revenueByDay: [],
    appointmentsByDoctor: [],
    upcomingAppointments: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Helper function to fetch revenue by day
  const fetchRevenueByDay = async (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date, doctors (consultation_fee)')
      .eq('status', 'completed')
      .gte('appointment_date', startDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching revenue by day:', error);
      return [];
    }

    const dailyRevenue = data.reduce((acc: any, apt: any) => {
      const date = apt.appointment_date;
      const fee = apt.doctors?.consultation_fee || 0;
      acc[date] = (acc[date] || 0) + fee;
      return acc;
    }, {});

    return Object.keys(dailyRevenue).map(date => ({
      date: new Date(date).toLocaleDateString('ar-SA', { weekday: 'short' }),
      revenue: dailyRevenue[date],
    }));
  };

  // Helper function to fetch appointments by doctor
  const fetchAppointmentsByDoctor = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('doctors (profiles (full_name))');

    if (error) {
      console.error('Error fetching appointments by doctor:', error);
      return [];
    }

    const doctorCounts = data.reduce((acc: any, apt: any) => {
      const doctorName = apt.doctors?.profiles?.full_name || 'غير معروف';
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(doctorCounts).map(doctor => ({
      doctor,
      count: doctorCounts[doctor],
    }));
  };

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch total patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch total doctors
      const { count: doctorCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });

      // Fetch today's appointments
      const { data: todayAppts, error: todayError } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', today)
        .lt('appointment_date', new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0]);

      if (todayError) throw todayError;

     name))
        `)
        .gte('appointment_date', today)
        .order('appointment_date')
        .limit(5);

      // Calculate revenue
      const { data: completedAppts, error: completedError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (consultation_fee)
        `)
        .eq('status', 'completed')
        .gte('appointment_date', today);

      if (completedError) throw completedError;

      const todayRevenue = completedAppts?.reduce((sum, apt) => sum + (apt.doctors?.consultation_fee || 0), 0) || 0;

      // Fetch revenue by day (for the last 7 days)
      const revenueByDayData = await fetchRevenueByDay(7);

      // Fetch appointments by doctor
      const appointmentsByDoctorData = await fetchAppointm// Calculate revenue is already done in the previous block, removing redundant code.   setStats({
        totalPatients: patientCount || 0,
        totalDoctors: doctorCount || 0,
        todayAppointments: todayAppts?.length || 0,
        todayRevenue,
        completedAppointments: statusCounts.find((s: any) => s.status === 'completed')?.count || 0,
        pendingAppointments: statusCounts.find((s: any) => s.status === 'pending')?.count || 0,
        cancelledAppointments: statusCounts.find((s: any) => s.status === 'cancelled')?.count || 0,
        activeUsers: 0, // This would require session tracking
        appointmentsByStatus: statusCounts,
        revenueByDay: revenueByDayData,
        appointmentsByDoctor: appointmentsByDoctorData,
        upcomingAppointments: upcomingAppts || [],
        alerts: generateAlerts(todayAppts || [], upcomingAppts || []),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({ title: "خطأ", description: "فشل في تحميل بيانات لوحة التحكم", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (todayAppts: any[], upcomingAppts: any[]) => {
    const alerts = [];

    if (todayAppts.length === 0) {
      alerts.push({
        type: 'info',
        message: 'لا توجد مواعيد مجدولة لهذا اليوم',
        icon: Calendar,
      });
    }

    const pendingAppts = todayAppts.filter((apt: any) => apt.status === 'pending');
    if (pendingAppts.length > 0) {
      alerts.push({
        type: 'warning',
        message: `هناك ${pendingAppts.length} موعد في قائمة الانتظار`,
        icon: AlertCircle,
      });
    }

    return alerts;
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'appointments',
    onInsert: () => fetchDashboardStats(),
    onUpdate: () => fetchDashboardStats(),
    onDelete: () => fetchDashboardStats(),
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            لمحة عامة فورية عن أداء المركز الطبي
          </p>
        </div>

        {/* Alerts */}
        {stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert, idx) => (
              <Alert key={idx} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
                <alert.icon className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>إجمالي المرضى</span>
                <Users className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="w-3 h-3 inline text-success" /> 12% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>مواعيد اليوم</span>
                <Calendar className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success">{stats.completedAppointments}</span> مكتملة
              </p>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>الإيرادات اليوم</span>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.todayRevenue.toFixed(2)} ر.س</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ArrowUpRight className="w-3 h-3 inline text-success" /> 8% من أمس
              </p>
            </CardContent>
          </Card>

          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>الأطباء</span>
                <Activity className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalDoctors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                جميع الأطباء متاحون
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
            <TabsTrigger value="doctors">الأطباء</TabsTrigger>
          </TabsList>

          {/* Appointments Chart */}
          <TabsContent value="appointments" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>توزيع المواعيد حسب الحالة</CardTitle>
                <CardDescription>
                  نسبة المواعيد المكتملة والمعلقة والملغاة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.appointmentsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.appointmentsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Chart */}
          <TabsContent value="revenue" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>الإيرادات</CardTitle>
                <CardDescription>
                  تحليل الإيرادات اليومية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.revenueByDay}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Chart */}
          <TabsContent value="doctors" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>الأطباء الأكثر حجزًا</CardTitle>
                <CardDescription>
                  عدد المواعيد لكل طبيب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.appointmentsByDoctor}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="doctor" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upcoming Appointments */}
        <Card className="medical-shadow">
          <CardHeader>
            <CardTitle>المواعيد القادمة</CardTitle>
            <CardDescription>
              المواعيد المجدولة للأيام القادمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد مواعيد قادمة</p>
              ) : (
                stats.upcomingAppointments.map((apt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{apt.patients?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          د. {apt.doctors?.profiles?.full_name} • {new Date(apt.appointment_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
