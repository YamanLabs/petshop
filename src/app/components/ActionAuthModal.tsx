'use client';

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader2, X, ShieldAlert } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ActionAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function ActionAuthModal({ onSuccess, onClose }: ActionAuthModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 32) {
      setErrorMsg('İşlem şifresi 32 karakter olmalıdır.');
      triggerShake();
      playSound.playError();
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    playSound.playClick();

    try {
      const res = await fetch('/api/admin/verify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playSound.playSuccess();
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Geçersiz işlem şifresi.');
        triggerShake();
        playSound.playError();
      }
    } catch (err) {
      setErrorMsg('Doğrulama sırasında bir ağ hatası oluştu.');
      triggerShake();
      playSound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog Card */}
      <div 
        className={`w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={() => {
            playSound.playClick();
            onClose();
          }}
          disabled={isLoading}
          className="absolute right-4.5 top-4.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock / Security Icon Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mx-auto shadow-inner text-amber-500">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-heading font-extrabold text-white">Yönetici İşlem Doğrulaması</h3>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[280px] mx-auto leading-normal">
              Bu kritik işlemi gerçekleştirmek için 32 karakterlik **İşlem Şifrenizi** girmeniz gerekmektedir.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-800/80 rounded-lg p-3 flex items-start gap-2 text-[11px] text-red-400 leading-normal animate-fadeIn">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">İşlem Şifresi (Action Password)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="32 karakterlik işlem şifresini girin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-xs font-mono tracking-widest text-white focus:outline-hidden focus:border-white disabled:opacity-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
              <span>Şifre Uzunluğu: {password.length} / 32</span>
              {password.length > 0 && password.length !== 32 && (
                <span className="text-amber-500 font-semibold">32 karakter olmalıdır!</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                playSound.playClick();
                onClose();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-xs font-bold rounded-lg border border-zinc-800 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isLoading || password.length !== 32}
              className="bg-white hover:bg-zinc-150 text-black disabled:bg-zinc-800 disabled:text-zinc-500 font-bold py-2 px-5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                'İşlemi Onayla'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
