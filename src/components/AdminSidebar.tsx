import { Sun, LayoutDashboard, Package, ShoppingCart, Users, Tags, LogOut, Home, type LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
  onSignOut: () => void;
  onNavigateHome: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, role, onSignOut, onNavigateHome }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: Package, adminOnly: true },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'categories', label: 'Catégories', icon: Tags, adminOnly: true },
    { id: 'agents', label: 'Équipe', icon: Users, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || role === 'admin');

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Sun className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold">Lumi<span className="text-amber-400">è</span>re</span>
          <p className="text-xs text-gray-500 capitalize">{role === 'admin' ? 'Administration' : 'Agent'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-amber-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          Voir le site
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
