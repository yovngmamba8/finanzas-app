import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_CATEGORIES = {
  ingreso: ['Sueldo', 'Negocio', 'Otros'],
  egreso: ['Servicios', 'Gastos', 'Ahorro', 'Deudas']
};

const DEFAULT_BUDGETS = {
  'Sueldo': 350000,
  'Otros': 40000,
  'Servicios': 66700,
  'Deudas': 176477,
  'Gastos': 104500,
  'Ahorro': 0
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getLastBusinessDayOfMonth = (year, month) => {
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
    return { mesName: MESES[nextMonthIndex].toLowerCase() };
  } else {
    return { mesName: MESES[month].toLowerCase() };
  }
};

export const dbService = {
  // Helper para convertir DD/MM/YYYY a YYYY-MM-DD para calcular el mes
  convertToYMD(dateStr) {
    if(!dateStr) return '';
    const parts = dateStr.split('/');
    if(parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  },

  // Obtener todas las transacciones de Supabase
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    // Mapear de BD a Frontend
    return data.map(t => {
      const ymd = this.convertToYMD(t.date);
      const mesInfo = getFinancialMonthInfo(ymd);
      
      return {
        id: t.id,
        fecha: t.date,
        mes: mesInfo.mesName,
        tipo: t.type,
        categoria: t.category,
        concepto: t.description,
        presupuesto: 0, // Se maneja en el componente
        monto: Number(t.amount)
      };
    });
  },

  // Guardar transacciones (Para el frontend, no necesitamos implementar un bulk save completo aquí, 
  // pero mantendremos el método por compatibilidad si es llamado)
  async saveTransactions(transactions) {
    return transactions;
  },

  // Agregar una transacción a Supabase
  async addTransaction(transaction) {
    // Obtener sesión del usuario actual para asociar el user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error("No hay un usuario autenticado para realizar esta acción.");
    }

    // Mapear de Frontend a BD e incluir user_id
    const newRecord = {
      date: transaction.fecha,
      description: transaction.concepto,
      amount: Number(transaction.monto),
      type: transaction.tipo,
      category: transaction.categoria,
      user_id: session.user.id
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newRecord])
      .select();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    const t = data[0];
    const ymd = this.convertToYMD(t.date);
    const mesInfo = getFinancialMonthInfo(ymd);

    return {
      id: t.id,
      fecha: t.date,
      mes: mesInfo.mesName,
      tipo: t.type,
      categoria: t.category,
      concepto: t.description,
      presupuesto: 0,
      monto: Number(t.amount)
    };
  },

  // Eliminar una transacción de Supabase
  async deleteTransaction(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
    return true;
  },

  // Obtener categorías por defecto
  async getCategories() {
    return DEFAULT_CATEGORIES;
  },

  // Obtener presupuestos base por defecto
  async getBudgets() {
    return DEFAULT_BUDGETS;
  },

  // Actualizar presupuesto de una categoría (simulado en memoria o modificado localmente)
  async updateBudget(category, amount) {
    const budgets = { ...DEFAULT_BUDGETS };
    budgets[category] = Number(amount) || 0;
    return budgets;
  }
};
