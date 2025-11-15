import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: string;
  color: "primary" | "success" | "warning" | "destructive";
}

export const StatsCard = ({ title, value, description, icon: Icon, trend, color }: StatsCardProps) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10"
  };

  const trendColor = trend.startsWith("+") ? "text-success" : trend === "0%" ? "text-muted-foreground" : "text-destructive";

  return (
    <Card className="card-gradient border-0 medical-shadow hover:glow-shadow transition-medical animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                {value}
              </h3>
              <span className={cn("text-sm font-medium", trendColor)}>
                {trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          </div>
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};