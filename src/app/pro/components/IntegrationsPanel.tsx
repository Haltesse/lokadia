import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Copy, KeyRound, Plug, ShieldOff, Trash2, Webhook } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../../../utils/supabase/info';
import type { Database } from '../../lib/database.types';

type ApiKey = Database['public']['Tables']['api_keys']['Row'];
type WebhookRow = Database['public']['Tables']['webhooks']['Row'];
type Delivery = Database['public']['Tables']['webhook_deliveries']['Row'];

const API_URL = `https://${projectId}.supabase.co/functions/v1/org-api`;

/**
 * Intégrations : clés d'API et webhooks (P6).
 *
 * Deux partis pris visibles à l'écran :
 *
 *  · **La clé n'apparaît qu'une fois.** Seul son haché est stocké ; nous
 *    ne pouvons pas la relire, et c'est écrit noir sur blanc plutôt que
 *    découvert le jour où quelqu'un la redemande.
 *
 *  · **Le journal de livraison est montré**, succès comme échecs. Sans
 *    lui, « on ne reçoit rien » se débogue à l'aveugle des deux côtés.
 */
export function IntegrationsPanel({
  orgId,
  isAdmin,
}: {
  orgId: string;
  isAdmin: boolean;
}) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [hooks, setHooks] = useState<WebhookRow[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [hookUrl, setHookUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const [k, w, d] = await Promise.all([
      supabase.from('api_keys').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      supabase.from('webhooks').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
      supabase.from('webhook_deliveries').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(10),
    ]);
    setKeys(k.data ?? []);
    setHooks(w.data ?? []);
    setDeliveries(d.data ?? []);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey(event: FormEvent) {
    event.preventDefault();
    setError('');
    setFreshKey(null);
    if (label.trim().length < 2) {
      setError('Donnez un libellé à la clé (ex. « Intégration RH »).');
      return;
    }
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ org_id: orgId, label: label.trim() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? 'Création impossible.');
      setFreshKey(body.key as string);
      setLabel('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(id: string) {
    await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id);
    await load();
  }

  async function createHook(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!hookUrl.startsWith('https://')) {
      setError('L’adresse doit commencer par https:// — un webhook en clair transporterait des données de sécurité.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      // Secret de signature genere cote client puis stocke : il doit etre
      // lisible par l'organisation, qui en a besoin pour verifier nos envois.
      const secretBytes = crypto.getRandomValues(new Uint8Array(24));
      const secret = [...secretBytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      const { error: insertError } = await supabase.from('webhooks').insert({
        org_id: orgId,
        url: hookUrl.trim(),
        secret,
        created_by: data.user?.id ?? '',
      });
      if (insertError) throw insertError;
      setHookUrl('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl p-5" style={{ background: 'var(--lokadia-gray-50)' }}>
        <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
          Les clés d'API et les webhooks sont réservés aux administrateurs de
          l'organisation : ce sont des accès machine, ils ne se distribuent pas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Clés d'API ─── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <KeyRound size={16} style={{ color: 'var(--lokadia-primary)' }} />
          Clés d'API
        </h3>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          Lecture seule : missions, effectif, alertes de veille, évaluations de
          risque. L'écriture n'est pas ouverte — sur des données de sécurité,
          mieux vaut pas d'API du tout qu'une API à moitié pensée.
        </p>

        <form onSubmit={createKey} className="mt-3 flex flex-wrap gap-2">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Libellé (ex. Intégration RH)"
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--lokadia-gray-200)', minWidth: 220 }}
          />
          <button
            type="submit"
            disabled={busy}
            className="lk-btn rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            Générer une clé
          </button>
        </form>

        {freshKey && (
          <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--lokadia-warning-bg)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--lokadia-warning)' }}>
              Copiez-la maintenant — elle ne sera plus jamais affichée
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code
                className="flex-1 break-all rounded-lg px-2 py-1.5 font-mono text-xs"
                style={{ background: 'var(--lokadia-surface)', color: 'var(--lokadia-gray-900)' }}
              >
                {freshKey}
              </code>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(freshKey);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-lg p-2"
                aria-label="Copier la clé"
              >
                <Copy size={15} style={{ color: 'var(--lokadia-primary)' }} />
              </button>
            </div>
            {copied && (
              <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-success)' }}>
                Copiée.
              </p>
            )}
            <p className="mt-2 text-[11px] leading-4" style={{ color: 'var(--lokadia-gray-600)' }}>
              Seul son empreinte est conservée : nous ne pouvons pas la relire, et
              personne d'autre non plus.
            </p>
          </div>
        )}

        <ul className="mt-3 space-y-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
              style={{ borderColor: 'var(--lokadia-gray-100)', opacity: key.revoked_at ? 0.55 : 1 }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {key.label}
                </p>
                <p className="font-mono text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                  {key.prefix}…
                  {key.last_used_at
                    ? ` · utilisée le ${new Date(key.last_used_at).toLocaleDateString('fr-FR')}`
                    : ' · jamais utilisée'}
                  {key.revoked_at ? ' · révoquée' : ''}
                </p>
              </div>
              {!key.revoked_at && (
                <button
                  type="button"
                  onClick={() => void revokeKey(key.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: 'var(--lokadia-danger)' }}
                >
                  <ShieldOff size={13} /> Révoquer
                </button>
              )}
            </li>
          ))}
          {keys.length === 0 && (
            <li className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Aucune clé pour le moment.
            </li>
          )}
        </ul>

        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
            Comment appeler l'API
          </summary>
          <pre
            className="mt-2 overflow-x-auto rounded-xl p-3 text-[11px] leading-5"
            style={{ background: 'var(--lokadia-gray-50)', color: 'var(--lokadia-gray-700)' }}
          >{`curl "${API_URL}/v1/missions" \\
  -H "Authorization: Bearer lok_live_…"

Ressources : missions · travelers · alerts · risk
Réponse : { resource, count, data: [...] }`}</pre>
        </details>
      </section>

      {/* ─── Webhooks ─── */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <Webhook size={16} style={{ color: 'var(--lokadia-primary)' }} />
          Webhooks
        </h3>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          Événements poussés vers votre système : alerte de veille, ouverture de
          crise, réponse à un check-in. Chaque envoi est signé (HMAC-SHA256, en-tête
          <code className="mx-1">X-Lokadia-Signature</code>) : vérifiez la signature
          avant d'agir sur le contenu.
        </p>

        <form onSubmit={createHook} className="mt-3 flex flex-wrap gap-2">
          <input
            value={hookUrl}
            onChange={(event) => setHookUrl(event.target.value)}
            placeholder="https://votre-systeme.exemple/lokadia"
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--lokadia-gray-200)', minWidth: 240 }}
          />
          <button
            type="submit"
            disabled={busy}
            className="lk-btn rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            Ajouter
          </button>
        </form>

        <ul className="mt-3 space-y-2">
          {hooks.map((hook) => (
            <li
              key={hook.id}
              className="rounded-xl border p-3"
              style={{ borderColor: 'var(--lokadia-gray-100)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 break-all text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {hook.url}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.from('webhooks').delete().eq('id', hook.id);
                    await load();
                  }}
                  aria-label="Supprimer ce webhook"
                  className="rounded-lg p-1.5"
                >
                  <Trash2 size={14} style={{ color: 'var(--lokadia-gray-500)' }} />
                </button>
              </div>
              <p className="mt-1 font-mono text-[11px] break-all" style={{ color: 'var(--lokadia-gray-500)' }}>
                secret : {hook.secret}
              </p>
              <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                {hook.events.join(' · ')}
                {hook.failure_count > 0 ? ` · ${hook.failure_count} échec(s) consécutif(s)` : ''}
              </p>
            </li>
          ))}
          {hooks.length === 0 && (
            <li className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Aucun webhook configuré.
            </li>
          )}
        </ul>

        {deliveries.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
              Dernières livraisons
            </p>
            <ul className="mt-1.5 space-y-1">
              {deliveries.map((delivery) => (
                <li key={delivery.id} className="text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>
                  {new Date(delivery.created_at).toLocaleString('fr-FR')} · {delivery.event} ·{' '}
                  <span
                    style={{
                      color: delivery.error ? 'var(--lokadia-danger)' : 'var(--lokadia-success)',
                    }}
                  >
                    {delivery.error ?? `HTTP ${delivery.status_code}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ─── SSO : dit franchement ─── */}
      <section
        className="rounded-2xl p-4"
        style={{ background: 'var(--lokadia-gray-50)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <Plug size={16} style={{ color: 'var(--lokadia-gray-500)' }} />
          SSO SAML et SCIM — non disponibles aujourd'hui
        </h3>
        <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          Le SSO SAML repose sur une option payante de notre hébergeur
          d'authentification, non activée sur ce projet ; l'approvisionnement
          SCIM demande en plus un connecteur dédié par annuaire. Les annoncer
          comme disponibles serait vous les vendre sans pouvoir les livrer.
          L'invitation nominative par e-mail et les rôles couvrent le besoin en
          attendant.
        </p>
      </section>

      {error && (
        <p className="text-sm font-semibold" role="alert" style={{ color: 'var(--lokadia-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
