import React, { useEffect, useState } from 'react';
import { inventoryService } from '@/services';
import { Inventory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Warehouse, Edit, AlertCircle, TrendingDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(item: Inventory) {
    setSelectedItem(item);
    setNewQuantity(item.quantity);
    setIsModalOpen(true);
  }

  async function handleUpdate() {
    if (!selectedItem) return;
    try {
      await inventoryService.updateQuantity(selectedItem.id, newQuantity);
      setIsModalOpen(false);
      loadInventory();
    } catch (error: any) {
      console.error('Update Inventory Error:', error);
      alert(`Erro ao atualizar estoque: ${error.message || 'Erro desconhecido'}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Estoque</h2>
        <p className="text-zinc-500 mt-1">Gerencie a disponibilidade física dos seus produtos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-600/10 text-red-500">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase">Total de Itens</p>
              <p className="text-xl font-bold text-white">{inventory.reduce((acc, i) => acc + i.quantity, 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-yellow-600/10 text-yellow-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase">Estoque Baixo</p>
              <p className="text-xl font-bold text-white">{inventory.filter(i => i.quantity <= i.min_quantity).length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Mínimo</th>
              <th className="px-6 py-4">Quantidade Atual</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Carregando estoque...</td></tr>
            ) : inventory.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Nenhum item no estoque. Cadastre produtos primeiro.</td></tr>
            ) : inventory.map((item) => {
              const isLow = item.quantity <= item.min_quantity;
              return (
                <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-zinc-500" />
                      <div>
                        <p className="font-medium text-white">{item.product?.name}</p>
                        <p className="text-xs text-zinc-500">{item.product?.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-900/20 text-red-500 text-xs font-medium border border-red-900/30">
                        <TrendingDown className="w-3 h-3" /> Estoque Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-900/20 text-green-500 text-xs font-medium border border-green-900/30">
                        Estável
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.min_quantity}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'text-lg font-bold',
                      isLow ? 'text-red-500' : 'text-zinc-100'
                    )}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-4 h-4" />
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
        title={`Ajustar Estoque: ${selectedItem?.product?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Atualizar Quantidade</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Você está alterando a quantidade física do produto no sistema. 
            Isso refletirá no dashboard e relatórios imediatamente.
          </p>
          <Input 
            label="Quantidade em Unidades"
            type="number"
            value={newQuantity || ''}
            onChange={(e) => setNewQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
}
