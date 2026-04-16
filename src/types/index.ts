export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  cost_price: number;
  sale_price: number;
  observations: string;
  created_at: string;
  updated_at: string;
};

export type Inventory = {
  id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  updated_at: string;
  product?: Product;
};

export type Sale = {
  id: string;
  total_amount: number;
  total_cost: number;
  profit: number;
  observations: string;
  created_at: string;
  items?: SaleItem[];
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  created_at: string;
};

export type FinancialTransactionType = 'investment' | 'reinvestment' | 'expense' | 'extra_income' | 'withdrawal';

export type FinancialTransaction = {
  id: string;
  type: FinancialTransactionType;
  amount: number;
  description: string;
  date: string;
  observations: string;
  created_at: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalInventoryUnits: number;
  lowStockItems: number;
  totalSalesCount: number;
  faturamentoTotal: number;
  investimentoTotal: number;
  reinvestimentoTotal: number;
  despesasTotais: number;
  lucroBruto: number;
  lucroLiquido: number;
  custoEstoqueAtual: number;
};
