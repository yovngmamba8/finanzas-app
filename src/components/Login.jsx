import { useState } from 'react';
import { supabase } from '../services/dbService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('¡Registro exitoso! Por favor verifica tu correo electrónico para confirmar tu cuenta (o inicia sesión directamente si la confirmación de email está deshabilitada).');
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
              autoComplete="current-password"
            />
          </div>

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
