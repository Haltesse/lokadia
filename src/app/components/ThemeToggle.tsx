import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../context/ThemeContext';

/**
 * Bascule de thème.
 *
 * `variant="icon"` : un seul bouton clair ↔ sombre, pour les barres de
 * navigation où la place manque.
 * `variant="segmented"` : les trois choix, dont « Système », pour l'écran
 * de réglages — c'est là qu'on veut pouvoir revenir au réglage de
 * l'appareil, ce qu'un simple interrupteur ne permet jamais.
 */

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
  { value: 'system', label: 'Système', Icon: Monitor },
];

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'segmented' }) {
  const { preference, theme, setPreference, toggle } = useTheme();

  if (variant === 'icon') {
    const nextLabel = theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre';
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={nextLabel}
        title={nextLabel}
        className="lk-btn inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        style={{ color: 'var(--lokadia-gray-600)' }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'interface"
      className="grid grid-cols-3 gap-1 rounded-2xl p-1"
      style={{ background: 'var(--lokadia-background-subtle)' }}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: active ? 'var(--lokadia-surface)' : 'transparent',
              color: active ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)',
              boxShadow: active ? 'var(--shadow-sm)' : undefined,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
