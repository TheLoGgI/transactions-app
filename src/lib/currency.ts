// Utility function to format currency based on user's browser locale
export function formatCurrency(amount: number, options: { 
  locale?: string
  currency?: string 
} = {}): string {
  // Get user's preferred locale from browser, fallback to 'en-US'
  const userLocale = options.locale ?? 
    (typeof window !== 'undefined' ? navigator.language : 'en-US')
  
  // Currency mapping based on common locales
  const getCurrencyForLocale = (locale: string): string => {
    const currencyMap: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP', 
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'en-NZ': 'NZD',
      'da-DK': 'DKK',
      'sv-SE': 'SEK',
      'nb-NO': 'NOK',
      'fi-FI': 'EUR',
      'de-DE': 'EUR',
      'fr-FR': 'EUR',
      'es-ES': 'EUR',
      'it-IT': 'EUR',
      'nl-NL': 'EUR',
      'pt-PT': 'EUR',
      'pl-PL': 'PLN',
      'cs-CZ': 'CZK',
      'hu-HU': 'HUF',
      'ru-RU': 'RUB',
      'ja-JP': 'JPY',
      'ko-KR': 'KRW',
      'zh-CN': 'CNY',
      'zh-TW': 'TWD',
      'th-TH': 'THB',
      'vi-VN': 'VND',
      'id-ID': 'IDR',
      'ms-MY': 'MYR',
      'ph-PH': 'PHP',
      'in-IN': 'INR',
      'ar-SA': 'SAR',
      'he-IL': 'ILS',
      'tr-TR': 'TRY',
      'pt-BR': 'BRL',
      'es-MX': 'MXN',
      'es-AR': 'ARS',
      'es-CL': 'CLP',
      'es-CO': 'COP',
      'es-PE': 'PEN',
      'fr-CA': 'CAD',
      'en-ZA': 'ZAR',
      'ar-EG': 'EGP',
      'sw-KE': 'KES',
      'am-ET': 'ETB',
      'zu-ZA': 'ZAR'
    }
    
    // Try exact match first
    if (currencyMap[locale]) {
      return currencyMap[locale]
    }
    
    // Try language part only (e.g., 'en' from 'en-US')
    const language = locale.split('-')[0]
    const languageMatch = Object.keys(currencyMap).find(key => 
      key.startsWith(language + '-')
    )
    
    if (languageMatch && currencyMap[languageMatch]) {
      return currencyMap[languageMatch]
    }
    
    // Default fallback
    return 'USD'
  }
  
  const currency = options.currency ?? getCurrencyForLocale(userLocale)
  
  try {
    return amount.toLocaleString(userLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } catch {
    // Fallback if locale/currency combination is not supported
    console.warn(`Currency formatting failed for locale ${userLocale} and currency ${currency}, falling back to USD`)
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
}

// Hook to get user's locale preferences
export function useUserLocale() {
  if (typeof window === 'undefined') {
    return 'en-US'
  }
  
  return navigator.language ?? navigator.languages?.[0] ?? 'en-US'
}
