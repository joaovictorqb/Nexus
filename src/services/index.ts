import { supabase } from '@/lib/supabase';
import { Product, Inventory, Sale, FinancialTransaction, FinancialTransactionType, DashboardStats } from '@/types';

// --- PRODUTOS ---
export const productService = {
  async getAll() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Product[];
  },

  async create(product: Partial<Product>) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data as Product;
  },

  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  },

  async delete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- ESTOQUE ---
export const inventoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:products(*)')
      .order('quantity', { ascending: true });
    if (error) throw error;
    return (data || []) as Inventory[];
  },

  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Inventory;
  }
};

// --- VENDAS ---
export const saleService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sales')
      .select('*, items:sale_items(*, product:products(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Sale[];
  },

  async create(sale: { 
    total_amount: number; 
    total_cost: number; 
    profit: number; 
    observations: string;
    items: { product_id: string; quantity: number; unit_price: number; cost_price: number }[]
  }) {
    // 1. Criar a venda
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        total_amount: sale.total_amount,
        total_cost: sale.total_cost,
        profit: sale.profit,
        observations: sale.observations
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Criar itens da venda
    const itemsToInsert = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: item.cost_price
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // 3. Atualizar estoque (baixa automática)
    for (const item of sale.items) {
      const { data: currentInv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single();
      
      if (currentInv) {
        await supabase
          .from('inventory')
          .update({ quantity: currentInv.quantity - item.quantity })
          .eq('product_id', item.product_id);
      }
    }

    return saleData;
  }
};

// --- FINANCEIRO ---
export const financialService = {
  async getAll() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as FinancialTransaction[];
  },

  async create(transaction: Partial<FinancialTransaction>) {
    const { data, error } = await supabase.from('financial_transactions').insert(transaction).select().single();
    if (error) throw error;
    return data as FinancialTransaction;
  },

  async delete(id: string) {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- DASHBOARD & RELATÓRIOS ---
export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      { count: productsCount },
      { data: inventoryData },
      { data: salesData },
      { data: financeData }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('inventory').select('quantity, product:products(cost_price), min_quantity'),
      supabase.from('sales').select('total_amount, total_cost, profit'),
      supabase.from('financial_transactions').select('*')
    ]);

    const inventory = (inventoryData || []) as any[];
    const sales = (salesData || []) as Sale[];
    const finance = (financeData || []) as FinancialTransaction[];

    const totalInventoryUnits = inventory.reduce((acc, item) => acc + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.min_quantity).length;
    const custoEstoqueAtual = inventory.reduce((acc, item) => acc + (item.quantity * (item.product?.cost_price || 0)), 0);

    const faturamentoTotal = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const lucroBruto = sales.reduce((acc, sale) => acc + Number(sale.profit), 0);

    const investimentoTotal = finance.filter(f => f.type === 'investment').reduce((acc, f) => acc + Number(f.amount), 0);
    const reinvestimentoTotal = finance.filter(f => f.type === 'reinvestment').reduce((acc, f) => acc + Number(f.amount), 0);
    const despesasTotais = finance.filter(f => f.type === 'expense').reduce((acc, f) => acc + Number(f.amount), 0);
    const extraIncome = finance.filter(f => f.type === 'extra_income').reduce((acc, f) => acc + Number(f.amount), 0);
    const withdrawals = finance.filter(f => f.type === 'withdrawal').reduce((acc, f) => acc + Number(f.amount), 0);

    const lucroLiquido = faturamentoTotal - sales.reduce((acc, s) => acc + Number(s.total_cost), 0) - despesasTotais + extraIncome - withdrawals;

    return {
      totalProducts: productsCount || 0,
      totalInventoryUnits,
      lowStockItems,
      totalSalesCount: sales.length,
      faturamentoTotal,
      investimentoTotal,
      reinvestimentoTotal,
      despesasTotais,
      lucroBruto,
      lucroLiquido,
      custoEstoqueAtual
    };
  }
};
