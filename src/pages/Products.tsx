import React, { useEffect, useState } from 'react';
import { productService } from '@/services';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    cost_price: 0,
    sale_price: 0,
    observations: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      if (error.code === '42P01') {
        alert('A tabela "products" não existe. Você executou o script SQL no Supabase?');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        cost_price: 0,
        sale_price: 0,
        observations: ''
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      console.error('Submit Product Error:', error);
      alert(`Erro ao salvar produto: ${error.message || 'Erro desconhecido'}. Verifique se você executou o SQL e se as chaves no painel Secrets estão corretas.`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      await productService.delete(id);
      loadProducts();
    } catch (error) {
      alert('Erro ao excluir produto. Ele pode estar vinculado a vendas.');
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Produtos</h2>
          <p className="text-zinc-500 mt-1">Gerencie o catálogo de itens da sua empresa.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input 
            type="text"
            placeholder="Buscar por nome ou categoria..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço Custo</th>
                <th className="px-4 py-3">Preço Venda</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">Buscando produtos...</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-red-500 transition-colors">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-zinc-100">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400 text-sm">{p.category}</td>
                  <td className="px-4 py-4 text-zinc-400 text-sm">{formatCurrency(p.cost_price)}</td>
                  <td className="px-4 py-4 text-white font-medium">{formatCurrency(p.sale_price)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nome do Produto" 
            placeholder="Ex: Teclado Mecânico RGB"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input 
            label="Categoria" 
            placeholder="Ex: Periféricos"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Preço de Custo (R$)" 
              type="number"
              step="0.01"
              value={formData.cost_price || ''}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
            <Input 
              label="Preço de Venda (R$)" 
              type="number"
              step="0.01"
              value={formData.sale_price || ''}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
          <Textarea 
            label="Observações" 
            placeholder="Notas internas opcionais..."
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
