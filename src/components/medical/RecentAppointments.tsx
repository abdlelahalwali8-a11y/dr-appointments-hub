import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, Phone, MoreHorizontal, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  appointment_date: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  cost?: number;
  patients?: {
    full_name: string;
    phone: string;
  };
  doctors?: {
    profiles?: {
      full_name: string;
    };
  };
}

export const RecentAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const fetchAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            phone
          ),
          doctors (
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setAppointments((data as any) || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Real-time updates
  useRealtimeSubscription({
    table: 'appointments',
    onInsert: () => fetchAppointments(),
    onUpdate: () => fetchAppointments(),
    onDelete: () => fetchAppointments(),
  });

  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      scheduled: { label: "مجدول", variant: "default" as const },
      confirmed: { label: "مؤكد", variant: "secondary" as const },
      in_progress: { label: "جاري", variant: "secondary" as const },
      completed: { label: "مكتمل", variant: "default" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
      no_show: { label: "لم يحضر", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="card-gradient border-0 medical-shadow">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient border-0 medical-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            مواعيد اليوم
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/appointments')}
          >
            عرض الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مواعيد اليوم
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/80 transition-smooth animate-slide-up"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {appointment.patients?.full_name?.split(" ")[0]?.[0] || "؟"}
                    {appointment.patients?.full_name?.split(" ")[1]?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">
                      {appointment.patients?.full_name || "غير محدد"}
                    </h4>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {appointment.doctors?.profiles?.full_name || "غير محدد"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {appointment.patients?.phone || "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-semibold text-foreground">
                    {appointment.appointment_time}
                  </div>
                   {appointment.cost && (
                    <div className="text-sm text-success font-medium">
                      {formatCurrency(appointment.cost)}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/appointments')}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};