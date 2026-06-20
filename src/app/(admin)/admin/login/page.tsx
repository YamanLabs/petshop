'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../../../components/Logo';
import { playSound } from '../../../utils/sound';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setErrorMsg('');
    playSound.playClick();

    try {
      const response = await fetch('/api/admin/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        playSound.playSuccess();
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Şifre doğrulanamadı.');
        playSound.playError();
      }
    } catch (err) {
      setErrorMsg('Bir ağ hatası oluştu. Lütfen tekrar deneyin.');
      playSound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white selection:bg-white selection:text-black">
      {/* Subtle glowing grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-20 -z-10" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <Logo className="h-12 w-auto" light />
          <div>
            <h2 className="text-xl font-heading font-extrabold tracking-tight">Yönetim Paneli Girişi</h2>
            <p className="text-xs text-zinc-400 mt-1">Devam etmek için 32 karakterlik yönetici şifresini girin.</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mx-auto relative">
            {success ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 animate-pulse" />
            ) : (
              <Lock className={`w-5 h-5 text-zinc-400 ${isLoading ? 'animate-bounce' : ''}`} />
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-950/50 border border-red-800/80 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-red-400 leading-relaxed">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Yönetici Şifresi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="32 karakterlik şifrenizi yapıştırın..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-3 pr-10 text-xs font-mono tracking-widest focus:outline-hidden focus:border-white disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || success}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                <span>Şifre Uzunluğu: {password.length} / 32</span>
                {password.length > 0 && password.length !== 32 && (
                  <span className="text-amber-500 font-semibold">Şifre 32 karakter olmalıdır!</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success || password.length !== 32}
              className="w-full bg-white hover:bg-zinc-150 text-black disabled:bg-zinc-800 disabled:text-zinc-500 font-bold py-3 px-4 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : success ? (
                'Giriş Başarılı!'
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>

        {/* Public Store Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Mağazaya Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
}
