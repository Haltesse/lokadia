import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  GraduationCap,
  Heart,
  Building2,
  Plane,
  CheckCircle2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { registerLandingSignup } from '../lib/landingSignupService';

export default function ProPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const offers = [
    {
      icon: GraduationCap,
      title: 'Écoles & universités',
      price: '500 – 2 000 €',
      unit: '/an',
      features: [
        'Suivi des étudiants en mobilité Erasmus',
        'Alertes groupe automatiques par pays',
        'Dashboard responsable relations internationales',
        'Export reporting conformité devoir de protection',
      ],
      color: '#0A84FF',
      bg: 'rgba(10, 132, 255, 0.08)',
    },
    {
      icon: Heart,
      title: 'ONG & humanitaires',
      price: '1 500 – 4 000 €',
      unit: '/an',
      features: [
        'Gestion missions terrain',
        'Alertes sécurité équipes expatriées',
        'Historique incidents et analyse',
        'Support dédié 7j/7',
      ],
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      icon: Building2,
      title: 'Assureurs (API white-label)',
      price: '5 000 – 20 000 €',
      unit: '/an',
      features: [
        'API GoSafe Score intégrée à votre espace client',
        'Tarification ajustée en fonction du risque pays',
        'Branding personnalisé',
        'SLA 99,9 %',
      ],
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      featured: true,
    },
    {
      icon: Plane,
      title: 'Compagnies aériennes',
      price: '8 000 – 25 000 €',
      unit: '/an',
      features: [
        'Notifications GoSafe dans l\'app passager',
        'Information destination pré-vol',
        'Intégration aux alertes opérationnelles',
        'Co-branding',
      ],
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      icon: Briefcase,
      title: 'MICE & voyages affaires',
      price: '2 000 – 6 000 €',
      unit: '/an',
      features: [
        'Gestion risque groupes séminaires',
        'Conformité obligation employeur (art. L4121-1)',
        'Alertes temps réel déplacement collaborateurs',
        'Tableau de bord RH',
      ],
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.08)',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const res = await registerLandingSignup(email, `pro-${company || 'unknown'}`);
    setStatus(res.ok ? 'success' : 'error');
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'var(--lokadia-info-bg)' }}>
            <Briefcase className="h-4 w-4" style={{ color: 'var(--lokadia-primary)' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--lokadia-primary)' }}>
              LOKADIA PRO · B2B
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
            style={{ color: 'var(--lokadia-gray-900)' }}>
            Protégez vos équipes<br />
            <span style={{ color: 'var(--lokadia-primary)' }}>partout dans le monde.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--lokadia-gray-600)' }}>
            L'API GoSafe Score et le tableau de bord Lokadia, adaptés à votre organisation.
            Conformité devoir de protection (art. L4121-1 du Code du travail).
          </p>
        </div>
      </section>

      {/* Offers */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((o, i) => {
            const Icon = o.icon;
            return (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-6 md:p-7 bg-white relative"
                style={{
                  border: o.featured
                    ? `2px solid ${o.color}`
                    : '1px solid var(--lokadia-gray-100)',
                  boxShadow: o.featured ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                }}
              >
                {o.featured && (
                  <span
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ background: o.color }}
                  >
                    Le plus demandé
                  </span>
                )}

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: o.bg }}
                >
                  <Icon className="h-6 w-6" style={{ color: o.color }} />
                </div>

                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {o.title}
                </h3>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-2xl font-bold" style={{ color: o.color }}>
                    {o.price}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
                    {o.unit}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {o.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: o.color }} />
                      <span className="text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 md:p-12 bg-white"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  Parlons de votre besoin
                </h2>
                <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                  Réponse sous 48 h ouvrées
                </p>
              </div>
            </div>

            {status === 'success' ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
              >
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3" />
                <p className="font-bold text-lg">Demande reçue — merci !</p>
                <p className="text-sm mt-1">Nous vous recontactons sous 48 h ouvrées.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--lokadia-gray-700)' }}>
                    Organisation
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Université de Montpellier, Chapka, Air France…"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{
                      border: '1px solid var(--lokadia-gray-200)',
                      background: 'white',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--lokadia-gray-700)' }}>
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@organisation.fr"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{
                      border: '1px solid var(--lokadia-gray-200)',
                      background: 'white',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {status === 'loading' ? 'Envoi...' : (
                    <>
                      Demander une démo <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-600">Erreur — réessaie dans un instant.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
