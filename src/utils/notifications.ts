// src/utils/notifications.ts

// مفتاح VAPID العام (يجب استبداله بمفتاحك الحقيقي)
// هذا المفتاح يستخدمه الخادم لتشفير رسائل Push
// بما أننا نستخدم Supabase Realtime، سنركز على إشعارات المتصفح العادية (Toast)
// وإشعارات PWA Push ستتطلب خادمًا خلفيًا مخصصًا.
// سنقوم بتطبيق إشعارات Toast الآن، وتجهيز PWA لاحقًا.

import { toast } from '@/hooks/use-toast';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';

interface NotificationPayload {
  type: 'appointment_reminder' | 'appointment_status_change' | 'system_alert';
  title: string;
  message: string;
  link?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export const showToastNotification = (payload: NotificationPayload) => {
  let icon = AlertCircle;
  let variant: 'default' | 'destructive' = 'default';

  switch (payload.status) {
    case 'scheduled':
      icon = Calendar;
      break;
    case 'completed':
      icon = CheckCircle2;
      break;
    case 'cancelled':
      icon = AlertCircle;
      variant = 'destructive';
      break;
    default:
      icon = AlertCircle;
      break;
  }

  toast({
    title: payload.title,
    description: payload.message,
    variant: variant,
    icon: icon,
    action: payload.link ? {
      label: 'عرض',
      onClick: () => {
        window.location.href = payload.link || '#';
      }
    } : undefined,
  });
};

// *****************************************************************
// PWA Push Notifications (يتطلب خادمًا خلفيًا)
// *****************************************************************

// سنقوم بتجهيز الدوال، لكن التنفيذ الكامل يتطلب خادمًا خلفيًا لإرسال الإشعارات.
// بما أننا نستخدم Supabase، يمكننا استخدام Supabase Edge Functions كخادم خلفي.

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
};

export const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
  if (!('PushManager' in window)) {
    console.warn('Push notifications not supported.');
    return;
  }

  // يجب استبدال هذا بمفتاح VAPID العام الحقيقي
  const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'; 

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('User is subscribed:', subscription);
    // هنا يجب إرسال كائن الاشتراك (subscription object) إلى الخادم الخلفي (Edge Function) لتخزينه.
    // await sendSubscriptionToServer(subscription);
    return subscription;
  } catch (err) {
    console.error('Failed to subscribe the user: ', err);
  }
};

// دالة مساعدة لتحويل مفتاح VAPID من Base64 إلى Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
