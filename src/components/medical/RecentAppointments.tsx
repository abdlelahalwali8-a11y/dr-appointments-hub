import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, Phone, MoreHorizontal } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  phone: string;
  status: "scheduled" | "waiting" | "completed" | "return" | "cancelled";
  cost?: number;
}

export const RecentAppointments = () => {
  const appointments: Appointment[] = [
    {
      id: "1",
      patientName: "أحمد محمد علي",
      doctorName: "د. سارة أحمد",
      time: "09:30",
      phone: "0501234567",
      status: "waiting",
    },
    {
      id: "2",
      patientName: "فاطمة حسن",
      doctorName: "د. محمد قايد",
      time: "10:00",
      phone: "0507654321",
      status: "scheduled",
    },
    {
      id: "3",
      patientName: "خالد عبدالله",
      doctorName: "د. أحمد قايد سالم",
      time: "10:30",
      phone: "0509876543",
      status: "completed",
      cost: 250,
    },
    {
      id: "4",
      patientName: "نورا سالم",
      doctorName: "د. سارة أحمد",
      time: "11:00",
      phone: "0502345678",
      status: "return",
    },
  ];

  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      scheduled: { label: "مجدول", variant: "default" as const },
      waiting: { label: "انتظار", variant: "secondary" as const },
      completed: { label: "مكتمل", variant: "default" as const },
      return: { label: "عودة", variant: "outline" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="card-gradient border-0 medical-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            المواعيد الحديثة
          </CardTitle>
          <Button variant="outline" size="sm">
            عرض الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/80 transition-smooth animate-slide-up"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {appointment.patientName.split(" ")[0][0]}
                  {appointment.patientName.split(" ")[1]?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">
                    {appointment.patientName}
                  </h4>
                  {getStatusBadge(appointment.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {appointment.doctorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {appointment.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  {appointment.time}
                </div>
                {appointment.cost && (
                  <div className="text-sm text-success font-medium">
                    {appointment.cost} ر.س
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};