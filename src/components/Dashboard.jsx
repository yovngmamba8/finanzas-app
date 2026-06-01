
export default function Dashboard({ transactions, selectedMonth }) {
  // Filtrar transacciones por el mes seleccionado
  const monthlyTransactions = transactions.filter(
    tx => tx.mes.toLowerCase() === selectedMonth.toLowerCase()
  );

  // Calcular ingresos reales
  const realIncome = monthlyTransactions
    .filter(tx => tx.tipo === 'ingreso')
    .reduce((sum, tx) => sum + tx.monto, 0);

  // Calcular egresos reales
  const realExpense = monthlyTransactions
    .filter(tx => tx.tipo === 'egreso')
    .reduce((sum, tx) => sum + tx.monto, 0);

  // Saldo real
  const balance = realIncome - realExpense;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="dashboard-grid">
      {/* CARD SALDO TOTAL */}
      <div className="glass-panel card card-balance">
        <h3 className="card-title">Saldo Neto ({selectedMonth})</h3>
        <div className="card-value" style={{ color: balance >= 0 ? 'var(--text-primary)' : 'var(--color-expense)' }}>
          {formatCurrency(balance)}
        </div>
      </div>

      {/* CARD INGRESOS */}
      <div className="glass-panel card card-income">
        <h3 className="card-title">Ingresos Totales</h3>
        <div className="card-value" style={{ color: 'var(--color-income)' }}>
          {formatCurrency(realIncome)}
        </div>
      </div>

      {/* CARD EGRESOS */}
      <div className="glass-panel card card-expense">
        <h3 className="card-title">Egresos Totales</h3>
        <div className="card-value" style={{ color: 'var(--color-expense)' }}>
          {formatCurrency(realExpense)}
        </div>
      </div>
    </div>
  );
}
