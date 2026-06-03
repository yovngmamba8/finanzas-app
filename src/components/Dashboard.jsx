import SummaryCard from './ui/SummaryCard';

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
      <SummaryCard
        title={`Saldo Neto (${selectedMonth})`}
        value={formatCurrency(balance)}
        type="balance"
        valueColor={balance >= 0 ? 'var(--text-primary)' : 'var(--color-expense)'}
      />
      <SummaryCard
        title="Ingresos Totales"
        value={formatCurrency(realIncome)}
        type="income"
        valueColor="var(--color-income)"
      />
      <SummaryCard
        title="Egresos Totales"
        value={formatCurrency(realExpense)}
        type="expense"
        valueColor="var(--color-expense)"
      />
    </div>
  );
}
