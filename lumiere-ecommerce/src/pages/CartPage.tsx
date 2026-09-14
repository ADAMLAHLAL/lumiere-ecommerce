import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  const shipping = totalPrice >= 50 ? 0 : 6.90;
  const finalTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Votre panier est vide</h1>
          <p className="text-gray-500 mb-8">
            Découvrez notre catalogue de vidéoprojecteurs et lampes pour trouver le produit parfait.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            Parcourir le catalogue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </button>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
          Mon panier <span className="text-gray-400 text-lg font-normal">({totalItems} article{totalItems > 1 ? 's' : ''})</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <button
                  onClick={() => onNavigate('product', { slug: item.product.slug })}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 shrink-0"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      {item.product.brand && (
                        <p className="text-xs text-amber-600 font-medium uppercase mb-1">{item.product.brand}</p>
                      )}
                      <button
                        onClick={() => onNavigate('product', { slug: item.product.slug })}
                        className="text-sm sm:text-base font-semibold text-gray-900 hover:text-amber-600 transition-colors text-left line-clamp-2"
                      >
                        {item.product.name}
                      </button>
                      <p className="text-sm text-gray-500 mt-1">{formatPrice(item.product.price)} / unité</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    Plus que {formatPrice(50 - totalPrice)} pour la livraison gratuite !
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Passer la commande
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
