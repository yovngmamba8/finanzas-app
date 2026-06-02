import { useState, useEffect } from 'react';
import { dbService } from './services/dbService';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategorySummary from './components/CategorySummary';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'Usuario');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ ingreso: [], egreso: [] });
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()]);
  const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar si el usuario está logueado
  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      if (!user) {
        await Promise.resolve(); // Hacer que las actualizaciones de estado sean asíncronas para evitar cascading renders
        if (mounted) {
          setTransactions([]);
          setCategories({ ingreso: [], egreso: [] });
          setLoading(false);
        }
        return;
      }
      
      setLoading(true);
      try {
        const txs = await dbService.getTransactions();
        const cats = await dbService.getCategories();
        
        if (mounted) {
          setTransactions(txs);
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Control del tema (Claro / Oscuro)
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!isManualOverride) {
        setIsDarkMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [isManualOverride]);

  // Agregar transacción
  const handleAddTransaction = async (newTx) => {
    try {
      const addedTx = await dbService.addTransaction(newTx);
      setTransactions(prev => [addedTx, ...prev]);
    } catch (error) {
      console.error("Error agregando transacción:", error);
    }
  };

  // Eliminar transacción
  const handleDeleteTransaction = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      try {
        await dbService.deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error("Error eliminando transacción:", error);
      }
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <h3>Cargando tu portal financiero...</h3>
      </div>
    );
  }

  // Protección de Rutas: Si no hay usuario, mostrar vista de Login
  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* CABECERA */}
      <header className="header">
        <div>
          <h1>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-income)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Finanzas Personales
          </h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Portal financiero inteligente</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{displayName}</span>
          </p>
        </div>

        {/* CONTROLES (SELECTOR DE TEMA, MES Y LOGOUT) */}
        <div className="controls-container">
          {/* Botón de alternancia de tema */}
          <button 
            className="theme-toggle-btn"
            onClick={() => { setIsDarkMode(!isDarkMode); setIsManualOverride(true); }}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* Selector de Mes */}
          <div className="month-selector">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mes:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MESES.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button 
            onClick={signOut}
            className="theme-toggle-btn"
            style={{ 
              color: 'var(--color-expense)',
              borderColor: 'rgba(234, 179, 8, 0.2)',
              background: 'rgba(234, 179, 8, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500'
            }}
            title="Cerrar Sesión"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span style={{ display: 'none' }}>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <Dashboard
        transactions={transactions}
        selectedMonth={selectedMonth}
      />

      {/* LAYOUT PRINCIPAL */}
      <main className="main-layout">
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <section>
          <TransactionForm
            categories={categories}
            onAddTransaction={handleAddTransaction}
          />
        </section>

        {/* PANEL DERECHO: HISTORIAL Y RESUMEN POR CATEGORÍAS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <TransactionList
            transactions={transactions}
            selectedMonth={selectedMonth}
            onDeleteTransaction={handleDeleteTransaction}
          />

          <CategorySummary
            transactions={transactions}
            categories={categories}
            selectedMonth={selectedMonth}
          />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
