import { useState } from 'react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLastBusinessDayOfMonth = (year, month) => {
  // month is 0-indexed: 0 = Jan, 11 = Dec
  let lastDay = new Date(year, month + 1, 0);
  while (true) {
    const dayOfWeek = lastDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return lastDay.getDate();
    }
    lastDay.setDate(lastDay.getDate() - 1);
  }
};

const getFinancialMonthInfo = (fechaString) => {
  if (!fechaString) return { mesName: '', isNext: false };
  const parts = fechaString.split('-');
  if (parts.length !== 3) return { mesName: '', isNext: false };
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const lastBusDay = getLastBusinessDayOfMonth(year, month);
  
  if (day >= lastBusDay) {
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextMonthIndex = nextMonthDate.getMonth();
    return {
      mesName: MESES[nextMonthIndex],
      isNext: true
    };
  } else {
    return {
      mesName: MESES[month],
      isNext: false
    };
  }
};

export default function TransactionForm({ categories, onAddTransaction }) {
  const [fecha, setFecha] = useState(getLocalDateString());
  const [tipo, setTipo] = useState('ingreso');
  const financialMonthInfo = getFinancialMonthInfo(fecha);
  const [categoria, setCategoria] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');

  // Sincronizar categorías en la fase de renderizado cuando cambia el tipo o las categorías cambian
  const [prevTipo, setPrevTipo] = useState(tipo);
  const [prevCategories, setPrevCategories] = useState(categories);
  if (tipo !== prevTipo || categories !== prevCategories) {
    setPrevTipo(tipo);
    setPrevCategories(categories);
    setCategoria(categories && categories[tipo] ? (categories[tipo][0] || '') : '');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!concepto || !monto) {
      alert('Por favor completa los campos obligatorios (Concepto y Monto).');
      return;
    }

    // fecha viene en formato "YYYY-MM-DD" del input type="date"
    const parts = fecha.split('-'); // [Año, Mes, Día]
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed para JS
    const day = parseInt(parts[2], 10);

    // Formatear a dd/mm/yyyy
    const formattedDate = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

    // Obtener el mes financiero usando la regla de negocio
    const financialInfo = getFinancialMonthInfo(fecha);
    const mes = financialInfo.mesName.toLowerCase();

    onAddTransaction({
      fecha: formattedDate, // Guardamos directamente en formato dd/mm/yyyy
      mes,
      tipo,
      categoria,
      concepto,
      presupuesto: 0,
      monto: Number(monto)
    });

    // Resetear formulario (excepto fecha y tipo para comodidad)
    setConcepto('');
    setMonto('');
  };

  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Nuevo Registro</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Transacción</label>
          <div className="tab-container">
            <button
              type="button"
              className={`tab ${tipo === 'ingreso' ? 'active' : ''}`}
              onClick={() => setTipo('ingreso')}
            >
              Ingreso
            </button>
            <button
              type="button"
              className={`tab ${tipo === 'egreso' ? 'active' : ''}`}
              onClick={() => setTipo('egreso')}
            >
              Egreso
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          {financialMonthInfo.mesName && (
            <div className={`date-helper ${financialMonthInfo.isNext ? 'next-month' : ''}`}>
              {financialMonthInfo.isNext ? (
                <span>💡 Contabiliza para el presupuesto de <strong>{financialMonthInfo.mesName}</strong></span>
              ) : (
                <span>Contabiliza para el presupuesto de <strong>{financialMonthInfo.mesName}</strong></span>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categories && categories[tipo] && categories[tipo].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="concepto">Concepto (Ej: Uber, Comida, Sueldo)</label>
          <input
            type="text"
            id="concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Descripción del movimiento"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="monto">Monto *</label>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <button type="submit" className="btn" style={{ marginTop: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Agregar Transacción
        </button>
      </form>
    </div>
  );
}
