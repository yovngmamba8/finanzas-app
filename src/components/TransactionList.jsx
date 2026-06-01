import { useState } from 'react';

export default function TransactionList({ transactions, selectedMonth, onDeleteTransaction }) {
  const [filterType, setFilterType] = useState('todos');

  // Filtrar transacciones por el mes seleccionado y por tipo de filtro
  const filteredTransactions = transactions.filter(tx => {
    const matchesMonth = tx.mes.toLowerCase() === selectedMonth.toLowerCase();
    const matchesType = filterType === 'todos' || tx.tipo === filterType;
    return matchesMonth && matchesType;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return dateStr || '';
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Registro de Movimientos ({selectedMonth})</h3>
        
        {/* Filtros rápidos */}
        <div className="tab-container" style={{ margin: 0, width: 'auto' }}>
          <button
            className={`tab ${filterType === 'todos' ? 'active' : ''}`}
            onClick={() => setFilterType('todos')}
            style={{ padding: '6px 12px' }}
          >
            Todos
          </button>
          <button
            className={`tab ${filterType === 'egreso' ? 'active' : ''}`}
            onClick={() => setFilterType('egreso')}
            style={{ padding: '6px 12px' }}
          >
            Egresos
          </button>
          <button
            className={`tab ${filterType === 'ingreso' ? 'active' : ''}`}
            onClick={() => setFilterType('ingreso')}
            style={{ padding: '6px 12px' }}
          >
            Ingresos
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p style={{ fontWeight: '500' }}>No hay registros guardados para este mes.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Usa el formulario lateral para agregar tu primera transacción.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th style={{ textAlign: 'right' }}>Monto Real</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.fecha)}</td>
                  <td>
                    <span className={`badge ${tx.tipo === 'ingreso' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.tipo}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{tx.categoria}</td>
                  <td>{tx.concepto}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600', color: tx.tipo === 'ingreso' ? 'var(--color-income)' : 'var(--text-primary)' }}>
                    {formatCurrency(tx.monto)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-delete"
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Eliminar registro"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
