import { Language } from '@/types';

/**
 * Parses a bilingual name string in format "English Name, French Name"
 * Returns an object with separate English and French names
 */
export function parseBilingualName(name: string): { nameEn: string; nameFr: string } {
  const parts = name.split(',').map(part => part.trim());
  
  if (parts.length === 2) {
    return {
      nameEn: parts[0],
      nameFr: parts[1]
    };
  }
  
  // If no comma found, assume it's English only
  return {
    nameEn: name,
    nameFr: name
  };
}

/**
 * Gets the appropriate name based on the current language
 */
export function getLocalizedName(name: string, language: Language): string {
  const { nameEn, nameFr } = parseBilingualName(name);
  return language === 'fr' ? nameFr : nameEn;
}

/**
 * Creates a bilingual name string from separate English and French names
 */
export function createBilingualName(nameEn: string, nameFr: string): string {
  return `${nameEn}, ${nameFr}`;
}

/**
 * Validates that a bilingual name string has the correct format
 */
export function isValidBilingualName(name: string): boolean {
  const parts = name.split(',').map(part => part.trim());
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}
