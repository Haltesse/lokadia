import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Database,
  Zap,
  Globe,
  ExternalLink,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import {
  GOSAFE_METHODOLOGY,
  SOURCE_HOMEPAGES,
} from '../lib/officialSources';

/**
 * Page dédiée au GoSafe Score — explication transparente de la méthodologie
 * et des sources officielles utilisées. Tous les liens mènent aux vrais sites.
 */
export default function GoSafePage() {
  const navigate = useNavigate();

  // Source primaire (Numbeo) + sources complémentaires que l'utilisateur peut
  // croiser à tout moment depuis la fiche d'une destination.
  const sources = [
    {
      name: 'Numbeo',
      full: 'Crime & Safety Index',
      desc: '600 000+ contributeurs · 9 000+ villes · index de sécurité urbain de référence',
      url: 'https://www.numbeo.com/crime/',
      tag: 'Source primaire',
      Icon: Database,
      color: '#1E40AF',
      bg: '#DBEAFE',
    },
    {
      name: 'France Diplomatie',
      full: 'MEAE · Conseils aux voyageurs',
      desc: 'Recommandations officielles du Ministère français : sécurité, santé, formalités, zones à éviter',
      url: SOURCE_HOMEPAGES.franceDiplomatie,
      tag: 'Officiel',
      Icon: Shield,
      color: '#92400E',
      bg: '#FEF3C7',
    },
    {
      name: 'OMS',
      full: 'Organisation Mondiale de la Santé',
      desc: 'Recommandations sanitaires, vaccins, alertes épidémies par pays',
      url: SOURCE_HOMEPAGES.who,
      tag: 'Officiel',
      Icon: Heart,
      color: '#6D28D9',
      bg: '#EDE9FE',
    },
    {
      name: 'GDACS',
      full: "Global Disaster Alert · Nations Unies",
      desc: 'Alertes mondiales temps réel : séismes, cyclones, tsunamis, inondations',
      url: SOURCE_HOMEPAGES.gdacs,
      tag: 'Officiel',
      Icon: AlertTriangle,
      color: '#991B1B',
      bg: '#FEE2E2',
    },
    {
      name: 'OSAC',
      full: 'US Department of State',
      desc: 'Rapports de sécurité par pays produits par le Bureau de la Sécurité Diplomatique américaine',
      url: SOURCE_HOMEPAGES.osac,
      tag: 'Officiel',
      Icon: Shield,
      color: '#0F4C81',
      bg: '#DBEAFE',
    },
    {
      name: 'CDC Travel Health',
      full: 'Centers for Disease Control · USA',
      desc: 'Avis sanitaires par destination : vaccins, prévention, alertes en cours',
      url: SOURCE_HOMEPAGES.cdc,
      tag: 'Officiel',
      Icon: Heart,
      color: '#047857',
      bg: '#D1FAE5',
    },
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
              MÉTHODOLOGIE TRANSPARENTE
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            GoSafe Score
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Un indice de <strong>{GOSAFE_METHODOLOGY.scoreRange}</strong> mesurant
            la sécurité d'une destination, calculé à partir du{' '}
            <strong>Crime Index Numbeo</strong> et croisable avec les sources
            officielles MAE / OMS / GDACS / OSAC.
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
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--lokadia-gray-500)' }}
              >
                {s.city}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold" style={{ color: s.color }}>
                  {s.score}
                </span>
                <span
                  className="text-base"
                  style={{ color: 'var(--lokadia-gray-400)' }}
                >
                  /100
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 mt-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.score}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: 'var(--lokadia-gray-900)' }}
          >
            Comment le score est calculé
          </h2>
          <p
            className="text-base"
            style={{ color: 'var(--lokadia-gray-600)' }}
          >
            Pas de boîte noire. Voici exactement d'où viennent les chiffres.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              n: '1',
              title: 'Récupération du Crime Index Numbeo',
              desc: (
                <>
                  Pour chaque ville, on interroge l'API Numbeo qui agrège les
                  réponses de plus de 600 000 contributeurs (résidents et
                  voyageurs) sur 9 000+ villes du monde. C'est l'index de
                  sécurité urbaine le plus utilisé par les chercheurs et
                  médias internationaux.
                </>
              ),
              link: { label: 'Voir la méthodologie Numbeo', url: GOSAFE_METHODOLOGY.primarySource.methodology },
            },
            {
              n: '2',
              title: 'Conversion en GoSafe Score (0–100)',
              desc: (
                <>
                  Le Safety Index Numbeo est arrondi sur une échelle 0–100. Un
                  score élevé signifie que la sécurité perçue est bonne (faible
                  criminalité, sentiment de sécurité de jour comme de nuit, peu
                  d'agressions).
                </>
              ),
            },
            {
              n: '3',
              title: 'Mise à jour automatique',
              desc: (
                <>
                  Les scores sont rafraîchis automatiquement toutes les{' '}
                  <strong>{GOSAFE_METHODOLOGY.refreshInterval}</strong>. Quand
                  vous ouvrez une destination, vous voyez la dernière valeur
                  publiée par Numbeo.
                </>
              ),
            },
            {
              n: '4',
              title: 'Croisement avec les sources officielles',
              desc: (
                <>
                  Sur chaque fiche destination, vous trouvez en plus du score
                  des liens directs vers <strong>France Diplomatie</strong>,{' '}
                  <strong>OMS</strong>, <strong>GDACS</strong>,{' '}
                  <strong>OSAC</strong> et <strong>CDC</strong> pour vérifier
                  vous-même les conseils officiels et alertes en cours.
                </>
              ),
            },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-2xl p-5 md:p-6 bg-white border border-gray-200 flex gap-5"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {step.n}
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  {step.desc}
                </p>
                {step.link && (
                  <a
                    href={step.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    {step.link.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Échelle */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--lokadia-gray-900)' }}
            >
              Échelle de lecture
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {GOSAFE_METHODOLOGY.thresholds.map((t) => (
              <div
                key={t.level}
                className="rounded-2xl p-5 bg-white border border-gray-200 text-center"
              >
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                  style={{ background: t.color }}
                >
                  {t.min}–{t.max}
                </div>
                <p
                  className="text-lg font-bold mb-1"
                  style={{ color: t.color }}
                >
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources officielles cliquables */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: 'var(--lokadia-gray-900)' }}
          >
            6 sources officielles, vérifiables en un clic
          </h2>
          <p
            className="text-base"
            style={{ color: 'var(--lokadia-gray-600)' }}
          >
            Cliquez sur chaque source pour vérifier directement sur le site
            officiel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((s) => {
            const Icon = s.Icon;
            return (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl p-6 bg-white block transition-all hover:-translate-y-0.5"
                style={{
                  border: '1px solid var(--lokadia-gray-100)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    <Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: 'var(--lokadia-gray-900)' }}
                  >
                    {s.name}
                  </h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p
                  className="text-xs mb-3 font-semibold uppercase tracking-wider"
                  style={{ color: s.color }}
                >
                  {s.full}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  {s.desc}
                </p>
              </a>
            );
          })}
        </div>

        <p
          className="text-xs text-center mt-8 italic"
          style={{ color: 'var(--lokadia-gray-500)' }}
        >
          Lokadia agrège ces sources publiques pour vous faire gagner du temps —
          aucune donnée n'est inventée. Chaque lien ouvre la page officielle de
          l'organisme.
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Temps réel',
                desc: `Mise à jour toutes les ${GOSAFE_METHODOLOGY.refreshInterval} via l'API Numbeo.`,
              },
              {
                icon: Globe,
                title: 'Monde entier',
                desc: '9 000+ villes couvertes par Numbeo + 190 fiches pays officielles.',
              },
              {
                icon: CheckCircle2,
                title: 'Sources vérifiables',
                desc: 'Chaque score est doublé de liens cliquables vers les organismes officiels.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl p-6 bg-white"
                  style={{ border: '1px solid var(--lokadia-gray-100)' }}
                >
                  <Icon
                    className="h-8 w-8 mb-4"
                    style={{ color: 'var(--lokadia-primary)' }}
                  />
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: 'var(--lokadia-gray-900)' }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--lokadia-gray-600)' }}
                  >
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
              Intégrer GoSafe dans notre organisation{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
