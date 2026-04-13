// Service d'authentification locale

import { db, User } from './db';
import { hashPassword, verifyPassword, generateToken, decodeToken, generateId } from './crypto';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  isPremium: boolean;
  premiumExpiry: string;
}

const TOKEN_KEY = 'lokadia_access_token';

/**
 * Initialise le service d'authentification
 */
export async function initAuth(): Promise<void> {
  await db.init();
  console.log('✅ Service d\'authentification initialisé');
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
  console.log('📝 Tentative d\'inscription pour:', email);
  
  // Vérifier si l'email existe déjà
  const existingUser = await db.getByIndex<User>('users', 'email', email.toLowerCase());
  if (existingUser) {
    console.error('❌ Email déjà utilisé:', email);
    throw new Error('EMAIL_EXISTS');
  }

  // Créer le nouvel utilisateur
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    passwordHash,
    name,
    isPremium: false,
    premiumExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours d'essai
    createdAt: now,
    updatedAt: now,
  };

  // Enregistrer l'utilisateur dans IndexedDB
  await db.add('users', newUser);
  console.log('✅ Utilisateur créé et enregistré dans IndexedDB:', newUser.email);
  console.log('📊 ID utilisateur:', newUser.id);

  // Générer le token
  const token = generateToken(newUser.id);
  console.log('🔑 Token JWT généré pour l\'utilisateur');

  // Retourner l'utilisateur (sans le hash du mot de passe)
  const { passwordHash: _, ...authUser } = newUser;
  return { user: authUser, token };
}

/**
 * Connexion d'un utilisateur
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  console.log('🔐 Tentative de connexion pour:', email);
  
  // Récupérer l'utilisateur
  const user = await db.getByIndex<User>('users', 'email', email.toLowerCase());
  if (!user) {
    console.error('❌ Utilisateur non trouvé dans la base de données:', email);
    throw new Error('USER_NOT_FOUND');
  }
  
  console.log('✅ Utilisateur trouvé:', user.email);
  console.log('📝 Hash stocké:', user.passwordHash.substring(0, 20) + '...');

  // Vérifier le mot de passe
  console.log('🔍 Vérification du mot de passe...');
  const passwordHash = await hashPassword(password);
  console.log('📝 Hash calculé:', passwordHash.substring(0, 20) + '...');
  
  const isValid = await verifyPassword(password, user.passwordHash);
  console.log('🔍 Résultat de la vérification:', isValid);
  
  if (!isValid) {
    console.error('❌ Mot de passe invalide pour:', email);
    throw new Error('INVALID_PASSWORD');
  }

  console.log('✅ Connexion réussie:', user.email);

  // Générer le token
  const token = generateToken(user.id);

  // Retourner l'utilisateur (sans le hash du mot de passe)
  const { passwordHash: _, ...authUser } = user;
  return { user: authUser, token };
}

/**
 * Récupère l'utilisateur actuel à partir du token
 */
export async function getCurrentUser(token: string): Promise<AuthUser> {
  // Décoder le token
  const payload = decodeToken(token);
  if (!payload) {
    throw new Error('INVALID_TOKEN');
  }

  // Récupérer l'utilisateur
  const user = await db.get<User>('users', payload.sub);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Retourner l'utilisateur (sans le hash du mot de passe)
  const { passwordHash: _, ...authUser } = user;
  return authUser;
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
  // Récupérer l'utilisateur
  const user = await db.get<User>('users', userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Mettre à jour les champs autorisés
  const updatedUser: User = {
    ...user,
    ...updates,
    id: user.id, // Ne pas modifier l'ID
    email: user.email, // Ne pas modifier l'email
    passwordHash: user.passwordHash, // Ne pas modifier le hash
    updatedAt: new Date().toISOString(),
  };

  await db.update('users', updatedUser);
  console.log('✅ Profil mis à jour:', updatedUser.email);

  // Retourner l'utilisateur (sans le hash du mot de passe)
  const { passwordHash: _, ...authUser } = updatedUser;
  return authUser;
}

/**
 * Change le mot de passe
 */
export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  // Récupérer l'utilisateur
  const user = await db.get<User>('users', userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Vérifier l'ancien mot de passe
  const isValid = await verifyPassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_PASSWORD');
  }

  // Hasher le nouveau mot de passe
  const newPasswordHash = await hashPassword(newPassword);

  // Mettre à jour
  const updatedUser: User = {
    ...user,
    passwordHash: newPasswordHash,
    updatedAt: new Date().toISOString(),
  };

  await db.update('users', updatedUser);
  console.log('✅ Mot de passe changé:', user.email);
}

/**
 * Récupère le token stocké
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Stocke le token
 */
export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Supprime le token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Vérifie si l'utilisateur est premium
 */
export function isPremium(user: AuthUser): boolean {
  if (!user.isPremium) return false;
  
  const expiryDate = new Date(user.premiumExpiry);
  const now = new Date();
  
  return expiryDate > now;
}

/**
 * Active l'abonnement premium
 */
export async function activatePremium(userId: string, durationMonths: number = 12): Promise<AuthUser> {
  const user = await db.get<User>('users', userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const now = new Date();
  const expiryDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  const updatedUser: User = {
    ...user,
    isPremium: true,
    premiumExpiry: expiryDate.toISOString(),
    updatedAt: now.toISOString(),
  };

  await db.update('users', updatedUser);
  console.log('✅ Premium activé jusqu\'au:', expiryDate.toISOString());

  const { passwordHash: _, ...authUser } = updatedUser;
  return authUser;
}

/**
 * Liste tous les utilisateurs enregistrés (pour debug)
 */
export async function getAllUsers(): Promise<{ email: string; name: string; createdAt: string }[]> {
  const users = await db.getAll<User>('users');
  return users.map(user => ({
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }));
}

/**
 * Compte le nombre d'utilisateurs enregistrés
 */
export async function countUsers(): Promise<number> {
  return await db.count('users');
}