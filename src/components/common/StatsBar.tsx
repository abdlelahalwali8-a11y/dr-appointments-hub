import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface StatsBarProps {
  stats: StatItem[];
  className?: string;
}

const StatsBar = ({ stats, className = '' }: StatsBarProps) => {
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'danger':
        return 'text-red-600 bg-red-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsBar;
