'use client';

import Link from 'next/link';
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
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'en' 
                    ? 'bg-white text-primary font-semibold' 
                    : 'hover:bg-primary-light'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'fr' 
                    ? 'bg-white text-primary font-semibold' 
                    : 'hover:bg-primary-light'
                }`}
              >
                FR
              </button>
            </div>

            {/* Cart Badge */}
            {getItemCount() > 0 && (
              <Link
                href="/cart"
                className="relative bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {getItemCount()} {t.itemsInCart}
              </Link>
            )}
            
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'bg-white text-primary font-semibold'
                    : 'hover:bg-primary-light'
                }`}
              >
                {t.orderNow}
              </Link>
              {getItemCount() > 0 && (
                <Link
                  href="/cart"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/cart'
                      ? 'bg-white text-primary font-semibold'
                      : 'hover:bg-primary-light'
                  }`}
                >
                  {t.cart}
                </Link>
              )}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Switcher for Mobile */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  language === 'en' 
                    ? 'bg-white text-primary font-semibold' 
                    : 'hover:bg-primary-light'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  language === 'fr' 
                    ? 'bg-white text-primary font-semibold' 
                    : 'hover:bg-primary-light'
                }`}
              >
                FR
              </button>
            </div>

            {/* Cart Badge for Mobile */}
            {getItemCount() > 0 && (
              <Link
                href="/cart"
                className="relative bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold hover:bg-accent-dark transition-colors"
                onClick={closeMobileMenu}
              >
                {getItemCount()}
              </Link>
            )}

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
              className={`px-4 py-3 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'bg-white text-primary font-semibold'
                  : 'hover:bg-primary-light'
              }`}
              onClick={closeMobileMenu}
            >
              {t.orderNow}
            </Link>
            {getItemCount() > 0 && (
              <Link
                href="/cart"
                className={`px-4 py-3 rounded-lg transition-colors ${
                  pathname === '/cart'
                    ? 'bg-white text-primary font-semibold'
                    : 'hover:bg-primary-light'
                }`}
                onClick={closeMobileMenu}
              >
                {t.cart} ({getItemCount()} {t.itemsInCart})
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
