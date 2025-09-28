/**
 * Currency utility functions for TND (Tunisian Dinar)
 */

// Tunisian Dinar symbol and formatting
export const CURRENCY_SYMBOL = 'د.ت'; // Tunisian Dinar symbol in Arabic
export const CURRENCY_EMOJI = '🇹🇳'; // Tunisia flag emoji

/**
 * Format a number as TND currency
 * @param amount - The amount to format
 * @param showEmoji - Whether to include the flag emoji
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showEmoji: boolean = true): string {
  const formatted = amount.toFixed(2);
  const emoji = showEmoji ? `${CURRENCY_EMOJI} ` : '';
  return `${emoji}${formatted} ${CURRENCY_SYMBOL}`;
}

/**
 * Format a number as TND currency without emoji
 * @param amount - The amount to format
 * @returns Formatted currency string without emoji
 */
export function formatCurrencyNoEmoji(amount: number): string {
  return formatCurrency(amount, false);
}

/**
 * Format a number as TND currency with emoji
 * @param amount - The amount to format
 * @returns Formatted currency string with emoji
 */
export function formatCurrencyWithEmoji(amount: number): string {
  return formatCurrency(amount, true);
}

