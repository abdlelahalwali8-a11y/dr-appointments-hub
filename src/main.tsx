import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/notifications";

// تسجيل Service Worker للإشعارات
if ('serviceWorker' in navigator) {
  registerServiceWorker()
    .then((registration) => {
      if (registration) {
        console.log('Service Worker registered successfully');
      }
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
