import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Plus, Calendar, User, Stethoscope, FileImage, Pill } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';

interface MedicalRecord {
  id: string;
  visit_date: string;
  chief_complaint?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescribed_medications?: string;
  follow_up_instructions?: string;
  vital_signs?: any;
  patients: {
    full_name: string;
    phone: string;
  };
  doctors: {
    profiles: {
      full_name: string;
    };
  };
}

const MedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (
            full_name,
            phone
          ),
          doctors (
            profiles (
              full_name
            )
          )
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل السجلات الطبية",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  // Real-time subscription
  useRealtimeSubscription({
    table: 'medical_records',
    onInsert: () => fetchRecords(),
    onUpdate: () => fetchRecords(),
    onDelete: () => fetchRecords(),
  });

  const filteredRecords = records.filter(record =>
    record.patients.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patients.phone.includes(searchTerm) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-foreground">السجلات الطبية</h1>
            <p className="text-muted-foreground mt-1">
              إدارة ومراجعة السجلات الطبية للمرضى
            </p>
          </div>
          <Button variant="medical">
            <Plus className="w-4 h-4 ml-2" />
            سجل طبي جديد
          </Button>
        </div>

        {/* Search */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو رقم الهاتف أو التشخيص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              السجلات الطبية ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات طبية</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {record.patients.full_name.split(' ')[0][0]}
                        {record.patients.full_name.split(' ')[1]?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-foreground">
                          {record.patients.full_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {new Date(record.visit_date).toLocaleDateString('ar-SA')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>د. {record.doctors.profiles.full_name}</span>
                        </div>
                        {record.chief_complaint && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            <span>{record.chief_complaint}</span>
                          </div>
                        )}
                        {record.diagnosis && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{record.diagnosis}</span>
                          </div>
                        )}
                        {record.prescribed_medications && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Pill className="w-4 h-4" />
                            <span>{record.prescribed_medications.substring(0, 50)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Record Details Dialog */}
        {selectedRecord && (
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  السجل الطبي - {selectedRecord.patients.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    معلومات المريض
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">الاسم: </span>
                      {selectedRecord.patients.full_name}
                    </div>
                    <div>
                      <span className="font-medium">الهاتف: </span>
                      {selectedRecord.patients.phone}
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الزيارة: </span>
                      {new Date(selectedRecord.visit_date).toLocaleDateString('ar-SA')}
                    </div>
                    <div>
                      <span className="font-medium">الطبيب المعالج: </span>
                      د. {selectedRecord.doctors.profiles.full_name}
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                {selectedRecord.vital_signs && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      العلامات الحيوية
                    </h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <pre className="text-sm">{JSON.stringify(selectedRecord.vital_signs, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Chief Complaint */}
                {selectedRecord.chief_complaint && (
                  <div>
                    <h3 className="font-semibold mb-3">الشكوى الرئيسية</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.chief_complaint}</p>
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedRecord.diagnosis && (
                  <div>
                    <h3 className="font-semibold mb-3">التشخيص</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.diagnosis}</p>
                    </div>
                  </div>
                )}

                {/* Treatment Plan */}
                {selectedRecord.treatment_plan && (
                  <div>
                    <h3 className="font-semibold mb-3">خطة العلاج</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.treatment_plan}</p>
                    </div>
                  </div>
                )}

                {/* Prescribed Medications */}
                {selectedRecord.prescribed_medications && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      الأدوية الموصوفة
                    </h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.prescribed_medications}</p>
                    </div>
                  </div>
                )}

                {/* Follow-up Instructions */}
                {selectedRecord.follow_up_instructions && (
                  <div>
                    <h3 className="font-semibold mb-3">تعليمات المتابعة</h3>
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <p className="text-sm">{selectedRecord.follow_up_instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default MedicalRecords;