// Système de traductions pour Lokadia
export type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ar';

export interface Translations {
  nav: {
    home: string;
    alerts: string;
    community: string;
    profile: string;
  };
  
  home: {
    greeting: string;
    subtitle: string;
    searchPlaceholder: string;
    trendingDestinations: string;
    whyLokadia: string;
    verifiedInfo: string;
    verifiedInfoDesc: string;
    realTimeAlerts: string;
    realTimeAlertsDesc: string;
    travelChecklist: string;
    travelChecklistDesc: string;
    travelPeace: string;
    travelPeaceDesc: string;
    discoverPremium: string;
    swipeHint: string;
    explore: string;
  };
  
  search: {
    title: string;
    placeholder: string;
    recentSearches: string;
    popularDestinations: string;
    noResults: string;
  };
  
  destination: {
    overview_tab: string;
    weather_tab: string;
    alerts_tab: string;
    safety_tab: string;
    health_tab: string;
    entry_tab: string;
    scams_tab: string;
    emergency_tab: string;
    culture_tab: string;
  };
  
  alerts: {
    title: string;
    realTime: string;
    filterAll: string;
    filterSecurity: string;
    filterHealth: string;
    filterNatural: string;
    filterTransport: string;
    urgent: string;
    vigilance: string;
    info: string;
    noAlerts: string;
    source: string;
  };
  
  checklist: {
    title: string;
    beforeTravel: string;
    documents: string;
    health: string;
    luggage: string;
    addItem: string;
    completed: string;
  };
  
  community: {
    title: string;
    verifiedTravelers: string;
    shareExperience: string;
    readMore: string;
    helpful: string;
  };
  
  premium: {
    title: string;
    subtitle: string;
    free: string;
    plus: string;
    pro: string;
    month: string;
    year: string;
    features: string;
    basicAlerts: string;
    unlimitedAlerts: string;
    prioritySupport: string;
    offlineMode: string;
    advancedAnalytics: string;
    choosePlan: string;
    currentPlan: string;
  };
  
  settings: {
    title: string;
    language: string;
    currency: string;
    notifications: string;
    privacy: string;
    about: string;
    logout: string;
  };
  
  profile: {
    title: string;
    editProfile: string;
    changePhoto: string;
    changeName: string;
    changeEmail: string;
    changePassword: string;
    deleteAccount: string;
    myTrips: string;
    viewAllTrips: string;
    upcomingTrips: string;
    pastTrips: string;
    favoriteTrips: string;
    noTrips: string;
    createFirstTrip: string;
    tripStatusUpcoming: string;
    tripStatusOngoing: string;
    tripStatusCompleted: string;
    open: string;
    duplicate: string;
    mySelections: string;
    favorites: string;
    followedDestinations: string;
    savedArticles: string;
    savedAlerts: string;
    customChecklist: string;
    createdTemplates: string;
    recurringItems: string;
    alertsNotifications: string;
    enableNotifications: string;
    alertsAroundMe: string;
    radiusKm: string;
    alertTypes: string;
    security: string;
    health: string;
    transport: string;
    politics: string;
    weather: string;
    quietHours: string;
    followedCountries: string;
    premiumSection: string;
    upgradeToPremium: string;
    comparison: string;
    benefits: string;
    renewalDate: string;
    manageSubscription: string;
    restorePurchase: string;
    cancelSubscription: string;
    privacySecurity: string;
    downloadMyData: string;
    deleteMyAccount: string;
    privacyPolicy: string;
    manageCookies: string;
    communityVisibility: string;
    visibilityPublic: string;
    visibilityAnonymous: string;
    allowPrivateMessages: string;
    communitySection: string;
    myPosts: string;
    myComments: string;
    reportedPosts: string;
    moderationHistory: string;
    trustedContributor: string;
    supportHelp: string;
    faq: string;
    contactSupport: string;
    reportBug: string;
    suggestImprovement: string;
    rateApp: string;
    quickSummary: string;
    activeTrips: string;
    importantAlerts: string;
    checklistItemsRemaining: string;
    freeBadge: string;
    premiumBadge: string;
    expiresOn: string;
  };
  
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    done: string;
    close: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    nav: {
      home: 'Accueil',
      alerts: 'Alertes',
      community: 'Communauté',
      profile: 'Profil',
    },
    home: {
      greeting: 'Bonjour',
      subtitle: 'Où vous emmène votre prochaine aventure ?',
      searchPlaceholder: 'Rechercher une ville, un pays...',
      trendingDestinations: 'Destinations Tendances',
      whyLokadia: 'Pourquoi Lokadia ?',
      verifiedInfo: 'Infos vérifiées',
      verifiedInfoDesc: 'Sources officielles uniquement',
      realTimeAlerts: 'Alertes temps réel',
      realTimeAlertsDesc: 'Notifications instantanées',
      travelChecklist: 'Checklist voyage',
      travelChecklistDesc: 'Ne rien oublier',
      travelPeace: 'Voyagez l\'esprit tranquille',
      travelPeaceDesc: 'Rejoignez plus de 100 000 voyageurs qui font confiance à Lokadia',
      discoverPremium: 'Découvrir Premium',
      swipeHint: '← Glissez pour découvrir plus →',
      explore: 'Explorer',
    },
    search: {
      title: 'Recherche',
      placeholder: 'Rechercher une destination...',
      recentSearches: 'Recherches récentes',
      popularDestinations: 'Destinations populaires',
      noResults: 'Aucun résultat trouvé',
    },
    destination: {
      overview_tab: 'Aperçu',
      weather_tab: 'Météo',
      alerts_tab: 'Alertes',
      safety_tab: 'Sécurité',
      health_tab: 'Santé',
      entry_tab: 'Entrée',
      scams_tab: 'Arnaques',
      emergency_tab: 'Urgences',
      culture_tab: 'Culture',
    },
    alerts: {
      title: 'Centre d\'Alertes',
      realTime: 'En temps réel',
      filterAll: 'Tout',
      filterSecurity: 'Sécurité',
      filterHealth: 'Santé',
      filterNatural: 'Naturel',
      filterTransport: 'Transport',
      urgent: 'Urgent',
      vigilance: 'Vigilance',
      info: 'Info',
      noAlerts: 'Aucune alerte active',
      source: 'Source',
    },
    checklist: {
      title: 'Checklist Voyage',
      beforeTravel: 'Avant le départ',
      documents: 'Documents',
      health: 'Santé',
      luggage: 'Bagages',
      addItem: 'Ajouter un élément',
      completed: 'Complété',
    },
    community: {
      title: 'Communauté',
      verifiedTravelers: 'Voyageurs vérifiés',
      shareExperience: 'Partager votre expérience',
      readMore: 'Lire plus',
      helpful: 'Utile',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Choisissez le plan qui vous convient',
      free: 'Gratuit',
      plus: 'Plus',
      pro: 'Pro',
      month: 'mois',
      year: 'an',
      features: 'Fonctionnalités',
      basicAlerts: 'Alertes basiques',
      unlimitedAlerts: 'Alertes illimitées',
      prioritySupport: 'Support prioritaire',
      offlineMode: 'Mode hors ligne',
      advancedAnalytics: 'Analyses avancées',
      choosePlan: 'Choisir ce plan',
      currentPlan: 'Plan actuel',
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      currency: 'Devise',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      about: 'À propos',
      logout: 'Déconnexion',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Modifier le profil',
      changePhoto: 'Changer la photo',
      changeName: 'Modifier le nom',
      changeEmail: 'Changer l\'email',
      changePassword: 'Changer le mot de passe',
      deleteAccount: 'Supprimer le compte',
      myTrips: 'Mes Voyages',
      viewAllTrips: 'Voir tous mes voyages',
      upcomingTrips: 'Voyages à venir',
      pastTrips: 'Voyages passés',
      favoriteTrips: 'Voyages favoris',
      noTrips: 'Aucun voyage',
      createFirstTrip: 'Créer mon premier voyage',
      tripStatusUpcoming: 'À venir',
      tripStatusOngoing: 'En cours',
      tripStatusCompleted: 'Terminé',
      open: 'Ouvrir',
      duplicate: 'Dupliquer',
      mySelections: 'Mes Sélections',
      favorites: 'Favoris',
      followedDestinations: 'Destinations suivies',
      savedArticles: 'Articles sauvegardés',
      savedAlerts: 'Alertes enregistrées',
      customChecklist: 'Checklist personnalisée',
      createdTemplates: 'Templates créés',
      recurringItems: 'Items récurrents',
      alertsNotifications: 'Alertes & Notifications',
      enableNotifications: 'Activer les notifications',
      alertsAroundMe: 'Alertes autour de moi',
      radiusKm: 'Rayon (km)',
      alertTypes: 'Types d\'alertes',
      security: 'Sécurité',
      health: 'Santé',
      transport: 'Transport',
      politics: 'Politique',
      weather: 'Météo',
      quietHours: 'Heures silencieuses',
      followedCountries: 'Pays suivis',
      premiumSection: 'Premium',
      upgradeToPremium: 'Passer à Premium',
      comparison: 'Comparatif',
      benefits: 'Avantages',
      renewalDate: 'Date de renouvellement',
      manageSubscription: 'Gérer l\'abonnement',
      restorePurchase: 'Restaurer l\'achat',
      cancelSubscription: 'Annuler',
      privacySecurity: 'Confidentialité & Sécurité',
      downloadMyData: 'Télécharger mes données',
      deleteMyAccount: 'Supprimer mon compte',
      privacyPolicy: 'Politique de confidentialité',
      manageCookies: 'Gérer les cookies',
      communityVisibility: 'Visibilité communauté',
      visibilityPublic: 'Public',
      visibilityAnonymous: 'Anonyme',
      allowPrivateMessages: 'Autoriser messages privés',
      communitySection: 'Communauté',
      myPosts: 'Mes posts',
      myComments: 'Mes commentaires',
      reportedPosts: 'Posts signalés',
      moderationHistory: 'Historique modération',
      trustedContributor: 'Contributeur fiable',
      supportHelp: 'Support & Aide',
      faq: 'FAQ',
      contactSupport: 'Contacter le support',
      reportBug: 'Signaler un bug',
      suggestImprovement: 'Proposer une amélioration',
      rateApp: 'Noter l\'application',
      quickSummary: 'Résumé rapide',
      activeTrips: 'voyages actifs',
      importantAlerts: 'alertes importantes',
      checklistItemsRemaining: 'éléments checklist restants',
      freeBadge: 'Gratuit',
      premiumBadge: 'Premium',
      expiresOn: 'Expire le',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      retry: 'Réessayer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      back: 'Retour',
      next: 'Suivant',
      done: 'Terminé',
      close: 'Fermer',
    },
  },
  
  en: {
    nav: {
      home: 'Home',
      alerts: 'Alerts',
      community: 'Community',
      profile: 'Profile',
    },
    home: {
      greeting: 'Hello!',
      subtitle: 'Where is your next adventure taking you?',
      searchPlaceholder: 'Search for a city, country...',
      trendingDestinations: 'Trending Destinations',
      whyLokadia: 'Why Lokadia?',
      verifiedInfo: 'Verified Info',
      verifiedInfoDesc: 'Official sources only',
      realTimeAlerts: 'Real-time Alerts',
      realTimeAlertsDesc: 'Instant notifications',
      travelChecklist: 'Travel Checklist',
      travelChecklistDesc: 'Don\'t forget anything',
      travelPeace: 'Travel with peace of mind',
      travelPeaceDesc: 'Join over 100,000 travelers who trust Lokadia',
      discoverPremium: 'Discover Premium',
      swipeHint: '← Swipe to discover more →',
      explore: 'Explore',
    },
    search: {
      title: 'Search',
      placeholder: 'Search for a destination...',
      recentSearches: 'Recent searches',
      popularDestinations: 'Popular destinations',
      noResults: 'No results found',
    },
    destination: {
      overview_tab: 'Overview',
      weather_tab: 'Weather',
      alerts_tab: 'Alerts',
      safety_tab: 'Safety',
      health_tab: 'Health',
      entry_tab: 'Entry',
      scams_tab: 'Scams',
      emergency_tab: 'Emergency',
      culture_tab: 'Culture',
    },
    alerts: {
      title: 'Alert Center',
      realTime: 'Real-time',
      filterAll: 'All',
      filterSecurity: 'Security',
      filterHealth: 'Health',
      filterNatural: 'Natural',
      filterTransport: 'Transport',
      urgent: 'Urgent',
      vigilance: 'Vigilance',
      info: 'Info',
      noAlerts: 'No active alerts',
      source: 'Source',
    },
    checklist: {
      title: 'Travel Checklist',
      beforeTravel: 'Before departure',
      documents: 'Documents',
      health: 'Health',
      luggage: 'Luggage',
      addItem: 'Add item',
      completed: 'Completed',
    },
    community: {
      title: 'Community',
      verifiedTravelers: 'Verified travelers',
      shareExperience: 'Share your experience',
      readMore: 'Read more',
      helpful: 'Helpful',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Choose the plan that suits you',
      free: 'Free',
      plus: 'Plus',
      pro: 'Pro',
      month: 'month',
      year: 'year',
      features: 'Features',
      basicAlerts: 'Basic alerts',
      unlimitedAlerts: 'Unlimited alerts',
      prioritySupport: 'Priority support',
      offlineMode: 'Offline mode',
      advancedAnalytics: 'Advanced analytics',
      choosePlan: 'Choose this plan',
      currentPlan: 'Current plan',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      currency: 'Currency',
      notifications: 'Notifications',
      privacy: 'Privacy',
      about: 'About',
      logout: 'Logout',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      changePhoto: 'Change photo',
      changeName: 'Change name',
      changeEmail: 'Change email',
      changePassword: 'Change password',
      deleteAccount: 'Delete account',
      myTrips: 'My Trips',
      viewAllTrips: 'View all trips',
      upcomingTrips: 'Upcoming trips',
      pastTrips: 'Past trips',
      favoriteTrips: 'Favorite trips',
      noTrips: 'No trips',
      createFirstTrip: 'Create my first trip',
      tripStatusUpcoming: 'Upcoming',
      tripStatusOngoing: 'Ongoing',
      tripStatusCompleted: 'Completed',
      open: 'Open',
      duplicate: 'Duplicate',
      mySelections: 'My Selections',
      favorites: 'Favorites',
      followedDestinations: 'Followed destinations',
      savedArticles: 'Saved articles',
      savedAlerts: 'Saved alerts',
      customChecklist: 'Custom checklist',
      createdTemplates: 'Created templates',
      recurringItems: 'Recurring items',
      alertsNotifications: 'Alerts & Notifications',
      enableNotifications: 'Enable notifications',
      alertsAroundMe: 'Alerts around me',
      radiusKm: 'Radius (km)',
      alertTypes: 'Alert types',
      security: 'Security',
      health: 'Health',
      transport: 'Transport',
      politics: 'Politics',
      weather: 'Weather',
      quietHours: 'Quiet hours',
      followedCountries: 'Followed countries',
      premiumSection: 'Premium',
      upgradeToPremium: 'Upgrade to Premium',
      comparison: 'Comparison',
      benefits: 'Benefits',
      renewalDate: 'Renewal date',
      manageSubscription: 'Manage subscription',
      restorePurchase: 'Restore purchase',
      cancelSubscription: 'Cancel',
      privacySecurity: 'Privacy & Security',
      downloadMyData: 'Download my data',
      deleteMyAccount: 'Delete my account',
      privacyPolicy: 'Privacy policy',
      manageCookies: 'Manage cookies',
      communityVisibility: 'Community visibility',
      visibilityPublic: 'Public',
      visibilityAnonymous: 'Anonymous',
      allowPrivateMessages: 'Allow private messages',
      communitySection: 'Community',
      myPosts: 'My posts',
      myComments: 'My comments',
      reportedPosts: 'Reported posts',
      moderationHistory: 'Moderation history',
      trustedContributor: 'Trusted contributor',
      supportHelp: 'Support & Help',
      faq: 'FAQ',
      contactSupport: 'Contact support',
      reportBug: 'Report a bug',
      suggestImprovement: 'Suggest improvement',
      rateApp: 'Rate the app',
      quickSummary: 'Quick summary',
      activeTrips: 'active trips',
      importantAlerts: 'important alerts',
      checklistItemsRemaining: 'checklist items remaining',
      freeBadge: 'Free',
      premiumBadge: 'Premium',
      expiresOn: 'Expires on',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      close: 'Close',
    },
  },
  
  es: {
    nav: {
      home: 'Inicio',
      alerts: 'Alertas',
      community: 'Comunidad',
      profile: 'Perfil',
    },
    home: {
      greeting: '¡Hola!',
      subtitle: '¿Dónde te lleva tu próxima aventura?',
      searchPlaceholder: 'Buscar una ciudad, país...',
      trendingDestinations: 'Destinos en Tendencia',
      whyLokadia: '¿Por qué Lokadia?',
      verifiedInfo: 'Info Verificada',
      verifiedInfoDesc: 'Solo fuentes oficiales',
      realTimeAlerts: 'Alertas en Tiempo Real',
      realTimeAlertsDesc: 'Notificaciones instantáneas',
      travelChecklist: 'Lista de Viaje',
      travelChecklistDesc: 'No olvides nada',
      travelPeace: 'Viaja con tranquilidad',
      travelPeaceDesc: 'Únete a más de 100,000 viajeros que confían en Lokadia',
      discoverPremium: 'Descubrir Premium',
      swipeHint: '← Desliza para descubrir más →',
      explore: 'Explorar',
    },
    search: {
      title: 'Buscar',
      placeholder: 'Buscar un destino...',
      recentSearches: 'Búsquedas recientes',
      popularDestinations: 'Destinos populares',
      noResults: 'No se encontraron resultados',
    },
    destination: {
      overview_tab: 'Resumen',
      weather_tab: 'Clima',
      alerts_tab: 'Alertas',
      safety_tab: 'Seguridad',
      health_tab: 'Salud',
      entry_tab: 'Entrada',
      scams_tab: 'Estafas',
      emergency_tab: 'Emergencia',
      culture_tab: 'Cultura',
    },
    alerts: {
      title: 'Centro de Alertas',
      realTime: 'En tiempo real',
      filterAll: 'Todo',
      filterSecurity: 'Seguridad',
      filterHealth: 'Salud',
      filterNatural: 'Natural',
      filterTransport: 'Transporte',
      urgent: 'Urgente',
      vigilance: 'Vigilancia',
      info: 'Info',
      noAlerts: 'Sin alertas activas',
      source: 'Fuente',
    },
    checklist: {
      title: 'Lista de Viaje',
      beforeTravel: 'Antes de partir',
      documents: 'Documentos',
      health: 'Salud',
      luggage: 'Equipaje',
      addItem: 'Agregar elemento',
      completed: 'Completado',
    },
    community: {
      title: 'Comunidad',
      verifiedTravelers: 'Viajeros verificados',
      shareExperience: 'Comparte tu experiencia',
      readMore: 'Leer más',
      helpful: 'Útil',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Elige el plan que te convenga',
      free: 'Gratis',
      plus: 'Plus',
      pro: 'Pro',
      month: 'mes',
      year: 'año',
      features: 'Características',
      basicAlerts: 'Alertas básicas',
      unlimitedAlerts: 'Alertas ilimitadas',
      prioritySupport: 'Soporte prioritario',
      offlineMode: 'Modo sin conexión',
      advancedAnalytics: 'Análisis avanzados',
      choosePlan: 'Elegir este plan',
      currentPlan: 'Plan actual',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      currency: 'Moneda',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      about: 'Acerca de',
      logout: 'Cerrar sesión',
    },
    profile: {
      title: 'Perfil',
      editProfile: 'Editar perfil',
      changePhoto: 'Cambiar foto',
      changeName: 'Cambiar nombre',
      changeEmail: 'Cambiar email',
      changePassword: 'Cambiar contraseña',
      deleteAccount: 'Eliminar cuenta',
      myTrips: 'Mis Viajes',
      viewAllTrips: 'Ver todos los viajes',
      upcomingTrips: 'Próximos viajes',
      pastTrips: 'Viajes pasados',
      favoriteTrips: 'Viajes favoritos',
      noTrips: 'Sin viajes',
      createFirstTrip: 'Crear mi primer viaje',
      tripStatusUpcoming: 'Próximo',
      tripStatusOngoing: 'En curso',
      tripStatusCompleted: 'Completado',
      open: 'Abrir',
      duplicate: 'Duplicar',
      mySelections: 'Mis Selecciones',
      favorites: 'Favoritos',
      followedDestinations: 'Destinos seguidos',
      savedArticles: 'Artículos guardados',
      savedAlerts: 'Alertas guardadas',
      customChecklist: 'Lista personalizada',
      createdTemplates: 'Plantillas creadas',
      recurringItems: 'Elementos recurrentes',
      alertsNotifications: 'Alertas y Notificaciones',
      enableNotifications: 'Activar notificaciones',
      alertsAroundMe: 'Alertas cerca de mí',
      radiusKm: 'Radio (km)',
      alertTypes: 'Tipos de alertas',
      security: 'Seguridad',
      health: 'Salud',
      transport: 'Transporte',
      politics: 'Política',
      weather: 'Clima',
      quietHours: 'Horas silenciosas',
      followedCountries: 'Países seguidos',
      premiumSection: 'Premium',
      upgradeToPremium: 'Actualizar a Premium',
      comparison: 'Comparación',
      benefits: 'Beneficios',
      renewalDate: 'Fecha de renovación',
      manageSubscription: 'Gestionar suscripción',
      restorePurchase: 'Restaurar compra',
      cancelSubscription: 'Cancelar',
      privacySecurity: 'Privacidad y Seguridad',
      downloadMyData: 'Descargar mis datos',
      deleteMyAccount: 'Eliminar mi cuenta',
      privacyPolicy: 'Política de privacidad',
      manageCookies: 'Gestionar cookies',
      communityVisibility: 'Visibilidad comunidad',
      visibilityPublic: 'Público',
      visibilityAnonymous: 'Anónimo',
      allowPrivateMessages: 'Permitir mensajes privados',
      communitySection: 'Comunidad',
      myPosts: 'Mis publicaciones',
      myComments: 'Mis comentarios',
      reportedPosts: 'Publicaciones reportadas',
      moderationHistory: 'Historial moderación',
      trustedContributor: 'Colaborador confiable',
      supportHelp: 'Soporte y Ayuda',
      faq: 'FAQ',
      contactSupport: 'Contactar soporte',
      reportBug: 'Reportar error',
      suggestImprovement: 'Sugerir mejora',
      rateApp: 'Calificar app',
      quickSummary: 'Resumen rápido',
      activeTrips: 'viajes activos',
      importantAlerts: 'alertas importantes',
      checklistItemsRemaining: 'elementos lista pendientes',
      freeBadge: 'Gratis',
      premiumBadge: 'Premium',
      expiresOn: 'Expira el',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      back: 'Volver',
      next: 'Siguiente',
      done: 'Hecho',
      close: 'Cerrar',
    },
  },
  
  de: {
    nav: {
      home: 'Startseite',
      alerts: 'Warnungen',
      community: 'Community',
      profile: 'Profil',
    },
    home: {
      greeting: 'Hallo!',
      subtitle: 'Wohin führt dich dein nächstes Abenteuer?',
      searchPlaceholder: 'Stadt, Land suchen...',
      trendingDestinations: 'Trending-Ziele',
      whyLokadia: 'Warum Lokadia?',
      verifiedInfo: 'Geprüfte Infos',
      verifiedInfoDesc: 'Nur offizielle Quellen',
      realTimeAlerts: 'Echtzeit-Warnungen',
      realTimeAlertsDesc: 'Sofortige Benachrichtigungen',
      travelChecklist: 'Reise-Checkliste',
      travelChecklistDesc: 'Nichts vergessen',
      travelPeace: 'Reise beruhigt',
      travelPeaceDesc: 'Schließe dich über 100.000 Reisenden an, die Lokadia vertrauen',
      discoverPremium: 'Premium entdecken',
      swipeHint: '← Wischen für mehr →',
      explore: 'Erkunden',
    },
    search: {
      title: 'Suchen',
      placeholder: 'Ziel suchen...',
      recentSearches: 'Letzte Suchen',
      popularDestinations: 'Beliebte Ziele',
      noResults: 'Keine Ergebnisse gefunden',
    },
    destination: {
      overview_tab: 'Übersicht',
      weather_tab: 'Wetter',
      alerts_tab: 'Warnungen',
      safety_tab: 'Sicherheit',
      health_tab: 'Gesundheit',
      entry_tab: 'Einreise',
      scams_tab: 'Betrug',
      emergency_tab: 'Notfall',
      culture_tab: 'Kultur',
    },
    alerts: {
      title: 'Warnzentrale',
      realTime: 'Echtzeit',
      filterAll: 'Alle',
      filterSecurity: 'Sicherheit',
      filterHealth: 'Gesundheit',
      filterNatural: 'Natur',
      filterTransport: 'Transport',
      urgent: 'Dringend',
      vigilance: 'Wachsamkeit',
      info: 'Info',
      noAlerts: 'Keine aktiven Warnungen',
      source: 'Quelle',
    },
    checklist: {
      title: 'Reise-Checkliste',
      beforeTravel: 'Vor der Abreise',
      documents: 'Dokumente',
      health: 'Gesundheit',
      luggage: 'Gepäck',
      addItem: 'Element hinzufügen',
      completed: 'Abgeschlossen',
    },
    community: {
      title: 'Community',
      verifiedTravelers: 'Verifizierte Reisende',
      shareExperience: 'Teile deine Erfahrung',
      readMore: 'Mehr lesen',
      helpful: 'Hilfreich',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Wähle den passenden Plan',
      free: 'Kostenlos',
      plus: 'Plus',
      pro: 'Pro',
      month: 'Monat',
      year: 'Jahr',
      features: 'Funktionen',
      basicAlerts: 'Basis-Warnungen',
      unlimitedAlerts: 'Unbegrenzte Warnungen',
      prioritySupport: 'Priority-Support',
      offlineMode: 'Offline-Modus',
      advancedAnalytics: 'Erweiterte Analysen',
      choosePlan: 'Diesen Plan wählen',
      currentPlan: 'Aktueller Plan',
    },
    settings: {
      title: 'Einstellungen',
      language: 'Sprache',
      currency: 'Währung',
      notifications: 'Benachrichtigungen',
      privacy: 'Datenschutz',
      about: 'Über',
      logout: 'Abmelden',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Profil bearbeiten',
      changePhoto: 'Foto ändern',
      changeName: 'Name ändern',
      changeEmail: 'E-Mail ändern',
      changePassword: 'Passwort ändern',
      deleteAccount: 'Konto löschen',
      myTrips: 'Meine Reisen',
      viewAllTrips: 'Alle Reisen anzeigen',
      upcomingTrips: 'Bevorstehende Reisen',
      pastTrips: 'Vergangene Reisen',
      favoriteTrips: 'Favoritenreisen',
      noTrips: 'Keine Reisen',
      createFirstTrip: 'Erste Reise erstellen',
      tripStatusUpcoming: 'Bevorstehend',
      tripStatusOngoing: 'Laufend',
      tripStatusCompleted: 'Abgeschlossen',
      open: 'Öffnen',
      duplicate: 'Duplizieren',
      mySelections: 'Meine Auswahl',
      favorites: 'Favoriten',
      followedDestinations: 'Verfolgte Ziele',
      savedArticles: 'Gespeicherte Artikel',
      savedAlerts: 'Gespeicherte Warnungen',
      customChecklist: 'Benutzerdefinierte Checkliste',
      createdTemplates: 'Erstellte Vorlagen',
      recurringItems: 'Wiederkehrende Elemente',
      alertsNotifications: 'Warnungen & Benachrichtigungen',
      enableNotifications: 'Benachrichtigungen aktivieren',
      alertsAroundMe: 'Warnungen in meiner Nähe',
      radiusKm: 'Radius (km)',
      alertTypes: 'Warnungstypen',
      security: 'Sicherheit',
      health: 'Gesundheit',
      transport: 'Transport',
      politics: 'Politik',
      weather: 'Wetter',
      quietHours: 'Ruhige Stunden',
      followedCountries: 'Verfolgte Länder',
      premiumSection: 'Premium',
      upgradeToPremium: 'Auf Premium upgraden',
      comparison: 'Vergleich',
      benefits: 'Vorteile',
      renewalDate: 'Verlängerungsdatum',
      manageSubscription: 'Abonnement verwalten',
      restorePurchase: 'Kauf wiederherstellen',
      cancelSubscription: 'Abbrechen',
      privacySecurity: 'Datenschutz & Sicherheit',
      downloadMyData: 'Meine Daten herunterladen',
      deleteMyAccount: 'Mein Konto löschen',
      privacyPolicy: 'Datenschutzerklärung',
      manageCookies: 'Cookies verwalten',
      communityVisibility: 'Community-Sichtbarkeit',
      visibilityPublic: 'Öffentlich',
      visibilityAnonymous: 'Anonym',
      allowPrivateMessages: 'Private Nachrichten erlauben',
      communitySection: 'Community',
      myPosts: 'Meine Beiträge',
      myComments: 'Meine Kommentare',
      reportedPosts: 'Gemeldete Beiträge',
      moderationHistory: 'Moderationsverlauf',
      trustedContributor: 'Vertrauenswürdiger Beitragende',
      supportHelp: 'Support & Hilfe',
      faq: 'FAQ',
      contactSupport: 'Support kontaktieren',
      reportBug: 'Fehler melden',
      suggestImprovement: 'Verbesserung vorschlagen',
      rateApp: 'App bewerten',
      quickSummary: 'Schnellübersicht',
      activeTrips: 'aktive Reisen',
      importantAlerts: 'wichtige Warnungen',
      checklistItemsRemaining: 'verbleibende Checklist-Elemente',
      freeBadge: 'Kostenlos',
      premiumBadge: 'Premium',
      expiresOn: 'Läuft ab am',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      retry: 'Wiederholen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      back: 'Zurück',
      next: 'Weiter',
      done: 'Fertig',
      close: 'Schließen',
    },
  },
  
  it: {
    nav: {
      home: 'Home',
      alerts: 'Avvisi',
      community: 'Community',
      profile: 'Profilo',
    },
    home: {
      greeting: 'Ciao!',
      subtitle: 'Dove ti porta la tua prossima avventura?',
      searchPlaceholder: 'Cerca una città, paese...',
      trendingDestinations: 'Destinazioni di Tendenza',
      whyLokadia: 'Perché Lokadia?',
      verifiedInfo: 'Info Verificate',
      verifiedInfoDesc: 'Solo fonti ufficiali',
      realTimeAlerts: 'Avvisi in Tempo Reale',
      realTimeAlertsDesc: 'Notifiche istantanee',
      travelChecklist: 'Checklist Viaggio',
      travelChecklistDesc: 'Non dimenticare nulla',
      travelPeace: 'Viaggia con tranquillità',
      travelPeaceDesc: 'Unisciti a oltre 100.000 viaggiatori che si fidano di Lokadia',
      discoverPremium: 'Scopri Premium',
      swipeHint: '← Scorri per scoprire di più →',
      explore: 'Esplora',
    },
    search: {
      title: 'Cerca',
      placeholder: 'Cerca una destinazione...',
      recentSearches: 'Ricerche recenti',
      popularDestinations: 'Destinazioni popolari',
      noResults: 'Nessun risultato trovato',
    },
    destination: {
      overview_tab: 'Panoramica',
      weather_tab: 'Meteo',
      alerts_tab: 'Avvisi',
      safety_tab: 'Sicurezza',
      health_tab: 'Salute',
      entry_tab: 'Ingresso',
      scams_tab: 'Truffe',
      emergency_tab: 'Emergenza',
      culture_tab: 'Cultura',
    },
    alerts: {
      title: 'Centro Avvisi',
      realTime: 'Tempo reale',
      filterAll: 'Tutto',
      filterSecurity: 'Sicurezza',
      filterHealth: 'Salute',
      filterNatural: 'Naturale',
      filterTransport: 'Trasporti',
      urgent: 'Urgente',
      vigilance: 'Vigilanza',
      info: 'Info',
      noAlerts: 'Nessun avviso attivo',
      source: 'Fonte',
    },
    checklist: {
      title: 'Checklist Viaggio',
      beforeTravel: 'Prima della partenza',
      documents: 'Documenti',
      health: 'Salute',
      luggage: 'Bagagli',
      addItem: 'Aggiungi elemento',
      completed: 'Completato',
    },
    community: {
      title: 'Community',
      verifiedTravelers: 'Viaggiatori verificati',
      shareExperience: 'Condividi la tua esperienza',
      readMore: 'Leggi di più',
      helpful: 'Utile',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Scegli il piano adatto a te',
      free: 'Gratis',
      plus: 'Plus',
      pro: 'Pro',
      month: 'mese',
      year: 'anno',
      features: 'Funzionalità',
      basicAlerts: 'Avvisi base',
      unlimitedAlerts: 'Avvisi illimitati',
      prioritySupport: 'Supporto prioritario',
      offlineMode: 'Modalità offline',
      advancedAnalytics: 'Analisi avanzate',
      choosePlan: 'Scegli questo piano',
      currentPlan: 'Piano attuale',
    },
    settings: {
      title: 'Impostazioni',
      language: 'Lingua',
      currency: 'Valuta',
      notifications: 'Notifiche',
      privacy: 'Privacy',
      about: 'Informazioni',
      logout: 'Esci',
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      retry: 'Riprova',
      cancel: 'Annulla',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      back: 'Indietro',
      next: 'Avanti',
      done: 'Fatto',
      close: 'Chiudi',
    },
  },
  
  pt: {
    nav: {
      home: 'Início',
      alerts: 'Alertas',
      community: 'Comunidade',
      profile: 'Perfil',
    },
    home: {
      greeting: 'Olá!',
      subtitle: 'Para onde vai sua próxima aventura?',
      searchPlaceholder: 'Buscar cidade, país...',
      trendingDestinations: 'Destinos em Alta',
      whyLokadia: 'Por que Lokadia?',
      verifiedInfo: 'Info Verificada',
      verifiedInfoDesc: 'Apenas fontes oficiais',
      realTimeAlerts: 'Alertas em Tempo Real',
      realTimeAlertsDesc: 'Notificações instantâneas',
      travelChecklist: 'Checklist de Viagem',
      travelChecklistDesc: 'Não esqueça nada',
      travelPeace: 'Viaje com tranquilidade',
      travelPeaceDesc: 'Junte-se a mais de 100.000 viajantes que confiam na Lokadia',
      discoverPremium: 'Descobrir Premium',
      swipeHint: '← Deslize para descobrir mais →',
      explore: 'Explorar',
    },
    search: {
      title: 'Buscar',
      placeholder: 'Buscar um destino...',
      recentSearches: 'Buscas recentes',
      popularDestinations: 'Destinos populares',
      noResults: 'Nenhum resultado encontrado',
    },
    destination: {
      overview_tab: 'Visão geral',
      weather_tab: 'Clima',
      alerts_tab: 'Alertas',
      safety_tab: 'Segurança',
      health_tab: 'Saúde',
      entry_tab: 'Entrada',
      scams_tab: 'Fraudes',
      emergency_tab: 'Emergência',
      culture_tab: 'Cultura',
    },
    alerts: {
      title: 'Centro de Alertas',
      realTime: 'Tempo real',
      filterAll: 'Todos',
      filterSecurity: 'Segurança',
      filterHealth: 'Saúde',
      filterNatural: 'Natural',
      filterTransport: 'Transporte',
      urgent: 'Urgente',
      vigilance: 'Vigilância',
      info: 'Info',
      noAlerts: 'Nenhum alerta ativo',
      source: 'Fonte',
    },
    checklist: {
      title: 'Checklist de Viagem',
      beforeTravel: 'Antes da partida',
      documents: 'Documentos',
      health: 'Saúde',
      luggage: 'Bagagem',
      addItem: 'Adicionar item',
      completed: 'Concluído',
    },
    community: {
      title: 'Comunidade',
      verifiedTravelers: 'Viajantes verificados',
      shareExperience: 'Compartilhe sua experiência',
      readMore: 'Ler mais',
      helpful: 'Útil',
    },
    premium: {
      title: 'Lokadia Premium',
      subtitle: 'Escolha o plano ideal para você',
      free: 'Grátis',
      plus: 'Plus',
      pro: 'Pro',
      month: 'mês',
      year: 'ano',
      features: 'Recursos',
      basicAlerts: 'Alertas básicos',
      unlimitedAlerts: 'Alertas ilimitados',
      prioritySupport: 'Suporte prioritário',
      offlineMode: 'Modo offline',
      advancedAnalytics: 'Análises avançadas',
      choosePlan: 'Escolher este plano',
      currentPlan: 'Plano atual',
    },
    settings: {
      title: 'Configurações',
      language: 'Idioma',
      currency: 'Moeda',
      notifications: 'Notificações',
      privacy: 'Privacidade',
      about: 'Sobre',
      logout: 'Sair',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      retry: 'Tentar novamente',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      back: 'Voltar',
      next: 'Próximo',
      done: 'Concluído',
      close: 'Fechar',
    },
  },
  
  ja: {
    nav: {
      home: 'ホーム',
      alerts: 'アラート',
      community: 'コミュニティ',
      profile: 'プロフィール',
    },
    home: {
      greeting: 'こんにちは！',
      subtitle: '次の冒険はどこへ？',
      searchPlaceholder: '都市、国を検索...',
      trendingDestinations: 'トレンドの目的地',
      whyLokadia: 'Lokadiaを選ぶ理由',
      verifiedInfo: '確認済み情報',
      verifiedInfoDesc: '公式ソースのみ',
      realTimeAlerts: 'リアルタイムアラート',
      realTimeAlertsDesc: '即時通知',
      travelChecklist: '旅行チェックリスト',
      travelChecklistDesc: '忘れ物なし',
      travelPeace: '安心して旅行',
      travelPeaceDesc: 'Lokadiaを信頼する10万人以上の旅行者に参加',
      discoverPremium: 'プレミアムを発見',
      swipeHint: '← スワイプしてもっと見る →',
      explore: '探索',
    },
    search: {
      title: '検索',
      placeholder: '目的地を検索...',
      recentSearches: '最近の検索',
      popularDestinations: '人気の目的地',
      noResults: '結果が見つかりません',
    },
    destination: {
      overview_tab: '概要',
      weather_tab: '天気',
      alerts_tab: 'アラート',
      safety_tab: '安全',
      health_tab: '健康',
      entry_tab: '入国',
      scams_tab: '詐欺',
      emergency_tab: '緊急',
      culture_tab: '文化',
    },
    alerts: {
      title: 'アラートセンター',
      realTime: 'リアルタイム',
      filterAll: 'すべて',
      filterSecurity: 'セキュリティ',
      filterHealth: '健康',
      filterNatural: '自然',
      filterTransport: '交通',
      urgent: '緊急',
      vigilance: '警戒',
      info: '情報',
      noAlerts: 'アクティブなアラートはありません',
      source: '情報源',
    },
    checklist: {
      title: '旅行チェックリスト',
      beforeTravel: '出発前',
      documents: '書類',
      health: '健康',
      luggage: '荷物',
      addItem: 'アイテムを追加',
      completed: '完了',
    },
    community: {
      title: 'コミュニティ',
      verifiedTravelers: '確認済み旅行者',
      shareExperience: '体験を共有',
      readMore: '続きを読む',
      helpful: '役に立つ',
    },
    premium: {
      title: 'Lokadia プレミアム',
      subtitle: 'あなたに合ったプランを選択',
      free: '無料',
      plus: 'プラス',
      pro: 'プロ',
      month: '月',
      year: '年',
      features: '機能',
      basicAlerts: '基本アラート',
      unlimitedAlerts: '無制限アラート',
      prioritySupport: '優先サポート',
      offlineMode: 'オフラインモード',
      advancedAnalytics: '高度な分析',
      choosePlan: 'このプランを選択',
      currentPlan: '現在のプラン',
    },
    settings: {
      title: '設定',
      language: '言語',
      currency: '通貨',
      notifications: '通知',
      privacy: 'プライバシー',
      about: '情報',
      logout: 'ログアウト',
    },
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      retry: '再試行',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      back: '戻る',
      next: '次へ',
      done: '完了',
      close: '閉じる',
    },
  },
  
  zh: {
    nav: {
      home: '首页',
      alerts: '警报',
      community: '社区',
      profile: '个人资料',
    },
    home: {
      greeting: '你好！',
      subtitle: '下一次冒险去哪里？',
      searchPlaceholder: '搜索城市、国家...',
      trendingDestinations: '热门目的地',
      whyLokadia: '为什么选择Lokadia？',
      verifiedInfo: '已验证信息',
      verifiedInfoDesc: '仅官方来源',
      realTimeAlerts: '实时警报',
      realTimeAlertsDesc: '即时通知',
      travelChecklist: '旅行清单',
      travelChecklistDesc: '不要遗漏任何东西',
      travelPeace: '安心旅行',
      travelPeaceDesc: '加入超过10万信任Lokadia的旅行者',
      discoverPremium: '发现高级版',
      swipeHint: '← 滑动查看更多 →',
      explore: '探索',
    },
    search: {
      title: '搜索',
      placeholder: '搜索目的地...',
      recentSearches: '最近搜索',
      popularDestinations: '热门目的地',
      noResults: '未找到结果',
    },
    destination: {
      overview_tab: '概述',
      weather_tab: '天气',
      alerts_tab: '警报',
      safety_tab: '安全',
      health_tab: '健康',
      entry_tab: '入境',
      scams_tab: '诈骗',
      emergency_tab: '紧急',
      culture_tab: '文化',
    },
    alerts: {
      title: '警报中心',
      realTime: '实时',
      filterAll: '全部',
      filterSecurity: '安全',
      filterHealth: '健康',
      filterNatural: '自然',
      filterTransport: '交通',
      urgent: '紧急',
      vigilance: '警惕',
      info: '信息',
      noAlerts: '没有活动警报',
      source: '来源',
    },
    checklist: {
      title: '旅行清单',
      beforeTravel: '出发前',
      documents: '文件',
      health: '健康',
      luggage: '行李',
      addItem: '添加项目',
      completed: '已完成',
    },
    community: {
      title: '社区',
      verifiedTravelers: '已验证旅行者',
      shareExperience: '分享您的经验',
      readMore: '阅读更多',
      helpful: '有帮助',
    },
    premium: {
      title: 'Lokadia 高级版',
      subtitle: '选择适合您的计划',
      free: '免费',
      plus: '增强版',
      pro: '专业版',
      month: '月',
      year: '年',
      features: '功能',
      basicAlerts: '基本警报',
      unlimitedAlerts: '无限警报',
      prioritySupport: '优先支持',
      offlineMode: '离线模式',
      advancedAnalytics: '高级分析',
      choosePlan: '选择此计划',
      currentPlan: '当前计划',
    },
    settings: {
      title: '设置',
      language: '语言',
      currency: '货币',
      notifications: '通知',
      privacy: '隐私',
      about: '关于',
      logout: '退出',
    },
    common: {
      loading: '加载中...',
      error: '错误',
      retry: '重试',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      back: '返回',
      next: '下一步',
      done: '完成',
      close: '关闭',
    },
  },
  
  ar: {
    nav: {
      home: 'الرئيسية',
      alerts: 'التنبيهات',
      community: 'المجتمع',
      profile: 'الملف الشخصي',
    },
    home: {
      greeting: 'مرحبا!',
      subtitle: 'إلى أين تأخذك مغامرتك القادمة؟',
      searchPlaceholder: 'ابحث عن مدينة، بلد...',
      trendingDestinations: 'وجهات رائجة',
      whyLokadia: 'لماذا Lokadia؟',
      verifiedInfo: 'معلومات موثقة',
      verifiedInfoDesc: 'مصادر رسمية فقط',
      realTimeAlerts: 'تنبيهات فورية',
      realTimeAlertsDesc: 'إشعارات فورية',
      travelChecklist: 'قائمة السفر',
      travelChecklistDesc: 'لا تنسى شيئاً',
      travelPeace: 'سافر براحة بال',
      travelPeaceDesc: 'انضم إلى أكثر من 100،000 مسافر يثقون في Lokadia',
      discoverPremium: 'اكتشف بريميوم',
      swipeHint: '← اسحب لاكتشاف المزيد →',
      explore: 'استكشف',
    },
    search: {
      title: 'بحث',
      placeholder: 'ابحث عن وجهة...',
      recentSearches: 'عمليات البحث الأخيرة',
      popularDestinations: 'وجهات شعبية',
      noResults: 'لم يتم العثور على نتائج',
    },
    destination: {
      overview_tab: 'نظرة عامة',
      weather_tab: 'الطقس',
      alerts_tab: 'التنبيهات',
      safety_tab: 'الأمان',
      health_tab: 'الصحة',
      entry_tab: 'الدخول',
      scams_tab: 'الاحتيال',
      emergency_tab: 'الطوارئ',
      culture_tab: 'الثقافة',
    },
    alerts: {
      title: 'مركز التنبيهات',
      realTime: 'الوقت الفعلي',
      filterAll: 'الكل',
      filterSecurity: 'الأمن',
      filterHealth: 'الصحة',
      filterNatural: 'طبيعي',
      filterTransport: 'النقل',
      urgent: 'عاجل',
      vigilance: 'يقظة',
      info: 'معلومات',
      noAlerts: 'لا توجد تنبيهات نشطة',
      source: 'المصدر',
    },
    checklist: {
      title: 'قائمة السفر',
      beforeTravel: 'قبل المغادرة',
      documents: 'المستندات',
      health: 'الصحة',
      luggage: 'الأمتعة',
      addItem: 'إضافة عنصر',
      completed: 'مكتمل',
    },
    community: {
      title: 'المجتمع',
      verifiedTravelers: 'مسافرون موثقون',
      shareExperience: 'شارك تجربتك',
      readMore: 'اقرأ المزيد',
      helpful: 'مفيد',
    },
    premium: {
      title: 'Lokadia بريميوم',
      subtitle: 'اختر الخطة المناسبة لك',
      free: 'مجاني',
      plus: 'بلس',
      pro: 'برو',
      month: 'شهر',
      year: 'سنة',
      features: 'الميزات',
      basicAlerts: 'تنبيهات أساسية',
      unlimitedAlerts: 'تنبيهات غير محدودة',
      prioritySupport: 'دعم ذو أولوية',
      offlineMode: 'وضع عدم الاتصال',
      advancedAnalytics: 'تحليلات متقدمة',
      choosePlan: 'اختر هذه الخطة',
      currentPlan: 'الخطة الحالية',
    },
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      currency: 'العملة',
      notifications: 'الإشعارات',
      privacy: 'الخصوصية',
      about: 'حول',
      logout: 'تسجيل الخروج',
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      retry: 'إعادة المحاولة',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      back: 'رجوع',
      next: 'التالي',
      done: 'تم',
      close: 'إغلاق',
    },
  },
};