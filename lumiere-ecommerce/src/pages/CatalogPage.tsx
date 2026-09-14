import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import type { Product, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

interface CatalogPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
  initialCategory?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export default function CatalogPage({
  onNavigate,
  onAddToCart,
  initialCategory,
  searchQuery,
  onSearchChange,
}: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data ?? []);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (selectedCategory) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .maybeSingle();
      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
    }

    query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('featured', { ascending: false }).order('rating', { ascending: false });
    }

    const { data } = await query;
    setProducts(data ?? []);
    setLoading(false);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const sortLabels: Record<SortOption, string> = {
    featured: 'En vedette',
    'price-asc': 'Prix croissant',
    'price-desc': 'Prix décroissant',
    rating: 'Mieux notés',
    name: 'Nom A-Z',
  };

  const activeCategory = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-gray-500 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-600 transition-colors">Accueil</button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{activeCategory ? activeCategory.name : 'Catalogue'}</span>
          </nav>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {activeCategory ? activeCategory.name : 'Tous nos produits'}
          </h1>
          {activeCategory?.description && (
            <p className="text-gray-500 mt-2 max-w-3xl">{activeCategory.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile search */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'
            } lg:relative lg:block lg:bg-transparent lg:z-auto lg:w-64 shrink-0`}
            onClick={() => showFilters && setShowFilters(false)}
          >
            <div
              className={`${
                showFilters
                  ? 'fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto'
                  : ''
              } lg:static lg:p-0 lg:bg-transparent`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile header */}
              {showFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="text-lg font-bold">Filtres</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              )}

              <div className="lg:sticky lg:top-28 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Catégories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        onNavigate('catalog');
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-amber-50 text-amber-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Toutes les catégories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          onNavigate('catalog', { category: cat.slug });
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.slug
                            ? 'bg-amber-50 text-amber-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Prix maximum
                  </h3>
                  <input
                    type="range"
                    min={0}
                    max={3000}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0 MAD</span>
                    <span className="font-medium text-gray-900">{priceRange[1]} MAD</span>
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange([0, 3000]);
                    onSearchChange('');
                    onNavigate('catalog');
                  }}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Trier: {sortLabels[sortBy]}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                        {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setShowSortMenu(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                              sortBy === option
                                ? 'text-amber-600 font-medium bg-amber-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {sortLabels[option]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">Aucun produit trouvé</p>
                <p className="text-gray-500 text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
