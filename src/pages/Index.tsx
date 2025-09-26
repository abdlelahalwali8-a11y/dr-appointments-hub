import React from 'react';
import Dashboard from "@/components/medical/Dashboard";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { seedSampleData } from "@/utils/seedData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const handleSeedData = async () => {
    const success = await seedSampleData();
    if (success) {
      toast({
        title: "تم بنجاح",
        description: "تم زرع البيانات التجريبية بنجاح",
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في زرع البيانات التجريبية",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-4 flex gap-2">
          <Button onClick={handleSeedData} variant="outline">
            زرع بيانات تجريبية
          </Button>
        </div>
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
