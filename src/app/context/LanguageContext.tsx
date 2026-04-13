import { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en" | "es" | "de" | "it" | "pt" | "ar" | "zh" | "ja";

interface Translations {
  nav: {
    home: string;
    alerts: string;
    profile: string;
    trips: string;
    community: string;
  };
  home: {
    greeting: string;
    search: string;
    destinations: string;
    trending: string;
    seeAll: string;
    featured: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    done: string;
  };
}

const translations: Record<Language, Translations> = {
  fr: {
    nav: { home: "Accueil", alerts: "Alertes", profile: "Profil", trips: "Voyages", community: "Social" },
    home: { greeting: "Bonjour", search: "Rechercher une destination…", destinations: "Destinations", trending: "Tendances", seeAll: "Voir tout", featured: "À la une" },
    common: { loading: "Chargement…", error: "Erreur", retry: "Réessayer", cancel: "Annuler", save: "Enregistrer", delete: "Supprimer", edit: "Modifier", close: "Fermer", back: "Retour", next: "Suivant", done: "Terminé" },
  },
  en: {
    nav: { home: "Home", alerts: "Alerts", profile: "Profile", trips: "Trips", community: "Social" },
    home: { greeting: "Hello", search: "Search a destination…", destinations: "Destinations", trending: "Trending", seeAll: "See all", featured: "Featured" },
    common: { loading: "Loading…", error: "Error", retry: "Retry", cancel: "Cancel", save: "Save", delete: "Delete", edit: "Edit", close: "Close", back: "Back", next: "Next", done: "Done" },
  },
  es: {
    nav: { home: "Inicio", alerts: "Alertas", profile: "Perfil", trips: "Viajes", community: "Social" },
    home: { greeting: "Hola", search: "Buscar destino…", destinations: "Destinos", trending: "Tendencias", seeAll: "Ver todo", featured: "Destacado" },
    common: { loading: "Cargando…", error: "Error", retry: "Reintentar", cancel: "Cancelar", save: "Guardar", delete: "Eliminar", edit: "Editar", close: "Cerrar", back: "Atrás", next: "Siguiente", done: "Listo" },
  },
  de: {
    nav: { home: "Startseite", alerts: "Benachrichtigungen", profile: "Profil", trips: "Reisen", community: "Social" },
    home: { greeting: "Hallo", search: "Reiseziel suchen…", destinations: "Reiseziele", trending: "Beliebt", seeAll: "Alle sehen", featured: "Empfohlen" },
    common: { loading: "Laden…", error: "Fehler", retry: "Wiederholen", cancel: "Abbrechen", save: "Speichern", delete: "Löschen", edit: "Bearbeiten", close: "Schließen", back: "Zurück", next: "Weiter", done: "Fertig" },
  },
  it: {
    nav: { home: "Home", alerts: "Avvisi", profile: "Profilo", trips: "Viaggi", community: "Social" },
    home: { greeting: "Ciao", search: "Cerca destinazione…", destinations: "Destinazioni", trending: "Tendenze", seeAll: "Vedi tutto", featured: "In evidenza" },
    common: { loading: "Caricamento…", error: "Errore", retry: "Riprova", cancel: "Annulla", save: "Salva", delete: "Elimina", edit: "Modifica", close: "Chiudi", back: "Indietro", next: "Avanti", done: "Fatto" },
  },
  pt: {
    nav: { home: "Início", alerts: "Alertas", profile: "Perfil", trips: "Viagens", community: "Social" },
    home: { greeting: "Olá", search: "Pesquisar destino…", destinations: "Destinos", trending: "Tendências", seeAll: "Ver tudo", featured: "Destaque" },
    common: { loading: "Carregando…", error: "Erro", retry: "Tentar novamente", cancel: "Cancelar", save: "Salvar", delete: "Excluir", edit: "Editar", close: "Fechar", back: "Voltar", next: "Próximo", done: "Concluído" },
  },
  ar: {
    nav: { home: "الرئيسية", alerts: "التنبيهات", profile: "الملف", trips: "الرحلات", community: "المجتمع" },
    home: { greeting: "مرحباً", search: "ابحث عن وجهة…", destinations: "الوجهات", trending: "الأكثر رواجاً", seeAll: "عرض الكل", featured: "مميز" },
    common: { loading: "جارٍ التحميل…", error: "خطأ", retry: "إعادة المحاولة", cancel: "إلغاء", save: "حفظ", delete: "حذف", edit: "تعديل", close: "إغلاق", back: "رجوع", next: "التالي", done: "تم" },
  },
  zh: {
    nav: { home: "首页", alerts: "提醒", profile: "我的", trips: "行程", community: "社区" },
    home: { greeting: "你好", search: "搜索目的地…", destinations: "目的地", trending: "热门", seeAll: "查看全部", featured: "精选" },
    common: { loading: "加载中…", error: "错误", retry: "重试", cancel: "取消", save: "保存", delete: "删除", edit: "编辑", close: "关闭", back: "返回", next: "下一步", done: "完成" },
  },
  ja: {
    nav: { home: "ホーム", alerts: "アラート", profile: "プロフィール", trips: "旅行", community: "コミュニティ" },
    home: { greeting: "こんにちは", search: "目的地を検索…", destinations: "目的地", trending: "トレンド", seeAll: "すべて表示", featured: "おすすめ" },
    common: { loading: "読み込み中…", error: "エラー", retry: "再試行", cancel: "キャンセル", save: "保存", delete: "削除", edit: "編集", close: "閉じる", back: "戻る", next: "次へ", done: "完了" },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const availableLanguages: { code: Language; name: string; flag: string }[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("lokadia_lang") as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lokadia_lang", lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language], availableLanguages }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useLanguageSafe() {
  return useContext(LanguageContext);
}
