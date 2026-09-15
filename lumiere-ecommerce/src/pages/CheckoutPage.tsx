import { useState } from 'react';
import { ArrowLeft, Check, Lock, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/utils';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  country: string;
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    postal_code: '',
    country: 'MAROC',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shipping = totalPrice >= 50 ? 0 : 6.90;
  const finalTotal = totalPrice + shipping;

  if (items.length === 0 && !success) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Votre panier est vide</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-amber-600 font-medium hover:text-amber-700"
          >
            Parcourir le catalogue
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Commande confirmée !
          </h1>
          <p className="text-gray-500 mb-2">
            Merci pour votre achat. Nous vous avons envoyé une confirmation par email.
          </p>
          <div className="bg-amber-50 rounded-xl px-6 py-4 my-6">
            <p className="text-sm text-gray-600">Votre numéro de commande</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{orderNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Livraison estimée sous 48h. Vous pouvez suivre votre commande avec ce numéro.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newOrderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone || null,
          shipping_address: form.shipping_address,
          city: form.city,
          postal_code: form.postal_code,
          country: form.country,
          total: finalTotal,
          status: 'confirmed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderNumber(newOrderNumber);
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Finaliser ma commande</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations de contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className={inputClass}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                    className={inputClass}
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    className={inputClass}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Adresse de livraison</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Adresse *</label>
                  <input
                    type="text"
                    required
                    value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                    className={inputClass}
                    placeholder="42 Rue de la Lumière"
                  />
                </div>
                <div>
                  <label className={labelClass}>Ville *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputClass}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className={labelClass}>Code postal *</label>
                  <input
                    type="text"
                    required
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    className={inputClass}
                    placeholder="75011"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Pays *</label>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Paiement</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                <CreditCard className="w-6 h-6 text-amber-500" />
                <span className="text-sm text-gray-600">Paiement à la livraison (mode démo)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock className="w-4 h-4" />
                Vos informations sont traitées de manière sécurisée.
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Votre commande</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-green-600">Gratuite</span> : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3 mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Confirmer la commande
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
