'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Box, 
  FolderTree, 
  Tag, 
  ArrowLeftRight, 
  LogOut, 
  Menu, 
  X, 
  PawPrint,
  Settings,
  MessageSquare,
  ClipboardList,
  Shield
} from 'lucide-react';
import Logo from '../components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMounted } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuSections = [
    {
      title: 'Analiz & Satış',
      items: [
        { name: 'Genel Bakış', path: '/admin', icon: BarChart3 },
        { name: 'Sipariş Yönetimi', path: '/admin/orders', icon: ClipboardList },
      ]
    },
    {
      title: 'Mağaza Yönetimi',
      items: [
        { name: 'Ürün Yönetimi', path: '/admin/products', icon: Box },
        { name: 'Kategori Ağacı', path: '/admin/categories', icon: FolderTree },
        { name: 'Marka Yönetimi', path: '/admin/brands', icon: Shield },
        { name: 'Kupon Yönetimi', path: '/admin/coupons', icon: Tag },
      ]
    },
    {
      title: 'İçerik & Yorumlar',
      items: [
        { name: 'Navbar Özelleştirme', path: '/admin/navbar', icon: Settings },
        { name: 'Sizden Gelenler', path: '/admin/reviews', icon: MessageSquare },
      ]
    }
  ];

  if (!isMounted) return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-150 flex flex-col md:flex-row text-zinc-900 font-sans">
      {/* Mobile Header */}
      <header className="md:hidden bg-black text-white h-16 px-4 flex items-center justify-between border-b border-zinc-800 sticky top-0 z-30 shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" light />
          <span className="font-heading font-bold text-xs tracking-wider uppercase ml-1 opacity-80 text-white">YÖNETİM</span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 rounded-md hover:bg-zinc-900 cursor-pointer"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black text-white flex flex-col justify-between border-r border-zinc-900 transform transition-transform duration-250 md:translate-x-0 md:static md:h-screen
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand Header */}
          <div className="h-20 px-6 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
            <Link href="/admin" className="flex flex-col items-start gap-1 group">
              <Logo className="h-9 w-auto" light />
              <span className="font-heading font-bold text-[9px] tracking-widest text-white/50 uppercase select-none pl-1">Yönetim Paneli</span>
            </Link>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-1 select-none">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-white text-black' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer actions inside sidebar */}
        <div className="p-4 border-t border-zinc-900 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <PawPrint className="w-4.5 h-4.5" />
            <span>Mağazayı Görüntüle</span>
          </Link>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/logout', { method: 'POST' });
                if (res.ok) {
                  router.push('/admin/login');
                  router.refresh();
                }
              } catch (err) {
                console.error("Çıkış yapılırken hata oluştu:", err);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold text-red-400 hover:text-red-300 hover:bg-zinc-900/60 transition-all cursor-pointer border-none bg-transparent text-left"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Window */}
      <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-fadeIn"
        />
      )}
    </div>
  );
}
