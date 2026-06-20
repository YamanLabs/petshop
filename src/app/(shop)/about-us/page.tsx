'use client';

import React from 'react';
import { Sparkles, Heart, ShieldCheck, PawPrint } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AboutUsPage() {
  const { settings } = useApp();

  const title = settings.about_us_title || 'Zuzu Pet Co. Hikayesi';
  const description = settings.about_us_description || 'Can dostlarımızın yaşam kalitesini artırmak ve onlara hak ettikleri premium bakımı sunmak amacıyla kurulan yeni nesil pet markasıyız.';
  const narrativeTitle = settings.about_us_narrative_title || 'Tutkuyla Başlayan Yolculuk';
  const narrativeContent = settings.about_us_narrative_content || 'Her şey, evlerimizi paylaştığımız patili dostlarımızın sağlıklı beslenmeye ve kaliteli aksesuarlara erişimini kolaylaştırma tutkusuyla başladı. Biz Zuzu Pet Co. olarak, sadece bir pet shop değil; evcil hayvan sahiplerinin güvenle alışveriş yapabileceği bir komünite ve yaşam tarzı markası yaratmayı amaçladık. En seçkin dünya markalarının mamalarından el yapımı deri tasmalara, konforlu yataklardan sağlıklı oyuncaklara kadar geniş bir ürün yelpazesini, en taze ve en güvenli şartlarda kapınıza kadar ulaştırıyoruz.';
  const quoteTitle = settings.about_us_quote_title || '"Dostunuz İçin En İyisi"';
  const quoteContent = settings.about_us_quote_content || 'Satışa sunduğumuz her ürün uzman ekibimiz tarafından test edilerek ve veteriner onayından geçirilerek seçilir.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fadeIn">
      {/* Editorial Title */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-black tracking-tight leading-[1.1]">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-zinc-550 max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <hr className="border-zinc-200" />

      {/* Narrative Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-sm text-zinc-655 leading-relaxed whitespace-pre-wrap">
          <h3 className="text-xl font-heading font-bold text-black">{narrativeTitle}</h3>
          <p>{narrativeContent}</p>
        </div>
        <div className="bg-zinc-950 text-white rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-4 aspect-4/3 relative overflow-hidden group border border-zinc-900 shadow-md">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
          <PawPrint className="w-12 h-12 text-white/70 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="font-heading font-bold text-lg text-white">{quoteTitle}</h4>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            {quoteContent}
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-heading font-bold text-black text-center">Temel Değerlerimiz</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-3 hover:border-black transition-all">
            <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-black border border-zinc-200">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Koşulsuz Sevgi</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Tüm işlerimizi can dostlarımıza duyduğumuz sonsuz saygı ve sevgiyle şekillendiriyoruz.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-3 hover:border-black transition-all">
            <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-black border border-zinc-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900">%100 Orijinal</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Sahte veya merdiven altı hiçbir ürüne yer vermiyor, sadece resmi distribütörlerden tedarik sağlıyoruz.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-3 hover:border-black transition-all">
            <div className="bg-zinc-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-black border border-zinc-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Premium Standartlar</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Hem paketleme hem de müşteri hizmetleri kalitemizle alışveriş deneyimini en üst seviyeye taşıyoruz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
