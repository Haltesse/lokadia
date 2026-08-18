import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Building2,
  FileText,
  Heart,
  Keyboard,
  MapPin,
  Moon,
  Route as RouteIcon,
  Search,
  Shield,
  Sun,
  User,
  Activity,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';
import { useTheme } from '../context/ThemeContext';
import type { DestinationDetails } from '../data/types';

/**
 * Palette de commandes (⌘K) et raccourcis clavier.
 *
 * Sur desktop, l'application se navigue à la souris depuis une interface
 * pensée mobile : la palette rend l'usage clavier possible sans refaire
 * les écrans. Elle cherche dans le catalogue de destinations avec le même
 * moteur tolérant aux fautes que l'écran de recherche.
 *
 * Détail qui compte pour le poids : le catalogue de destinations
 * (~190 ko) est chargé **à la première ouverture**, pas au démarrage. La
 * palette est montée globalement ; l'importer statiquement ramènerait
 * tout le jeu de données dans le bundle initial, ce que le Lot 0 avait
 * justement découpé.
 */

interface PaletteContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
  openShortcuts: () => void;
}

const PaletteContext = createContext<PaletteContextValue>({
  open: false,
  setOpen: () => {},
  openShortcuts: () => {},
});

export function useCommandPalette(): PaletteContextValue {
  return useContext(PaletteContext);
}

/** Vrai si l'utilisateur est en train de saisir du texte quelque part. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

interface NavItem {
  label: string;
  hint: string;
  path: string;
  Icon: typeof Search;
}

const NAVIGATION: NavItem[] = [
  { label: 'Accueil', hint: 'Destinations mises en avant', path: '/global-home', Icon: MapPin },
  { label: 'Explorer les destinations', hint: 'Recherche tolérante aux fautes', path: '/search', Icon: Search },
  { label: 'Toutes les destinations', hint: 'Catalogue complet', path: '/all-destinations', Icon: MapPin },
  { label: 'Alertes', hint: 'Sources officielles et destinations suivies', path: '/alerts', Icon: Bell },
  { label: 'Mes voyages', hint: 'Voyages enregistrés', path: '/trips', Icon: RouteIcon },
  { label: 'Planificateur', hint: 'Itinéraire jour par jour', path: '/trips/map-planner', Icon: RouteIcon },
  { label: 'Mes favoris', hint: 'Destinations mises de côté', path: '/favorites', Icon: Heart },
  { label: 'Mon profil', hint: 'Préférences, nationalité, thème', path: '/profile', Icon: User },
  { label: 'Méthodologie du Lokascore', hint: 'Sources, limites, FAQ', path: '/lokascore', Icon: Shield },
  { label: 'Lokadia Pro', hint: 'Offre entreprise', path: '/pro', Icon: Building2 },
  { label: 'Statut des services', hint: 'Vérification en direct', path: '/statut', Icon: Activity },
  { label: 'Mentions légales', hint: 'Éditeur et hébergement', path: '/mentions-legales', Icon: FileText },
  { label: "Conditions d'utilisation", hint: 'Portée exacte des informations', path: '/cgu', Icon: FileText },
  { label: 'Confidentialité', hint: 'Données, droits, effacement', path: '/confidentialite', Icon: FileText },
];

export const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: '⌘ K  /  Ctrl K', description: 'Ouvrir la palette de commandes' },
  { keys: '?', description: 'Afficher cette aide' },
  { keys: 'T', description: 'Basculer entre thème clair et sombre' },
  { keys: '↑ ↓', description: 'Parcourir les résultats de la palette' },
  { keys: 'Entrée', description: 'Ouvrir le résultat sélectionné' },
  { keys: 'Échap', description: 'Fermer la palette ou la boîte de dialogue' },
];

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DestinationDetails[]>([]);

  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);

  // ─── Raccourcis globaux ───
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      // Les touches simples ne déclenchent rien pendant une saisie, sinon
      // écrire « t » dans un champ basculerait le thème.
      if (isTyping(event.target) || meta || event.altKey) return;
      if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key.toLowerCase() === 't') {
        toggle();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  // ─── Recherche de destinations, catalogue chargé à la demande ───
  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { searchDestinations } = await import('../lib/destinationSearch');
      if (cancelled) return;
      const found = searchDestinations(term);
      setResults(
        [...found.cities, ...found.countries].slice(0, 8).map((hit) => hit.destination),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery('');
      navigate(path);
    },
    [navigate],
  );

  const value = useMemo(
    () => ({ open, setOpen, openShortcuts }),
    [open, openShortcuts],
  );

  // Filtrage maison, puisque celui de cmdk est désactivé. Simple mais
  // suffisant pour des libellés connus : accents et casse ignorés.
  const normalized = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const matches = (...fields: string[]) =>
    normalized.length === 0 ||
    fields.some((field) =>
      field
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .includes(normalized),
    );
  const navigation = NAVIGATION.filter((item) => matches(item.label, item.hint));

  return (
    <PaletteContext.Provider value={value}>
      {children}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Palette de commandes"
        description="Cherchez une destination ou une page, puis validez avec Entrée."
        // Le filtre interne de cmdk est désactivé : il annulait la
        // tolérance aux fautes du moteur maison (« tokio » ne ressortait
        // pas, alors que la recherche, elle, trouvait Tokyo).
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder="Destination, page, action…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim().length < 2
              ? 'Saisissez au moins deux lettres.'
              : 'Aucun résultat.'}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Destinations">
              {results.map((destination) => (
                <CommandItem
                  key={destination.id}
                  value={`destination ${destination.name} ${destination.country}`}
                  onSelect={() => go(`/destination/${destination.id}`)}
                >
                  <MapPin />
                  <span>
                    {destination.name}
                    <span className="opacity-60"> · {destination.country}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {navigation.length > 0 && (
          <CommandGroup heading="Aller à">
            {navigation.map((item) => (
              <CommandItem
                key={item.path}
                value={`${item.label} ${item.hint}`}
                onSelect={() => go(item.path)}
              >
                <item.Icon />
                <span>
                  {item.label}
                  <span className="opacity-60"> · {item.hint}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          )}

          <CommandSeparator />

          {matches("theme", "thème", "sombre", "clair", "raccourcis", "clavier", "aide", "apparence") && (
          <CommandGroup heading="Actions">
            <CommandItem
              value="theme thème sombre clair apparence"
              onSelect={() => {
                toggle();
                setOpen(false);
              }}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
              <span>{theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}</span>
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="raccourcis clavier aide"
              onSelect={() => {
                setOpen(false);
                setShortcutsOpen(true);
              }}
            >
              <Keyboard />
              <span>Raccourcis clavier</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </PaletteContext.Provider>
  );
}

/** Aide raccourcis — la documentation vit à côté de la fonctionnalité. */
function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Raccourcis clavier"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 23, 0.55)' }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'var(--lokadia-surface)', boxShadow: 'var(--shadow-2xl)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <Keyboard size={18} style={{ color: 'var(--lokadia-primary)' }} />
          Raccourcis clavier
        </h2>
        <ul className="mt-4 space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                {shortcut.description}
              </span>
              <kbd
                className="flex-shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs font-bold"
                style={{
                  background: 'var(--lokadia-background-subtle)',
                  color: 'var(--lokadia-gray-700)',
                  border: '1px solid var(--lokadia-gray-200)',
                }}
              >
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="lk-btn mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: 'var(--lokadia-primary)' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

/**
 * Déclencheur visible de la palette. Un raccourci qu'on ne découvre qu'en
 * lisant la documentation n'existe pas : le bouton l'annonce.
 */
export function CommandPaletteTrigger() {
  const { setOpen } = useCommandPalette();
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Ouvrir la recherche rapide"
      className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors lg:inline-flex"
      style={{
        background: 'var(--lokadia-background-subtle)',
        color: 'var(--lokadia-gray-600)',
        border: '1px solid var(--lokadia-gray-200)',
      }}
    >
      <Search className="h-4 w-4" />
      Rechercher
      <kbd
        className="rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold"
        style={{ background: 'var(--lokadia-surface)', color: 'var(--lokadia-gray-500)' }}
      >
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  );
}
