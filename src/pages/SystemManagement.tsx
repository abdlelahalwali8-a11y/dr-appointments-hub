import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Database, FileText, Users, Stethoscope, Calendar, Activity, Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import DataTable from '@/components/common/DataTable';

const SystemManagement = () => {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState('specializations');
  const [loading, setLoading] = useState(false);

  // Specializations State
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [editingSpecialization, setEditingSpecialization] = useState<{ old: string; new: string } | null>(null);

  // Appointment Types State
  const [appointmentTypes, setAppointmentTypes] = useState<string[]>(['كشف جديد', 'متابعة', 'استشارة', 'فحص دوري']);
  const [newAppointmentType, setNewAppointmentType] = useState('');

  // Diagnosis Templates State
  const [diagnosisTemplates, setDiagnosisTemplates] = useState<Array<{ id: string; name: string; template: string }>>([]);
  const [newDiagnosis, setNewDiagnosis] = useState({ name: '', template: '' });

  // Treatment Templates State
  const [treatmentTemplates, setTreatmentTemplates] = useState<Array<{ id: string; name: string; template: string }>>([]);
  const [newTreatment, setNewTreatment] = useState({ name: '', template: '' });

  useEffect(() => {
    fetchSpecializations();
    fetchTemplates();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('specialization');
      
      if (error) throw error;
      
      const unique = [...new Set(data.map(d => d.specialization).filter(Boolean))];
      setSpecializations(unique);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchTemplates = () => {
    // Mock data - في المستقبل يمكن تخزينها في قاعدة البيانات
    setDiagnosisTemplates([
      { id: '1', name: 'التهاب الحلق', template: 'التهاب في الحلق مع احتقان واحمرار' },
      { id: '2', name: 'نزلة برد', template: 'أعراض نزلة برد مع رشح وسعال' },
    ]);
    
    setTreatmentTemplates([
      { id: '1', name: 'علاج التهاب', template: 'مضاد حيوي + مسكن + راحة' },
      { id: '2', name: 'علاج نزلة برد', template: 'مضاد للاحتقان + خافض حرارة + سوائل' },
    ]);
  };

  const addSpecialization = async () => {
    if (!newSpecialization.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم التخصص",
        variant: "destructive",
      });
      return;
    }

    if (specializations.includes(newSpecialization)) {
      toast({
        title: "خطأ",
        description: "التخصص موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    setSpecializations([...specializations, newSpecialization]);
    setNewSpecialization('');
    
    toast({
      title: "تم الإضافة",
      description: "تم إضافة التخصص بنجاح",
    });
  };

  const updateSpecialization = async () => {
    if (!editingSpecialization) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .update({ specialization: editingSpecialization.new })
        .eq('specialization', editingSpecialization.old);

      if (error) throw error;

      setSpecializations(specializations.map(s => 
        s === editingSpecialization.old ? editingSpecialization.new : s
      ));
      setEditingSpecialization(null);
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث التخصص بنجاح",
      });

      fetchSpecializations();
    } catch (error) {
      console.error('Error updating specialization:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث التخصص",
        variant: "destructive",
      });
    }
  };

  const deleteSpecialization = async (specialization: string) => {
    try {
      const { data: doctorsWithSpec } = await supabase
        .from('doctors')
        .select('id')
        .eq('specialization', specialization);

      if (doctorsWithSpec && doctorsWithSpec.length > 0) {
        toast({
          title: "تحذير",
          description: `لا يمكن حذف التخصص. يوجد ${doctorsWithSpec.length} طبيب مرتبط به`,
          variant: "destructive",
        });
        return;
      }

      setSpecializations(specializations.filter(s => s !== specialization));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف التخصص بنجاح",
      });
    } catch (error) {
      console.error('Error deleting specialization:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف التخصص",
        variant: "destructive",
      });
    }
  };

  const addAppointmentType = () => {
    if (!newAppointmentType.trim()) return;
    if (appointmentTypes.includes(newAppointmentType)) {
      toast({
        title: "خطأ",
        description: "نوع الموعد موجود بالفعل",
        variant: "destructive",
      });
      return;
    }
    setAppointmentTypes([...appointmentTypes, newAppointmentType]);
    setNewAppointmentType('');
    toast({
      title: "تم الإضافة",
      description: "تم إضافة نوع الموعد بنجاح",
    });
  };

  const addDiagnosisTemplate = () => {
    if (!newDiagnosis.name.trim() || !newDiagnosis.template.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: newDiagnosis.name,
      template: newDiagnosis.template,
    };

    setDiagnosisTemplates([...diagnosisTemplates, newTemplate]);
    setNewDiagnosis({ name: '', template: '' });
    
    toast({
      title: "تم الإضافة",
      description: "تم إضافة قالب التشخيص بنجاح",
    });
  };

  const addTreatmentTemplate = () => {
    if (!newTreatment.name.trim() || !newTreatment.template.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: newTreatment.name,
      template: newTreatment.template,
    };

    setTreatmentTemplates([...treatmentTemplates, newTemplate]);
    setNewTreatment({ name: '', template: '' });
    
    toast({
      title: "تم الإضافة",
      description: "تم إضافة قالب العلاج بنجاح",
    });
  };

  if (!permissions.canManageSettings) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">غير مصرح</h3>
              <p className="text-muted-foreground">ليس لديك صلاحية الوصول لإدارة النظام</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              إدارة النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة البيانات الأساسية والقوالب والإعدادات العامة
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="specializations" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              التخصصات
            </TabsTrigger>
            <TabsTrigger value="appointment-types" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              أنواع المواعيد
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              قوالب التشخيص
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              قوالب العلاج
            </TabsTrigger>
          </TabsList>

          {/* Specializations Tab */}
          <TabsContent value="specializations" className="space-y-4">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  إدارة التخصصات الطبية
                </CardTitle>
                <CardDescription>
                  إضافة وتعديل التخصصات الطبية المتاحة في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Specialization */}
                <div className="flex gap-2">
                  <Input
                    placeholder="أدخل تخصص جديد..."
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  />
                  <Button onClick={addSpecialization} variant="medical">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة
                  </Button>
                </div>

                {/* Specializations List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {specializations.map((spec) => (
                    <Card key={spec} className="p-4 bg-accent/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-primary" />
                          <span className="font-medium">{spec}</span>
                        </div>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingSpecialization({ old: spec, new: spec })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تعديل التخصص</DialogTitle>
                                <DialogDescription>
                                  تحديث اسم التخصص الطبي
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>اسم التخصص الجديد</Label>
                                  <Input
                                    value={editingSpecialization?.new || ''}
                                    onChange={(e) => setEditingSpecialization(prev => 
                                      prev ? { ...prev, new: e.target.value } : null
                                    )}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingSpecialization(null)}>
                                  إلغاء
                                </Button>
                                <Button variant="medical" onClick={updateSpecialization}>
                                  حفظ
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف التخصص "{spec}"؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSpecialization(spec)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {specializations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد تخصصات. ابدأ بإضافة التخصصات الطبية.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointment Types Tab */}
          <TabsContent value="appointment-types" className="space-y-4">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  إدارة أنواع المواعيد
                </CardTitle>
                <CardDescription>
                  تخصيص أنواع المواعيد المتاحة للحجز
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أدخل نوع موعد جديد..."
                    value={newAppointmentType}
                    onChange={(e) => setNewAppointmentType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAppointmentType()}
                  />
                  <Button onClick={addAppointmentType} variant="medical">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appointmentTypes.map((type) => (
                    <Card key={type} className="p-4 bg-accent/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">{type}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setAppointmentTypes(appointmentTypes.filter(t => t !== type))}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis Templates Tab */}
          <TabsContent value="diagnosis" className="space-y-4">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  قوالب التشخيص
                </CardTitle>
                <CardDescription>
                  إنشاء قوالب جاهزة للتشخيص الطبي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="medical" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة قالب تشخيص
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>قالب تشخيص جديد</DialogTitle>
                      <DialogDescription>
                        أضف قالب تشخيص للاستخدام السريع
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>اسم القالب</Label>
                        <Input
                          placeholder="مثال: التهاب الحلق"
                          value={newDiagnosis.name}
                          onChange={(e) => setNewDiagnosis({ ...newDiagnosis, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>محتوى التشخيص</Label>
                        <Input
                          placeholder="وصف التشخيص..."
                          value={newDiagnosis.template}
                          onChange={(e) => setNewDiagnosis({ ...newDiagnosis, template: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="medical" onClick={addDiagnosisTemplate}>
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {diagnosisTemplates.map((template) => (
                    <Card key={template.id} className="p-4 bg-accent/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.template}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDiagnosisTemplates(diagnosisTemplates.filter(t => t.id !== template.id))}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {diagnosisTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد قوالب تشخيص. ابدأ بإضافة قوالب جاهزة.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Templates Tab */}
          <TabsContent value="treatment" className="space-y-4">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  قوالب العلاج
                </CardTitle>
                <CardDescription>
                  إنشاء قوالب جاهزة لخطط العلاج
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="medical" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة قالب علاج
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>قالب علاج جديد</DialogTitle>
                      <DialogDescription>
                        أضف قالب علاج للاستخدام السريع
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>اسم القالب</Label>
                        <Input
                          placeholder="مثال: علاج التهاب"
                          value={newTreatment.name}
                         onChange={(e) => setNewTreatment({ ...newTreatment, content: e.target.value })}                        />
                      </div>
                      <div>
                        <Label>محتوى العلاج</Label>
                        <Input
                          placeholder="وصف خطة العلاج..."
                          value={newTreatment.template}
                          onChange={(e) => setNewTreatment({ ...newTreatment, template: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="medical" onClick={addTreatmentTemplate}>
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {treatmentTemplates.map((template) => (
                    <Card key={template.id} className="p-4 bg-accent/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.template}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setTreatmentTemplates(treatmentTemplates.filter(t => t.id !== template.id))}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {treatmentTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد قوالب علاج. ابدأ بإضافة قوالب جاهزة.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SystemManagement;