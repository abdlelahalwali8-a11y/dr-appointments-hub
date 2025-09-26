import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, Users, Settings, Eye, Edit, Trash2, Plus, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  permissions: string[];
}

const Permissions = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // تعريف الصلاحيات المتاحة
  const availablePermissions: Permission[] = [
    { id: 'view_dashboard', name: 'عرض لوحة القيادة', description: 'الوصول للصفحة الرئيسية والإحصائيات', category: 'dashboard' },
    { id: 'view_appointments', name: 'عرض المواعيد', description: 'مشاهدة جميع المواعيد', category: 'appointments' },
    { id: 'create_appointments', name: 'إنشاء المواعيد', description: 'إضافة مواعيد جديدة', category: 'appointments' },
    { id: 'edit_appointments', name: 'تعديل المواعيد', description: 'تحديث حالة وتفاصيل المواعيد', category: 'appointments' },
    { id: 'delete_appointments', name: 'حذف المواعيد', description: 'إلغاء وحذف المواعيد', category: 'appointments' },
    { id: 'view_patients', name: 'عرض المرضى', description: 'الوصول لبيانات المرضى', category: 'patients' },
    { id: 'create_patients', name: 'إضافة المرضى', description: 'تسجيل مرضى جدد', category: 'patients' },
    { id: 'edit_patients', name: 'تعديل المرضى', description: 'تحديث بيانات المرضى', category: 'patients' },
    { id: 'delete_patients', name: 'حذف المرضى', description: 'إزالة ملفات المرضى', category: 'patients' },
    { id: 'view_doctors', name: 'عرض الأطباء', description: 'مشاهدة قائمة الأطباء', category: 'doctors' },
    { id: 'manage_doctors', name: 'إدارة الأطباء', description: 'إضافة وتعديل الأطباء', category: 'doctors' },
    { id: 'view_medical_records', name: 'عرض السجلات الطبية', description: 'الوصول للسجلات الطبية', category: 'records' },
    { id: 'create_medical_records', name: 'إنشاء السجلات الطبية', description: 'إضافة سجلات طبية جديدة', category: 'records' },
    { id: 'edit_medical_records', name: 'تعديل السجلات الطبية', description: 'تحديث السجلات الطبية', category: 'records' },
    { id: 'view_reports', name: 'عرض التقارير', description: 'الوصول للتقارير والإحصائيات', category: 'reports' },
    { id: 'export_reports', name: 'تصدير التقارير', description: 'تنزيل التقارير كملفات', category: 'reports' },
    { id: 'manage_users', name: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين', category: 'users' },
    { id: 'manage_permissions', name: 'إدارة الصلاحيات', description: 'تحديد صلاحيات المستخدمين', category: 'users' },
    { id: 'manage_settings', name: 'إدارة الإعدادات', description: 'تحديث إعدادات النظام', category: 'settings' },
    { id: 'view_notifications', name: 'عرض الإشعارات', description: 'الوصول للإشعارات', category: 'notifications' },
    { id: 'send_notifications', name: 'إرسال الإشعارات', description: 'إرسال إشعارات للمستخدمين', category: 'notifications' },
  ];

  // صلاحيات الأدوار الافتراضية
  const defaultRolePermissions: RolePermission[] = [
    {
      role: 'admin',
      permissions: availablePermissions.map(p => p.id) // جميع الصلاحيات
    },
    {
      role: 'doctor',
      permissions: [
        'view_dashboard',
        'view_appointments',
        'edit_appointments',
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_medical_records',
        'create_medical_records',
        'edit_medical_records',
        'view_reports',
        'view_notifications'
      ]
    },
    {
      role: 'receptionist',
      permissions: [
        'view_dashboard',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_doctors',
        'view_notifications'
      ]
    },
    {
      role: 'patient',
      permissions: [
        'view_dashboard',
        'view_appointments',
        'view_notifications'
      ]
    }
  ];

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRolePermissions = (role: string): string[] => {
    const rolePerms = defaultRolePermissions.find(rp => rp.role === role);
    return rolePerms ? rolePerms.permissions : [];
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'doctor': return 'طبيب';
      case 'receptionist': return 'موظف استقبال';
      case 'patient': return 'مريض';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'receptionist': return 'bg-green-100 text-green-800';
      case 'patient': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    availablePermissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dashboard': return 'لوحة القيادة';
      case 'appointments': return 'المواعيد';
      case 'patients': return 'المرضى';
      case 'doctors': return 'الأطباء';
      case 'records': return 'السجلات الطبية';
      case 'reports': return 'التقارير';
      case 'users': return 'المستخدمين';
      case 'settings': return 'الإعدادات';
      case 'notifications': return 'الإشعارات';
      default: return category;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              إدارة الصلاحيات
            </h1>
            <p className="text-muted-foreground mt-1">
              تحديد صلاحيات الوصول لكل دور في النظام
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles and Permissions Matrix */}
          <Card className="card-gradient border-0 medical-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                مصفوفة الصلاحيات حسب الأدوار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      {getCategoryLabel(category)}
                    </h3>
                    <div className="grid gap-3">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{permission.name}</h4>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            {defaultRolePermissions.map(rolePerms => (
                              <div key={rolePerms.role} className="flex items-center gap-2">
                                <Badge className={`text-xs ${getRoleBadgeColor(rolePerms.role)}`}>
                                  {getRoleLabel(rolePerms.role)}
                                </Badge>
                                <div className={`w-4 h-4 rounded-full ${
                                  rolePerms.permissions.includes(permission.id) 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'
                                }`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users and Their Roles */}
          <Card className="card-gradient border-0 medical-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                المستخدمين وأدوارهم ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد مستخدمين</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {user.full_name.split(' ')[0][0]}
                          {user.full_name.split(' ')[1]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-foreground">{user.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        {getRolePermissions(user.role).length} صلاحية
                      </div>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permission Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الصلاحيات</p>
                  <p className="text-2xl font-bold text-foreground">{availablePermissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأدوار المتاحة</p>
                  <p className="text-2xl font-bold text-foreground">{defaultRolePermissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
                  <p className="text-2xl font-bold text-foreground">
                    {users.filter(u => u.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Permissions;