import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();

  const langs = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
  ];

  const change = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('sahtech_lang', code);
    document.documentElement.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', code);
  };

  return (
    <div className={`flex items-center gap-1 ${compact ? '' : 'bg-gray-100 rounded-lg p-1'}`}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => change(l.code)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
            i18n.language === l.code
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 hover:text-primary hover:bg-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
