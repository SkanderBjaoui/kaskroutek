'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">🥪 Kaskroutek</h1>
            <p className="text-xs sm:text-sm hidden sm:block" style={{ color: '#CD9900', fontWeight: 'bold' }}>
              {t.premiumSandwichShop}
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors shadow-sm border flex items-center gap-2 ${
                  language === 'en'
                    ? 'bg-amber-500 text-white font-semibold border-amber-500'
                    : 'bg-transparent text-white border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <Image src="/flags/gb.svg" alt="" width={16} height={16} aria-hidden className="inline-block" />
                <span>English</span>
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors shadow-sm border flex items-center gap-2 ${
                  language === 'fr'
                    ? 'bg-amber-500 text-white font-semibold border-amber-500'
                    : 'bg-transparent text-white border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <Image src="/flags/fr.svg" alt="" width={16} height={16} aria-hidden className="inline-block" />
                <span>Français</span>
              </button>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  pathname === '/'
                    ? 'bg-white text-primary font-semibold'
                    : 'border border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <span aria-hidden>🍽️</span>
                <span>{t.orderNow}</span>
              </Link>
              <Link
                href="/activity"
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  pathname === '/activity'
                    ? 'bg-white text-primary font-semibold'
                    : 'border border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <span aria-hidden>📊</span>
                <span>{t.checkActivity}</span>
              </Link>
              <Link
                href="/cart"
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  pathname === '/cart'
                    ? 'bg-accent text-white font-semibold'
                    : 'bg-accent text-white hover:bg-accent-dark'
                }`}
              >
                <span aria-hidden>🛒</span>
                <span>{t.cart}</span>
                {getItemCount() > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white text-accent font-bold">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Switcher for Mobile */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors shadow-sm border flex items-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-amber-500 text-white font-semibold border-amber-500'
                    : 'bg-transparent text-white border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <Image src="/flags/gb.svg" alt="" width={14} height={14} aria-hidden className="inline-block" />
                <span>English</span>
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors shadow-sm border flex items-center gap-1.5 ${
                  language === 'fr'
                    ? 'bg-amber-500 text-white font-semibold border-amber-500'
                    : 'bg-transparent text-white border-white/40 hover:border-white/70 hover:bg-white/10'
                }`}
              >
                <Image src="/flags/fr.svg" alt="" width={14} height={14} aria-hidden className="inline-block" />
                <span>Français</span>
              </button>
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-primary-light transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}></span>
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="flex flex-col space-y-2 py-4 border-t border-primary-light">
            <Link
              href="/"
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                pathname === '/'
                  ? 'bg-white text-primary font-semibold'
                  : 'border border-white/40 hover:border-white/70 hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <span aria-hidden>🍽️</span>
              <span>{t.orderNow}</span>
            </Link>
            <Link
              href="/activity"
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                pathname === '/activity'
                  ? 'bg-white text-primary font-semibold'
                  : 'border border-white/40 hover:border-white/70 hover:bg-white/10'
              }`}
              onClick={closeMobileMenu}
            >
              <span aria-hidden>📊</span>
              <span>{t.checkActivity}</span>
            </Link>
            <Link
              href="/cart"
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                pathname === '/cart'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-accent text-white hover:bg-accent-dark'
              }`}
              onClick={closeMobileMenu}
            >
              <span aria-hidden>🛒</span>
              <span>{t.cart}</span>
              {getItemCount() > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white text-accent font-bold">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
