/**
 * Currency formatting utilities for consistent display across the app
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
  'JPY': '¥',
  'CNY': '¥',
  'KRW': '₩',
  'RUB': '₽',
  'BRL': 'R$',
  'MXN': '$',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RON': 'lei',
  'BGN': 'лв',
  'HRK': 'kn',
  'RSD': 'din',
  'UAH': '₴',
  'BYN': 'Br',
  'KZT': '₸',
  'UZS': 'so\'m',
  'GEL': '₾',
  'AMD': '֏',
  'AZN': '₼',
  'MDL': 'L',
  'TJS': 'ЅМ',
  'TMT': 'T',
  'KGS': 'с',
  'VND': '₫',
  'THB': '฿',
  'MYR': 'RM',
  'IDR': 'Rp',
  'PHP': '₱',
  'BDT': '৳',
  'PKR': '₨',
  'LKR': 'Rs',
  'NPR': '₨',
  'MMK': 'K',
  'KHR': '៛',
  'LAK': '₭',
  'MNT': '₮',
  'KWD': 'د.ك',
  'QAR': 'ر.ق',
  'AED': 'د.إ',
  'SAR': 'ر.س',
  'OMR': 'ر.ع.',
  'BHD': '.د.ب',
  'JOD': 'د.ا',
  'LBP': 'ل.ل',
  'EGP': 'ج.م',
  'MAD': 'د.م.',
  'TND': 'د.ت',
  'DZD': 'د.ج',
  'NGN': '₦',
  'GHS': 'GH₵',
  'KES': 'KSh',
  'UGX': 'USh',
  'TZS': 'TSh',
  'ZAR': 'R',
  'NAD': 'N$',
  'BWP': 'P',
  'ZMW': 'ZK',
  'MWK': 'MK',
  'MZN': 'MT',
  'SZL': 'E',
  'LSL': 'L',
  'SSP': 'SSP',
  'ETB': 'Br',
  'SDG': 'ج.س.',
  'LYD': 'ل.د',
  'XOF': 'CFA',
  'XAF': 'FCFA',
  'XPF': 'CFP',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'ARS': '$',
  'UYU': '$U',
  'PYG': '₲',
  'BOB': 'Bs',
  'GTQ': 'Q',
  'HNL': 'L',
  'NIO': 'C$',
  'CRC': '₡',
  'PAB': 'B/.',
  'DOP': 'RD$',
  'JMD': 'J$',
  'TTD': 'TT$',
  'BBD': 'Bds$',
  'XCD': 'EC$',
  'AWG': 'ƒ',
  'ANG': 'ƒ',
  'SRD': '$',
  'GYD': 'G$',
  'BZD': 'BZ$',
  'BMD': 'BD$',
  'FJD': 'FJ$',
  'SBD': 'SI$',
  'VUV': 'VT',
  'WST': 'T',
  'TOP': 'T$',
  'PGK': 'K',
  'KID': '$',
  'TVD': '$T',
  'CKD': '$',
  'NIO': 'C$',
  'CRC': '₡',
  'PAB': 'B/.',
  'DOP': 'RD$',
  'JMD': 'J$',
  'TTD': 'TT$',
  'BBD': 'Bds$',
  'XCD': 'EC$',
  'AWG': 'ƒ',
  'ANG': 'ƒ',
  'SRD': '$',
  'GYD': 'G$',
  'BZD': 'BZ$',
  'BMD': 'BD$',
  'FJD': 'FJ$',
  'SBD': 'SI$',
  'VUV': 'VT',
  'WST': 'T',
  'TOP': 'T$',
  'PGK': 'K',
  'KID': '$',
  'TVD': '$T',
  'CKD': '$'
};

/**
 * Format price with appropriate currency symbol
 * @param price - The price amount
 * @param currency - The currency code (e.g., 'INR', 'USD')
 * @param showCurrencyCode - Whether to show the currency code after the symbol (default: false)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string, currency?: string, showCurrencyCode: boolean = false): string {
  if (!currency) {
    return price.toString();
  }

  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || '';
  
  if (showCurrencyCode && symbol && currency.toUpperCase() !== 'USD' && currency.toUpperCase() !== 'INR') {
    return `${symbol}${price} ${currency}`;
  }
  
  return `${symbol}${price}`;
}

/**
 * Get currency symbol for a given currency code
 * @param currency - The currency code (e.g., 'INR', 'USD')
 * @returns Currency symbol or empty string if not found
 */
export function getCurrencySymbol(currency?: string): string {
  if (!currency) return '';
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || '';
}

/**
 * Check if a currency code is supported
 * @param currency - The currency code to check
 * @returns True if the currency is supported
 */
export function isSupportedCurrency(currency?: string): boolean {
  if (!currency) return false;
  return currency.toUpperCase() in CURRENCY_SYMBOLS;
}
