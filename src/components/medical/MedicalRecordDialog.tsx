import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, Activity, Pill, FlaskConical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MedicalRecord {
  id: string;
  visit_date: string;
  chief_complaint?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescribed_medications?: string;
  lab_results?: string;
  vital_signs?: any;
  follow_up_instructions?: string;
  doctor: {
    profiles: {
      full_name: string;
    };
    specialization: string;
  };
}

interface MedicalRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

const MedicalRecordDialog: React.FC<MedicalRecordDialogProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchMedicalRecords();
    }
  }, [isOpen, patientId]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctor:doctor_id (
            specialization,
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل السجل الطبي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            السجل الطبي - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">لا يوجد سجل طبي لهذا المريض</p>
              <p className="text-sm text-muted-foreground mt-2">
                سيتم إضافة السجلات الطبية تلقائياً عند إنشاء المواعيد والكشوفات
              </p>
            </div>
          ) : (
            records.map((record) => (
              <Card key={record.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.visit_date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>د. {record.doctor?.profiles?.full_name}</span>
                        <Badge variant="outline" className="mr-2">
                          {record.doctor?.specialization}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {record.chief_complaint && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        الشكوى الرئيسية
                      </h4>
                      <p className="text-foreground">{record.chief_complaint}</p>
                    </div>
                  )}

                  {record.vital_signs && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        العلامات الحيوية
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {record.vital_signs.blood_pressure && (
                          <div className="bg-accent/30 p-2 rounded-lg">
                            <p className="text-xs text-muted-foreground">ضغط الدم</p>
                            <p className="font-semibold">{record.vital_signs.blood_pressure}</p>
                          </div>
                        )}
                        {record.vital_signs.temperature && (
                          <div className="bg-accent/30 p-2 rounded-lg">
                            <p className="text-xs text-muted-foreground">الحرارة</p>
                            <p className="font-semibold">{record.vital_signs.temperature}°C</p>
                          </div>
                        )}
                        {record.vital_signs.pulse && (
                          <div className="bg-accent/30 p-2 rounded-lg">
                            <p className="text-xs text-muted-foreground">النبض</p>
                            <p className="font-semibold">{record.vital_signs.pulse} نبضة/دقيقة</p>
                          </div>
                        )}
                        {record.vital_signs.weight && (
                          <div className="bg-accent/30 p-2 rounded-lg">
                            <p className="text-xs text-muted-foreground">الوزن</p>
                            <p className="font-semibold">{record.vital_signs.weight} كجم</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {record.diagnosis && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        التشخيص
                      </h4>
                      <p className="text-foreground">{record.diagnosis}</p>
                    </div>
                  )}

                  {record.treatment_plan && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        خطة العلاج
                      </h4>
                      <p className="text-foreground">{record.treatment_plan}</p>
                    </div>
                  )}

                  {record.prescribed_medications && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Pill className="w-4 h-4" />
                        الأدوية الموصوفة
                      </h4>
                      <p className="text-foreground whitespace-pre-wrap">{record.prescribed_medications}</p>
                    </div>
                  )}

                  {record.lab_results && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <FlaskConical className="w-4 h-4" />
                        نتائج المختبر
                      </h4>
                      <p className="text-foreground whitespace-pre-wrap">{record.lab_results}</p>
                    </div>
                  )}

                  {record.follow_up_instructions && (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm text-primary mb-1">
                        تعليمات المتابعة
                      </h4>
                      <p className="text-foreground">{record.follow_up_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordDialog;