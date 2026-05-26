import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Shield,
  Bell,
  Wifi,
  ShieldCheck,
  Hotel,
  Ticket,
  Plane,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Building2,
  Briefcase,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { registerLandingSignup } from '../lib/landingSignupService';
import { useLokascore } from '../hooks/useLokascore';

/**
 * Landing page publique à la racine /.
 * Objectifs :
 * - Capturer des emails (validation pré-lancement Phase 0A)
 * - Communiquer le positionnement "assistant sécurité + logistique" (pas réseau social)
 * - Exposer Lokascore (actif défensable)
 * - Montrer les partenaires de commissions (crédibilité modèle)
 * - Appel B2B vers /pro
 */
export default function LandingScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const {
    score: lisbonLokascore,
    safetyLevel: lisbonSafetyLevel,
    loading: lisbonScoreLoading,
    lastUpdate: lisbonLastUpdate,
  } = useLokascore('lisbon-portugal');
  const lisbonScoreLabel =
    lisbonScoreLoading && lisbonLokascore === null
      ? '...'
      : lisbonLokascore !== null
      ? lisbonLokascore
      : '--';
  const lisbonSafetyLabel =
    lisbonLokascore === null
      ? 'Score live indisponible'
      : lisbonSafetyLevel === 'safe'
      ? 'Très sûr'
      : lisbonSafetyLevel === 'danger'
      ? 'Risque'
      : 'Vigilance';
  const lisbonCardGradient =
    lisbonLokascore === null
      ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
      : lisbonSafetyLevel === 'safe'
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      : lisbonSafetyLevel === 'danger'
      ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const res = await registerLandingSignup(email, 'landing-hero');
    if (res.ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(15, 76, 129, 0.92) 0%, rgba(19, 64, 116, 0.88) 60%, rgba(6, 182, 212, 0.75) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-28 pb-16 md:pb-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md mb-5"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <Shield className="h-4 w-4 text-white" />
                <span className="text-xs font-semibold text-white tracking-wide">
                  L'ASSISTANT SÉCURITÉ VOYAGEUR
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5"
              >
                Voyage partout.<br />
                <span style={{ color: '#FCD34D' }}>En toute sécurité.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-xl"
              >
                Score Lokascore en temps réel, alertes géolocalisées officielles,
                et réservation intégrée des essentiels. Tout dans une seule app.
              </motion.p>

              {/* Email capture */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-6 max-w-xl"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton.email@exemple.com"
                  disabled={status === 'loading' || status === 'success'}
                  className="flex-1 px-5 py-4 rounded-2xl text-base outline-none bg-white"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="px-7 py-4 rounded-2xl font-semibold text-base whitespace-nowrap transition-all flex items-center justify-center gap-2"
                  style={{
                    background: status === 'success' ? '#10B981' : '#FCD34D',
                    color: status === 'success' ? 'white' : '#0F4C81',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  {status === 'loading' && 'Envoi...'}
                  {status === 'success' && (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Inscrit !
                    </>
                  )}
                  {(status === 'idle' || status === 'error') && (
                    <>
                      Rejoindre la liste <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </motion.form>

              {status === 'error' && (
                <p className="text-sm text-red-300 mb-4">{errorMsg}</p>
              )}
              {status === 'success' && (
                <p className="text-sm text-white/90 mb-4">
                  Merci ! Tu seras parmi les premiers informés au lancement.
                </p>
              )}

              <p className="text-sm text-white/70">
                Lancement 2027 · Déjà plus de 300 voyageurs inscrits
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/global-home')}
                  className="px-5 py-3 rounded-full font-semibold text-sm bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                >
                  Explorer la démo
                </button>
                <button
                  onClick={() => navigate('/pro')}
                  className="px-5 py-3 rounded-full font-semibold text-sm bg-transparent text-white border border-white/30 hover:bg-white/10 transition-all"
                >
                  Espace Pro (B2B)
                </button>
              </div>
            </div>

            {/* Visuel side — Lokascore card preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div
                className="rounded-3xl p-7 bg-white/95 backdrop-blur-md"
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <MapPin className="h-5 w-5" style={{ color: 'var(--lokadia-primary)' }} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-500)' }}>
                      Destination
                    </p>
                    <p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                      Lisbonne, Portugal
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl p-5 mb-5" style={{ background: lisbonCardGradient }}>
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">Lokascore</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{lisbonScoreLabel}</span>
                    <span className="text-lg text-white/80">/ 100</span>
                  </div>
                  <p className="text-sm text-white/90 mt-1">
                    {lisbonLokascore !== null
                      ? `${lisbonSafetyLabel} · MAJ ${lisbonLastUpdate}`
                      : lisbonSafetyLabel}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Risque politique', value: 92 },
                    { label: 'Santé & sanitaire', value: 90 },
                    { label: 'Transports', value: 85 },
                    { label: 'Criminalité', value: 82 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--lokadia-gray-600)' }}>{row.label}</span>
                        <span className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {row.value}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.value}%`, background: 'var(--lokadia-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Bell className="h-4 w-4" style={{ color: '#F59E0B' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--lokadia-gray-800)' }}>
                    Alerte : grève métro prévue le 23 août · Prévois +20 min
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 piliers */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--lokadia-gray-900)' }}>
            Trois piliers. Un seul outil.
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--lokadia-gray-600)' }}>
            Sécurité, logistique et réservation. Aucun acteur ne couvre ces trois dimensions en 2026.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Lokascore',
              desc: 'Algorithme propriétaire qui croise MAE, GDACS, OMS et IATA pour un score 0-100 mis à jour en temps réel.',
              color: '#0F4C81',
              bg: 'rgba(15, 76, 129, 0.1)',
            },
            {
              icon: Bell,
              title: 'Alertes temps réel',
              desc: 'Grèves, catastrophes naturelles, zones à risque : reçois une notification dès qu\'une menace apparaît sur ton itinéraire.',
              color: '#F59E0B',
              bg: 'rgba(245, 158, 11, 0.1)',
            },
            {
              icon: CheckCircle2,
              title: 'Réservation intégrée',
              desc: 'e-SIM, assurance, hôtel, activités, vols : tout depuis l\'app, avec des partenaires certifiés.',
              color: '#10B981',
              bg: 'rgba(16, 185, 129, 0.1)',
            },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl p-7 bg-white"
                style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: p.bg }}
                >
                  <Icon className="h-7 w-7" style={{ color: p.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/lokascore')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
            style={{
              background: 'var(--lokadia-info-bg)',
              color: 'var(--lokadia-primary)',
            }}
          >
            Comprendre l'algorithme Lokascore <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Partenaires commissions */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--lokadia-gray-900)' }}>
              Tout ton voyage, en un seul endroit.
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--lokadia-gray-600)' }}>
              Lokadia est gratuit pour toi. Nous sommes rémunérés par nos partenaires à chaque réservation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Wifi, label: 'e-SIM internet', prov: 'Airalo · Holafly', c: '#0A84FF' },
              { icon: ShieldCheck, label: 'Assurance voyage', prov: 'Chapka · AXA', c: '#10B981' },
              { icon: Hotel, label: 'Hôtels & auberges', prov: 'Accor · B&B', c: '#F59E0B' },
              { icon: Ticket, label: 'Activités', prov: 'GetYourGuide', c: '#8B5CF6' },
              { icon: Plane, label: 'Vols', prov: 'Kiwi · Skyscanner', c: '#EF4444' },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-2xl p-5 bg-white"
                  style={{ border: '1px solid var(--lokadia-gray-100)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${p.c}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: p.c }} />
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {p.label}
                  </h3>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: p.c }}>
                    {p.prov}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
          <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-14 lg:p-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md mb-5">
                <Briefcase className="h-4 w-4 text-white" />
                <span className="text-xs font-semibold text-white tracking-wide">ESPACE PRO</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Protégez vos équipes, vos étudiants, vos assurés.
              </h2>
              <p className="text-base md:text-lg text-white/90 mb-8 max-w-xl">
                L'API Lokascore en white-label pour écoles, ONG, assureurs et compagnies aériennes.
                Tableau de bord, alertes groupe, reporting RGPD.
              </p>
              <button
                onClick={() => navigate('/pro')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm bg-white"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                Découvrir Lokadia Pro <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: GraduationCap, label: 'Écoles & universités', sub: 'À partir de 500 €/an' },
                { icon: Heart, label: 'ONG & humanitaires', sub: 'À partir de 1 500 €/an' },
                { icon: Building2, label: 'Assureurs (API)', sub: '5 000 – 20 000 €/an' },
                { icon: Plane, label: 'Compagnies aériennes', sub: '8 000 – 25 000 €/an' },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.label}
                    className="rounded-2xl p-4 backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <Icon className="h-6 w-6 text-white mb-2" />
                    <p className="text-sm font-bold text-white leading-tight mb-1">{b.label}</p>
                    <p className="text-xs text-white/70">{b.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Lokadia</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            © 2026 Lokadia · Voyage en toute sécurité · contact@lokadia.fr
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            <button onClick={() => navigate('/global-home')}>Démo</button>
            <button onClick={() => navigate('/pro')}>Pro</button>
            <button onClick={() => navigate('/lokascore')}>Lokascore</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
