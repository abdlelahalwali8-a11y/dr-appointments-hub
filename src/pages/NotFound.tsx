import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Calendar } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="medical">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المواعيد
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;