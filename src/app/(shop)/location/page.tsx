'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LocationPage() {
  const { settings } = useApp();

  const address = settings.contact_address || 'Caferağa Mh. Şair Nefi Sk. No:18 D:1 Kadıköy / İstanbul';
  const phone = settings.contact_phone || '+90 216 123 45 67';
  const email = settings.contact_email || 'destek@zuzupet.co';
  const hours = settings.contact_hours || 'Hafta İçi & Hafta Sonu: 09:00 - 20:00';
  const mapIframe = settings.contact_map_iframe || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6502096335345!2d29.023253276602323!3d40.98912232049755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab8677eb931e9%3A0xe107d39366dfd90a!2zQ2FmZXJhxJ9hLCDFnsFhaXIgTmVmaSBTay4sIDM0NzEwIEthZMSxa8O2eS_EsHN0YW5idWw!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
          <MapPin className="w-3.5 h-3.5" /> Konumumuz
        </div>
        <h1 className="text-4xl font-heading font-extrabold text-black tracking-tight">
          Bizi Ziyaret Edin
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Kadıköy'deki konsept mağazamızda can dostunuzla birlikte en premium ürünleri inceleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="font-heading font-bold text-lg text-black border-b border-zinc-100 pb-3">İletişim Bilgileri</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex gap-4 items-start">
              <div className="bg-zinc-100 text-zinc-950 p-2.5 rounded-lg border border-zinc-200 flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-450 block text-[10px] uppercase">Adres</span>
                <p className="text-zinc-800 font-medium leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-zinc-100 text-zinc-950 p-2.5 rounded-lg border border-zinc-200 flex-shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-450 block text-[10px] uppercase">Telefon</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-zinc-850 font-bold hover:underline">
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-zinc-100 text-zinc-950 p-2.5 rounded-lg border border-zinc-200 flex-shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-450 block text-[10px] uppercase">E-Posta</span>
                <a href={`mailto:${email}`} className="text-zinc-850 font-bold hover:underline">
                  {email}
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-zinc-100 text-zinc-950 p-2.5 rounded-lg border border-zinc-200 flex-shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-450 block text-[10px] uppercase">Çalışma Saatleri</span>
                <p className="text-zinc-800 font-medium">
                  {hours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Container */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-200">
            <iframe
              src={mapIframe}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Zuzu Pet Co. Harita Konumu"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
