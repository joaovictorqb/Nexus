# Guia de Configuração do Supabase - NEXUS ERP

Para que o sistema funcione 100% (Cadastro de produtos, vendas, financeiro), você deve seguir estes dois passos:

## 1. Configurar as Chaves no AI Studio
No menu lateral do AI Studio, vá em **Secrets** e adicione:
- `VITE_SUPABASE_URL`: A URL do seu projeto (ex: `https://xyz.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: A chave `anon public` do seu projeto.

## 2. Executar o Script SQL no Supabase
O sistema precisa de tabelas e permissões específicas. 
1. Vá ao seu painel do Supabase.
2. Clique em **SQL Editor** no menu lateral esquerdo.
3. Clique em **New Query**.
4. Copie todo o conteúdo do arquivo `supabase_schema.sql` (disponível na raiz deste projeto) e cole no editor.
5. Clique em **Run**.

### O que o script SQL faz:
- Cria as tabelas: `products`, `inventory`, `sales`, `sale_items` e `financial_transactions`.
- Configura o **RLS (Row Level Security)** para permitir que você salve e leia dados sem precisar de login imediato (modo simplificado).
- Cria um **Gatilho (Trigger)** que adiciona o produto automaticamente ao estoque quando você cadastra um novo produto.

---

**Dica:** Se você já executou o SQL antes de eu ajeitar as permissões, execute os comandos de `POLICY` do arquivo `supabase_schema.sql` novamente para garantir que a permissão "anon" esteja ativa.
