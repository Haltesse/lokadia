// Utilitaires cryptographiques pour l'authentification locale

/**
 * Génère un hash SHA-256 d'un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Vérifie si un mot de passe correspond au hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Génère un token JWT simple (côté client uniquement)
 * Note: Ce n'est pas cryptographiquement sécurisé pour un vrai backend,
 * mais suffisant pour un stockage local
 */
export function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 jours
  }));
  const signature = btoa(Math.random().toString(36));
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Décode un token JWT
 */
export function decodeToken(token: string): { sub: string; iat: number; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifier l'expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
