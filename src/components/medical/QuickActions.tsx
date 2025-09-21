import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Calendar, 
  Search, 
  Users, 
  Stethoscope, 
  FileText,
  Clock,
  Settings
} from "lucide-react";

export const QuickActions = () => {
  const quickActions = [
    {
      title: "موعد جديد",
      description: "حجز موعد لمريض",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      action: "book-appointment"
    },
    {
      title: "مريض جديد",
      description: "إضافة مريض جديد",
      icon: UserPlus,
      color: "bg-success/10 text-success",
      action: "add-patient"
    },
    {
      title: "إدارة الأطباء",
      description: "عرض وإدارة الأطباء",
      icon: Stethoscope,
      color: "bg-warning/10 text-warning",
      action: "manage-doctors"
    },
    {
      title: "التقارير",
      description: "عرض التقارير والإحصائيات",
      icon: FileText,
      color: "bg-destructive/10 text-destructive",
      action: "reports"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <Card className="card-gradient border-0 medical-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            البحث السريع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="البحث بالاسم أو رقم الهاتف..."
            className="w-full"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Users className="w-4 h-4 ml-2" />
              المرضى
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="w-4 h-4 ml-2" />
              المواعيد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-gradient border-0 medical-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            الإجراءات السريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-accent/50 transition-smooth"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card className="card-gradient border-0 medical-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            ملخص اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">المواعيد المكتملة</span>
            <span className="font-semibold text-success">18</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">في الانتظار</span>
            <span className="font-semibold text-warning">7</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">الملغية</span>
            <span className="font-semibold text-destructive">2</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">إجمالي الإيرادات</span>
              <span className="font-bold text-primary text-lg">12,450 ر.س</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};