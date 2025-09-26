import { useEffect, useRef } from 'react';
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