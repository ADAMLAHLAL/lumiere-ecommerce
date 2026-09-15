import { useState, useEffect } from 'react';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones, Star } from 'lucide-react';
import type { Product, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .order('rating', { ascending: false })
          .limit(8),
        supabase.from('categories').select('*').order('name'),
      ]);
      setFeaturedProducts(prodRes.data ?? []);
      setCategories(catRes.data ?? []);
      setLoading(false);
    }
    loadData();
  }, []);

  const features = [
    { icon: Truck, title: 'Livraison 48h', desc: 'Partout en Maroc' },
    { icon: ShieldCheck, title: 'Paiement Sécurisé', desc: 'Transactions protégées' },
    { icon: RefreshCw, title: 'Retours 30 jours', desc: 'Satisfait ou remboursé' },
    { icon: Headphones, title: 'Support 7j/7', desc: 'Une équipe à votre écoute' },
  ];

  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/7991486/pexels-photo-7991486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-amber-200">N°1 de l'éclairage en Maroc</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Illuminez votre monde avec{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Lumiè<span className="text-amber-400">r</span>e
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
              Découvrez notre sélection de vidéoprojecteurs haute définition et lampes design. Des produits de qualité pour sublimer votre intérieur et vos expériences cinématographiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all active:scale-95"
              >
                Découvrir le catalogue
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('catalog', { category: 'videoprojecteurs' })}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all active:scale-95"
              >
                Nos vidéoprojecteurs
              </button>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Explorez nos catégories
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              De la lampe LED basse consommation au vidéoprojecteur 4K, trouvez l'éclairage parfait pour chaque besoin.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate('catalog', { category: category.slug })}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={category.image_url ?? ''}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                  <div className="flex items-center gap-1 text-amber-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir les produits
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Produits en vedette
              </h2>
              <p className="text-gray-500">Notre sélection des meilleurs produits du moment.</p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl"
            >
              Voir tout le catalogue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-16 lg:px-16 lg:py-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Besoin d'aide pour choisir ?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Notre équipe d'experts vous guide pour trouver le vidéoprojecteur ou la lampe parfaits pour votre espace. Contactez-nous pour un conseil personnalisé.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Nous contacter
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
