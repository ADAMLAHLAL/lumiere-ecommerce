import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search, Sun, UserCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Navbar({ onNavigate, currentPage, searchQuery, onSearchChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil', page: 'home' },
    { label: 'Vidéoprojecteurs', page: 'catalog', params: { category: 'videoprojecteurs' } },
    { label: 'Lampes LED', page: 'catalog', params: { category: 'lampes-led' } },
    { label: 'Lampes de Bureau', page: 'catalog', params: { category: 'lampes-bureau' } },
    { label: 'Lampes de Sol', page: 'catalog', params: { category: 'lampes-sol' } },
    { label: 'Extérieur', page: 'catalog', params: { category: 'lampes-exterieur' } },
    { label: 'Suspensions', page: 'catalog', params: { category: 'suspensions-plafonniers' } },
  ];

  const handleNavClick = (page: string, params?: Record<string, string>) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Lumi<span className="text-amber-500">è</span>re
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.params)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === link.page
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - desktop */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-full border border-transparent focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all w-40 lg:w-56"
              />
            </div>

            {/* Cart */}
            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-[pop_0.3s_ease-out]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin/Agent login or dashboard link */}
            {profile ? (
              <button
                onClick={() => handleNavClick(profile.role === 'admin' ? 'admin' : 'agent')}
                className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                title="Espace d'administration"
              >
                <UserCircle className="w-6 h-6 text-amber-600" />
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                title="Connexion"
              >
                <UserCircle className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            {/* Mobile search */}
            <div className="flex items-center relative mb-3 px-1">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'catalog') onNavigate('catalog');
                }}
                placeholder="Rechercher un produit..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-full border border-transparent focus:border-amber-300 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.params)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick(profile ? (profile.role === 'admin' ? 'admin' : 'agent') : 'auth')}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors"
            >
              {profile ? 'Espace admin' : 'Connexion'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
