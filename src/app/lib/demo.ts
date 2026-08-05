// Compte de démonstration (existe déjà dans Supabase).
// Les identifiants sont volontairement publics : le compte est en lecture
// type vitrine et affiché tel quel sur l'écran de connexion.

export async function getDemoCredentials() {
  return {
    email: 'demo@lokadia.com',
    password: 'demo123',
  };
}
