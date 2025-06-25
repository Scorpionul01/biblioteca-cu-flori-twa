// 🌐 CONFIGURARE NGROK - MODIFICA DOAR URL-URILE DE AICI!
// Acest fișier se încarcă DINAMIC - nu trebuie rebuild!

window.APP_CONFIG = {
  // 🧠 AI Service URL - Înlocuiește cu URL-ul tău ngrok
  AI_URL: 'https://3f2e-89-136-162-148.ngrok-free.app',
  
  // 🖥️ Backend Service URL - Înlocuiește cu URL-ul tău ngrok  
  BACKEND_URL: 'https://9b63-89-136-162-148.ngrok-free.app',
  
  // 🔧 Debug info
  LAST_UPDATED: new Date().toLocaleString(),
  VERSION: '1.0'
};

console.log('📋 App Config încărcat:', window.APP_CONFIG);
