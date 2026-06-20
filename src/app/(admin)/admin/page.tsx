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
  const { orders, products, coupons, updateOrderStatus, settings, updateSetting, requireActionAuth } = useApp();

  const [rating, setRating] = React.useState('4.97');
  const [count, setCount] = React.useState('875');
  const [couponVisible, setCouponVisible] = React.useState(true);
  
  // Biz Kimiz Page States
  const [aboutUsTitle, setAboutUsTitle] = React.useState('');
  const [aboutUsDesc, setAboutUsDesc] = React.useState('');
  const [aboutUsNarrativeTitle, setAboutUsNarrativeTitle] = React.useState('');
  const [aboutUsNarrativeContent, setAboutUsNarrativeContent] = React.useState('');
  const [aboutUsQuoteTitle, setAboutUsQuoteTitle] = React.useState('');
  const [aboutUsQuoteContent, setAboutUsQuoteContent] = React.useState('');

  // Contact Page States
  const [contactAddress, setContactAddress] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactHours, setContactHours] = React.useState('');
  const [contactMapIframe, setContactMapIframe] = React.useState('');

  const [settingsTab, setSettingsTab] = React.useState<'general' | 'about' | 'contact'>('general');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  React.useEffect(() => {
    if (settings) {
      if (settings.customer_reviews_rating) {
        setRating(settings.customer_reviews_rating);
      }
      if (settings.customer_reviews_count) {
        setCount(settings.customer_reviews_count);
      }
      if (settings.coupon_banner_visible !== undefined) {
        setCouponVisible(settings.coupon_banner_visible !== 'false');
      }

      setAboutUsTitle(settings.about_us_title || 'Zuzu Pet Co. Hikayesi');
      setAboutUsDesc(settings.about_us_description || 'Can dostlarımızın yaşam kalitesini artırmak ve onlara hak ettikleri premium bakımı sunmak amacıyla kurulan yeni nesil pet markasıyız.');
      setAboutUsNarrativeTitle(settings.about_us_narrative_title || 'Tutkuyla Başlayan Yolculuk');
      setAboutUsNarrativeContent(settings.about_us_narrative_content || 'Her şey, evlerimizi paylaştığımız patili dostlarımızın sağlıklı beslenmeye ve kaliteli aksesuarlara erişimini kolaylaştırma tutkusuyla başladı. Biz Zuzu Pet Co. olarak, sadece bir pet shop değil; evcil hayvan sahiplerinin güvenle alışveriş yapabileceği bir komünite ve yaşam tarzı markası yaratmayı amaçladık. En seçkin dünya markalarının mamalarından el yapımı deri tasmalara, konforlu yataklardan sağlıklı oyuncaklara kadar geniş bir ürün yelpazesini, en taze ve en güvenli şartlarda kapınıza kadar ulaştırıyoruz.');
      setAboutUsQuoteTitle(settings.about_us_quote_title || '"Dostunuz İçin En İyisi"');
      setAboutUsQuoteContent(settings.about_us_quote_content || 'Satışa sunduğumuz her ürün uzman ekibimiz tarafından test edilerek ve veteriner onayından geçirilerek seçilir.');

      setContactAddress(settings.contact_address || 'Caferağa Mh. Şair Nefi Sk. No:18 D:1 Kadıköy / İstanbul');
      setContactPhone(settings.contact_phone || '+90 216 123 45 67');
      setContactEmail(settings.contact_email || 'destek@zuzupet.co');
      setContactHours(settings.contact_hours || 'Hafta İçi & Hafta Sonu: 09:00 - 20:00');
      setContactMapIframe(settings.contact_map_iframe || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6502096335345!2d29.023253276602323!3d40.98912232049755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab8677eb931e9%3A0xe107d39366dfd90a!2zQ2FmZXJhxJ9hLCDFnsFhaXIgTmVmaSBTay4sIDM0NzEwIEthZMSxa8O2eS_EsHN0YW5idWw!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str');
    }
  }, [settings]);

  const handleSaveSettings = () => {
    requireActionAuth(async () => {
      setIsSaving(true);
      setSaveMessage('');
      try {
        await updateSetting('customer_reviews_rating', rating);
        await updateSetting('customer_reviews_count', count);
        await updateSetting('coupon_banner_visible', couponVisible ? 'true' : 'false');

        await updateSetting('about_us_title', aboutUsTitle);
        await updateSetting('about_us_description', aboutUsDesc);
        await updateSetting('about_us_narrative_title', aboutUsNarrativeTitle);
        await updateSetting('about_us_narrative_content', aboutUsNarrativeContent);
        await updateSetting('about_us_quote_title', aboutUsQuoteTitle);
        await updateSetting('about_us_quote_content', aboutUsQuoteContent);

        await updateSetting('contact_address', contactAddress);
        await updateSetting('contact_phone', contactPhone);
        await updateSetting('contact_email', contactEmail);
        await updateSetting('contact_hours', contactHours);
        await updateSetting('contact_map_iframe', contactMapIframe);

        setSaveMessage('Ayarlar başarıyla kaydedildi.');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
        setSaveMessage('Ayarlar kaydedilirken hata oluştu.');
      } finally {
        setIsSaving(false);
      }
    });
  };

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
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Toplam Ciro</span>
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
            <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Aktif Siparişler</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Genel Mağaza Ayarları Card */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <h3 className="text-lg font-bold text-black">Genel Mağaza Ayarları</h3>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded">
              Yönetici Yetkisi
            </span>
          </div>

          {/* Sub Tab Headers */}
          <div className="flex border-b border-zinc-100 pb-2 gap-2">
            <button
              type="button"
              onClick={() => setSettingsTab('general')}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${
                settingsTab === 'general' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Mağaza & Kupon
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('about')}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${
                settingsTab === 'about' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Biz Kimiz?
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('contact')}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${
                settingsTab === 'contact' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Konum & İletişim
            </button>
          </div>

          <div className="space-y-4">
            {settingsTab === 'general' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Average Rating Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Müşteri Yorumları Yıldız Derecesi</label>
                  <input
                    type="text"
                    placeholder="Örn: 4.97"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs font-mono text-black outline-none transition-all"
                  />
                </div>

                {/* Reviews Count Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Toplam Yorum Sayısı</label>
                  <input
                    type="number"
                    placeholder="Örn: 875"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs font-mono text-black outline-none transition-all"
                  />
                </div>

                {/* Coupon Banner Visibility Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-700 block">Kupon Bannerı Gösterimi</span>
                    <span className="text-[10px] text-zinc-400 block">Anasayfadaki ilk sipariş %20 indirim bannerı.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={couponVisible}
                      onChange={(e) => setCouponVisible(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            )}

            {settingsTab === 'about' && (
              <div className="space-y-4 animate-fadeIn">
                {/* About Us Page Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Ana Başlık</label>
                  <input
                    type="text"
                    value={aboutUsTitle}
                    onChange={(e) => setAboutUsTitle(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Kısa Açıklama</label>
                  <textarea
                    value={aboutUsDesc}
                    onChange={(e) => setAboutUsDesc(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all min-h-[50px] resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Hikaye Başlığı</label>
                  <input
                    type="text"
                    value={aboutUsNarrativeTitle}
                    onChange={(e) => setAboutUsNarrativeTitle(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Hikaye İçeriği</label>
                  <textarea
                    value={aboutUsNarrativeContent}
                    onChange={(e) => setAboutUsNarrativeContent(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all min-h-[100px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">Vurgulanan Alıntı Başlığı</label>
                    <input
                      type="text"
                      value={aboutUsQuoteTitle}
                      onChange={(e) => setAboutUsQuoteTitle(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">Vurgulanan Alıntı İçeriği</label>
                    <input
                      type="text"
                      value={aboutUsQuoteContent}
                      onChange={(e) => setAboutUsQuoteContent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'contact' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Contact Page Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Mağaza Adresi</label>
                  <textarea
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all min-h-[50px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">Telefon</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">E-Posta</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Çalışma Saatleri</label>
                  <input
                    type="text"
                    value={contactHours}
                    onChange={(e) => setContactHours(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">Google Maps Embed URL</label>
                  <input
                    type="text"
                    placeholder="https://www.google.com/maps/embed?..."
                    value={contactMapIframe}
                    onChange={(e) => setContactMapIframe(e.target.value)}
                    className="w-full bg-white border border-zinc-200 focus:border-black rounded-lg px-3 py-2 text-[10px] font-mono text-black outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Save Message & Button */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-550 font-bold">{saveMessage}</span>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-black hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow active:scale-98"
              >
                {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
