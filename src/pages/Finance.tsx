import React, { useEffect, useState } from 'react';
import { financialService } from '@/services';
import { FinancialTransaction, FinancialTransactionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, DollarSign, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export function Finance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    type: 'expense' as FinancialTransactionType,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    observations: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const data = await financialService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      await financialService.create(formData);
      setIsModalOpen(false);
      loadTransactions();
    } catch (error: any) {
      console.error('Submit Finance Error:', error);
      alert(`Erro ao salvar transação: ${error.message || 'Erro desconhecido'}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento financeiro?')) return;
    try {
      await financialService.delete(id);
      loadTransactions();
    } catch (error: any) {
      console.error('Delete Finance Error:', error);
      alert(`Erro ao excluir: ${error.message || 'Erro desconhecido'}`);
    }
  }

  const getTypeStyle = (type: FinancialTransactionType) => {
    switch (type) {
      case 'investment': return { icon: TrendingUp, color: 'text-blue-500', label: 'Investimento' };
      case 'reinvestment': return { icon: Wallet, color: 'text-indigo-500', label: 'Reinvestimento' };
      case 'expense': return { icon: TrendingDown, color: 'text-red-500', label: 'Despesa' };
      case 'extra_income': return { icon: DollarSign, color: 'text-green-500', label: 'Entrada Extra' };
      case 'withdrawal': return { icon: Receipt, color: 'text-orange-500', label: 'Retirada' };
      default: return { icon: DollarSign, color: 'text-zinc-500', label: type };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financeiro</h2>
          <p className="text-zinc-500 mt-1">Controle de investimentos, despesas e fluxos de caixa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-zinc-500 uppercase font-medium">Investimento Acumulado</p>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(transactions.filter(t => t.type === 'investment').reduce((acc, t) => acc + Number(t.amount), 0))}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-500 uppercase font-medium">Reinvestimento</p>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(transactions.filter(t => t.type === 'reinvestment').reduce((acc, t) => acc + Number(t.amount), 0))}
          </p>
        </Card>
        <Card className="p-6 border-red-900/30">
          <p className="text-sm text-zinc-500 uppercase font-medium">Despesas Totais</p>
          <p className="text-2xl font-bold text-red-500 mt-2">
            {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0))}
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Buscando transações...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Nenhum lançamento financeiro.</td></tr>
            ) : transactions.map((t) => {
              const { icon: Icon, color, label } = getTypeStyle(t.type);
              return (
                <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', color)} />
                      <span className="text-sm text-zinc-200">{label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-100 font-medium">{t.description}</p>
                    {t.observations && <p className="text-xs text-zinc-500 italic">{t.observations}</p>}
                  </td>
                  <td className={cn('px-6 py-4 font-bold', (t.type === 'expense' || t.type === 'withdrawal') ? 'text-red-500' : 'text-green-500')}>
                    {(t.type === 'expense' || t.type === 'withdrawal') ? '-' : ''}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-zinc-600 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento Financeiro"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar Lançamento</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select 
            label="Tipo de Lançamento"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as FinancialTransactionType })}
          >
            <option value="investment">Investimento (Aporte)</option>
            <option value="reinvestment">Reinvestimento</option>
            <option value="expense">Despesa (Saída)</option>
            <option value="extra_income">Entrada Extra</option>
            <option value="withdrawal">Retirada</option>
          </Select>
          <Input 
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value === '' ? 0 : Number(e.target.value) })}
          />
          <Input 
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input 
            label="Descrição Curta"
            placeholder="Ex: Aluguel, Compra de material, etc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Textarea 
            label="Observações Adicionais"
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
