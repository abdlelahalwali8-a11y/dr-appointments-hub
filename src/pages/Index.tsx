import React, { useEffect, useState } from 'react';
import Dashboard from "@/components/medical/Dashboard";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seedSampleData } from "@/utils/seedData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Loader2 } from "lucide-react";

const Index = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('center_settings')
        .select('id')
        .limit(1);
      
      if (!error) {
        setDbStatus('connected');
      } else {
        setDbStatus('error');
      }
    } catch (error) {
      setDbStatus('error');
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    const success = await seedSampleData();
    if (success) {
      toast({
        title: "تم بنجاح",
        description: "تم زرع البيانات التجريبية بنجاح - يمكنك الآن استخدام النظام",
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في زرع البيانات التجريبية",
        variant: "destructive",
      });
    }
    setSeeding(false);
  };

  if (dbStatus === 'checking') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">جاري التحقق من الاتصال بقاعدة البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Database Status */}
        <Card className="mb-6 border-0 medical-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {dbStatus === 'connected' ? 'متصل بقاعدة البيانات' : 'خطأ في الاتصال بقاعدة البيانات'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSeedData} 
                  variant="outline" 
                  size="sm"
                  disabled={seeding || dbStatus !== 'connected'}
                >
                  {seeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري الزرع...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 ml-2" />
                      زرع بيانات تجريبية
                    </>
                  )}
                </Button>
                <Button onClick={checkDatabaseConnection} variant="ghost" size="sm">
                  إعادة فحص الاتصال
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;