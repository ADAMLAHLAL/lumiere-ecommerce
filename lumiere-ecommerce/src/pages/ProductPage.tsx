import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Check, ChevronRight, ArrowLeft, Zap, Truck, Shield } from 'lucide-react';
import type { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import Rating from '@/components/Rating';

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductPage({ slug, onNavigate, onAddToCart }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setQuantity(1);
      setSelectedImage(0);
      setAdded(false);

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setProduct(data as Product);

        if (data.category_id) {
          const { data: relData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          setRelated(relData ?? []);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Produit introuvable</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-amber-600 font-medium hover:text-amber-700"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const allImages = [product.image_url, ...(product.images ?? [])];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6 flex-wrap gap-1">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600 transition-colors">Accueil</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => onNavigate('catalog')} className="hover:text-amber-600 transition-colors">Catalogue</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-4">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>
            <div className="mb-4">
              <Rating rating={product.rating} reviewCount={product.review_count} size="md" />
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.old_price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.old_price)}</span>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-lg">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    En stock ({product.stock} disponibles)
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">Rupture de stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all active:scale-95 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30'
                } disabled:bg-gray-200 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100 mb-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-gray-600 font-medium">Livraison 48h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-gray-600 font-medium">Garantie 2 ans</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Zap className="w-6 h-6 text-amber-500" />
                <span className="text-xs text-gray-600 font-medium">Paiement sécurisé</span>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques techniques</h2>
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-white/50' : ''}>
                          <td className="px-5 py-3 text-sm font-medium text-gray-700 w-1/2">{key}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('product', { slug: p.slug })}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-amber-600 font-medium uppercase mb-1">{p.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{p.name}</h3>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
