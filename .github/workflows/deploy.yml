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
import { Textarea } from '@/components/ui/textarea'; // Added Textarea import

const SystemManagement = () => {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState('specializations');
  const [loading, setLoading] = useState(false);

  // Specializations State
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [newSpecialization, setNewSpecialization] = useState({ name: '', name_en: '', description: '' });
  const [editingSpecialization, setEditingSpecialization] = useState<any>(null);

  // Appointment Types State
  const [editingAppointmentType, setEditingAppointmentType] = useState<any>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
  const [newAppointmentType, setNewAppointmentType] = useState({ name: '', name_en: '', duration_minutes: 30 });

  // Diagnosis Templates State
  const [editingDiagnosisTemplate, setEditingDiagnosisTemplate] = useState<any>(null);
  const [diagnosisTemplates, setDiagnosisTemplates] = useState<any[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState({ name: '', content: '', category: '' });

  // Treatment Templates State
  const [editingTreatmentTemplate, setEditingTreatmentTemplate] = useState<any>(null);
  const [treatmentTemplates, setTreatmentTemplates] = useState<any[]>([]);
  const [newTreatment, setNewTreatment] = useState({ name: '', content: '', category: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchSpecializations(),
      fetchAppointmentTypes(),
      fetchDiagnosisTemplates(),
      fetchTreatmentTemplates(),
    ]);
  };

  const fetchSpecializations = async () => {
    try {
      const { data, error } = await supabase
        .from('specializations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSpecializations(data || []);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchAppointmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setAppointmentTypes(data || []);
    } catch (error) {
      console.error('Error fetching appointment types:', error);
    }
  };

  const fetchDiagnosisTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('diagnosis_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setDiagnosisTemplates(data || []);
    } catch (error) {
      console.error('Error fetching diagnosis templates:', error);
    }
  };

  const fetchTreatmentTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setTreatmentTemplates(data || []);
    } catch (error) {
      console.error('Error fetching treatment templates:', error);
    }
  };

  const addSpecialization = async () => {
    if (!newSpecialization.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم التخصص",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('specializations')
        .insert([newSpecialization]);

      if (error) throw error;

      setNewSpecialization({ name: '', name_en: '', description: '' });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة التخصص بنجاح",
      });
      fetchSpecializations();
    } catch (error) {
      console.error('Error adding specialization:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة التخصص",
        variant: "destructive",
      });
    }
  };

  const updateSpecialization = async () => {
    if (!editingSpecialization || !editingSpecialization.name.trim()) return;

    try {
      // Corrected logic: Update the specialization in the 'specializations' table
      const { error } = await supabase
        .from('specializations')
        .update({ name: editingSpecialization.name, name_en: editingSpecialization.name_en, description: editingSpecialization.description })
        .eq('id', editingSpecialization.id); // Assuming 'id' is the primary key

      if (error) throw error;

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

  const deleteSpecialization = async (id: number) => { // Changed parameter to id
    try {
      // The original code was missing the actual deletion from the 'specializations' table.
      // The check for associated doctors should ideally be done on the server side or handled by database constraints.
      
      const { error } = await supabase
        .from('specializations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف التخصص بنجاح",
      });
      fetchSpecializations(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error deleting specialization:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف التخصص",
        variant: "destructive",
      });
    }
  };


	  const updateDiagnosisTemplate = async () => {
	    if (!editingDiagnosisTemplate || !editingDiagnosisTemplate.name.trim() || !editingDiagnosisTemplate.content.trim()) return;
	
	    try {
	      const { error } = await supabase
	        .from('diagnosis_templates')
	        .update({ name: editingDiagnosisTemplate.name, content: editingDiagnosisTemplate.content, category: editingDiagnosisTemplate.category })
	        .eq('id', editingDiagnosisTemplate.id);
	
	      if (error) throw error;
	
	      setEditingDiagnosisTemplate(null);
	      toast({
	        title: "تم التحديث",
	        description: "تم تحديث قالب التشخيص بنجاح",
	      });
	      fetchDiagnosisTemplates();
	    } catch (error) {
	      console.error('Error updating diagnosis template:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في تحديث قالب التشخيص",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const deleteDiagnosisTemplate = async (id: number) => {
	    try {
	      const { error } = await supabase
	        .from('diagnosis_templates')
	        .delete()
	        .eq('id', id);
	
	      if (error) throw error;
	
	      toast({
	        title: "تم الحذف",
	        description: "تم حذف قالب التشخيص بنجاح",
	      });
	      fetchDiagnosisTemplates();
	    } catch (error) {
	      console.error('Error deleting diagnosis template:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في حذف قالب التشخيص",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const addDiagnosisTemplate = async () => {
    if (!newDiagnosis.name.trim() || !newDiagnosis.content.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('diagnosis_templates')
        .insert([newDiagnosis]);

      if (error) throw error;

      setNewDiagnosis({ name: '', content: '', category: '' });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة قالب التشخيص بنجاح",
      });
      fetchDiagnosisTemplates();
    } catch (error) {
      console.error('Error adding diagnosis template:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة قالب التشخيص",
        variant: "destructive",
      });
    }
  };

	  const updateTreatmentTemplate = async () => {
	    if (!editingTreatmentTemplate || !editingTreatmentTemplate.name.trim() || !editingTreatmentTemplate.content.trim()) return;
	
	    try {
	      const { error } = await supabase
	        .from('treatment_templates')
	        .update({ name: editingTreatmentTemplate.name, content: editingTreatmentTemplate.content, category: editingTreatmentTemplate.category })
	        .eq('id', editingTreatmentTemplate.id);
	
	      if (error) throw error;
	
	      setEditingTreatmentTemplate(null);
	      toast({
	        title: "تم التحديث",
	        description: "تم تحديث قالب العلاج بنجاح",
	      });
	      fetchTreatmentTemplates();
	    } catch (error) {
	      console.error('Error updating treatment template:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في تحديث قالب العلاج",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const deleteTreatmentTemplate = async (id: number) => {
	    try {
	      const { error } = await supabase
	        .from('treatment_templates')
	        .delete()
	        .eq('id', id);
	
	      if (error) throw error;
	
	      toast({
	        title: "تم الحذف",
	        description: "تم حذف قالب العلاج بنجاح",
	      });
	      fetchTreatmentTemplates();
	    } catch (error) {
	      console.error('Error deleting treatment template:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في حذف قالب العلاج",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const addTreatmentTemplate = async () => {
    if (!newTreatment.name.trim() || !newTreatment.content.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('treatment_templates')
        .insert([newTreatment]);

      if (error) throw error;

      setNewTreatment({ name: '', content: '', category: '' });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة قالب العلاج بنجاح",
      });
      fetchTreatmentTemplates();
    } catch (error) {
      console.error('Error adding treatment template:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة قالب العلاج",
        variant: "destructive",
      });
    }
  };

	  const updateAppointmentType = async () => {
	    if (!editingAppointmentType || !editingAppointmentType.name.trim()) return;
	
	    try {
	      const { error } = await supabase
	        .from('appointment_types')
	        .update({ name: editingAppointmentType.name, name_en: editingAppointmentType.name_en, duration_minutes: editingAppointmentType.duration_minutes })
	        .eq('id', editingAppointmentType.id);
	
	      if (error) throw error;
	
	      setEditingAppointmentType(null);
	      toast({
	        title: "تم التحديث",
	        description: "تم تحديث نوع الموعد بنجاح",
	      });
	      fetchAppointmentTypes();
	    } catch (error) {
	      console.error('Error updating appointment type:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في تحديث نوع الموعد",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const deleteAppointmentType = async (id: number) => {
	    try {
	      const { error } = await supabase
	        .from('appointment_types')
	        .delete()
	        .eq('id', id);
	
	      if (error) throw error;
	
	      toast({
	        title: "تم الحذف",
	        description: "تم حذف نوع الموعد بنجاح",
	      });
	      fetchAppointmentTypes();
	    } catch (error) {
	      console.error('Error deleting appointment type:', error);
	      toast({
	        title: "خطأ",
	        description: "فشل في حذف نوع الموعد",
	        variant: "destructive",
	      });
	    }
	  };
	
	  const addAppointmentType = async () => {
    if (!newAppointmentType.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم نوع الموعد",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appointment_types')
        .insert([newAppointmentType]);

      if (error) throw error;

      setNewAppointmentType({ name: '', name_en: '', duration_minutes: 30 });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة نوع الموعد بنجاح",
      });
      fetchAppointmentTypes();
    } catch (error) {
      console.error('Error adding appointment type:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة نوع الموعد",
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="w-7 h-7 text-primary" />
              إدارة النظام
            </h1>
            <p className="text-muted-foreground">إدارة التخصصات، أنواع المواعيد، وقوالب التشخيص والعلاج.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="specializations" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              التخصصات
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
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
                  إدارة التخصصات
                </CardTitle>
                <CardDescription>
                  إضافة وتعديل وحذف التخصصات الطبية المتاحة في النظام.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="medical" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة تخصص جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تخصص جديد</DialogTitle>
                      <DialogDescription>
                        أضف تخصصاً جديداً سيظهر للأطباء والمرضى.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">اسم التخصص (عربي)</Label>
                        <Input
                          id="name"
                          placeholder="مثال: طب الأسرة"
                          value={newSpecialization.name}
                          onChange={(e) => setNewSpecialization({ ...newSpecialization, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name_en">اسم التخصص (إنجليزي)</Label>
                        <Input
                          id="name_en"
                          placeholder="Example: Family Medicine"
                          value={newSpecialization.name_en}
                          onChange={(e) => setNewSpecialization({ ...newSpecialization, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea // Corrected: Changed Input to Textarea
                          id="description"
                          placeholder="وصف مختصر للتخصص..."
                          value={newSpecialization.description}
                          onChange={(e) => setNewSpecialization({ ...newSpecialization, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="medical" onClick={addSpecialization}>
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {specializations.map((spec) => (
                    <Card key={spec.id} className="p-4 bg-accent/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{spec.name}</h4>
                          <p className="text-sm text-muted-foreground">{spec.name_en}</p>
                          <p className="text-xs text-gray-500 mt-1">{spec.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => setEditingSpecialization(spec)}>
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تعديل التخصص</DialogTitle>
                                <DialogDescription>
                                  عدّل بيانات التخصص الحالي.
                                </DialogDescription>
                              </DialogHeader>
                              {editingSpecialization && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit_name">اسم التخصص (عربي)</Label>
                                    <Input
                                      id="edit_name"
                                      value={editingSpecialization.name}
                                      onChange={(e) => setEditingSpecialization({ ...editingSpecialization, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit_name_en">اسم التخصص (إنجليزي)</Label>
                                    <Input
                                      id="edit_name_en"
                                      value={editingSpecialization.name_en}
                                      onChange={(e) => setEditingSpecialization({ ...editingSpecialization, name_en: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit_description">الوصف</Label>
                                    <Textarea // Corrected: Changed Input to Textarea
                                      id="edit_description"
                                      value={editingSpecialization.description}
                                      onChange={(e) => setEditingSpecialization({ ...editingSpecialization, description: e.target.value })}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="medical" onClick={updateSpecialization}>
                                  حفظ التعديلات
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
                                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف التخصص **{spec.name}** بشكل دائم.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSpecialization(spec.id)} className="bg-destructive hover:bg-red-600">
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
                    <p>لا توجد تخصصات. ابدأ بإضافة تخصص جديد.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointment Types Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <Card className="card-gradient border-0 medical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  أنواع المواعيد
                </CardTitle>
                <CardDescription>
                  إدارة أنواع المواعيد المتاحة ومدة كل منها.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="medical" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة نوع موعد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>نوع موعد جديد</DialogTitle>
                      <DialogDescription>
                        أضف نوع موعد جديد (مثل: استشارة، متابعة).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="appointment_name">اسم النوع (عربي)</Label>
                        <Input
                          id="appointment_name"
                          placeholder="مثال: استشارة أولى"
                          value={newAppointmentType.name}
                          onChange={(e) => setNewAppointmentType({ ...newAppointmentType, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointment_name_en">اسم النوع (إنجليزي)</Label>
                        <Input
                          id="appointment_name_en"
                          placeholder="Example: First Consultation"
                          value={newAppointmentType.name_en}
                          onChange={(e) => setNewAppointmentType({ ...newAppointmentType, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">المدة بالدقائق</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="مثال: 30"
                          value={newAppointmentType.duration_minutes}
                          onChange={(e) => setNewAppointmentType({ ...newAppointmentType, duration_minutes: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="medical" onClick={addAppointmentType}>
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

	                <div className="space-y-3">
	                  {appointmentTypes.map((type) => (
	                    <Card key={type.id} className="p-4 bg-accent/30">
	                      <div className="flex items-center justify-between">
	                        <div className="flex items-center gap-2">
	                          <Calendar className="w-4 h-4 text-primary" />
	                          <span className="font-medium">{type.name}</span>
	                          <Badge variant="secondary">{type.duration_minutes} دقيقة</Badge>
	                        </div>
	                        <div className="flex gap-2">
	                          {/* Edit Dialog */}
	                          <Dialog>
	                            <DialogTrigger asChild>
	                              <Button size="icon" variant="ghost" onClick={() => setEditingAppointmentType(type)}>
	                                <Edit className="w-4 h-4 text-blue-500" />
	                              </Button>
	                            </DialogTrigger>
	                            <DialogContent>
	                              <DialogHeader>
	                                <DialogTitle>تعديل نوع الموعد</DialogTitle>
	                                <DialogDescription>
	                                  عدّل بيانات نوع الموعد الحالي.
	                                </DialogDescription>
	                              </DialogHeader>
	                              {editingAppointmentType && (
	                                <div className="space-y-4">
	                                  <div>
	                                    <Label htmlFor="edit_appointment_name">اسم النوع (عربي)</Label>
	                                    <Input
	                                      id="edit_appointment_name"
	                                      value={editingAppointmentType.name}
	                                      onChange={(e) => setEditingAppointmentType({ ...editingAppointmentType, name: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label htmlFor="edit_appointment_name_en">اسم النوع (إنجليزي)</Label>
	                                    <Input
	                                      id="edit_appointment_name_en"
	                                      value={editingAppointmentType.name_en}
	                                      onChange={(e) => setEditingAppointmentType({ ...editingAppointmentType, name_en: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label htmlFor="edit_duration">المدة بالدقائق</Label>
	                                    <Input
	                                      id="edit_duration"
	                                      type="number"
	                                      value={editingAppointmentType.duration_minutes}
	                                      onChange={(e) => setEditingAppointmentType({ ...editingAppointmentType, duration_minutes: parseInt(e.target.value) || 0 })}
	                                    />
	                                  </div>
	                                </div>
	                              )}
	                              <DialogFooter>
	                                <Button variant="medical" onClick={updateAppointmentType}>
	                                  حفظ التعديلات
	                                </Button>
	                              </DialogFooter>
	                            </DialogContent>
	                          </Dialog>
	
	                          {/* Delete Alert */}
	                          <AlertDialog>
	                            <AlertDialogTrigger asChild>
	                              <Button size="icon" variant="ghost">
	                                <Trash2 className="w-4 h-4 text-destructive" />
	                              </Button>
	                            </AlertDialogTrigger>
	                            <AlertDialogContent>
	                              <AlertDialogHeader>
	                                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
	                                <AlertDialogDescription>
	                                  سيتم حذف نوع الموعد **{type.name}** بشكل دائم.
	                                </AlertDialogDescription>
	                              </AlertDialogHeader>
	                              <AlertDialogFooter>
	                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
	                                <AlertDialogAction onClick={() => deleteAppointmentType(type.id)} className="bg-destructive hover:bg-red-600">
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

                {appointmentTypes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد أنواع مواعيد. ابدأ بإضافة نوع جديد.</p>
                  </div>
                )}
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
                        <Textarea // Corrected: Changed Input to Textarea
                          placeholder="وصف التشخيص..."
                          value={newDiagnosis.content}
                          onChange={(e) => setNewDiagnosis({ ...newDiagnosis, content: e.target.value })}
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
	                          <p className="text-sm text-muted-foreground">{template.content}</p>
	                        </div>
	                        <div className="flex gap-2">
	                          {/* Edit Dialog */}
	                          <Dialog>
	                            <DialogTrigger asChild>
	                              <Button size="icon" variant="ghost" onClick={() => setEditingDiagnosisTemplate(template)}>
	                                <Edit className="w-4 h-4 text-blue-500" />
	                              </Button>
	                            </DialogTrigger>
	                            <DialogContent>
	                              <DialogHeader>
	                                <DialogTitle>تعديل قالب التشخيص</DialogTitle>
	                                <DialogDescription>
	                                  عدّل بيانات قالب التشخيص الحالي.
	                                </DialogDescription>
	                              </DialogHeader>
	                              {editingDiagnosisTemplate && (
	                                <div className="space-y-4">
	                                  <div>
	                                    <Label>اسم القالب</Label>
	                                    <Input
	                                      value={editingDiagnosisTemplate.name}
	                                      onChange={(e) => setEditingDiagnosisTemplate({ ...editingDiagnosisTemplate, name: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label>محتوى التشخيص</Label>
	                                    <Textarea
	                                      value={editingDiagnosisTemplate.content}
	                                      onChange={(e) => setEditingDiagnosisTemplate({ ...editingDiagnosisTemplate, content: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label>الفئة</Label>
	                                    <Input
	                                      value={editingDiagnosisTemplate.category}
	                                      onChange={(e) => setEditingDiagnosisTemplate({ ...editingDiagnosisTemplate, category: e.target.value })}
	                                    />
	                                  </div>
	                                </div>
	                              )}
	                              <DialogFooter>
	                                <Button variant="medical" onClick={updateDiagnosisTemplate}>
	                                  حفظ التعديلات
	                                </Button>
	                              </DialogFooter>
	                            </DialogContent>
	                          </Dialog>
	
	                          {/* Delete Alert */}
	                          <AlertDialog>
	                            <AlertDialogTrigger asChild>
	                              <Button size="icon" variant="ghost">
	                                <Trash2 className="w-4 h-4 text-destructive" />
	                              </Button>
	                            </AlertDialogTrigger>
	                            <AlertDialogContent>
	                              <AlertDialogHeader>
	                                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
	                                <AlertDialogDescription>
	                                  سيتم حذف قالب التشخيص **{template.name}** بشكل دائم.
	                                </AlertDialogDescription>
	                              </AlertDialogHeader>
	                              <AlertDialogFooter>
	                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
	                                <AlertDialogAction onClick={() => deleteDiagnosisTemplate(template.id)} className="bg-destructive hover:bg-red-600">
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
                          onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>محتوى خطة العلاج</Label>
                        <Textarea // Corrected: Changed Input to Textarea
                          placeholder="وصف خطة العلاج..."
                          value={newTreatment.content}
                          onChange={(e) => setNewTreatment({ ...newTreatment, content: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>الفئة</Label>
                        <Input
                          placeholder="مثال: أمراض القلب، السكري..."
                          value={newTreatment.category}
                          onChange={(e) => setNewTreatment({ ...newTreatment, category: e.target.value })}
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
	                          <p className="text-sm text-muted-foreground">{template.content}</p>
	                        </div>
	                        <div className="flex gap-2">
	                          {/* Edit Dialog */}
	                          <Dialog>
	                            <DialogTrigger asChild>
	                              <Button size="icon" variant="ghost" onClick={() => setEditingTreatmentTemplate(template)}>
	                                <Edit className="w-4 h-4 text-blue-500" />
	                              </Button>
	                            </DialogTrigger>
	                            <DialogContent>
	                              <DialogHeader>
	                                <DialogTitle>تعديل قالب العلاج</DialogTitle>
	                                <DialogDescription>
	                                  عدّل بيانات قالب العلاج الحالي.
	                                </DialogDescription>
	                              </DialogHeader>
	                              {editingTreatmentTemplate && (
	                                <div className="space-y-4">
	                                  <div>
	                                    <Label>اسم القالب</Label>
	                                    <Input
	                                      value={editingTreatmentTemplate.name}
	                                      onChange={(e) => setEditingTreatmentTemplate({ ...editingTreatmentTemplate, name: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label>محتوى خطة العلاج</Label>
	                                    <Textarea
	                                      value={editingTreatmentTemplate.content}
	                                      onChange={(e) => setEditingTreatmentTemplate({ ...editingTreatmentTemplate, content: e.target.value })}
	                                    />
	                                  </div>
	                                  <div>
	                                    <Label>الفئة</Label>
	                                    <Input
	                                      value={editingTreatmentTemplate.category}
	                                      onChange={(e) => setEditingTreatmentTemplate({ ...editingTreatmentTemplate, category: e.target.value })}
	                                    />
	                                  </div>
	                                </div>
	                              )}
	                              <DialogFooter>
	                                <Button variant="medical" onClick={updateTreatmentTemplate}>
	                                  حفظ التعديلات
	                                </Button>
	                              </DialogFooter>
	                            </DialogContent>
	                          </Dialog>
	
	                          {/* Delete Alert */}
	                          <AlertDialog>
	                            <AlertDialogTrigger asChild>
	                              <Button size="icon" variant="ghost">
	                                <Trash2 className="w-4 h-4 text-destructive" />
	                              </Button>
	                            </AlertDialogTrigger>
	                            <AlertDialogContent>
	                              <AlertDialogHeader>
	                                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
	                                <AlertDialogDescription>
	                                  سيتم حذف قالب العلاج **{template.name}** بشكل دائم.
	                                </AlertDialogDescription>
	                              </AlertDialogHeader>
	                              <AlertDialogFooter>
	                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
	                                <AlertDialogAction onClick={() => deleteTreatmentTemplate(template.id)} className="bg-destructive hover:bg-red-600">
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
