import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('تم الاتصال بالإنترنت', {
        description: 'سيتم مزامنة بياناتك تلقائياً'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('لا يوجد اتصال بالإنترنت', {
        description: 'يمكنك الاستمرار في العمل، وسيتم المزامنة عند عودة الاتصال',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <div className="bg-warning/10 border border-warning text-warning-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">وضع بدون اتصال</span>
      </div>
    </div>
  );
};
