import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Home,
  Share2,
  MoreVertical,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Help = () => {
  const [activeStep, setActiveStep] = useState<string>('');

  const installSteps = {
    android: [
      {
        id: 'android-1',
        title: 'افتح التطبيق في متصفح Chrome',
        description: 'تأكد من أنك تستخدم متصفح Google Chrome على هاتفك الأندرويد',
        icon: Smartphone
      },
      {
        id: 'android-2',
        title: 'ابحث عن رسالة التثبيت',
        description: 'ستظهر رسالة في أسفل الشاشة تطلب منك تثبيت التطبيق',
        icon: Download
      },
      {
        id: 'android-3',
        title: 'اضغط على "تثبيت"',
        description: 'اضغط على زر التثبيت لإضافة التطبيق إلى الشاشة الرئيسية',
        icon: CheckCircle2
      },
      {
        id: 'android-4',
        title: 'ابدأ الاستخدام',
        description: 'ستجد أيقونة التطبيق على الشاشة الرئيسية، اضغط عليها للبدء',
        icon: Home
      }
    ],
    ios: [
      {
        id: 'ios-1',
        title: 'افتح التطبيق في Safari',
        description: 'يجب استخدام متصفح Safari على iPhone أو iPad',
        icon: Smartphone
      },
      {
        id: 'ios-2',
        title: 'اضغط على زر المشاركة',
        description: 'اضغط على أيقونة المشاركة (المربع مع السهم لأعلى) في شريط الأدوات السفلي',
        icon: Share2
      },
      {
        id: 'ios-3',
        title: 'اختر "إضافة إلى الشاشة الرئيسية"',
        description: 'قم بالتمرير للأسفل واختر خيار "Add to Home Screen"',
        icon: Home
      },
      {
        id: 'ios-4',
        title: 'أكّد الإضافة',
        description: 'اضغط على "إضافة" في الزاوية العلوية اليسرى',
        icon: CheckCircle2
      }
    ]
  };

  const features = [
    {
      icon: WifiOff,
      title: 'العمل بدون اتصال',
      description: 'يمكنك عرض البيانات والمواعيد حتى بدون إنترنت',
      color: 'text-warning bg-warning/10'
    },
    {
      icon: RefreshCw,
      title: 'المزامنة التلقائية',
      description: 'عند عودة الاتصال، سيتم مزامنة جميع البيانات تلقائياً',
      color: 'text-success bg-success/10'
    },
    {
      icon: Download,
      title: 'التحديثات التلقائية',
      description: 'التطبيق يحدث نفسه تلقائياً بدون الحاجة لإعادة التثبيت',
      color: 'text-primary bg-primary/10'
    }
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">مركز المساعدة</h1>
          <p className="text-muted-foreground">تعلم كيفية تثبيت واستخدام التطبيق بكل سهولة</p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="card-gradient border-0 medical-shadow hover:glow-shadow transition-medical">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-4 rounded-xl ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Guide */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              دليل التثبيت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="android" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="ios">iOS / iPhone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="android" className="space-y-4 mt-6">
                {installSteps.android.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      activeStep === step.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setActiveStep(activeStep === step.id ? '' : step.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                        activeStep === step.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="ios" className="space-y-4 mt-6">
                {installSteps.ios.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      activeStep === step.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setActiveStep(activeStep === step.id ? '' : step.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                        activeStep === step.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Offline Features Guide */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-primary" />
              كيف تعمل الميزات بدون اتصال؟
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-success" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">عند وجود اتصال بالإنترنت</h3>
                  <p className="text-sm text-muted-foreground">
                    يتم تحميل جميع البيانات تلقائياً وحفظها محلياً على جهازك. يمكنك العمل بشكل طبيعي ومزامنة البيانات فوراً.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <WifiOff className="w-5 h-5 text-warning" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">عند انقطاع الاتصال</h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك الاستمرار في عرض البيانات المحفوظة محلياً. ستظهر رسالة تنبيه في أعلى الشاشة تخبرك بحالة الاتصال.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">عند عودة الاتصال</h3>
                  <p className="text-sm text-muted-foreground">
                    سيتم مزامنة جميع البيانات تلقائياً وستظهر رسالة تأكيد. لا حاجة لإعادة تحميل الصفحة أو القيام بأي إجراء إضافي.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">نصائح للاستخدام الأمثل:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>افتح التطبيق مرة واحدة على الأقل يومياً عند وجود إنترنت لتحديث البيانات</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>البيانات المحفوظة محلياً آمنة ولا يمكن الوصول إليها من أجهزة أخرى</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>التطبيق يحدث نفسه تلقائياً عند توفر إصدار جديد</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>في حالة انقطاع الاتصال، يمكنك عرض البيانات فقط بدون إجراء تعديلات</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="card-gradient border-0 medical-shadow">
          <CardHeader>
            <CardTitle>الأسئلة الشائعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">هل يحتاج التطبيق مساحة كبيرة؟</h3>
                <p className="text-sm text-muted-foreground">
                  لا، التطبيق خفيف جداً ولا يستهلك سوى بضعة ميجابايتات من مساحة التخزين.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">هل أحتاج لتحديث التطبيق يدوياً؟</h3>
                <p className="text-sm text-muted-foreground">
                  لا، التطبيق يحدث نفسه تلقائياً عند توفر إصدار جديد دون أي تدخل منك.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">ماذا يحدث إذا قمت بحذف التطبيق؟</h3>
                <p className="text-sm text-muted-foreground">
                  سيتم حذف البيانات المحفوظة محلياً فقط، لكن بياناتك الأساسية محفوظة على السيرفر ويمكنك الوصول إليها بإعادة تثبيت التطبيق.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Help;