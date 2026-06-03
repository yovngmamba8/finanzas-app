import { useState } from 'react';
import { supabase } from '../services/dbService';
import InstallPrompt from './InstallPrompt';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Validaciones en tiempo real
  const isPasswordLengthValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValidForRegister = isPasswordLengthValid && doPasswordsMatch && fullName.trim().length > 0 && email.trim().length > 0;
  const isSubmitDisabled = loading || (isRegistering && !isFormValidForRegister);

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
        if (password.length < 8) {
          setErrorMsg('La contraseña debe tener al menos 8 caracteres');
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
          setRegistrationSuccess(true);
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

  if (registrationSuccess) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'var(--bg-primary)'
      }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '16px', color: 'var(--color-income)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--text-primary)' }}>¡Casi listo!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Hemos enviado un correo de confirmación a <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setRegistrationSuccess(false);
              setIsRegistering(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

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
            {isRegistering && (
              <div style={{
                fontSize: '0.8rem',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isPasswordLengthValid ? 'var(--color-income)' : '#ef4444',
                transition: 'var(--transition-smooth)'
              }}>
                {isPasswordLengthValid ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
                )}
                <span>Mínimo 8 caracteres</span>
              </div>
            )}
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
              {confirmPassword.length > 0 && (
                <div style={{
                  fontSize: '0.8rem',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: doPasswordsMatch ? 'var(--color-income)' : '#ef4444',
                  transition: 'var(--transition-smooth)'
                }}>
                  {doPasswordsMatch ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
                      <span>Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn" style={{ marginTop: '8px' }} disabled={isSubmitDisabled}>
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
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path
              fill="#EA4335"
              d="M20.285 12.3c0-.66-.06-1.29-.17-1.89H12v3.58h4.648a3.98 3.98 0 0 1-1.73 2.61v2.17h2.798c1.64-1.51 2.569-3.73 2.569-6.47Z"
            />
            <path
              fill="#4285F4"
              d="M12 20.73c2.36 0 4.34-.78 5.79-2.12l-2.798-2.17a5.536 5.536 0 0 1-8.347-2.91H3.722v2.24A8.995 8.995 0 0 0 12 20.73Z"
            />
            <path
              fill="#FBBC05"
              d="M6.645 13.53a5.56 5.56 0 0 1 0-3.06V8.23H3.722a8.995 8.995 0 0 0 0 7.54l2.923-2.24Z"
            />
            <path
              fill="#34A853"
              d="M12 7.27c1.28 0 2.43.44 3.34 1.31l2.5-2.5A8.92 8.92 0 0 0 12 3.27a8.995 8.995 0 0 0-8.278 5.24l2.923 2.24c.69-2.07 2.62-3.48 5.355-3.48Z"
            />
          </svg>
          Continuar con Google
        </button>

        <InstallPrompt />

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
