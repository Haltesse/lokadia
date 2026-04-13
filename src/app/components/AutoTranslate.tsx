// AutoTranslate: applies RTL for Arabic, adjusts font for CJK
import { useEffect } from "react";
import { useLanguageSafe } from "../context/LanguageContext";

export function AutoTranslate() {
  const ctx = useLanguageSafe();

  useEffect(() => {
    if (!ctx) return;
    const { language } = ctx;
    const html = document.documentElement;

    if (language === "ar") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", "ar");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", language);
    }
  }, [ctx]);

  return null;
}
