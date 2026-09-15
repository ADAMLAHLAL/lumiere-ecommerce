import { Sun, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const categories = [
    { label: 'Vidéoprojecteurs', slug: 'videoprojecteurs' },
    { label: 'Lampes LED', slug: 'lampes-led' },
    { label: 'Lampes de Bureau', slug: 'lampes-bureau' },
    { label: 'Lampes de Sol', slug: 'lampes-sol' },
    { label: 'Lampes d\'Extérieur', slug: 'lampes-exterieur' },
    { label: 'Suspensions & Plafonniers', slug: 'suspensions-plafonniers' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Lumi<span className="text-amber-400">è</span>re
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Votre spécialiste en projecteurs et éclairage. Des produits de qualité pour illuminer votre vie.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Catégories
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => onNavigate('catalog', { category: cat.slug })}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informations
            </h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('about')} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">À propos de nous</button></li>
              <li><button onClick={() => onNavigate('shipping')} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Livraison & Retours</button></li>
              <li><button onClick={() => onNavigate('faq')} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('contact')} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Contact</button></li>
              <li><button onClick={() => onNavigate('cgv')} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Conditions générales</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">drissiya 2 , nakhil</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-gray-400">00 00 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-gray-400">imrane@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 Lumière. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-500">Paiement sécurisé</span>
            <span className="text-xs text-gray-500">Livraison 48h</span>
            <span className="text-xs text-gray-500">Satisfait ou remboursé</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
