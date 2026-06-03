import { useState, useEffect } from 'react';

const checkIsIOS = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
         (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
};

const checkIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const isIos = checkIsIOS();
  const isStandalone = checkIsStandalone();

  useEffect(() => {
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // Renderizado condicional
  if (isStandalone) return null;

  if (isIos) {
    return (
      <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', textAlign: 'center', marginBottom: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>
          Para instalar la App: Toca el botón <b>Compartir</b> de Safari y luego selecciona <b>'Agregar a inicio'</b>.
        </p>
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <button onClick={handleInstallClick} style={{ backgroundColor: '#00ff00', color: '#000', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', width: '100%' }}>
          📱 Instalar Aplicación
        </button>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
