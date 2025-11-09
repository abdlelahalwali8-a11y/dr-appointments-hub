import { useEffect, useRef } from 'react';
import { showToastNotification } from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
}

export const useRealtimeSubscription = ({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter
}: UseRealtimeSubscriptionProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create channel name with filter if provided
    const channelName = filter ? `${table}-${filter}` : table;
    
    channelRef.current = supabase
      .channel(`realtime-${channelName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`Realtime ${payload.eventType} on ${table}:`, payload);

          // Realtime notifications for appointments
          if (table === 'appointments') {
            if (payload.eventType === 'INSERT') {
              const newAppointment = payload.new;
              showToastNotification({
                type: 'appointment_status_change',
                title: '✅ موعد جديد!',
                message: `تم حجز موعد جديد بتاريخ ${newAppointment.appointment_date} الساعة ${newAppointment.appointment_time}`,
                status: 'scheduled',
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedAppointment = payload.new;
              const oldAppointment = payload.old;
              
              // Only show notification if status changed
              if (updatedAppointment.status !== oldAppointment.status) {
                const statusText = {
                  'scheduled': 'مجدول',
                  'waiting': 'في الانتظار',
                  'completed': 'مكتمل',
                  'return': 'عودة',
                  'cancelled': 'ملغي'
                }[updatedAppointment.status] || updatedAppointment.status;
                
                showToastNotification({
                  type: 'appointment_status_change',
                  title: '🔔 تحديث حالة الموعد',
                  message: `تم تحديث الموعد إلى: ${statusText}`,
                  status: updatedAppointment.status,
                });
              }
            }
          }
          
          // Realtime notifications for patients
          if (table === 'patients' && payload.eventType === 'INSERT') {
            showToastNotification({
              type: 'system_alert',
              title: '👤 مريض جديد',
              message: `تم تسجيل مريض جديد: ${payload.new.full_name}`,
              status: 'scheduled',
            });
          }
          
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);

  return channelRef.current;
};