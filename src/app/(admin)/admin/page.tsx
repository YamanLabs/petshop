'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  PawPrint
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { orders, products, coupons, updateOrderStatus } = useApp();

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Teslim Edildi').length;
  const criticalStockProducts = products.filter(p => p.stock <= 3);

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-black">Genel Bakış</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Mağazanızın güncel gelir, sipariş ve stok durumu analitikleri.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex justify-between items-center group hover:border-black transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Toplam Ciro</span>
            <span className="text-3xl font-extrabold text-black font-mono block">
              {totalRevenue.toFixed(2)} TL
            </span>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Tüm zamanların sipariş toplamı
            </span>
          </div>
          <div className="bg-zinc-100 p-4 rounded-xl text-black group-hover:scale-105 transition-transform duration-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex justify-between items-center group hover:border-black transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Aktif Siparişler</span>
            <span className="text-3xl font-extrabold text-black font-mono block">
              {activeOrdersCount}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold block">
              Toplam {orders.length} siparişten {activeOrdersCount} adedi hazırlanıyor/yolda.
            </span>
          </div>
          <div className="bg-zinc-100 p-4 rounded-xl text-black group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Critical Stock Warnings */}
        <div className={`border rounded-xl p-6 shadow-xs flex justify-between items-center group transition-all ${
          criticalStockProducts.length > 0
            ? 'bg-red-50/50 border-red-200 hover:border-red-400'
            : 'bg-white border-zinc-200 hover:border-black'
        }`}>
          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${
              criticalStockProducts.length > 0 ? 'text-red-500' : 'text-zinc-400'
            }`}>
              Kritik Stok Uyarısı
            </span>
            <span className="text-3xl font-extrabold text-black font-mono block">
              {criticalStockProducts.length}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold block">
              Stoğu 3 ve altı olan ürün adedi.
            </span>
          </div>
          <div className={`p-4 rounded-xl group-hover:scale-105 transition-transform duration-200 ${
            criticalStockProducts.length > 0
              ? 'bg-red-100 text-red-700 animate-pulse'
              : 'bg-zinc-100 text-black'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Critical Stock Logs Panel */}
      {criticalStockProducts.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            Otomatik Kritik Stok Alarmları (En Fazla 3 Ürün)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalStockProducts.map(p => (
              <div key={p.id} className="bg-white border border-red-150 rounded-lg p-4 flex gap-3 items-center">
                <div className="w-12 h-12 bg-zinc-900 rounded-md border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0 gap-0.5 select-none">
                  <PawPrint className="w-4 h-4 text-white/50" />
                  <span className="text-[5px] font-bold text-white/50 tracking-wider">YOK</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-zinc-900 truncate leading-snug">{p.title}</h4>
                  <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block mt-1">
                    Kalan Stok: {p.stock} Adet
                  </span>
                  <Link href={`/admin/products?edit=${p.id}`} className="text-[9px] text-zinc-400 hover:text-black font-semibold underline mt-0.5 inline-block">
                    Stoğu Güncelle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders Link Card */}
      <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="text-lg font-bold text-black">Son Sipariş Durumu</h3>
          <Link href="/admin/orders" className="text-xs font-bold underline hover:opacity-85 text-black">
            Tüm Siparişleri Yönet (Sipariş Yönetim Sayfası) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-zinc-550 text-xs font-medium py-4 text-center">Henüz sipariş bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3.5 bg-zinc-50 rounded-lg border border-zinc-150 text-xs hover:border-black transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black font-mono select-all">{order.trackingCode}</span>
                    <span className="text-zinc-400">|</span>
                    <span className="font-semibold text-zinc-700">{order.customerName}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">{order.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold font-mono text-black">{order.total.toFixed(2)} TL</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === 'Hazırlanıyor' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : order.status === 'Kargoya Verildi' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
