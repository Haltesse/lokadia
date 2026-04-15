import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Shield, ArrowRight, CheckCircle2, Database, Zap, Globe } from 'lucide-react';

/**
 * Page dédiée au GoSafe Score — actif défensable n°1 du produit.
 * Explique sources, méthodologie, mise à jour.
 */
export default function GoSafePage() {
  const navigate = useNavigate();

  const sources = [
    { name: 'MAE', full: 'Ministère des Affaires Étrangères', desc: 'Conseils aux voyageurs par pays' },
    { name: 'GDACS', full: 'Global Disaster Alert', desc: 'Catastrophes naturelles en temps réel' },
    { name: 'OMS', full: 'Organisation Mondiale de la Santé', desc: 'Risques sanitaires et épidémies' },
    { name: 'IATA', full: 'Association Transport Aérien', desc: 'Perturbations aériennes et grèves' },
  ];

  const criteria = [
    { label: 'Risque politique', weight: '25 %', desc: 'Instabilité, manifestations, couvre-feu' },
    { label: 'Santé & sanitaire', weight: '25 %', desc: 'Épidémies, qualité soins, vaccins requis' },
    { label: 'Transports', weight: '20 %', desc: 'Grèves, accidents routiers, perturbations' },
    { label: 'Criminalité', weight: '20 %', desc: 'Agressions, vols, zones sensibles' },
    { label: 'Climat', weight: '10 %', desc: 'Tempêtes, canicules, pollution' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="py-14 md:py-24 relative overflow-hidden"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md mb-6"
          >
            <Shield className="h-4 w-4 text-white" />
            <span className="text-xs font-semibold text-white tracking-wide">
              ALGORITHME PROPRIÉTAIRE
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            GoSafe Score
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Un score unique de 0 à 100 qui mesure la sécurité d'une destination
            en temps réel, à partir de sources officielles vérifiées.
          </p>
        </div>
      </section>

      {/* Sample scores */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { city: 'Tokyo', score: 95, color: '#10B981' },
            { city: 'Lisbonne', score: 87, color: '#10B981' },
            { city: 'Marrakech', score: 70, color: '#F59E0B' },
            { city: 'Le Caire', score: 54, color: '#EF4444' },
          ].map((s) => (
            <div
              key={s.city}
              className="rounded-2xl p-5 bg-white"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--lokadia-gray-500)' }}>
                {s.city}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold" style={{ color: s.color }}>
                  {s.score}
                </span>
                <span className="text-base" style={{ color: 'var(--lokadia-gray-400)' }}>/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 mt-2">
                <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--lokadia-gray-900)' }}>
            4 sources officielles, zéro approximation
          </h2>
          <p className="text-base" style={{ color: 'var(--lokadia-gray-600)' }}>
            Aucun avis d'utilisateur, aucune rumeur : uniquement des flux vérifiables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl p-6 bg-white"
              style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'var(--lokadia-info-bg)' }}
              >
                <Database className="h-6 w-6" style={{ color: 'var(--lokadia-primary)' }} />
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
                {s.name}
              </h3>
              <p className="text-xs mb-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--lokadia-primary)' }}>
                {s.full}
              </p>
              <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Criteria */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--lokadia-gray-900)' }}>
              5 critères, une pondération transparente
            </h2>
            <p className="text-base" style={{ color: 'var(--lokadia-gray-600)' }}>
              Chaque composante est recalculée toutes les 2 heures.
            </p>
          </div>

          <div className="space-y-3">
            {criteria.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl p-5 md:p-6 bg-white flex items-center gap-5"
                style={{ border: '1px solid var(--lokadia-gray-100)' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <span className="text-base font-bold text-white">{c.weight}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {c.label}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Temps réel', desc: 'Mise à jour toutes les 2 h. Alertes push dès dégradation.' },
            { icon: Globe, title: 'Monde entier', desc: 'Couverture de 190 pays dès le jour 1.' },
            { icon: CheckCircle2, title: 'API B2B', desc: 'Disponible en white-label pour assureurs, airlines, ONG.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl p-6 bg-white"
                style={{ border: '1px solid var(--lokadia-gray-100)' }}
              >
                <Icon className="h-8 w-8 mb-4" style={{ color: 'var(--lokadia-primary)' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/pro')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Intégrer GoSafe dans notre organisation <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
