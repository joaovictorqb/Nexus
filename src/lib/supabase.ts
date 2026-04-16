import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis de ambiente de forma segura (import.meta.env ou process.env)
const getEnv = (key: string): string | undefined => {
  const value = import.meta.env[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
  if (!value || value === 'undefined' || value === 'null' || value === '') {
    return undefined;
  }
  return String(value).trim();
};

const rawUrl = getEnv('VITE_SUPABASE_URL');
const rawKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Garante que a URL seja válida para o createClient não quebrar o load da página
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) 
  ? rawUrl 
  : 'https://placeholder-project.supabase.co';

const supabaseAnonKey = rawKey || 'placeholder-anon-key';

// O client é exportado normalmente, mas as operações falharão se as chaves forem placeholders
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!rawUrl || !rawKey) {
  console.error(
    'SUPABASE CONFIG ERROR: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes.\n' +
    'Por favor, configure-as no painel "Secrets" do AI Studio para que o sistema funcione.'
  );
}
