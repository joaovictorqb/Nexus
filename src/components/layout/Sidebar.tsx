import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Settings, 
  TrendingUp, 
  FileText,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Produtos', path: '/produtos' },
  { icon: Warehouse, label: 'Estoque', path: '/estoque' },
  { icon: ShoppingCart, label: 'Vendas', path: '/vendas' },
  { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  { icon: FileText, label: 'Relatórios', path: '/relatorios' },
];

export function Sidebar() {
  return (
    <aside className="w-[220px] bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-0 flex flex-col pt-6">
        <div className="px-6 pb-10 text-[22px] font-[900] text-[var(--accent-red)] tracking-[2px] uppercase">
          CORE OPS
        </div>
      </div>

      <nav className="flex-1 flex flex-col">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'px-6 py-3.5 flex items-center text-[13px] font-medium transition-all duration-200 border-l-[3px]',
              isActive 
                ? 'bg-[rgba(255,0,0,0.1)] text-white border-[var(--accent-red)]' 
                : 'text-[var(--text-secondary)] border-transparent hover:bg-[rgba(255,0,0,0.05)] hover:text-white'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'w-[18px] h-[18px] mr-3 rounded-[2px] transition-all duration-200 flex items-center justify-center',
                  isActive 
                    ? 'bg-[var(--accent-red)] shadow-[0_0_10px_var(--accent-red)]' 
                    : 'bg-[var(--text-secondary)] opacity-50'
                )}>
                  <item.icon className="w-3 h-3 text-black" />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3 px-3 py-2 text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer text-sm">
          <Settings className="w-[18px] h-[18px]" />
          <span>Configurações</span>
        </div>
      </div>
    </aside>
  );
}
