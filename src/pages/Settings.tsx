import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Building, Clock, Bell, Shield, Save, Upload, DollarSign, Zap, Database, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import { TextInput, TextAreaField, SelectField } from '@/components/common/FormField';
import { useForm, FormErrors } from '@/hooks/useForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
  auto_create_medical_records: boolean;
  require_appointment_confirmation: boolean;
  allow_online_booking: boolean;
  show_doctor_availability: boolean;
  enable_sms_reminders: boolean;
  reminder_hours_before: number;
  max_appointments_per_day: number;
  emergency_contact_phone?: string;
  support_email?: string;
}

const Settings = () => {
  const permissions = usePermissions();
  const [settings, setSettings] = useState<CenterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

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
        const defaultSettings: Partial<CenterSettings> = {
          center_name: 'مركز د أحمد قايد سالم الطبي',
          center_phone: '+967771234567',
          center_email: '',
          center_address: 'صنعاء، اليمن',
          working_hours_start: '08:00',
          working_hours_end: '17:00',
          working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
          appointment_duration: 30,
          max_advance_booking_days: 30,
          cancellation_hours: 24,
          sms_notifications_enabled: false,
          email_notifications_enabled: true,
          whatsapp_notifications_enabled: false,
          currency_code: 'YER',
          currency_symbol: 'ر.ي',
          currency_name: 'ريال يمني',
          auto_create_medical_records: true,
          require_appointment_confirmation: false,
          allow_online_booking: true,
          show_doctor_availability: true,
          enable_sms_reminders: false,
          reminder_hours_before: 24,
          max_appointments_per_day: 50,
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
      toast({ title: "خطأ", description: "فشل في تحميل الإعدادات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // --- Form Setup ---
  const initialValues = {
    center_name: settings?.center_name || '',
    center_phone: settings?.center_phone || '',
    center_email: settings?.center_email || '',
    center_address: settings?.center_address || '',
    working_hours_start: settings?.working_hours_start || '08:00',
    working_hours_end: settings?.working_hours_end || '17:00',
    appointment_duration: settings?.appointment_duration || 30,
    max_advance_booking_days: settings?.max_advance_booking_days || 30,
    cancellation_hours: settings?.cancellation_hours || 24,
    currency_code: settings?.currency_code || 'YER',
    currency_symbol: settings?.currency_symbol || 'ر.ي',
    currency_name: settings?.currency_name || 'ريال يمني',
    reminder_hours_before: settings?.reminder_hours_before || 24,
    max_appointments_per_day: settings?.max_appointments_per_day || 50,
    emergency_contact_phone: settings?.emergency_contact_phone || '',
    support_email: settings?.support_email || '',
  };

  const validateSettings = (values: typeof initialValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.center_name) errors.center_name = 'اسم المركز مطلوب.';
    if (!values.center_phone) errors.center_phone = 'رقم الهاتف مطلوب.';
    if (values.appointment_duration < 5) errors.appointment_duration = 'مدة الموعد يجب أن تكون 5 دقائق على الأقل.';
    if (values.max_appointments_per_day < 1) errors.max_appointments_per_day = 'يجب أن يكون هناك موعد واحد على الأقل.';
    return errors;
  };

  const handleSaveSettings = async (values: typeof initialValues) => {
    try {
      if (!settings?.id) throw new Error('معرف الإعدادات غير موجود.');

      const { error } = await supabase
        .from('center_settings')
        .update({
          center_name: values.center_name,
          center_phone: values.center_phone,
          center_email: values.center_email,
          center_address: values.center_address,
          working_hours_start: values.working_hours_start,
          working_hours_end: values.working_hours_end,
          appointment_duration: values.appointment_duration,
          max_advance_booking_days: values.max_advance_booking_days,
          cancellation_hours: values.cancellation_hours,
          currency_code: values.currency_code,
          currency_symbol: values.currency_symbol,
          currency_name: values.currency_name,
          reminder_hours_before: values.reminder_hours_before,
          max_appointments_per_day: values.max_appointments_per_day,
          emergency_contact_phone: values.emergency_contact_phone,
          support_email: values.support_email,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({ title: "تم الحفظ", description: "تم حفظ الإعدادات بنجاح" });
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({ title: "خطأ", description: error.message || "فشل في حفظ الإعدادات", variant: "destructive" });
    }
  };

  const form = useForm({
    initialValues,
    onSubmit: handleSaveSettings,
    validate: validateSettings,
  });

  // --- Toggle Notifications ---
  const handleToggleNotification = async (key: keyof CenterSettings, value: boolean) => {
    try {
      if (!settings?.id) throw new Error('معرف الإعدادات غير موجود.');

      const { error } = await supabase
        .from('center_settings')
        .update({ [key]: value })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      toast({ title: "تم التحديث", description: "تم تحديث الإعدادات بنجاح" });
    } catch (error: any) {
      console.error('Error updating notification setting:', error);
      toast({ title: "خطأ", description: "فشل في تحديث الإعدادات", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!permissions.canManageSettings) {
    return (
      <Layout>
        <div className="p-4 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ليس لديك صلاحية للوصول إلى الإعدادات. يرجى التواصل مع المسؤول.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            الإعدادات المتقدمة
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة إعدادات المركز الطبي والنظام
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">عام</span>
            </TabsTrigger>
            <TabsTrigger value="working" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">الدوام</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">المواعيد</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">الإخطارات</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">النظام</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>بيانات المركز الأساسية</CardTitle>
                <CardDescription>
                  معلومات المركز الطبي والتواصل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="اسم المركز"
                      required
                      name="center_name"
                      value={form.values.center_name}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      error={form.errors.center_name}
                    />
                    <TextInput
                      label="رقم الهاتف"
                      required
                      name="center_phone"
                      value={form.values.center_phone}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      error={form.errors.center_phone}
                    />
                    <TextInput
                      label="البريد الإلكتروني"
                      type="email"
                      name="center_email"
                      value={form.values.center_email}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="هاتف الطوارئ"
                      name="emergency_contact_phone"
                      value={form.values.emergency_contact_phone}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                  </div>
                  <TextAreaField
                    label="العنوان"
                    name="center_address"
                    value={form.values.center_address}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                  />
                  <TextInput
                    label="بريد الدعم الفني"
                    type="email"
                    name="support_email"
                    value={form.values.support_email}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                  />
                  <Button type="submit" variant="medical" disabled={form.isSubmitting} className="w-full md:w-auto">
                    <Save className="w-4 h-4 ml-2" />
                    {form.isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Hours */}
          <TabsContent value="working" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>ساعات العمل</CardTitle>
                <CardDescription>
                  تحديد ساعات عمل المركز الطبي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="بداية الدوام"
                      type="time"
                      name="working_hours_start"
                      value={form.values.working_hours_start}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="نهاية الدوام"
                      type="time"
                      name="working_hours_end"
                      value={form.values.working_hours_end}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                  </div>
                  <Button type="submit" variant="medical" disabled={form.isSubmitting} className="w-full md:w-auto">
                    <Save className="w-4 h-4 ml-2" />
                    {form.isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Settings */}
          <TabsContent value="appointments" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>إعدادات المواعيد</CardTitle>
                <CardDescription>
                  تحديد سياسات وقواعد المواعيد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="مدة الموعد (دقيقة)"
                      type="number"
                      name="appointment_duration"
                      value={form.values.appointment_duration.toString()}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      error={form.errors.appointment_duration}
                    />
                    <TextInput
                      label="الحد الأقصى لأيام الحجز المسبق"
                      type="number"
                      name="max_advance_booking_days"
                      value={form.values.max_advance_booking_days.toString()}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="ساعات الإلغاء المسموحة"
                      type="number"
                      name="cancellation_hours"
                      value={form.values.cancellation_hours.toString()}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="الحد الأقصى للمواعيد اليومية"
                      type="number"
                      name="max_appointments_per_day"
                      value={form.values.max_appointments_per_day.toString()}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      error={form.errors.max_appointments_per_day}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-foreground">الخيارات</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">السماح بالحجز الإلكتروني</label>
                      <Switch
                        checked={settings?.allow_online_booking || false}
                        onCheckedChange={(value) => handleToggleNotification('allow_online_booking', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">عرض توفر الأطباء</label>
                      <Switch
                        checked={settings?.show_doctor_availability || false}
                        onCheckedChange={(value) => handleToggleNotification('show_doctor_availability', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">طلب تأكيد الموعد</label>
                      <Switch
                        checked={settings?.require_appointment_confirmation || false}
                        onCheckedChange={(value) => handleToggleNotification('require_appointment_confirmation', value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="medical" disabled={form.isSubmitting} className="w-full md:w-auto">
                    <Save className="w-4 h-4 ml-2" />
                    {form.isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>الإخطارات والتنبيهات</CardTitle>
                <CardDescription>
                  تفعيل/تعطيل قنوات الإخطارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div>
                      <h4 className="font-semibold text-foreground">إخطارات البريد الإلكتروني</h4>
                      <p className="text-sm text-muted-foreground">إرسال إخطارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch
                      checked={settings?.email_notifications_enabled || false}
                      onCheckedChange={(value) => handleToggleNotification('email_notifications_enabled', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div>
                      <h4 className="font-semibold text-foreground">إخطارات الرسائل النصية</h4>
                      <p className="text-sm text-muted-foreground">إرسال إخطارات عبر الرسائل النصية</p>
                    </div>
                    <Switch
                      checked={settings?.sms_notifications_enabled || false}
                      onCheckedChange={(value) => handleToggleNotification('sms_notifications_enabled', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div>
                      <h4 className="font-semibold text-foreground">إخطارات WhatsApp</h4>
                      <p className="text-sm text-muted-foreground">إرسال إخطارات عبر WhatsApp</p>
                    </div>
                    <Switch
                      checked={settings?.whatsapp_notifications_enabled || false}
                      onCheckedChange={(value) => handleToggleNotification('whatsapp_notifications_enabled', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div>
                      <h4 className="font-semibold text-foreground">تذكيرات الرسائل النصية</h4>
                      <p className="text-sm text-muted-foreground">إرسال تذكيرات قبل الموعد</p>
                    </div>
                    <Switch
                      checked={settings?.enable_sms_reminders || false}
                      onCheckedChange={(value) => handleToggleNotification('enable_sms_reminders', value)}
                    />
                  </div>
                </div>

                {(settings?.enable_sms_reminders || settings?.sms_notifications_enabled) && (
                  <form onSubmit={form.handleSubmit} className="space-y-4 border-t pt-4">
                    <TextInput
                      label="ساعات التذكير قبل الموعد"
                      type="number"
                      name="reminder_hours_before"
                      value={form.values.reminder_hours_before.toString()}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <Button type="submit" variant="medical" disabled={form.isSubmitting} className="w-full md:w-auto">
                      <Save className="w-4 h-4 ml-2" />
                      {form.isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-4">
            <Card className="medical-shadow">
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
                <CardDescription>
                  إعدادات النظام والعملة والسجلات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      label="رمز العملة"
                      name="currency_code"
                      value={form.values.currency_code}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="رمز العملة (الرمز)"
                      name="currency_symbol"
                      value={form.values.currency_symbol}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                    <TextInput
                      label="اسم العملة"
                      name="currency_name"
                      value={form.values.currency_name}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-foreground">الخيارات</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">إنشاء السجلات الطبية تلقائياً</label>
                      <Switch
                        checked={settings?.auto_create_medical_records || false}
                        onCheckedChange={(value) => handleToggleNotification('auto_create_medical_records', value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="medical" disabled={form.isSubmitting} className="w-full md:w-auto">
                    <Save className="w-4 h-4 ml-2" />
                    {form.isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
