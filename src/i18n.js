import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pl from './locales/pl.json'
import en from './locales/en.json'

let savedLang = 'pl'
try {
  const stored = localStorage.getItem('jumplogx_language')
  if (stored === 'en') savedLang = 'en'
} catch (e) {}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'pl',
    supportedLngs: ['pl', 'en'],
    interpolation: {
      escapeValue: false,
    },
    load: 'languageOnly',
  })

export default i18n