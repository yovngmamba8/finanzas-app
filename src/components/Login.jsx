import { useState } from 'react';
import { supabase } from '../services/dbService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          setErrorMsg('Por favor ingresa tu nombre');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });
        if (error) throw error;
        if (data && !data.session) {
          setSuccessMsg('Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar tu cuenta.');
        } else {
          setSuccessMsg('¡Registro exitoso! Cuenta creada e inicio de sesión automático.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al intentar iniciar sesión con Google');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-income)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isRegistering ? 'Regístrate para comenzar a gestionar tus finanzas' : 'Ingresa tus credenciales para acceder a tu portal'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--color-income-glow)',
            border: '1px solid var(--border-focus)',
            color: 'var(--color-income)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegistering && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="login-name">Tu Nombre</label>
              <input
                id="login-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Ariel"
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
          </div>

          {isRegistering && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="login-confirm-password">Confirmar Contraseña</label>
              <input
                id="login-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          <button type="submit" className="btn" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                {isRegistering ? 'Registrarse' : 'Ingresar'}
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          <span style={{ padding: '0 8px' }}>o</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
        </div>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.01A11.962 11.962 0 0 0 12 .909a11.95 11.95 0 0 0-8.91 4.025l2.176 4.831Z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.275c0-.79-.06-1.57-.18-2.34H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.63v3.01h3.87c2.26-2.08 3.56-5.14 3.56-8.77Z"
            />
            <path
              fill="#FBBC05"
              d="M3.09 15.115a7.127 7.127 0 0 1 0-6.23L.914 4.054a11.966 11.966 0 0 0 0 15.892l2.176-4.831Z"
            />
            <path
              fill="#34A853"
              d="M12 19.091c-1.89 0-3.59-.64-4.89-1.72l-2.176 4.83A11.94 11.94 0 0 0 12 23.091c3.24 0 5.95-1.07 7.94-2.91l-3.87-3.01c-1.07.72-2.45 1.16-4.07 1.16Z"
            />
          </svg>
          Continuar con Google
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'var(--transition-smooth)'
            }}
            disabled={loading}
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
