import React, { useEffect, useState } from 'react';
import { statsService, saleService, productService } from '@/services';
import { DashboardStats, Sale, Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { FileDown, TrendingUp, TrendingDown, Target, Package, ShoppingCart, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, salesData, productsData] = await Promise.all([
          statsService.getDashboardStats(),
          saleService.getAll(),
          productService.getAll()
        ]);
        setStats(statsData);
        setSales(salesData);
        setProducts(productsData);
      } catch (error: any) {
        if (error.code !== '42P01' && !error.message?.includes('PGRST205')) {
          console.error('Erro ao carregar relatórios:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-zinc-500 p-8">Consolidando dados reais...</div>;

  // Calculando produtos mais vendidos
  const productSalesMap: Record<string, { name: string; qty: number }> = {};
  sales.forEach(sale => {
    sale.items?.forEach(item => {
      if (item.product_id) {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = { name: item.product?.name || '?', qty: 0 };
        }
        productSalesMap[item.product_id].qty += item.quantity;
      }
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const profitMargin = stats?.faturamentoTotal ? (stats.lucroBruto / stats.faturamentoTotal) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Relatórios Consolidados</h2>
          <p className="text-zinc-500 mt-1">Visão integrada e real do desempenho do seu negócio.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400 hover:text-white transition-all">
          <FileDown className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-500 w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Fluxo de Entradas</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Vendas (Faturamento)</span>
              <span className="text-sm font-medium text-white">{formatCurrency(stats?.faturamentoTotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Entradas Extra</span>
              <span className="text-sm font-medium text-white">{formatCurrency(stats?.faturamentoTotal && stats.lucroLiquido ? (stats.lucroLiquido - (stats.faturamentoTotal - (stats.faturamentoTotal - stats.lucroBruto) - stats.despesasTotais)) : 0)}</span>
            </div>
            <div className="pt-4 border-t border-zinc-800 flex justify-between">
              <span className="font-semibold text-white">Total Bruto</span>
              <span className="font-bold text-green-500 text-lg">{formatCurrency((stats?.faturamentoTotal || 0))}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="text-red-500 w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Fluxo de Saídas</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Custo Mercadoria Vendida</span>
              <span className="text-sm font-medium text-white">{formatCurrency((stats?.faturamentoTotal || 0) - (stats?.lucroBruto || 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Despesas Operacionais</span>
              <span className="text-sm font-medium text-white">{formatCurrency(stats?.despesasTotais || 0)}</span>
            </div>
            <div className="pt-4 border-t border-zinc-800 flex justify-between">
              <span className="font-semibold text-white">Total Saídas</span>
              <span className="font-bold text-red-500 text-lg">{formatCurrency(((stats?.faturamentoTotal || 0) - (stats?.lucroBruto || 0)) + (stats?.despesasTotais || 0))}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-600/5 border-red-900/20">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-red-500 w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Rentabilidade Real</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">Margem Bruta Média</span>
              <span className="text-sm font-medium text-white">{profitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-500">ROI (Retorno s/ Investimento)</span>
              <span className="text-sm font-medium text-white">{stats?.investimentoTotal ? ((stats.lucroLiquido / stats.investimentoTotal) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="pt-4 border-t border-red-900/20 flex justify-between">
              <span className="font-semibold text-white">Lucro Líquido Final</span>
              <span className="font-bold text-white text-xl">{formatCurrency(stats?.lucroLiquido || 0)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <Card className="p-6 min-w-0">
          <div className="flex items-center gap-2 mb-8">
            <ShoppingCart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">Produtos com Maior Saída</h3>
          </div>
          <div className="h-[300px] w-full min-w-0 relative">
            <div className="absolute inset-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={120} />
                  <Tooltip 
                    cursor={{ fill: '#ef4444', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#18181b', border: '#27272a' }}
                  />
                  <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#991b1b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">Posição de Estoque</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="space-y-1">
                <p className="text-sm text-zinc-400">Patrimônio em Estoque</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats?.custoEstoqueAtual || 0)}</p>
              </div>
              <Wallet className="w-8 h-8 text-zinc-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold">Variedade</p>
                <p className="text-xl font-bold text-white mt-1">{stats?.totalProducts} SKUs</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold">Giro Total</p>
                <p className="text-xl font-bold text-white mt-1">{sales.length} Pedidos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
