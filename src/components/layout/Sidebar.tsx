import React, { useState, useEffect } from 'react';
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
  LogOut,
  Plus,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Sidebar = () => {
  const { profile, signOut, isAdmin, isDoctor, isReceptionist } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      title: 'الرئيسية',
      icon: Home,
      path: '/',
      roles: ['admin', 'doctor', 'receptionist', 'patient']
    },
    {
      title: 'الحجز السريع',
      icon: Plus,
      path: '/quick-booking',
      roles: ['admin', 'receptionist']
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
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 right-4 z-50 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-card border-l border-border h-screen flex flex-col medical-shadow transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobile && isCollapsed ? 'fixed right-0 top-0 z-40 overflow-hidden' : ''}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">المركز الطبي</h2>
                <p className="text-xs text-muted-foreground">د أحمد قايد سالم</p>
              </div>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 h-auto"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>

        {/* User Profile */}
        {!isCollapsed && (
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
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.title : ''}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth justify-center md:justify-start ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full transition-smooth ${
              isCollapsed ? 'justify-center p-2' : 'justify-start gap-3'
            } text-muted-foreground hover:text-foreground`}
            title={isCollapsed ? 'تسجيل الخروج' : ''}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
