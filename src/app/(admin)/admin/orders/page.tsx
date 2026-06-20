'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  Trash2, 
  MapPin, 
  Calendar, 
  X,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../../../types';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useApp();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-black">Sipariş Yönetimi</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Mağazanıza düşen siparişlerin hazırlık, kargolama ve teslimat süreçlerini yönetin.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Müşteri adı, takip kodu veya telefon ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-4 pr-10 text-xs font-semibold focus:outline-hidden focus:border-black"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-zinc-400" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-zinc-450 uppercase whitespace-nowrap">Durum:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
          >
            <option value="all">Tüm Siparişler</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Kargoya Verildi">Kargoya Verildi</option>
            <option value="Teslim Edildi">Teslim Edildi</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Orders Table Container */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-black">Gelen Siparişler ({filteredOrders.length})</h3>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-500 font-semibold">Eşleşen sipariş bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-xs">
                <thead>
                  <tr className="text-left text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-200">
                    <th className="py-3 pr-3">Takip Kodu</th>
                    <th className="py-3 px-3">Müşteri</th>
                    <th className="py-3 px-3">Tarih</th>
                    <th className="py-3 px-3">Tutar</th>
                    <th className="py-3 px-3 text-center">Durum</th>
                    <th className="py-3 pl-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 pr-3 font-mono font-bold text-black select-all">{order.trackingCode}</td>
                      <td className="py-4 px-3">
                        <div className="font-semibold text-zinc-950">{order.customerName}</div>
                        <div className="text-[10px] text-zinc-450 mt-0.5">{order.phone}</div>
                      </td>
                      <td className="py-4 px-3 text-zinc-500 font-medium">{order.date}</td>
                      <td className="py-4 px-3 font-bold font-mono text-black">{order.total.toFixed(2)} TL</td>
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Hazırlanıyor' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : order.status === 'Kargoya Verildi' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {order.status === 'Hazırlanıyor' && <Clock className="w-3 h-3" />}
                          {order.status === 'Kargoya Verildi' && <Truck className="w-3 h-3" />}
                          {order.status === 'Teslim Edildi' && <CheckCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 pl-3 text-right space-x-1.5 whitespace-nowrap">
                        {order.status === 'Hazırlanıyor' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Kargoya Verildi')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-sm transition-colors cursor-pointer"
                          >
                            Kargola
                          </button>
                        )}
                        {order.status === 'Kargoya Verildi' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Teslim Edildi')}
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-sm transition-colors cursor-pointer"
                          >
                            Teslim Et
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="border border-zinc-200 hover:border-black text-zinc-500 hover:text-black p-1.5 rounded-sm inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Detayları Gör"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side Detail Drawer */}
        <div className="lg:col-span-4 space-y-6">
          {selectedOrder ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider">
                  Sipariş Detayı
                </h4>
                <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Order Meta */}
              <div className="space-y-3 text-xs border-b border-zinc-100 pb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">Takip Kodu</span>
                  <span className="font-bold text-black font-mono select-all">{selectedOrder.trackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">Tarih</span>
                  <span className="font-semibold text-zinc-700">{selectedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">Müşteri</span>
                  <span className="font-bold text-black">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">E-Posta</span>
                  <span className="font-semibold text-zinc-700">{selectedOrder.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">Telefon</span>
                  <span className="font-semibold text-zinc-750 font-mono">{selectedOrder.phone}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2 text-xs border-b border-zinc-100 pb-4">
                <h5 className="font-bold text-zinc-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-zinc-450" />
                  Teslimat Adresi
                </h5>
                <p className="text-zinc-650 leading-relaxed pl-5">{selectedOrder.address}</p>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs border-b border-zinc-100 pb-4">
                <h5 className="font-bold text-zinc-900">Sipariş Edilen Ürünler</h5>
                <div className="divide-y divide-zinc-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 text-zinc-700">
                      <div>
                        <div className="font-semibold text-zinc-900 leading-snug">{item.title}</div>
                        {item.variation && <div className="text-[9px] text-zinc-400 mt-0.5">Seçenek: {item.variation}</div>}
                        <div className="text-[10px] text-zinc-400 mt-0.5">Adet: {item.quantity} x {item.price} TL</div>
                      </div>
                      <span className="font-bold font-mono text-black whitespace-nowrap">{item.price * item.quantity} TL</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="space-y-1.5 text-xs text-zinc-500">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span className="font-mono">{selectedOrder.subtotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>İndirim:</span>
                  <span className="font-mono">-{selectedOrder.discount.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black border-t border-zinc-100 pt-2.5">
                  <span>Toplam Ödenen:</span>
                  <span className="font-mono text-sm">{selectedOrder.total.toFixed(2)} TL</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 text-center text-xs leading-relaxed text-zinc-500 shadow-xs">
              <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Kargo ve Sipariş İpuçları</h4>
              <p className="pt-2 text-left">
                • <strong>Hazırlanıyor:</strong> Yeni siparişler bu durumla düşer. Ürünleri paketledikten sonra "Kargola" butonuna tıklayın.
              </p>
              <p className="pt-2 text-left">
                • <strong>Kargoya Verildi:</strong> Paketiniz yoldayken bu statüyü alır. Müşteri kargoya teslim edildiğini görür. Teslim edilince "Teslim Et" butonuna basın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
