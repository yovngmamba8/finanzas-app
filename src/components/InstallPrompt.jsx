import { useState, useEffect } from 'react';

const checkIsIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const checkIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  return !!(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const isIOS = checkIsIOS();
  const isStandalone = checkIsStandalone();

  // Inicializar visibilidad basado en el dispositivo para evitar setState síncrono en useEffect
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    if (isStandalone || isDismissed) {
      return false;
    }
    return isIOS; // Empieza visible si es iOS y cumple las condiciones
  });

  useEffect(() => {
    if (isStandalone) return;

    // Escuchar el evento de instalación de Android/Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      
      // Solo mostrar si no se ha descartado antes
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
      if (!isDismissed) {
        setDeferredPrompt(e);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario eligió instalar PWA: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-prompt-container glass-panel animate-slide-in">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
        <div className="install-prompt-text">
          <h4>Instalar Finance App</h4>
          {isIOS ? (
            <p>
              Para instalar la app: toca el botón <strong>Compartir</strong> <span className="share-icon-placeholder">⎋</span> en Safari y selecciona <strong>"Agregar a inicio"</strong>.
            </p>
          ) : (
            <p>Accede de forma rápida y segura desde tu pantalla de inicio con soporte sin conexión.</p>
          )}
        </div>
      </div>
      <div className="install-prompt-actions">
        {!isIOS && deferredPrompt && (
          <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
            📱 Instalar
          </button>
        )}
        <button className="btn btn-secondary btn-sm btn-dismiss" onClick={handleDismiss}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
