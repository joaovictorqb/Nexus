import React from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard Principal',
  '/produtos': 'Gerenciamento de Produtos',
  '/estoque': 'Controle de Inventário',
  '/vendas': 'Operações de Venda',
  '/financeiro': 'Fluxo Financeiro',
  '/relatorios': 'Inteligência de Negócio',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'NEXUS ERP';

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="flex min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <Sidebar />
      <main className="flex-1 ml-[220px] flex flex-col relative">
        <header className="h-[70px] px-8 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-deep)] sticky top-0 z-30">
          <div className="text-[18px] font-semibold text-white tracking-tight">
            {title}
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isConfigured ? "bg-[#00ff00] shadow-[0_0_8px_#00ff00]" : "bg-red-500 shadow-[0_0_8px_red]"
            )} />
            <span className={isConfigured ? "text-[var(--text-secondary)]" : "text-red-500 font-bold"}>
              {isConfigured ? 'Conectado ao Supabase (Produção)' : 'Supabase não configurado'}
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
