import { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AuthPage from '@/pages/AuthPage';
import AdminDashboard from '@/pages/AdminDashboard';

interface Route {
  page: string;
  params: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1);
  if (!hash) return { page: 'home', params: {} };

  const [path, queryString] = hash.split('?');
  const segments = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value;
    });
  }

  if (segments.length === 0) return { page: 'home', params: {} };

  const page = segments[0];
  if (segments[1]) {
    if (page === 'product') params.slug = segments[1];
    if (page === 'catalog' && segments[1]) params.category = segments[1];
  }

  return { page, params };
}

function buildHash(page: string, params?: Record<string, string>): string {
  if (page === 'home') return '#/';
  if (page === 'product' && params?.slug) return `#/product/${params.slug}`;
  if (page === 'catalog') {
    if (params?.category) return `#/catalog/${params.category}`;
    return '#/catalog';
  }
  return `#/${page}`;
}

function AppContent() {
  const [route, setRoute] = useState<Route>(parseHash());
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { session, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((page: string, params?: Record<string, string>) => {
    window.location.hash = buildHash(page, params);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity = 1) => {
      addToCart(product, quantity);
    },
    [addToCart]
  );

  // Admin / Agent pages (no navbar/footer)
  if (route.page === 'admin' || route.page === 'agent') {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!session || !profile) {
      return <AuthPage onNavigate={navigate} />;
    }

    if (route.page === 'admin' && profile.role !== 'admin') {
      return <AuthPage onNavigate={navigate} />;
    }

    if (route.page === 'agent' && profile.role !== 'admin' && profile.role !== 'agent') {
      return <AuthPage onNavigate={navigate} />;
    }

    return <AdminDashboard onNavigateHome={() => navigate('home')} />;
  }

  // Auth page
  if (route.page === 'auth') {
    return <AuthPage onNavigate={navigate} />;
  }

  // Storefront pages
  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage onNavigate={navigate} onAddToCart={handleAddToCart} />;
      case 'catalog':
        return (
          <CatalogPage
            onNavigate={navigate}
            onAddToCart={handleAddToCart}
            initialCategory={route.params.category}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'product':
        return route.params.slug ? (
          <ProductPage slug={route.params.slug} onNavigate={navigate} onAddToCart={handleAddToCart} />
        ) : (
          <HomePage onNavigate={navigate} onAddToCart={handleAddToCart} />
        );
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} onAddToCart={handleAddToCart} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        onNavigate={navigate}
        currentPage={route.page}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
