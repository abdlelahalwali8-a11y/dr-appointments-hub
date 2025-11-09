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
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 md:mb-2 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                {value}
              </h3>
              <span className={cn("text-xs sm:text-sm font-medium", trendColor)}>
                {trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {description}
            </p>
          </div>
          <div className={cn("p-2 md:p-3 rounded-xl flex-shrink-0", colorClasses[color])}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};