import { useState } from 'react';
import { LayoutDashboard, FileText, BarChart3, DollarSign } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
// 1. Import the language hook
import { useLanguage } from '../context/LanguageContext';

export function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  
  // 2. Access the translation helper
  const { t } = useLanguage();

  // 3. Apply translation to the labels
  const navItems = [
    { 
      label: t('Dashboard', 'Dashboard'), 
      href: '/', 
      icon: LayoutDashboard 
    },
    { 
      label: t('Document Issuance', 'Pag-isyu ng Dokumento'), 
      href: '/documents', 
      icon: FileText 
    },
    { 
      label: t('Revenue', 'Kita'), 
      href: '/revenue', 
      icon: DollarSign 
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-20 left-0 h-[calc(100vh-80px)] bg-white border-r border-gray-100 transition-all duration-300 z-40 shadow-sm ${
        isHovered ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="mt-8 px-3 space-y-4">
        {navItems.map((item) => {
          const active = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center rounded-xl transition-all duration-200 group relative ${
                active ? 'bg-[#0038A8] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              } ${isHovered ? 'px-4 py-3.5' : 'justify-center py-3.5'}`}
            >
              <Icon className={`w-6 h-6 flex-shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              <span className={`ml-4 font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'
              }`}>
                {item.label}
              </span>

              {active && !isHovered && (
                <div className="absolute right-0 w-1.5 h-8 bg-[#0038A8] rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}