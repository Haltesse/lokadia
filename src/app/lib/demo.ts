// Utilitaires pour le compte de démonstration

/**
 * Retourne les credentials du compte démo existant
 * Le compte démo existe déjà dans Supabase, pas besoin de le créer
 */
export async function getDemoCredentials() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       🎭 DEMO ACCOUNT CREDENTIALS               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('📧 Email: demo@lokadia.com');
  console.log('🔑 Password: demo123');
  console.log('ℹ️  Account already exists in Supabase\n');
  
  return {
    email: 'demo@lokadia.com',
    password: 'demo123',
  };
}

/**
 * Obtient les statistiques de la base de données (non implémenté pour Supabase)
 */
export async function getDatabaseStats() {
  console.log('📊 Database statistics not available');
  return {
    users: 0,
    trips: 0,
    favorites: 0,
    followedTips: 0,
    checklistItems: 0,
  };
}

/**
 * Efface complètement la base de données (non implémenté pour Supabase)
 */
export async function clearDatabase() {
  console.warn('⚠️  clearDatabase() is not available with Supabase');
  console.log('ℹ️  Use the Supabase dashboard to manage the database');
}
