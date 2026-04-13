import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguageSafe, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

export function LanguageSelector() {
  const context = useLanguageSafe();
  const [isOpen, setIsOpen] = useState(false);
  
  // Protection contre contexte non disponible
  if (!context) return null;
  
  const { language, setLanguage } = context;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de sélection */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-xl">{SUPPORTED_LANGUAGES[language].flag}</span>
        <span className="font-medium text-gray-700 text-sm hidden sm:inline">
          {SUPPORTED_LANGUAGES[language].name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            Choisir une langue
          </div>
          
          <div className="py-1 max-h-80 overflow-y-auto">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                  language === code ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                <span className="text-2xl">{flag}</span>
                <span className={`font-medium text-sm ${language === code ? 'text-blue-600' : 'text-gray-700'}`}>
                  {name}
                </span>
                {language === code && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}