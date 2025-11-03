import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface RolePermission {
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  permissions: string[];
}

const PermissionsAdvanced = () => {
  const { isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matrix');
  
  // New permission dialog state
  const [newPermission, setNewPermission] = useState({
    name: '',
    name_ar: '',
    description: '',
    category: 'general',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  // Real-time updates
  useRealtimeSubscription({
    table: 'permissions',
    onInsert: () => fetchPermissions(),
    onUpdate: () => fetchPermissions(),
    onDelete: () => fetchPermissions(),
  });

  useRealtimeSubscription({
    table: 'role_permissions',
    onInsert: () => fetchRolePermissions(),
    onUpdate: () => fetchRolePermissions(),
    onDelete: () => fetchRolePermissions(),
  });

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الصلاحيات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const roles: Array<'admin' | 'doctor' | 'receptionist' | 'patient'> = ['admin', 'doctor', 'receptionist', 'patient'];
      const rolePermsData: RolePermission[] = [];

      for (const role of roles) {
        const { data, error } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions (name)
          `)
          .eq('role', role);

        if (error) throw error;

        rolePermsData.push({
          role: role as any,
          permissions: data?.map((rp: any) => rp.permissions?.name).filter(Boolean) || [],
        });
      }

      setRolePermissions(rolePermsData);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const toggleRolePermission = async (role: string, permissionName: string) => {
    try {
      const permission = permissions.find(p => p.name === permissionName);
      if (!permission) return;

      const rolePerms = rolePermissions.find(rp => rp.role === role);
      const hasPermission = rolePerms?.permissions.includes(permissionName);

      if (hasPermission) {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role as any)
          .eq('permission_id', permission.id);

        if (error) throw error;

        toast({
          title: "تم الإزالة",
          description: `تم إزالة صلاحية ${permission.name_ar} من ${getRoleLabel(role)}`,
        });
      } else {
        // Add permission
        const { error } = await supabase
          .from('role_permissions')
          .insert([{ role: role as any, permission_id: permission.id }]);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: `تم إضافة صلاحية ${permission.name_ar} لـ ${getRoleLabel(role)}`,
        });
      }

      fetchRolePermissions();
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الصلاحية",
        variant: "destructive",
      });
    }
  };

  const addPermission = async () => {
    try {
      if (!newPermission.name || !newPermission.name_ar) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('permissions')
        .insert([newPermission]);

      if (error) throw error;

      toast({
        title: "تم الإضافة",
        description: "تم إضافة الصلاحية الجديدة بنجاح",
      });

      setNewPermission({
        name: '',
        name_ar: '',
        description: '',
        category: 'general',
      });
      setIsAddDialogOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error('Error adding permission:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصلاحية",
        variant: "destructive",
      });
    }
  };

  const togglePermissionStatus = async (permissionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .update({ is_active: !currentStatus })
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الصلاحية`,
      });

      fetchPermissions();
    } catch (error) {
      console.error('Error toggling permission status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الصلاحية",
        variant: "destructive",
      });
    }
  };

  const deletePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الصلاحية بنجاح",
      });

      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الصلاحية",
        variant: "destructive",
      });
    }
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
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'doctor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'receptionist': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'patient': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      dashboard: 'لوحة التحكم',
      appointments: 'المواعيد',
      patients: 'المرضى',
      doctors: 'الأطباء',
      medical_records: 'السجلات الطبية',
      reports: 'التقارير',
      users: 'المستخدمين',
      permissions: 'الصلاحيات',
      settings: 'الإعدادات',
      notifications: 'الإشعارات',
      waiting_list: 'قائمة الانتظار',
      general: 'عام',
    };
    return labels[category] || category;
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const hasRolePermission = (role: string, permissionName: string) => {
    const rolePerms = rolePermissions.find(rp => rp.role === role);
    return rolePerms?.permissions.includes(permissionName) || false;
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">غير مصرح</h3>
              <p className="text-muted-foreground">ليس لديك صلاحية الوصول لإدارة الصلاحيات</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

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
              إدارة الصلاحيات المتقدمة
            </h1>
            <p className="text-muted-foreground mt-1">
              التحكم الكامل في صلاحيات الوصول والأدوار
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="medical">
                <Plus className="w-4 h-4 ml-2" />
                إضافة صلاحية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة صلاحية جديدة</DialogTitle>
                <DialogDescription>
                  أضف صلاحية جديدة للنظام
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الصلاحية بالإنجليزية *</Label>
                  <Input
                    placeholder="view_dashboard"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>اسم الصلاحية بالعربية *</Label>
                  <Input
                    placeholder="عرض لوحة التحكم"
                    value={newPermission.name_ar}
                    onChange={(e) => setNewPermission({ ...newPermission, name_ar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Input
                    placeholder="وصف الصلاحية"
                    value={newPermission.description}
                    onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الفئة</Label>
                  <Select
                    value={newPermission.category}
                    onValueChange={(value) => setNewPermission({ ...newPermission, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">لوحة التحكم</SelectItem>
                      <SelectItem value="appointments">المواعيد</SelectItem>
                      <SelectItem value="patients">المرضى</SelectItem>
                      <SelectItem value="doctors">الأطباء</SelectItem>
                      <SelectItem value="medical_records">السجلات الطبية</SelectItem>
                      <SelectItem value="reports">التقارير</SelectItem>
                      <SelectItem value="users">المستخدمين</SelectItem>
                      <SelectItem value="permissions">الصلاحيات</SelectItem>
                      <SelectItem value="settings">الإعدادات</SelectItem>
                      <SelectItem value="notifications">الإشعارات</SelectItem>
                      <SelectItem value="general">عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button variant="medical" onClick={addPermission}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="matrix">مصفوفة الصلاحيات</TabsTrigger>
            <TabsTrigger value="manage">إدارة الصلاحيات</TabsTrigger>
          </TabsList>

          {/* Permissions Matrix */}
          <TabsContent value="matrix" className="space-y-6">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle>مصفوفة الصلاحيات حسب الأدوار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        {getCategoryLabel(category)}
                      </h3>
                      <div className="space-y-2">
                        {categoryPermissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">{permission.name_ar}</h4>
                                {!permission.is_active && (
                                  <Badge variant="destructive" className="text-xs">معطل</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{permission.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {['admin', 'doctor', 'receptionist', 'patient'].map(role => (
                                <div key={role} className="flex flex-col items-center gap-1">
                                  <Badge className={`text-xs ${getRoleBadgeColor(role)}`}>
                                    {getRoleLabel(role)}
                                  </Badge>
                                  <Switch
                                    checked={hasRolePermission(role, permission.name)}
                                    onCheckedChange={() => toggleRolePermission(role, permission.name)}
                                    disabled={!permission.is_active || role === 'admin'}
                                  />
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
          </TabsContent>

          {/* Manage Permissions */}
          <TabsContent value="manage" className="space-y-6">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle>إدارة الصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{permission.name_ar}</h4>
                          <Badge variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                          <Badge className="text-xs">
                            {getCategoryLabel(permission.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={permission.is_active}
                          onCheckedChange={() => togglePermissionStatus(permission.id, permission.is_active)}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deletePermission(permission.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{permissions.length}</div>
            </CardContent>
          </Card>
          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الصلاحيات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {permissions.filter(p => p.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card className="medical-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الفئات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Object.keys(groupPermissionsByCategory()).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PermissionsAdvanced;
