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
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pwa-prompt-dismissed') === 'true';
  });

  const isIos = checkIsIOS();
  const isStandalone = checkIsStandalone();

  useEffect(() => {
    if (isStandalone) return;

    // Capturar evento de instalación en Android / Desktop
    const handler = (e) => {
      e.preventDefault();
      
      const alreadyDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
      if (!alreadyDismissed) {
        setDeferredPrompt(e);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("Error al disparar el prompt de instalación PWA:", err);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  // Renderizado condicional: ocultar si ya está instalada o fue cerrada por el usuario
  if (isStandalone || isDismissed) return null;

  // Banner Premium para iOS
  if (isIos) {
    return (
      <div className="install-prompt-container glass-panel animate-slide-in" style={{ marginTop: '20px', marginBottom: '15px' }}>
        <div className="install-prompt-content">
          <div className="install-prompt-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div className="install-prompt-text" style={{ textAlign: 'left' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Instalar Finance App</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Toca el botón <strong>Compartir</strong> <span className="share-icon-placeholder">⎋</span> en Safari y selecciona <strong>"Agregar a inicio"</strong>.
            </p>
          </div>
        </div>
        <div className="install-prompt-actions">
          <button className="btn btn-secondary btn-sm btn-dismiss" onClick={handleDismiss}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Banner Premium para Android / PC
  if (deferredPrompt) {
    return (
      <div className="install-prompt-container glass-panel animate-slide-in" style={{ marginTop: '20px', marginBottom: '15px' }}>
        <div className="install-prompt-content">
          <div className="install-prompt-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div className="install-prompt-text" style={{ textAlign: 'left' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Instalar Finance App</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Accede al instante desde tu pantalla de inicio con soporte sin conexión.
            </p>
          </div>
        </div>
        <div className="install-prompt-actions">
          <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
            📱 Instalar
          </button>
          <button className="btn btn-secondary btn-sm btn-dismiss" onClick={handleDismiss}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
