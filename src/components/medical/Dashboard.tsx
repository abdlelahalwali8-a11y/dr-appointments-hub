import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserPlus, Clock, DollarSign, Activity, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentAppointments } from "./RecentAppointments";
import { QuickActions } from "./QuickActions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

import heroImage from "../../assets/medical-hero.jpg";

const Dashboard = () => {
  const [centerSettings, setCenterSettings] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    appointments: 0,
    patients: 0,
    waiting: 0,
    revenue: 0,
  });
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchCenterSettings();
    fetchTodayStats();
  }, []);

  // Real-time subscription for appointments
  useRealtimeSubscription({
    table: 'appointments',
    onInsert: () => {
      fetchTodayStats();
      toast.success('تم إضافة موعد جديد');
    },
    onUpdate: () => {
      fetchTodayStats();
    },
    onDelete: () => {
      fetchTodayStats();
    },
  });

  // Real-time subscription for patients
  useRealtimeSubscription({
    table: 'patients',
    onInsert: () => {
      fetchTodayStats();
      toast.success('تم تسجيل مريض جديد');
    },
  });

  const fetchCenterSettings = async () => {
    const { data } = await supabase
      .from('center_settings')
      .select('*')
      .single();
    setCenterSettings(data);
  };

  const fetchTodayStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's appointments with real-time data
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*, cost, doctors(consultation_fee)')
      .eq('appointment_date', today);

    // Calculate real revenue (completed appointments)
    const completedAppointments = appointments?.filter(apt => apt.status === 'completed') || [];
    const totalRevenue = completedAppointments.reduce((sum, apt) => {
      return sum + (apt.cost || apt.doctors?.consultation_fee || 0);
    }, 0);

    // Count waiting appointments (scheduled or waiting status)
    const waiting = appointments?.filter(apt => apt.status === 'scheduled' || apt.status === 'waiting').length || 0;

    // Fetch total active patients
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    setTodayStats({
      appointments: appointments?.length || 0,
      patients: patientsCount || 0,
      waiting,
      revenue: totalRevenue,
    });
  };

  const stats = [
    {
      title: "مواعيد اليوم",
      value: todayStats.appointments.toString(),
      description: todayStats.appointments === 1 ? "موعد مجدول" : "موعد مجدول",
      icon: Calendar,
      trend: todayStats.appointments > 0 ? "✓" : "0",
      color: "primary" as const
    },
    {
      title: "المرضى المسجلين",
      value: todayStats.patients.toString(),
      description: todayStats.patients === 1 ? "مريض" : "مريض",
      icon: Users,
      trend: "✓",
      color: "success" as const
    },
    {
      title: "في الانتظار",
      value: todayStats.waiting.toString(),
      description: todayStats.waiting === 0 ? "لا يوجد" : "مريض ينتظر",
      icon: Clock,
      trend: todayStats.waiting > 0 ? "⏳" : "✓",
      color: todayStats.waiting > 0 ? "warning" as const : "success" as const
    },
    {
      title: "إيرادات اليوم",
      value: formatCurrency(todayStats.revenue),
      description: "المواعيد المكتملة",
      icon: DollarSign,
      trend: todayStats.revenue > 0 ? "💰" : "0",
      color: "success" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {centerSettings?.center_name || 'مركز د أحمد قايد سالم الطبي'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              نظام إدارة المواعيد والمرضى
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-xs md:text-sm">
              <Activity className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">تقرير يومي</span>
              <span className="sm:hidden">تقرير</span>
            </Button>
            <Button size="sm" variant="medical" className="flex-1 sm:flex-none text-xs md:text-sm">
              <UserPlus className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">مريض جديد</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <RecentAppointments />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;