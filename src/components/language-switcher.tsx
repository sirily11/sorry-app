'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    router.refresh();
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-pink-100 transition-colors group"
        aria-label="Change language"
      >
        <Globe className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
        <span className="text-sm font-medium text-gray-600 group-hover:text-pink-600">
          {currentLanguage.flag}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-20 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-w-[180px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors flex items-center gap-3 ${
                  i18n.language === lang.code ? 'bg-pink-50 text-pink-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
