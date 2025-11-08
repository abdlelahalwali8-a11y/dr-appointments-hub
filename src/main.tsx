import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker with auto-update
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm('محتوى جديد متاح. هل تريد تحديث التطبيق؟')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون اتصال');
  },
  onRegisteredSW(swUrl, registration) {
    console.log('Service Worker مسجل:', swUrl);
    
    // Check for updates every hour
    setInterval(() => {
      registration?.update();
    }, 60 * 60 * 1000);
  },
  onRegisterError(error) {
    console.error('خطأ في تسجيل Service Worker:', error);
  }
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
