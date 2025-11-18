import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus, Edit, Trash2, Eye, Download, Share2, Lock, AlertCircle, FileText,
  Pill, Microscope, Heart, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useForm, FormErrors } from '@/hooks/useForm';
import { TextInput, TextAreaField, SelectField } from '@/components/common/FormField';

interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: 'diagnosis' | 'prescription' | 'lab_test' | 'vital_signs' | 'procedure' | 'note';
  title: string;
  description: string;
  data: Record<string, any>;
  created_at: string;
  created_by: string;
  patients: {
    full_name: string;
    age?: number;
  };
}

interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  conditional?: {
    field: string;
    value: string;
  };
}

const ElectronicMedicalRecords = () => {
  const permissions = usePermissions();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (full_name, age)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({ title: "خطأ", description: "فشل في تحميل السجلات الطبية", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'medical_records',
    onInsert: () => fetchRecords(),
    onUpdate: () => fetchRecords(),
    onDelete: () => fetchRecords(),
  });

  // Add Medical Record
  const initialAddValues = {
    patient_id: '',
    record_type: 'diagnosis',
    title: '',
    description: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medication_name: '',
    dosage: '',
    duration: '',
    lab_test_name: '',
    lab_result: '',
    systolic: '',
    diastolic: '',
    heart_rate: '',
    temperature: '',
    procedure_name: '',
    procedure_details: '',
  };

  const validateAdd = (values: typeof initialAddValues): FormErrors => {
    const errors: FormErrors = {};
    if (!values.patient_id) errors.patient_id = 'يجب اختيار مريض.';
    if (!values.title) errors.title = 'العنوان مطلوب.';
    return errors;
  };

  const handleAddRecord = async (values: typeof initialAddValues) => {
    try {
      const recordData: any = {
        patient_id: values.patient_id,
        record_type: values.record_type,
        title: values.title,
        description: values.description,
      };

      // Add type-specific data
      if (values.record_type === 'diagnosis') {
        recordData.data = {
          diagnosis: values.diagnosis,
          symptoms: values.symptoms,
          treatment: values.treatment,
        };
      } else if (values.record_type === 'prescription') {
        recordData.data = {
          medication_name: values.medication_name,
          dosage: values.dosage,
          duration: values.duration,
        };
      } else if (values.record_type === 'lab_test') {
        recordData.data = {
          lab_test_name: values.lab_test_name,
          lab_result: values.lab_result,
        };
      } else if (values.record_type === 'vital_signs') {
        recordData.data = {
          systolic: values.systolic,
          diastolic: values.diastolic,
          heart_rate: values.heart_rate,
          temperature: values.temperature,
        };
      } else if (values.record_type === 'procedure') {
        recordData.data = {
          procedure_name: values.procedure_name,
          procedure_details: values.procedure_details,
        };
      }

      const { error } = await supabase
        .from('medical_records')
        .insert([recordData]);

      if (error) throw error;

      toast({ title: "تم الإضافة", description: "تم إضافة السجل الطبي بنجاح" });
      setIsAddOpen(false);
      addForm.resetForm();
      fetchRecords();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في إضافة السجل", variant: "destructive" });
    }
  };

  const addForm = useForm({
    initialValues: initialAddValues,
    onSubmit: handleAddRecord,
    validate: validateAdd,
  });

  // Delete Record
  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف السجل الطبي بنجاح" });
      setIsDeleteOpen(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل في حذف السجل", variant: "destructive" });
    }
  };

  // Search
  const { searchTerm: filteredSearchTerm, setSearchTerm: setFilteredSearchTerm, filteredData: searchedRecords } = useSearch(records, {
    fields: ['patients.full_name', 'title', 'record_type'],
    minChars: 0,
  });

  const recordTypeLabels: Record<string, string> = {
    diagnosis: 'تشخيص',
    prescription: 'وصفة طبية',
    lab_test: 'فحص مخبري',
    vital_signs: 'العلامات الحيوية',
    procedure: 'إجراء طبي',
    note: 'ملاحظة',
  };

  const recordTypeIcons: Record<string, React.ReactNode> = {
    diagnosis: <Heart className="w-4 h-4" />,
    prescription: <Pill className="w-4 h-4" />,
    lab_test: <Microscope className="w-4 h-4" />,
    vital_signs: <Activity className="w-4 h-4" />,
    procedure: <FileText className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />,
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

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">السجل الطبي الإلكتروني</h1>
            <p className="text-muted-foreground mt-1">
              إدارة السجلات الطبية الشاملة للمرضى ({records.length})
            </p>
          </div>
          {permissions.canAddRecords && (
            <Button variant="medical" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة سجل جديد
            </Button>
          )}
        </div>

        {/* Search */}
        <SearchBar
          value={filteredSearchTerm}
          onChange={setFilteredSearchTerm}
          placeholder="البحث بالمريض، العنوان، أو النوع..."
        />

        {/* Records List */}
        <div className="space-y-4">
          {searchedRecords.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>لا توجد سجلات طبية</AlertDescription>
            </Alert>
          ) : (
            searchedRecords.map(record => (
              <Card key={record.id} className="medical-shadow hover:shadow-lg transition">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {recordTypeIcons[record.record_type]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{record.title}</h3>
                          <p className="text-sm text-muted-foreground">{record.patients.full_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">
                          {recordTypeLabels[record.record_type]}
                        </Badge>
                        <Badge variant="secondary">
                          {new Date(record.created_at).toLocaleDateString('ar-SA')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {permissions.canEditRecords && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRecord(record);
                              // setIsEditOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Record Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecord?.title}</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">المريض</p>
                    <p className="font-semibold">{selectedRecord.patients.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">النوع</p>
                    <p className="font-semibold">{recordTypeLabels[selectedRecord.record_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ</p>
                    <p className="font-semibold">
                      {new Date(selectedRecord.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="text-sm">{selectedRecord.description}</p>
                </div>
                {Object.keys(selectedRecord.data).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">البيانات التفصيلية</p>
                    <div className="bg-accent/30 p-3 rounded-lg space-y-2">
                      {Object.entries(selectedRecord.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-semibold">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Record Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة سجل طبي جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={addForm.handleSubmit} className="space-y-4">
              <SelectField
                label="المريض"
                required
                name="patient_id"
                value={addForm.values.patient_id}
                onChange={addForm.handleChange}
                onBlur={addForm.handleBlur}
                error={addForm.errors.patient_id}
                options={[
                  { value: '', label: 'اختر مريضاً' },
                  // Would be populated from patients data
                ]}
              />
              <SelectField
                label="نوع السجل"
                required
                name="record_type"
                value={addForm.values.record_type}
                onChange={addForm.handleChange}
                onBlur={addForm.handleBlur}
                options={Object.entries(recordTypeLabels).map(([value, label]) => ({ value, label }))}
              />
              <TextInput
                label="العنوان"
                required
                name="title"
                value={addForm.values.title}
                onChange={addForm.handleChange}
                onBlur={addForm.handleBlur}
                error={addForm.errors.title}
              />
              <TextAreaField
                label="الوصف"
                name="description"
                value={addForm.values.description}
                onChange={addForm.handleChange}
                onBlur={addForm.handleBlur}
              />
              <DialogFooter>
                <Button type="submit" variant="medical" disabled={addForm.isSubmitting}>
                  {addForm.isSubmitting ? "جاري الإضافة..." : "إضافة السجل"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="حذف السجل الطبي"
          description={`هل أنت متأكد من حذف السجل "${selectedRecord?.title}"؟`}
          onConfirm={handleDeleteRecord}
          confirmText="حذف نهائي"
          isDangerous
        />
      </div>
    </Layout>
  );
};

export default ElectronicMedicalRecords;
