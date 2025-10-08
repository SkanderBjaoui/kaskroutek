'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import { supabaseStore } from '@/data/supabaseStore';
import { useLanguage } from '@/contexts/LanguageContext';

interface PreloadGateProps {
  children: React.ReactNode;
  minDurationMs?: number;
  timeoutMs?: number;
  oncePerSession?: boolean;
}

export default function PreloadGate({ children, minDurationMs = 2000, timeoutMs = 6000, oncePerSession = false }: PreloadGateProps) {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const { t } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  const didPreload = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const force = window.location.hash.includes('force-preload');
    if (force) return false;
    if (!oncePerSession) return false;
    return sessionStorage.getItem('kaskroutek_preloaded') === '1';
  }, [oncePerSession]);

  useEffect(() => {
    if (!mounted) return;
    if (didPreload) {
      setIsReady(true);
      return;
    }
    let cancelled = false;
    const preload = async () => {
      try {
        const [breads, toppings] = await Promise.all([
          supabaseStore.getBreads().catch(() => []),
          supabaseStore.getToppings().catch(() => []),
        ]);
        // Recompute timers for today so delivery/pickup selection reflects current availability
        await supabaseStore.recomputeAllTimersActiveFlagsForToday().catch(() => {});
        const urls: string[] = [
          '/flags/gb.svg',
          '/flags/fr.svg',
          '/sandwich.png',
          '/next.svg',
          '/vercel.svg',
          '/globe.svg',
          '/window.svg',
          '/file.svg',
        ];
        breads.forEach(b => { if (b.imageUrl) urls.push(b.imageUrl); });
        toppings.forEach(t => { if (t.imageUrl) urls.push(t.imageUrl); });
        const unique = Array.from(new Set(urls));
        const total = unique.length;
        if (total === 0) return finish();
        let loaded = 0;
        const tick = () => setProgress(Math.round(((++loaded) / total) * 100));
        // Wait for all image requests to settle (success or error)
        await Promise.all(unique.map(src => loadImage(src).then(tick).catch(tick)));
        await waitMinDuration(startedAtRef.current, minDurationMs);
        if (!cancelled) finish();
      } catch {
        await waitMinDuration(startedAtRef.current, minDurationMs);
        if (!cancelled) finish();
      }
    };
    const finish = () => {
      if (oncePerSession) sessionStorage.setItem('kaskroutek_preloaded', '1');
      setIsReady(true);
    };
    preload();
    return () => { cancelled = true; };
  }, [mounted, didPreload, minDurationMs, timeoutMs, oncePerSession]);

  if (!mounted) return null;
  if (isReady) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary to-primary-light text-white">
      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Ellipsis-style sandwich dots with veggies */}
          <div className="flex items-center justify-center gap-4 h-24">
            <span className="text-5xl select-none animate-dot" aria-hidden>🍞</span>
            <span className="text-5xl select-none animate-dot" style={{ animationDelay: '140ms' }} aria-hidden>🥬</span>
            <span className="text-5xl select-none animate-dot" style={{ animationDelay: '280ms' }} aria-hidden>🍅</span>
            <span className="text-5xl select-none animate-dot" style={{ animationDelay: '420ms' }} aria-hidden>🥒</span>
            <span className="text-5xl select-none animate-dot" style={{ animationDelay: '560ms' }} aria-hidden>🧀</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">{t.preloadingTitle}</h2>
            <p className="opacity-90 mt-1">{t.preloadingSubtitle}</p>
          </div>

          <div className="w-full">
            <div className="w-full h-3 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="text-sm mt-2">{progress}%</div>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-90">
            <NextImage src="/sandwich.png" alt="" width={20} height={20} />
            <span>{t.preloadingTip}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dot {
          0% { transform: translateY(0) scale(0.9); opacity: 0.4; }
          35% { transform: translateY(-10%) scale(1); opacity: 1; }
          70% { transform: translateY(0) scale(0.9); opacity: 0.6; }
          100% { transform: translateY(0) scale(0.9); opacity: 0.4; }
        }
        .animate-dot { animation: dot 1.1s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
}

function waitMinDuration(startedAt: number, minDurationMs: number) {
  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, minDurationMs - elapsed);
  return new Promise(resolve => setTimeout(resolve, remaining));
}


