import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserPlus, Clock, DollarSign, Activity } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentAppointments } from "./RecentAppointments";
import { QuickActions } from "./QuickActions";

import heroImage from "../../assets/medical-hero.jpg";

const Dashboard = () => {
  const stats = [
    {
      title: "مواعيد اليوم",
      value: "24",
      description: "موعد مجدول",
      icon: Calendar,
      trend: "+12%",
      color: "primary" as const
    },
    {
      title: "المرضى النشطين",
      value: "156",
      description: "مريض مسجل",
      icon: Users,
      trend: "+8%",
      color: "success" as const
    },
    {
      title: "في الانتظار",
      value: "7",
      description: "مريض ينتظر",
      icon: Clock,
      trend: "0%",
      color: "warning" as const
    },
    {
      title: "الإيرادات اليومية",
      value: "12,450",
      description: "ريال سعودي",
      icon: DollarSign,
      trend: "+15%",
      color: "success" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              مركز د أحمد قايد سالم الطبي
            </h1>
            <p className="text-muted-foreground mt-2">
              نظام إدارة المواعيد والمرضى
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              <Activity className="w-4 h-4 ml-2" />
              تقرير يومي
            </Button>
            <Button size="sm" variant="medical">
              <UserPlus className="w-4 h-4 ml-2" />
              مريض جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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