/**
 * BriefingAckScreen — page publique d'accusé de lecture (route /briefing/:token).
 *
 * Le voyageur ouvre son lien personnel, lit le briefing (avec sa source
 * officielle et sa date), puis signe de son nom. L'horodatage est posé
 * côté serveur par l'Edge Function `briefing-ack` — le client ne peut pas
 * l'écrire lui-même, c'est ce qui rend la preuve opposable.
 *
 * Aucun compte requis : la friction tuerait le taux de signature, qui est
 * précisément l'indicateur que l'organisation doit présenter.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { ShieldCheck, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface AckData {
  organization: string;
  briefing: {
    title: string; content: string; source: string;
    source_url: string | null; country_name: string; updated_at: string;
  } | null;
  traveler: { first_name: string; last_name: string } | null;
  mission: { country_name: string; city: string | null; date_start: string; date_end: string } | null;
  sent_at: string;
  read_at: string | null;
  read_name: string | null;
}

const FN_URL = `https://${projectId}.supabase.co/functions/v1/briefing-ack`;

export default function BriefingAckScreen() {
  const { token = '' } = useParams<{ token: string }>();
  const [data, setData] = useState<AckData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const body = await res.json();
      if (!res.ok) {
        setErrorMsg(body?.error ?? 'Ce lien n\'est pas valide.');
        setStatus('error');
        return;
      }
      setData(body as AckData);
      const t = body.traveler as AckData['traveler'];
      if (t && !body.read_at) setName(`${t.first_name} ${t.last_name}`);
      setStatus('ready');
    } catch {
      setErrorMsg('Connexion impossible. Vérifiez votre réseau et rechargez la page.');
      setStatus('error');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function sign(e: FormEvent) {
    e.preventDefault();
    setSignError('');
    if (name.trim().length < 2) {
      setSignError('Indiquez votre nom complet pour signer.');
      return;
    }
    setSigning(true);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ token, name: name.trim() }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSignError(body?.error ?? 'Enregistrement impossible.');
        return;
      }
      setData(body as AckData);
    } catch {
      setSignError('Connexion impossible. Réessayez dans un instant.');
    } finally {
      setSigning(false);
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen px-5 py-10" style={{ background: 'var(--lokadia-background)' }} aria-busy="true">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="lk-skeleton h-10 w-2/3 rounded-xl" />
          <div className="lk-skeleton h-64 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (status === 'error' || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-3" size={36} style={{ color: 'var(--lokadia-gray-300)' }} />
          <h1 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Ce lien n'est pas accessible</h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
          <p className="mt-4 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Rapprochez-vous du service qui vous a transmis ce briefing pour obtenir un nouveau lien.
          </p>
        </div>
      </main>
    );
  }

  const signed = !!data.read_at;

  return (
    <main className="min-h-screen px-5 py-8" style={{ background: 'var(--lokadia-background)' }}>
      <div className="mx-auto max-w-2xl space-y-4">
        {/* En-tête */}
        <header className="rounded-3xl p-6 text-white" style={{ background: 'var(--lokadia-primary)' }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
            <ShieldCheck size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wide">Briefing pré-départ</span>
          </div>
          <h1 className="text-xl font-bold leading-tight">{data.briefing?.title ?? 'Briefing de sécurité'}</h1>
          <p className="mt-1.5 text-sm text-white/85">
            {data.organization}
            {data.mission && ` · ${data.mission.city ? data.mission.city + ', ' : ''}${data.mission.country_name}`}
          </p>
          {data.mission && (
            <p className="mt-0.5 text-xs text-white/70">
              Du {new Date(data.mission.date_start + 'T00:00:00').toLocaleDateString('fr-FR')} au{' '}
              {new Date(data.mission.date_end + 'T00:00:00').toLocaleDateString('fr-FR')}
            </p>
          )}
        </header>

        {/* Contenu */}
        <article className="rounded-2xl bg-white p-6" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
            {data.briefing?.content ?? 'Contenu indisponible.'}
          </p>

          {data.briefing && (
            <div className="mt-5 rounded-xl p-3.5" style={{ background: 'var(--lokadia-info-bg)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Source</p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--lokadia-gray-800)' }}>{data.briefing.source}</p>
              {data.briefing.source_url && (
                <a href={data.briefing.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
                  Consulter la source officielle <ExternalLink size={11} />
                </a>
              )}
              <p className="mt-1.5 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                Mis à jour le {new Date(data.briefing.updated_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </article>

        {/* Signature */}
        {signed ? (
          <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <CheckCircle2 className="mx-auto mb-2" size={32} style={{ color: '#059669' }} />
            <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Accusé de lecture enregistré</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Signé par <strong>{data.read_name}</strong> le{' '}
              {new Date(data.read_at as string).toLocaleString('fr-FR')}.
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
              Votre organisation conserve cette confirmation dans son registre de conformité.
              Vous pouvez fermer cette page — le lien reste consultable si vous souhaitez relire le briefing.
            </p>
          </div>
        ) : (
          <form onSubmit={sign} className="rounded-2xl bg-white p-6" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Accusé de lecture</h2>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
              En signant, vous confirmez avoir lu et compris ce briefing. Votre nom et la date
              seront enregistrés dans le registre de conformité de votre organisation.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Nom complet</span>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setSignError(''); }}
                autoComplete="name"
                className="w-full rounded-xl border px-3.5 py-3 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
            </label>
            {signError && <p className="mt-2 text-sm font-semibold text-red-600">{signError}</p>}
            <button
              type="submit"
              disabled={signing}
              className="mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              {signing ? 'Enregistrement…' : 'Je confirme avoir lu ce briefing'}
            </button>
          </form>
        )}

        <p className="pb-6 text-center text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>
          Lokadia Pro · Les informations de ce briefing proviennent de la source citée ci-dessus
          et ne se substituent pas aux recommandations officielles en vigueur.
        </p>
      </div>
    </main>
  );
}
