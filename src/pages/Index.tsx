import React, { useEffect, useState } from 'react';
import Dashboard from "@/components/medical/Dashboard";
import Layout from "@/components/layout/Layout";
import SmartSearch from "@/components/common/SmartSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";

const Index = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

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
      <div className="p-4 md:p-6 space-y-6">
        {/* Quick Search Section */}
        <Card className="border-0 medical-shadow bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              البحث السريع والحجز
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ابحث عن مريض موجود أو أضف مريض جديد واحجز موعد مباشرة
            </p>
          </CardHeader>
          <CardContent>
            <SmartSearch />
          </CardContent>
        </Card>
        
        {/* Dashboard */}
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;