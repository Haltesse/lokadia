import { Check, Crown, Bell, Map, Shield, Zap, Globe, Star, Sparkles, TrendingUp, Award, Gift } from "lucide-react";
import { PriceDisplay } from "../components/PriceDisplay";
import { motion } from "motion/react";

export function Premium() {
  const plans = [
    {
      id: "monthly",
      name: "Mensuel",
      price: "€9.99",
      period: "/mois",
      popular: false,
      color: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
    },
    {
      id: "quarterly",
      name: "Trimestriel",
      price: "€14.99",
      period: "/3 mois",
      popular: true,
      savings: "Économisez 50%",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
    },
    {
      id: "yearly",
      name: "Annuel",
      price: "€19.99",
      period: "/an",
      popular: false,
      savings: "Économisez 83%",
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    },
  ];

  const features = [
    {
      icon: Bell,
      title: "Alertes en temps réel",
      description: "Notifications push instantanées pour les événements critiques",
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
    {
      icon: Map,
      title: "Cartes hors ligne",
      description: "Accédez aux cartes et aux informations sans connexion Internet",
      color: "#06B6D4",
      bgColor: "#ECFEFF",
    },
    {
      icon: Shield,
      title: "Assistance 24/7",
      description: "Support prioritaire par chat et téléphone",
      color: "#059669",
      bgColor: "#ECFDF5",
    },
    {
      icon: Zap,
      title: "Mises à jour prioritaires",
      description: "Accès anticipé aux nouvelles fonctionnalités",
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      icon: Globe,
      title: "Destinations illimitées",
      description: "Suivez autant de destinations que vous le souhaitez",
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
  ];

  const freeFeatures = [
    "Indice GoSafe basique",
    "Alertes quotidiennes",
    "1 destination suivie",
    "Conseils de la communauté",
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--lokadia-background)' }}>
      {/* Header avec dégradé premium */}
      <motion.div 
        className="px-6 pt-14 pb-12 text-white relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #0F4C81 0%, #8B5CF6 50%, #F59E0B 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Effet de particules brillantes */}
        <div className="absolute inset-0 opacity-20">
          <Sparkles className="absolute top-10 right-10 h-8 w-8 text-white animate-pulse" />
          <Star className="absolute top-20 left-10 h-6 w-6 text-white animate-pulse" style={{ animationDelay: '0.3s' }} />
          <Crown className="absolute bottom-10 right-20 h-7 w-7 text-white animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>

        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center backdrop-blur-md"
            style={{ 
              background: "rgba(255, 255, 255, 0.25)",
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Crown className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-white text-center mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Lokadia Premium
        </motion.h1>
        
        <motion.p 
          className="text-white/90 text-lg text-center max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Voyagez en toute sérénité avec nos fonctionnalités avancées
        </motion.p>
      </motion.div>

      {/* Plans avec animations */}
      <div className="px-6 -mt-8 relative z-10 mb-8">
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "ring-4" : ""
                }`}
                style={plan.popular ? { 
                  borderColor: plan.color,
                  boxShadow: `0 20px 40px ${plan.color}40`
                } : {
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                {plan.popular && (
                  <div
                    className="text-white text-sm font-bold text-center py-3 flex items-center justify-center gap-2"
                    style={{ background: plan.gradient }}
                  >
                    <TrendingUp size={18} />
                    PLUS POPULAIRE
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 
                        className="font-bold text-2xl mb-1" 
                        style={{ color: 'var(--lokadia-gray-900)' }}
                      >
                        {plan.name}
                      </h3>
                      {plan.savings && (
                        <div className="flex items-center gap-1.5">
                          <Gift size={16} style={{ color: plan.color }} />
                          <span
                            className="text-sm font-bold"
                            style={{ color: plan.color }}
                          >
                            {plan.savings}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span 
                          className="text-4xl font-bold"
                          style={{ color: plan.color }}
                        >
                          {plan.price}
                        </span>
                      </div>
                      <span className="text-base" style={{ color: 'var(--lokadia-gray-600)' }}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all"
                    style={{
                      background: plan.gradient,
                      boxShadow: `0 10px 25px ${plan.color}40`
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Commencer maintenant
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Features avec couleurs */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Award size={24} style={{ color: 'var(--lokadia-primary)' }} />
            <h2 
              className="text-2xl font-bold" 
              style={{ color: 'var(--lokadia-gray-900)' }}
            >
              Fonctionnalités Premium
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 space-y-5" style={{ boxShadow: 'var(--shadow-xl)' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index} 
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <Icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="font-bold text-lg mb-1" 
                      style={{ color: 'var(--lokadia-gray-900)' }}
                    >
                      {feature.title}
                    </h3>
                    <p 
                      className="text-base" 
                      style={{ color: 'var(--lokadia-gray-600)' }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Free Features Comparison */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 
            className="text-2xl font-bold mb-5" 
            style={{ color: 'var(--lokadia-gray-900)' }}
          >
            Version gratuite
          </h2>

          <div 
            className="bg-white rounded-3xl p-6" 
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="space-y-4">
              {freeFeatures.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--lokadia-success-bg)' }}
                  >
                    <Check 
                      className="h-5 w-5" 
                      style={{ color: 'var(--lokadia-success)' }} 
                    />
                  </div>
                  <span 
                    className="text-base font-medium" 
                    style={{ color: 'var(--lokadia-gray-700)' }}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--lokadia-gray-200)' }}>
              <motion.button
                className="w-full py-4 rounded-2xl font-bold text-base border-2 transition-all"
                style={{
                  borderColor: 'var(--lokadia-primary)',
                  color: 'var(--lokadia-primary)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuer avec la version gratuite
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trust Badge avec gradient */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div 
            className="rounded-3xl p-6 text-center relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              boxShadow: '0 20px 40px rgba(5, 150, 105, 0.3)'
            }}
          >
            <div className="relative z-10">
              <div className="flex justify-center gap-2 mb-3">
                <Shield className="h-7 w-7 text-white" />
                <span className="font-bold text-xl text-white">
                  Garantie satisfait ou remboursé
                </span>
              </div>
              <p className="text-white/90 text-base">
                Annulez à tout moment. Aucun engagement requis.
              </p>
            </div>
            
            {/* Effet de brillance */}
            <div className="absolute inset-0 opacity-10">
              <Star className="absolute top-3 right-10 h-6 w-6 text-white animate-pulse" />
              <Sparkles className="absolute bottom-3 left-10 h-5 w-5 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}