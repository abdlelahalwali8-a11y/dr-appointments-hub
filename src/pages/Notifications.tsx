import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, AlertCircle, Info, CheckCircle, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإشعارات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'notifications',
    onInsert: () => fetchNotifications(),
    onUpdate: () => fetchNotifications(),
    onDelete: () => fetchNotifications(),
    filter: `user_id=eq.${user?.id}`,
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: false })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الإشعار بنجاح",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإشعار",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديد جميع الإشعارات كمقروءة",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإشعارات",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'موعد';
      case 'alert':
        return 'تنبيه';
      case 'reminder':
        return 'تذكير';
      case 'system':
        return 'نظام';
      default:
        return 'عام';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
              <Bell className="w-8 h-8 text-primary" />
              الإشعارات
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {unreadCount} جديد
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              جميع التنبيهات والإشعارات الخاصة بك
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'medical' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                الكل ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'medical' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                غير مقروء ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'medical' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                مقروء ({notifications.length - unreadCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              قائمة الإشعارات ({filteredNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 
                   filter === 'read' ? 'لا توجد إشعارات مقروءة' : 
                   'لا توجد إشعارات'}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'ستظهر الإشعارات هنا عند وصولها' : ''}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-smooth hover:bg-accent/50 ${
                    notification.is_read 
                      ? 'bg-accent/20 border-border' 
                      : 'bg-accent/40 border-primary/30 border-l-4 border-l-primary'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString('ar-SA')}
                        </div>
                      </div>
                      <p className={`text-sm mb-3 ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.is_read ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsUnread(notification.id)}
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            تحديد كغير مقروء
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تحديد كمقروء
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;