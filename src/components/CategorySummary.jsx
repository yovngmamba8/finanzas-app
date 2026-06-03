export default function CategorySummary({ transactions, categories, selectedMonth }) {
  const monthlyTransactions = transactions.filter(
    tx => tx.mes.toLowerCase() === selectedMonth.toLowerCase()
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderCategoryCard = (cat, type) => {
    const real = monthlyTransactions
      .filter(tx => tx.categoria === cat)
      .reduce((sum, tx) => sum + tx.monto, 0);

    return (
      <div key={cat} className="category-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <span className="category-name" style={{ fontSize: '1rem', fontWeight: '600' }}>{cat}</span>
        <span style={{ 
          fontSize: '1rem', 
          fontWeight: '700', 
          color: real > 0 
            ? (type === 'ingreso' ? 'var(--color-income)' : 'var(--text-primary)') 
            : 'var(--text-muted)' 
        }}>
          {formatCurrency(real)}
        </span>
      </div>
    );
  };

  return (
    <div className="category-summary-section">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Resumen por Categorías ({selectedMonth})</h3>
      
      <div className="category-summary-scroll-container">
        <h4 style={{ fontSize: '1rem', color: 'var(--color-income)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'var(--color-income)', borderRadius: '50%' }}></span>
          Ingresos
        </h4>
        <div className="category-grid" style={{ marginBottom: '32px' }}>
          {categories.ingreso && categories.ingreso.map(cat => renderCategoryCard(cat, 'ingreso'))}
        </div>

        <h4 style={{ fontSize: '1rem', color: 'var(--color-expense)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'var(--color-expense)', borderRadius: '50%' }}></span>
          Egresos
        </h4>
        <div className="category-grid">
          {categories.egreso && categories.egreso.map(cat => renderCategoryCard(cat, 'egreso'))}
        </div>
      </div>
    </div>
  );
}
