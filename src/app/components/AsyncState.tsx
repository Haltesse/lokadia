import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

/**
 * États d'une donnée asynchrone : chargement, hors-ligne, erreur, vide.
 *
 * Chaque écran réinventait les siens — squelette ici, spinner là, page
 * blanche ailleurs, et l'état hors-ligne souvent oublié alors que c'est le
 * plus fréquent en voyage. Ce composant impose les quatre, avec l'ordre de
 * priorité qui compte : **hors-ligne avant erreur**, parce que « vous êtes
 * hors connexion » est une information utile là où « une erreur est
 * survenue » n'en est pas une.
 *
 * Il n'affiche pas les données : il décide seulement quoi montrer à leur
 * place. Les écrans gardent la main sur leur rendu.
 *
 * ```tsx
 * <AsyncState loading={loading} error={error} isEmpty={items.length === 0}
 *   emptyTitle="Aucun voyage" emptyDescription="…" onRetry={reload}>
 *   {items.map(…)}
 * </AsyncState>
 * ```
 */
export function AsyncState({
  loading,
  error,
  isEmpty = false,
  offline,
  skeleton = 'card',
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  children,
}: {
  loading: boolean;
  /** Message d'erreur, ou null/undefined si tout va bien */
  error?: string | null;
  isEmpty?: boolean;
  /** Force l'état hors-ligne ; sinon déduit de `navigator.onLine` */
  offline?: boolean;
  skeleton?: 'card' | 'list' | 'text';
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  onRetry?: () => void;
  children: ReactNode;
}) {
  const isOffline =
    offline ?? (typeof navigator !== 'undefined' && navigator.onLine === false);

  if (loading) {
    return (
      <div aria-busy="true" aria-live="polite">
        <SkeletonLoader type={skeleton} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="status"
        className="rounded-2xl p-6 text-center"
        style={{
          background: isOffline ? 'var(--lokadia-gray-50)' : 'var(--lokadia-danger-bg)',
          border: '1px solid var(--lokadia-gray-100)',
        }}
      >
        {isOffline ? (
          <WifiOff className="mx-auto h-8 w-8" style={{ color: 'var(--lokadia-gray-500)' }} />
        ) : (
          <AlertTriangle className="mx-auto h-8 w-8" style={{ color: 'var(--lokadia-danger)' }} />
        )}
        <p className="mt-3 font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          {isOffline ? 'Vous êtes hors connexion' : 'Chargement impossible'}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
          {isOffline
            ? "Les données déjà consultées restent lisibles, avec leur date de capture. Le reste reviendra dès le retour du réseau."
            : error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="lk-btn mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            <RefreshCw size={15} />
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (isEmpty && emptyTitle) {
    return (
      <EmptyState
        icon={emptyIcon ?? <AlertTriangle className="h-8 w-8" />}
        title={emptyTitle}
        description={emptyDescription ?? ''}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
