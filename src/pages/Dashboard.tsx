import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { statsService } from '@/services';
import { DashboardStats } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { DbDiagnostic } from '@/components/shared/DbDiagnostic';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
      } catch (error: any) {
        // Silently fail if it's a known table error (handled by DbDiagnostic)
        if (error.code !== '42P01' && !error.message?.includes('PGRST205')) {
          console.error('Erro inesperado no dashboard:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="text-zinc-500">Carregando métricas...</div>;

  const cards = [
    { label: 'Faturamento Total', value: formatCurrency(stats?.faturamentoTotal || 0), icon: DollarSign, color: 'text-green-500', path: '/vendas' },
    { label: 'Lucro Líquido', value: formatCurrency(stats?.lucroLiquido || 0), icon: TrendingUp, color: 'text-red-500', path: '/relatorios' },
    { label: 'Itens em Estoque', value: stats?.totalInventoryUnits || 0, icon: Package, color: 'text-blue-500', path: '/estoque' },
    { label: 'Estoque Baixo', value: stats?.lowStockItems || 0, icon: AlertTriangle, color: 'text-yellow-500', path: '/estoque' },
  ];

  const financialItems = [
    { label: 'Total Investido', value: formatCurrency(stats?.investimentoTotal || 0), icon: ArrowUpRight },
    { label: 'Total Reinvestido', value: formatCurrency(stats?.reinvestimentoTotal || 0), icon: ArrowUpRight },
    { label: 'Despesas Totais', value: formatCurrency(stats?.despesasTotais || 0), icon: ArrowDownRight },
    { label: 'Custo Estoque', value: formatCurrency(stats?.custoEstoqueAtual || 0), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      {/* Diagnóstico de Banco de Dados */}
      <DbDiagnostic />

      {/* Page title now in Header (Layout) */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={i} onClick={() => navigate(card.path)} hover className="p-5 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[1px]">{card.label}</p>
                <h3 className={cn(
                  "text-2xl font-bold mt-2",
                  (card.label.includes('Faturamento') || card.label.includes('Baixo')) ? "text-[var(--accent-red)] [text-shadow:0_0_10px_var(--accent-glow)]" : "text-white"
                )}>
                  {card.value}
                </h3>
              </div>
              <div className={cn(
                "p-2.5 rounded-lg bg-zinc-900/50",
                (card.label.includes('Faturamento') || card.label.includes('Baixo')) ? "text-[var(--accent-red)]" : "text-zinc-500"
              )}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="lg:col-span-2 p-6 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Desempenho de Vendas</h3>
            <p className="text-sm text-zinc-500">Últimos dados</p>
          </div>
          <div className="h-[300px] w-full min-w-0 relative">
            <div className="absolute inset-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ name: 'Início', val: 0 }, { name: 'Atual', val: stats?.faturamentoTotal || 0 }]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#3f3f46" fontSize={12} />
                  <YAxis stroke="#3f3f46" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '#27272a' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#ef4444" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Resumo Financeiro</h3>
          <div className="space-y-6 flex-1">
            {financialItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-zinc-800 text-zinc-400 group-hover:text-red-500 transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-zinc-400">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Total de Vendas</span>
              <span className="text-lg font-bold text-white">{stats?.totalSalesCount || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
