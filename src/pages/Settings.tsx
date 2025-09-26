import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Building, Clock, Bell, Shield, Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface CenterSettings {
  id: string;
  center_name: string;
  center_phone?: string;
  center_email?: string;
  center_address?: string;
  center_logo_url?: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  appointment_duration: number;
  max_advance_booking_days: number;
  cancellation_hours: number;
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  whatsapp_notifications_enabled: boolean;
}

const Settings = () => {
  const [settings, setSettings] = useState<CenterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('center_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          center_name: 'مركز د أحمد قايد سالم الطبي',
          center_phone: '+966501234567',
          center_email: '',
          center_address: 'الرياض، المملكة العربية السعودية',
          working_hours_start: '08:00',
          working_hours_end: '17:00',
          working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
          appointment_duration: 30,
          max_advance_booking_days: 30,
          cancellation_hours: 24,
          sms_notifications_enabled: false,
          email_notifications_enabled: true,
          whatsapp_notifications_enabled: false,
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('center_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('center_settings')
        .update({
          center_name: settings.center_name,
          center_phone: settings.center_phone,
          center_email: settings.center_email,
          center_address: settings.center_address,
          working_hours_start: settings.working_hours_start,
          working_hours_end: settings.working_hours_end,
          working_days: settings.working_days,
          appointment_duration: settings.appointment_duration,
          max_advance_booking_days: settings.max_advance_booking_days,
          cancellation_hours: settings.cancellation_hours,
          sms_notifications_enabled: settings.sms_notifications_enabled,
          email_notifications_enabled: settings.email_notifications_enabled,
          whatsapp_notifications_enabled: settings.whatsapp_notifications_enabled,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    if (!settings) return;

    const newWorkingDays = checked
      ? [...settings.working_days, day]
      : settings.working_days.filter(d => d !== day);

    setSettings({ ...settings, working_days: newWorkingDays });
  };

  const workingDaysOptions = [
    { key: 'sunday', label: 'الأحد' },
    { key: 'monday', label: 'الإثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
    { key: 'friday', label: 'الجمعة' },
    { key: 'saturday', label: 'السبت' },
  ];

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

  if (!settings) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">فشل في تحميل الإعدادات</p>
            </CardContent>
          </Card>
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
              <SettingsIcon className="w-8 h-8 text-primary" />
              إعدادات النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              إعدادات المركز الطبي والنظام العامة
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="medical"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Center Information */}
          <Card className="card-gradient border-0 medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                معلومات المركز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="center_name">اسم المركز</Label>
                <Input
                  id="center_name"
                  value={settings.center_name}
                  onChange={(e) => setSettings({ ...settings, center_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="center_phone">رقم الهاتف</Label>
                <Input
                  id="center_phone"
                  value={settings.center_phone || ''}
                  onChange={(e) => setSettings({ ...settings, center_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="center_email">البريد الإلكتروني</Label>
                <Input
                  id="center_email"
                  type="email"
                  value={settings.center_email || ''}
                  onChange={(e) => setSettings({ ...settings, center_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="center_address">العنوان</Label>
                <Input
                  id="center_address"
                  value={settings.center_address || ''}
                  onChange={(e) => setSettings({ ...settings, center_address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="card-gradient border-0 medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                أوقات العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="working_hours_start">بداية العمل</Label>
                  <Input
                    id="working_hours_start"
                    type="time"
                    value={settings.working_hours_start}
                    onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="working_hours_end">نهاية العمل</Label>
                  <Input
                    id="working_hours_end"
                    type="time"
                    value={settings.working_hours_end}
                    onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>أيام العمل</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {workingDaysOptions.map((day) => (
                    <div key={day.key} className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id={day.key}
                        checked={settings.working_days.includes(day.key)}
                        onCheckedChange={(checked) => handleWorkingDayChange(day.key, checked)}
                      />
                      <Label htmlFor={day.key} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Settings */}
          <Card className="card-gradient border-0 medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                إعدادات المواعيد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appointment_duration">مدة الموعد (بالدقائق)</Label>
                <Input
                  id="appointment_duration"
                  type="number"
                  value={settings.appointment_duration}
                  onChange={(e) => setSettings({ ...settings, appointment_duration: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label htmlFor="max_advance_booking_days">الحد الأقصى للحجز المسبق (بالأيام)</Label>
                <Input
                  id="max_advance_booking_days"
                  type="number"
                  value={settings.max_advance_booking_days}
                  onChange={(e) => setSettings({ ...settings, max_advance_booking_days: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div>
                <Label htmlFor="cancellation_hours">الحد الأدنى للإلغاء (بالساعات)</Label>
                <Input
                  id="cancellation_hours"
                  type="number"
                  value={settings.cancellation_hours}
                  onChange={(e) => setSettings({ ...settings, cancellation_hours: parseInt(e.target.value) || 24 })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="card-gradient border-0 medical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                إعدادات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">إرسال إشعارات عبر البريد الإلكتروني</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_notifications">إشعارات الرسائل النصية</Label>
                  <p className="text-sm text-muted-foreground">إرسال إشعارات عبر الرسائل النصية</p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={settings.sms_notifications_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsapp_notifications">إشعارات الواتساب</Label>
                  <p className="text-sm text-muted-foreground">إرسال إشعارات عبر الواتساب</p>
                </div>
                <Switch
                  id="whatsapp_notifications"
                  checked={settings.whatsapp_notifications_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_notifications_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;