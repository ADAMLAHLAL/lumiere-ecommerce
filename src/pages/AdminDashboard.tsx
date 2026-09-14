import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, X, Search, TrendingUp, Package, ShoppingCart, Users, DollarSign,
  ChevronRight, Star, AlertCircle,
} from 'lucide-react';
import type { Product, Category, Order, OrderItem, Profile, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

type Tab = 'dashboard' | 'products' | 'orders' | 'categories' | 'agents';

export default function AdminDashboard({ onNavigateHome }: AdminDashboardProps) {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const role = profile?.role ?? 'customer';

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes, ordRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    setProducts(prodRes.data ?? []);
    setCategories(catRes.data ?? []);
    setOrders(ordRes.data ?? []);

    if (role === 'admin') {
      const { data: agentData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setAgents(agentData ?? []);
    }
    setLoading(false);
  }, [role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    await signOut();
    onNavigateHome();
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStock = products.filter((p) => p.stock <= 10).length;

  // Filtered products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  // Product CRUD
  const saveProduct = async (data: Partial<Product>) => {
    if (editingProduct) {
      await supabase.from('products').update(data).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert(data);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    loadData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadData();
  };

  // Category CRUD
  const saveCategory = async (data: Partial<Category>) => {
    if (editingCategory) {
      await supabase.from('categories').update(data).eq('id', editingCategory.id);
    } else {
      await supabase.from('categories').insert(data);
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
    loadData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadData();
  };

  // Order management
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    loadData();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    await supabase.from('orders').delete().eq('id', id);
    setSelectedOrder(null);
    loadData();
  };

  // Agent management
  const updateAgentRole = async (id: string, newRole: UserRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    loadData();
  };

  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    setOrderItems(data ?? []);
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    loadOrderItems(order.id);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
  };
  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={tab}
        onTabChange={(t) => setTab(t as Tab)}
        role={role}
        onSignOut={handleSignOut}
        onNavigateHome={onNavigateHome}
      />

      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900 capitalize">
            {tab === 'dashboard' && 'Tableau de bord'}
            {tab === 'products' && 'Gestion des produits'}
            {tab === 'orders' && 'Gestion des commandes'}
            {tab === 'categories' && 'Gestion des catégories'}
            {tab === 'agents' && 'Gestion de l\'équipe'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenue, {profile?.full_name || profile?.email}
          </p>
        </header>

        <div className="p-8">
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={DollarSign} label="Chiffre d'affaires" value={formatPrice(totalRevenue)} color="amber" />
                <StatCard icon={ShoppingCart} label="Commandes" value={orders.length.toString()} color="blue" />
                <StatCard icon={Package} label="Produits" value={products.length.toString()} color="indigo" />
                <StatCard icon={Users} label="Membres équipe" value={agents.length.toString()} color="green" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Commandes récentes</h2>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatPrice(Number(order.total))}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                            {statusLabels[order.status] ?? order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-sm text-gray-400">Aucune commande</p>}
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Alertes</h2>
                  <div className="space-y-3">
                    {pendingOrders > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <p className="text-sm text-amber-700">{pendingOrders} commande(s) en attente</p>
                      </div>
                    )}
                    {lowStock > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-700">{lowStock} produit(s) en stock limité</p>
                      </div>
                    )}
                    {pendingOrders === 0 && lowStock === 0 && (
                      <p className="text-sm text-gray-400">Aucune alerte</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Low stock products */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Stock limité</h2>
                <div className="space-y-2">
                  {products.filter((p) => p.stock <= 10).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      </div>
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {p.stock} restant(s)
                      </span>
                    </div>
                  ))}
                  {products.filter((p) => p.stock <= 10).length === 0 && (
                    <p className="text-sm text-gray-400">Tous les stocks sont bons</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && role === 'admin' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 text-sm"
                  />
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Catégorie</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              <span className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{cat?.name ?? '-'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`text-sm font-medium ${p.stock <= 10 ? 'text-amber-500' : 'text-gray-600'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                                className="p-2 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Orders list */}
                <div className="lg:col-span-1 space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => openOrder(order)}
                      className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${
                        selectedOrder?.id === order.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(Number(order.total))}</p>
                    </button>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune commande</p>}
                </div>

                {/* Order detail */}
                <div className="lg:col-span-2">
                  {selectedOrder ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">{selectedOrder.order_number}</h2>
                          <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</p>
                        </div>
                        <button
                          onClick={() => deleteOrder(selectedOrder.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Customer info */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase mb-1">Client</p>
                          <p className="text-sm font-medium text-gray-900">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                          {selectedOrder.customer_phone && <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase mb-1">Livraison</p>
                          <p className="text-sm text-gray-600">{selectedOrder.shipping_address}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.postal_code} {selectedOrder.city}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.country}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Articles</h3>
                        <div className="space-y-2">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                              {item.product_image && (
                                <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold">{formatPrice(Number(item.price) * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gray-900">{formatPrice(Number(selectedOrder.total))}</span>
                        </div>
                      </div>

                      {/* Status changer */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Statut</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <button
                              key={value}
                              onClick={() => updateOrderStatus(selectedOrder.id, value)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                selectedOrder.status === value
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <ChevronRight className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Sélectionnez une commande pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {tab === 'categories' && role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">{categories.length} catégorie(s)</p>
                <button
                  onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-50">
                      {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                          className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENTS */}
          {tab === 'agents' && role === 'admin' && (
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Membre</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold text-sm">
                              {(a.full_name || a.email)[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{a.full_name || a.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{a.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={a.role}
                            onChange={(e) => updateAgentRole(a.id, e.target.value as UserRole)}
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-amber-300"
                          >
                            <option value="admin">Admin</option>
                            <option value="agent">Agent</option>
                            <option value="customer">Client</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Pour ajouter un nouveau membre, demandez-lui de créer un compte sur la page de connexion, puis changez son rôle ici.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={saveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={saveCategory}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ProductModal({ product, categories, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    old_price: product?.old_price?.toString() ?? '',
    image_url: product?.image_url ?? '',
    category_id: product?.category_id ?? '',
    brand: product?.brand ?? '',
    stock: product?.stock?.toString() ?? '0',
    featured: product?.featured ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    onSave({
      ...form,
      slug,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
    });
  };

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD) *</label>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancien prix (MAD)</label>
              <input type="number" step="0.01" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                <option value="">Aucune</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Image *</label>
              <input required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm text-gray-700">Produit en vedette</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ category, onSave, onClose }: {
  category: Category | null;
  onSave: (data: Partial<Category>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    image_url: category?.image_url ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    onSave({ ...form, slug });
  };

  const inputClass = "w-full px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Image</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
