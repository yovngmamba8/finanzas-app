import { useState, useEffect } from 'react';
import { dbService } from './services/dbService';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategorySummary from './components/CategorySummary';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ ingreso: [], egreso: [] });
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        dbService.init();
        const txs = await dbService.getTransactions();
        const cats = await dbService.getCategories();
        
        setTransactions(txs);
        setCategories(cats);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Control del tema (Claro / Oscuro)
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

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


  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <h3>Cargando tu portal financiero...</h3>
      </div>
    );
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
          <p>Tu portal de finanzas inteligente y escalable</p>
        </div>

        {/* CONTROLES (SELECTOR DE TEMA Y MES) */}
        <div className="controls-container">
          {/* Botón de alternancia de tema */}
          <button 
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
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
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Selecciona el mes:</span>
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
