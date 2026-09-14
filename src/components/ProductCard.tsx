import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import Rating from './Rating';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onNavigate, onAddToCart }: ProductCardProps) {
  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100 transition-all duration-300">
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onNavigate('product', { slug: product.slug })}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md">
              -{discount}%
            </span>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-md">
              Stock limité
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-gray-700 text-white text-xs font-bold rounded-lg shadow-md">
              Rupture
            </span>
          )}
        </div>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('product', { slug: product.slug });
              }}
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-50 transition-colors"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}
        <h3
          className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 cursor-pointer hover:text-amber-600 transition-colors line-clamp-2 min-h-[2.5rem]"
          onClick={() => onNavigate('product', { slug: product.slug })}
        >
          {product.name}
        </h3>
        <Rating rating={product.rating} reviewCount={product.review_count} />

        <div className="flex items-end justify-between mt-3">
          <div className="flex flex-col">
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
