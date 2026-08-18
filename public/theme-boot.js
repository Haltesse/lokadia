/**
 * Applique le thème avant le premier rendu.
 *
 * Chargé de façon bloquante dans le <head> : c'est le seul moyen d'éviter
 * le flash blanc sur une page sombre, et le fichier fait quelques
 * centaines d'octets. Il vit dans `public/` plutôt qu'en script inline
 * parce que la politique de sécurité de contenu interdit `unsafe-inline`.
 *
 * La logique est volontairement dupliquée avec `ThemeContext` : ici le
 * strict minimum pour peindre juste, là-bas la gestion complète.
 */
(function () {
  try {
    var saved = localStorage.getItem('lokadia_theme');
    var dark =
      saved === 'dark' ||
      (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (!dark) return;
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#0B1220');
  } catch (e) {
    /* stockage indisponible : on reste en clair */
  }
})();
