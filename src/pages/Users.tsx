import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserCheck, Search, Plus, Mail, Phone, Shield, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  is_active: boolean;
  created_at: string;
}

const Users = () => {
  const permissions = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'patient' as UserProfile['role'],
  });

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

  // Real-time subscription
  useRealtimeSubscription({
    table: 'profiles',
    onInsert: () => fetchUsers(),
    onUpdate: () => fetchUsers(),
    onDelete: () => fetchUsers(),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with role and phone
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: newUserData.role,
            phone: newUserData.phone,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;

        // Update user_roles
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: authData.user.id,
            role: newUserData.role,
          });

        if (roleError) throw roleError;
      }

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المستخدم بنجاح",
      });

      setIsDialogOpen(false);
      setNewUserData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'patient',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (user: UserProfile) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsSubmitting(true);

    try {
      // Delete from profiles (this will cascade to user_roles)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserProfile['role']) => {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
        });

      if (roleError) throw roleError;

      toast({
        title: "تم التحديث",
        description: "تم تحديث دور المستخدم بنجاح",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث دور المستخدم",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المستخدم",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'receptionist':
        return 'bg-green-100 text-green-800';
      case 'patient':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserProfile['role']) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'doctor':
        return 'طبيب';
      case 'receptionist':
        return 'موظف استقبال';
      case 'patient':
        return 'مريض';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
            <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-muted-foreground mt-1">
              إدارة حسابات وصلاحيات المستخدمين
            </p>
          </div>
          {permissions.canManageUsers && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="medical" className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="new-fullname">الاسم الكامل</Label>
                    <Input
                      id="new-fullname"
                      value={newUserData.fullName}
                      onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-email">البريد الإلكتروني</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">كلمة المرور</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      required
                      minLength={8}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-phone">رقم الهاتف</Label>
                    <Input
                      id="new-phone"
                      type="tel"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-role">الدور</Label>
                    <Select
                      value={newUserData.role}
                      onValueChange={(value) => setNewUserData({ ...newUserData, role: value as UserProfile['role'] })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">مريض</SelectItem>
                        <SelectItem value="receptionist">موظف استقبال</SelectItem>
                        <SelectItem value="doctor">طبيب</SelectItem>
                        <SelectItem value="admin">مدير النظام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="medical" disabled={isSubmitting}>
                      {isSubmitting ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filter */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background min-w-[150px]"
              >
                <option value="all">جميع الأدوار</option>
                <option value="admin">مدير النظام</option>
                <option value="doctor">طبيب</option>
                <option value="receptionist">موظف استقبال</option>
                <option value="patient">مريض</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              قائمة المستخدمين ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد مستخدمين</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user.full_name.split(' ')[0][0]}
                        {user.full_name.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {user.full_name}
                        </h4>
                        <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                          {user.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                        )}
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </span>
                        )}
                        <span className="text-xs">
                          انضم في {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {permissions.canManageUsers && (
                      <>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.user_id, e.target.value as UserProfile['role'])}
                          className="px-2 py-1 text-sm border rounded bg-background"
                        >
                          <option value="admin">مدير النظام</option>
                          <option value="doctor">طبيب</option>
                          <option value="receptionist">موظف استقبال</option>
                          <option value="patient">مريض</option>
                        </select>
                        
                        <Button
                          size="sm"
                          variant={user.is_active ? "outline" : "medical"}
                          onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                        >
                          {user.is_active ? "إلغاء التفعيل" : "تفعيل"}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>الاسم الكامل</Label>
                                <Input
                                  value={selectedUser?.full_name || ''}
                                  onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, full_name: e.target.value } : null)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>البريد الإلكتروني</Label>
                                <Input
                                  value={selectedUser?.email || ''}
                                  onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, email: e.target.value } : null)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>رقم الهاتف</Label>
                                <Input
                                  value={selectedUser?.phone || ''}
                                  onChange={(e) => setSelectedUser(selectedUser ? { ...selectedUser, phone: e.target.value } : null)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="medical"
                                onClick={() => selectedUser && handleEditUser(selectedUser)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog open={isDeleteDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedUser(user)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف المستخدم "{user.full_name}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "جاري الحذف..." : "حذف"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مديرو النظام</p>
                  <p className="text-lg font-semibold">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأطباء</p>
                  <p className="text-lg font-semibold">
                    {users.filter(u => u.role === 'doctor').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">موظفو الاستقبال</p>
                  <p className="text-lg font-semibold">
                    {users.filter(u => u.role === 'receptionist').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-0 medical-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المرضى</p>
                  <p className="text-lg font-semibold">
                    {users.filter(u => u.role === 'patient').length}
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

export default Users;
