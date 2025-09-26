import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  UserPlus,
  Settings,
  Activity,
  FileText,
  Bell,
  Home,
  Stethoscope,
  UserCheck,
  ClipboardList,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Sidebar = () => {
  const { profile, signOut, isAdmin, isDoctor, isReceptionist } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'الرئيسية',
      icon: Home,
      path: '/',
      roles: ['admin', 'doctor', 'receptionist', 'patient']
    },
    {
      title: 'المواعيد',
      icon: Calendar,
      path: '/appointments',
      roles: ['admin', 'doctor', 'receptionist']
    },
    {
      title: 'المرضى',
      icon: Users,
      path: '/patients',
      roles: ['admin', 'doctor', 'receptionist']
    },
    {
      title: 'الأطباء',
      icon: Stethoscope,
      path: '/doctors',
      roles: ['admin']
    },
    {
      title: 'قائمة الانتظار',
      icon: ClipboardList,
      path: '/waiting-list',
      roles: ['admin', 'doctor', 'receptionist']
    },
    {
      title: 'السجلات الطبية',
      icon: FileText,
      path: '/medical-records',
      roles: ['admin', 'doctor']
    },
    {
      title: 'التقارير',
      icon: BarChart3,
      path: '/reports',
      roles: ['admin', 'doctor']
    },
    {
      title: 'الإشعارات',
      icon: Bell,
      path: '/notifications',
      roles: ['admin', 'doctor', 'receptionist', 'patient']
    },
    {
      title: 'إدارة المستخدمين',
      icon: UserCheck,
      path: '/users',
      roles: ['admin']
    },
    {
      title: 'الصلاحيات',
      icon: Shield,
      path: '/permissions',
      roles: ['admin']
    },
    {
      title: 'الإعدادات',
      icon: Settings,
      path: '/settings',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(profile?.role || 'patient')
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-card border-l border-border h-screen flex flex-col medical-shadow">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">المركز الطبي</h2>
            <p className="text-xs text-muted-foreground">د أحمد قايد سالم</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {profile?.full_name?.split(' ')[0]?.[0] || 'U'}
              {profile?.full_name?.split(' ')[1]?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.role === 'admin' && 'مدير النظام'}
              {profile?.role === 'doctor' && 'طبيب'}
              {profile?.role === 'receptionist' && 'موظف استقبال'}
              {profile?.role === 'patient' && 'مريض'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;