import React, { useEffect, useState } from 'react';
import { saleService, productService, inventoryService } from '@/services';
import { Product, Inventory, Sale } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ShoppingBag, Plus, Trash2, History, Package } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Sale State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [salesData, productsData, inventoryData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        inventoryService.getAll()
      ]);
      setSales(salesData);
      setProducts(productsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStock(productId: string) {
    return inventory.find(i => i.product_id === productId)?.quantity || 0;
  }

  function addToCart(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingInCart = cart.find(item => item.product.id === productId);
    const stock = getStock(productId);

    if (existingInCart) {
      if (existingInCart.quantity + 1 > stock) {
        alert('Estoque insuficiente!');
        return;
      }
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (stock < 1) {
        alert('Produto fora de estoque!');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter(item => item.product.id !== productId));
  }

  const totalAmount = cart.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0);
  const totalCost = cart.reduce((acc, item) => acc + (item.product.cost_price * item.quantity), 0);
  const totalProfit = totalAmount - totalCost;

  async function handleFinishSale() {
    if (cart.length === 0) return;
    try {
      await saleService.create({
        total_amount: totalAmount,
        total_cost: totalCost,
        profit: totalProfit,
        observations,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.sale_price,
          cost_price: item.product.cost_price
        }))
      });
      setIsModalOpen(false);
      setCart([]);
      setObservations('');
      loadData();
    } catch (error: any) {
      console.error('Finalize Sale Error:', error);
      alert(`Erro ao processar venda: ${error.message || 'Erro desconhecido'}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Vendas</h2>
          <p className="text-zinc-500 mt-1">Registre transações e acompanhe o histórico.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-zinc-800">
        <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-500" />
          <h3 className="font-semibold text-white">Histórico Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Itens</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Lucro</th>
                <th className="px-6 py-4">Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Buscando vendas...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">Nenhuma venda registrada ainda.</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-400">{formatDate(sale.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {sale.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-400" title={item.product?.name}>
                          {item.product?.name.charAt(0)}
                        </div>
                      ))}
                      {(sale.items?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-red-900/20 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-red-500">
                          +{(sale.items?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{formatCurrency(sale.total_amount)}</td>
                  <td className="px-6 py-4 text-sm text-green-500">{formatCurrency(sale.profit)}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 italic max-w-xs truncate">{sale.observations || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Venda"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleFinishSale} disabled={cart.length === 0} className="w-32">
              Finalizar {formatCurrency(totalAmount)}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Selecionar Produto</label>
            <div className="grid grid-cols-1 gap-2">
              {products.map(p => {
                const stock = getStock(p.id);
                const disabled = stock <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={disabled}
                    onClick={() => addToCart(p.id)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border border-zinc-800 transition-all text-left group',
                      disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-red-600/50 hover:bg-zinc-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{p.name}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(p.sale_price)} • {stock} em estoque</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-zinc-600 group-hover:text-red-500" />
                  </button>
                );
              })}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-500" /> Carrinho de Itens
              </h4>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center bg-zinc-900 p-2 rounded-md">
                    <div className="text-sm">
                      <span className="font-bold text-white">{item.quantity}x</span> {item.product.name}
                      <p className="text-xs text-zinc-500">{formatCurrency(item.product.sale_price * item.quantity)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-zinc-600 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea 
            label="Observações da Venda"
            placeholder="Ex: Pagamento no PIX, entrega pendente..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />

          <div className="p-4 bg-red-600/5 border border-red-600/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Total da Venda</span>
              <span className="text-xl font-bold text-red-500">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
