import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle2, Database, ShieldAlert, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function DbDiagnostic() {
  const [status, setStatus] = useState<{
    connected: boolean;
    tables: Record<string, boolean>;
    error?: string;
    checking: boolean;
  }>({
    connected: false,
    tables: {},
    checking: true
  });

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    const tablesToCheck = ['products', 'inventory', 'sales', 'financial_transactions'];
    const tableStatus: Record<string, boolean> = {};
    let globalError = undefined;

    try {
      // 1. Check for placeholder keys
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url.includes('placeholder')) {
        throw new Error('Chaves do Supabase não configuradas (verifique o painel Secrets).');
      }

      // 2. Minimal health check
      for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('id').limit(0);
        
        if (error) {
          const pgError = error as any;
          // PGRST205 and 42P01 mean the table or schema definition is missing
          if (pgError.code === '42P01' || pgError.message?.includes('PGRST205')) {
            tableStatus[table] = false;
            globalError = 'Banco de dados não inicializado. Execute o script SQL no Supabase.';
          } else {
            // Other errors (like RLS) might mean the table exists but access is blocked
            tableStatus[table] = true;
          }
        } else {
          tableStatus[table] = true;
        }
      }

      setStatus({
        connected: true,
        tables: tableStatus,
        error: globalError,
        checking: false
      });
    } catch (err: any) {
      setStatus({
        connected: false,
        tables: {},
        error: err.message,
        checking: false
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Hide if everything is OK
  const allTablesOk = Object.keys(status.tables).length > 0 && Object.values(status.tables).every(v => v);
  if (!status.error && status.connected && allTablesOk) {
    return null;
  }

  return (
    <Card className="p-5 border-zinc-800 bg-zinc-900/50 mb-8 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400">
          <Database className={cn("w-6 h-6", status.error ? "text-red-500" : "text-zinc-500")} />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Status do Banco de Dados
            </h3>
            {status.checking && <RefreshCw className="w-3 h-3 text-zinc-600 animate-spin" />}
          </div>
          
          <p className="mt-1 text-xs text-zinc-500">
            {status.error || 'Verificando integridade das tabelas operacionais...'}
          </p>

          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
            {['products', 'inventory', 'sales', 'financial_transactions'].map(table => (
              <div key={table} className="flex items-center gap-2 px-2 py-1 rounded bg-black/40 border border-zinc-800">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  status.tables[table] ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                )} />
                <span className="text-[10px] font-mono text-zinc-400">{table}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={checkConnection}
          className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-red)] border border-red-900/30 rounded hover:bg-red-900/10 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" /> Revalidar
        </button>
      </div>
      
      {status.error && status.error.includes('SQL') && (
        <div className="mt-4 p-3 bg-red-900/10 rounded border border-red-900/20">
          <p className="text-[11px] text-red-200/70 leading-relaxed">
            As tabelas necessárias não foram encontradas no seu projeto Supabase. 
            Vá ao <strong className="text-white">SQL Editor</strong>, crie uma nova query e cole o conteúdo de <code className="text-white">supabase_schema.sql</code> para inicializar o sistema.
          </p>
        </div>
      )}
    </Card>
  );
}

// Simple internal helper to avoid dependency cycles if cn is not imported
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
