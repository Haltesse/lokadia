/**
 * Edge Function : lokascore-compute
 * ════════════════════════════════════════════════════════════════════════
 *  CŒUR PROPRIÉTAIRE DE LOKADIA — NE JAMAIS EXPOSER CÔTÉ CLIENT
 * ════════════════════════════════════════════════════════════════════════
 *
 *  Cette fonction contient l'INTÉGRALITÉ du secret de fabrique Lokascore :
 *    - Le dataset curé des 61 pays (indices officiels)
 *    - Les tables de normalisation (MAE/FCDO/US State/DFAT)
 *    - Les pondérations internes de chaque dimension (formule d'agrégation)
 *    - La matrice de modulation par profil de voyage (9 profils)
 *    - La formule composite finale
 *
 *  Le client n'envoie qu'un destinationId + un profil, et ne reçoit QUE :
 *    - le score final 0-100
 *    - les 4 scores de dimension (résultats, pas les poids)
 *    - les NOMS des sources qui ont contribué (pas leurs valeurs/poids)
 *    - le niveau (couleur) + alertes live éventuelles
 *
 *  Aucune pondération, aucune formule, aucune table de normalisation ne
 *  transite vers le navigateur.
 *
 *  Endpoint :
 *    GET /functions/v1/lokascore-compute?destination=paris-france&profile=studies
 *    GET /functions/v1/lokascore-compute?destination=paris-france&profile=studies&live=1
 *      (live=1 → enrichit avec les advisories temps réel MAE/FCDO/US/OMS pour ce pays)
 *    GET ...&city=Santorini&country=Greece  (fallback Numbeo pour destinations non curées)
 *
 *  Déploiement :
 *    supabase functions deploy lokascore-compute --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ════════════════════════════════════════════════════════════════════════
//  SECRET 1 — Tables de normalisation des advisories
// ════════════════════════════════════════════════════════════════════════
const MAE_SCORE: Record<string, number> = { vert: 100, jaune: 75, orange: 50, rouge: 25, noir: 0 };
const FCDO_SCORE: Record<string, number> = { none: 100, advisory: 60, essential: 30, donottravel: 0 };
const US_STATE_SCORE: Record<number, number> = { 1: 100, 2: 70, 3: 35, 4: 0 };
const DFAT_SCORE: Record<string, number> = { normal: 100, caution: 65, reconsider: 30, donottravel: 0 };

// ════════════════════════════════════════════════════════════════════════
//  SECRET 2 — Matrice de pondération par profil de voyage (somme = 1.00)
// ════════════════════════════════════════════════════════════════════════
interface Weights { security: number; health: number; nature: number; infrastructure: number; }
const PROFILE_WEIGHTS: Record<string, Weights> = {
  default:        { security: 0.40, health: 0.25, nature: 0.20, infrastructure: 0.15 },
  studies:        { security: 0.45, health: 0.20, nature: 0.15, infrastructure: 0.20 },
  'remote-work':  { security: 0.35, health: 0.20, nature: 0.15, infrastructure: 0.30 },
  backpack:       { security: 0.45, health: 0.30, nature: 0.15, infrastructure: 0.10 },
  family:         { security: 0.35, health: 0.35, nature: 0.20, infrastructure: 0.10 },
  senior:         { security: 0.30, health: 0.40, nature: 0.20, infrastructure: 0.10 },
  business:       { security: 0.45, health: 0.20, nature: 0.10, infrastructure: 0.25 },
  humanitarian:   { security: 0.60, health: 0.20, nature: 0.10, infrastructure: 0.10 },
  vacation:       { security: 0.40, health: 0.25, nature: 0.20, infrastructure: 0.15 },
};

// ════════════════════════════════════════════════════════════════════════
//  SECRET 3 — Dataset curé des pays (indices officiels normalisés)
// ════════════════════════════════════════════════════════════════════════
interface CountryRisk {
  iso: string; name: string;
  mae?: string; fcdo?: string; usState?: number; dfat?: string;
  whoActiveAlerts?: number; lancetHaq?: number; emdatStructural?: number;
  wjpRuleOfLaw?: number; cpiCorruption?: number; whoRoadSafety?: number;
  wbStability?: number; gsmaConnectivity?: number;
}
const COUNTRY_RISK_DATA: Record<string, CountryRisk> = {
  FR: { iso: 'FR', name: 'France', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', whoActiveAlerts: 0, lancetHaq: 88, emdatStructural: 80, wjpRuleOfLaw: 73, cpiCorruption: 71, whoRoadSafety: 80, wbStability: 65, gsmaConnectivity: 81 },
  DE: { iso: 'DE', name: 'Germany', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 90, emdatStructural: 85, wjpRuleOfLaw: 84, cpiCorruption: 75, whoRoadSafety: 88, wbStability: 70, gsmaConnectivity: 84 },
  GB: { iso: 'GB', name: 'United Kingdom', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 89, emdatStructural: 90, wjpRuleOfLaw: 78, cpiCorruption: 71, whoRoadSafety: 85, wbStability: 60, gsmaConnectivity: 86 },
  ES: { iso: 'ES', name: 'Spain', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 89, emdatStructural: 80, wjpRuleOfLaw: 71, cpiCorruption: 60, whoRoadSafety: 84, wbStability: 65, gsmaConnectivity: 78 },
  IT: { iso: 'IT', name: 'Italy', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 88, emdatStructural: 75, wjpRuleOfLaw: 68, cpiCorruption: 56, whoRoadSafety: 75, wbStability: 60, gsmaConnectivity: 75 },
  PT: { iso: 'PT', name: 'Portugal', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 86, emdatStructural: 85, wjpRuleOfLaw: 75, cpiCorruption: 61, whoRoadSafety: 78, wbStability: 75, gsmaConnectivity: 76 },
  NL: { iso: 'NL', name: 'Netherlands', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 92, emdatStructural: 85, wjpRuleOfLaw: 88, cpiCorruption: 78, whoRoadSafety: 92, wbStability: 80, gsmaConnectivity: 86 },
  BE: { iso: 'BE', name: 'Belgium', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 89, emdatStructural: 90, wjpRuleOfLaw: 79, cpiCorruption: 69, whoRoadSafety: 80, wbStability: 65, gsmaConnectivity: 80 },
  CH: { iso: 'CH', name: 'Switzerland', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 95, emdatStructural: 80, wjpRuleOfLaw: 88, cpiCorruption: 81, whoRoadSafety: 95, wbStability: 90, gsmaConnectivity: 87 },
  AT: { iso: 'AT', name: 'Austria', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 91, emdatStructural: 80, wjpRuleOfLaw: 81, cpiCorruption: 71, whoRoadSafety: 88, wbStability: 78, gsmaConnectivity: 83 },
  IE: { iso: 'IE', name: 'Ireland', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 88, emdatStructural: 92, wjpRuleOfLaw: 80, cpiCorruption: 77, whoRoadSafety: 87, wbStability: 80, gsmaConnectivity: 82 },
  SE: { iso: 'SE', name: 'Sweden', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 92, emdatStructural: 90, wjpRuleOfLaw: 86, cpiCorruption: 80, whoRoadSafety: 92, wbStability: 82, gsmaConnectivity: 88 },
  NO: { iso: 'NO', name: 'Norway', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 95, emdatStructural: 92, wjpRuleOfLaw: 89, cpiCorruption: 84, whoRoadSafety: 95, wbStability: 88, gsmaConnectivity: 89 },
  DK: { iso: 'DK', name: 'Denmark', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 94, emdatStructural: 92, wjpRuleOfLaw: 91, cpiCorruption: 90, whoRoadSafety: 92, wbStability: 87, gsmaConnectivity: 90 },
  FI: { iso: 'FI', name: 'Finland', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 94, emdatStructural: 92, wjpRuleOfLaw: 92, cpiCorruption: 88, whoRoadSafety: 90, wbStability: 88, gsmaConnectivity: 87 },
  IS: { iso: 'IS', name: 'Iceland', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 95, emdatStructural: 75, wjpRuleOfLaw: 90, cpiCorruption: 79, whoRoadSafety: 90, wbStability: 95, gsmaConnectivity: 88 },
  PL: { iso: 'PL', name: 'Poland', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 80, emdatStructural: 85, wjpRuleOfLaw: 56, cpiCorruption: 53, whoRoadSafety: 70, wbStability: 50, gsmaConnectivity: 74 },
  CZ: { iso: 'CZ', name: 'Czech Republic', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 85, emdatStructural: 88, wjpRuleOfLaw: 71, cpiCorruption: 56, whoRoadSafety: 80, wbStability: 70, gsmaConnectivity: 79 },
  GR: { iso: 'GR', name: 'Greece', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 86, emdatStructural: 65, wjpRuleOfLaw: 60, cpiCorruption: 49, whoRoadSafety: 70, wbStability: 50, gsmaConnectivity: 73 },
  RU: { iso: 'RU', name: 'Russia', mae: 'rouge', fcdo: 'donottravel', usState: 4, dfat: 'donottravel', whoActiveAlerts: 0, lancetHaq: 65, emdatStructural: 75, wjpRuleOfLaw: 28, cpiCorruption: 22, whoRoadSafety: 50, wbStability: 20, gsmaConnectivity: 73 },
  TR: { iso: 'TR', name: 'Turkey', mae: 'jaune', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 55, wjpRuleOfLaw: 38, cpiCorruption: 34, whoRoadSafety: 55, wbStability: 25, gsmaConnectivity: 71 },
  US: { iso: 'US', name: 'United States', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'normal', lancetHaq: 88, emdatStructural: 60, wjpRuleOfLaw: 70, cpiCorruption: 65, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 85 },
  CA: { iso: 'CA', name: 'Canada', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 91, emdatStructural: 78, wjpRuleOfLaw: 80, cpiCorruption: 75, whoRoadSafety: 85, wbStability: 85, gsmaConnectivity: 84 },
  MX: { iso: 'MX', name: 'Mexico', mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 50, wjpRuleOfLaw: 42, cpiCorruption: 26, whoRoadSafety: 50, wbStability: 25, gsmaConnectivity: 70 },
  BR: { iso: 'BR', name: 'Brazil', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 73, emdatStructural: 70, wjpRuleOfLaw: 48, cpiCorruption: 34, whoRoadSafety: 50, wbStability: 35, gsmaConnectivity: 71 },
  AR: { iso: 'AR', name: 'Argentina', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 75, emdatStructural: 80, wjpRuleOfLaw: 55, cpiCorruption: 37, whoRoadSafety: 60, wbStability: 50, gsmaConnectivity: 74 },
  MA: { iso: 'MA', name: 'Morocco', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 65, emdatStructural: 70, wjpRuleOfLaw: 50, cpiCorruption: 38, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 67 },
  EG: { iso: 'EG', name: 'Egypt', mae: 'jaune', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 60, emdatStructural: 75, wjpRuleOfLaw: 35, cpiCorruption: 30, whoRoadSafety: 35, wbStability: 25, gsmaConnectivity: 66 },
  AE: { iso: 'AE', name: 'United Arab Emirates', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal', lancetHaq: 75, emdatStructural: 92, wjpRuleOfLaw: 68, cpiCorruption: 68, whoRoadSafety: 65, wbStability: 70, gsmaConnectivity: 82 },
  IL: { iso: 'IL', name: 'Israel', mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 85, emdatStructural: 70, wjpRuleOfLaw: 65, cpiCorruption: 58, whoRoadSafety: 70, wbStability: 20, gsmaConnectivity: 81 },
  ZA: { iso: 'ZA', name: 'South Africa', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 60, emdatStructural: 80, wjpRuleOfLaw: 58, cpiCorruption: 41, whoRoadSafety: 25, wbStability: 35, gsmaConnectivity: 65 },
  JP: { iso: 'JP', name: 'Japan', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 96, emdatStructural: 45, wjpRuleOfLaw: 79, cpiCorruption: 71, whoRoadSafety: 88, wbStability: 80, gsmaConnectivity: 84 },
  CN: { iso: 'CN', name: 'China', mae: 'jaune', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 78, emdatStructural: 55, wjpRuleOfLaw: 47, cpiCorruption: 43, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 80 },
  HK: { iso: 'HK', name: 'Hong Kong', mae: 'vert', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 92, emdatStructural: 70, wjpRuleOfLaw: 70, cpiCorruption: 74, whoRoadSafety: 85, wbStability: 55, gsmaConnectivity: 88 },
  KR: { iso: 'KR', name: 'South Korea', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 93, emdatStructural: 75, wjpRuleOfLaw: 73, cpiCorruption: 64, whoRoadSafety: 75, wbStability: 60, gsmaConnectivity: 88 },
  TH: { iso: 'TH', name: 'Thailand', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 72, emdatStructural: 70, wjpRuleOfLaw: 49, cpiCorruption: 35, whoRoadSafety: 25, wbStability: 30, gsmaConnectivity: 73 },
  SG: { iso: 'SG', name: 'Singapore', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 95, emdatStructural: 95, wjpRuleOfLaw: 82, cpiCorruption: 84, whoRoadSafety: 92, wbStability: 92, gsmaConnectivity: 89 },
  MY: { iso: 'MY', name: 'Malaysia', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 73, emdatStructural: 78, wjpRuleOfLaw: 55, cpiCorruption: 50, whoRoadSafety: 60, wbStability: 55, gsmaConnectivity: 78 },
  ID: { iso: 'ID', name: 'Indonesia', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 65, emdatStructural: 45, wjpRuleOfLaw: 51, cpiCorruption: 37, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 67 },
  IN: { iso: 'IN', name: 'India', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 55, emdatStructural: 60, wjpRuleOfLaw: 50, cpiCorruption: 39, whoRoadSafety: 35, wbStability: 40, gsmaConnectivity: 60 },
  AU: { iso: 'AU', name: 'Australia', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 92, emdatStructural: 75, wjpRuleOfLaw: 80, cpiCorruption: 75, whoRoadSafety: 87, wbStability: 80, gsmaConnectivity: 85 },
  NZ: { iso: 'NZ', name: 'New Zealand', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 89, emdatStructural: 65, wjpRuleOfLaw: 83, cpiCorruption: 83, whoRoadSafety: 80, wbStability: 90, gsmaConnectivity: 85 },
  HU: { iso: 'HU', name: 'Hungary', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 78, emdatStructural: 88, wjpRuleOfLaw: 51, cpiCorruption: 41, whoRoadSafety: 70, wbStability: 60, gsmaConnectivity: 76 },
  RO: { iso: 'RO', name: 'Romania', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 73, emdatStructural: 75, wjpRuleOfLaw: 55, cpiCorruption: 46, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 72 },
  HR: { iso: 'HR', name: 'Croatia', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 80, emdatStructural: 70, wjpRuleOfLaw: 62, cpiCorruption: 47, whoRoadSafety: 70, wbStability: 60, gsmaConnectivity: 75 },
  SI: { iso: 'SI', name: 'Slovenia', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 86, emdatStructural: 85, wjpRuleOfLaw: 75, cpiCorruption: 60, whoRoadSafety: 85, wbStability: 75, gsmaConnectivity: 80 },
  SK: { iso: 'SK', name: 'Slovakia', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 80, emdatStructural: 88, wjpRuleOfLaw: 64, cpiCorruption: 49, whoRoadSafety: 75, wbStability: 65, gsmaConnectivity: 78 },
  EE: { iso: 'EE', name: 'Estonia', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 80, emdatStructural: 92, wjpRuleOfLaw: 78, cpiCorruption: 76, whoRoadSafety: 80, wbStability: 70, gsmaConnectivity: 85 },
  VN: { iso: 'VN', name: 'Vietnam', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 65, emdatStructural: 50, wjpRuleOfLaw: 47, cpiCorruption: 40, whoRoadSafety: 35, wbStability: 60, gsmaConnectivity: 70 },
  PH: { iso: 'PH', name: 'Philippines', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 60, emdatStructural: 35, wjpRuleOfLaw: 47, cpiCorruption: 34, whoRoadSafety: 30, wbStability: 30, gsmaConnectivity: 64 },
  TW: { iso: 'TW', name: 'Taiwan', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 90, emdatStructural: 55, wjpRuleOfLaw: 75, cpiCorruption: 67, whoRoadSafety: 70, wbStability: 65, gsmaConnectivity: 85 },
  CL: { iso: 'CL', name: 'Chile', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 78, emdatStructural: 55, wjpRuleOfLaw: 70, cpiCorruption: 63, whoRoadSafety: 60, wbStability: 60, gsmaConnectivity: 75 },
  CO: { iso: 'CO', name: 'Colombia', mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 60, wjpRuleOfLaw: 45, cpiCorruption: 39, whoRoadSafety: 45, wbStability: 30, gsmaConnectivity: 68 },
  PE: { iso: 'PE', name: 'Peru', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 65, emdatStructural: 50, wjpRuleOfLaw: 50, cpiCorruption: 33, whoRoadSafety: 45, wbStability: 30, gsmaConnectivity: 65 },
  UY: { iso: 'UY', name: 'Uruguay', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 75, emdatStructural: 90, wjpRuleOfLaw: 75, cpiCorruption: 76, whoRoadSafety: 70, wbStability: 75, gsmaConnectivity: 72 },
  KE: { iso: 'KE', name: 'Kenya', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 50, emdatStructural: 70, wjpRuleOfLaw: 45, cpiCorruption: 31, whoRoadSafety: 30, wbStability: 30, gsmaConnectivity: 55 },
  TN: { iso: 'TN', name: 'Tunisia', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 65, emdatStructural: 85, wjpRuleOfLaw: 50, cpiCorruption: 39, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 67 },
  JO: { iso: 'JO', name: 'Jordan', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 70, emdatStructural: 88, wjpRuleOfLaw: 55, cpiCorruption: 46, whoRoadSafety: 50, wbStability: 35, gsmaConnectivity: 72 },
  SA: { iso: 'SA', name: 'Saudi Arabia', mae: 'jaune', fcdo: 'advisory', usState: 2, dfat: 'caution', lancetHaq: 70, emdatStructural: 92, wjpRuleOfLaw: 50, cpiCorruption: 53, whoRoadSafety: 35, wbStability: 50, gsmaConnectivity: 78 },
  QA: { iso: 'QA', name: 'Qatar', mae: 'vert', fcdo: 'none', usState: 1, dfat: 'normal', lancetHaq: 78, emdatStructural: 95, wjpRuleOfLaw: 65, cpiCorruption: 58, whoRoadSafety: 60, wbStability: 70, gsmaConnectivity: 84 },
};

const DESTINATION_TO_COUNTRY_ISO: Record<string, string> = {
  'paris-france': 'FR', 'nice-france': 'FR', 'london-uk': 'GB', 'edinburgh-uk': 'GB',
  'berlin-germany': 'DE', 'barcelona-spain': 'ES', 'madrid-spain': 'ES', 'seville-spain': 'ES',
  'rome-italy': 'IT', 'milan-italy': 'IT', 'venice-italy': 'IT', 'florence-italy': 'IT',
  'lisbon-portugal': 'PT', 'porto-portugal': 'PT', 'amsterdam-netherlands': 'NL',
  'brussels-belgium': 'BE', 'zurich-switzerland': 'CH', 'vienna-austria': 'AT',
  'dublin-ireland': 'IE', 'stockholm-sweden': 'SE', 'oslo-norway': 'NO',
  'copenhagen-denmark': 'DK', 'helsinki-finland': 'FI', 'reykjavik-iceland': 'IS',
  'warsaw-poland': 'PL', 'krakow-poland': 'PL', 'prague-czech': 'CZ', 'prague-czechia': 'CZ',
  'athens-greece': 'GR', 'moscow-russia': 'RU', 'istanbul-turkey': 'TR',
  'new-york-usa': 'US', 'miami-usa': 'US', 'los-angeles-usa': 'US', 'san-francisco-usa': 'US',
  'toronto-canada': 'CA', 'vancouver-canada': 'CA', 'montreal-canada': 'CA',
  'mexico-city-mexico': 'MX', 'rio-de-janeiro-brazil': 'BR', 'buenos-aires-argentina': 'AR',
  'marrakech-morocco': 'MA', 'cairo-egypt': 'EG', 'dubai-uae': 'AE', 'tel-aviv-israel': 'IL',
  'cape-town-south-africa': 'ZA', 'tokyo-japan': 'JP', 'shanghai-china': 'CN',
  'hong-kong-china': 'HK', 'seoul-south-korea': 'KR', 'bangkok-thailand': 'TH',
  'phuket-thailand': 'TH', 'singapore-singapore': 'SG', 'kuala-lumpur-malaysia': 'MY',
  'bali-indonesia': 'ID', 'mumbai-india': 'IN', 'sydney-australia': 'AU',
  // Inférences pour destinations sans entrée pays dédiée
  'santorini-greece': 'GR',
};

// ════════════════════════════════════════════════════════════════════════
//  Métadonnées d'affichage des dimensions (public — noms de sources)
// ════════════════════════════════════════════════════════════════════════
const DIM_SOURCES = {
  security: { mae: 'MAE France', fcdo: 'UK FCDO', usState: 'US State Dept', dfat: 'AU DFAT' },
  health: { who: 'OMS', ecdc: 'ECDC', cdc: 'CDC USA', haq: 'Lancet HAQ' },
  nature: { gdacs: 'GDACS', emdat: 'EM-DAT', usgs: 'USGS', reliefweb: 'ReliefWeb' },
  infrastructure: { wjp: 'WJP', cpi: 'Transparency Int.', whoRoad: 'WHO Road Safety', wb: 'World Bank', gsma: 'GSMA' },
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// ════════════════════════════════════════════════════════════════════════
//  SECRET 4 — Agrégation des 4 dimensions (formule propriétaire)
// ════════════════════════════════════════════════════════════════════════
interface DimResult { score: number; sources: string[]; official: boolean; }

function wavg(parts: Array<{ v: number; w: number }>): number {
  const tw = parts.reduce((s, p) => s + p.w, 0);
  if (tw === 0) return 0;
  return clamp(parts.reduce((s, p) => s + p.v * p.w, 0) / tw);
}

function computeSecurity(c: CountryRisk | null): DimResult {
  const parts: Array<{ v: number; w: number }> = [];
  const sources: string[] = [];
  if (c?.mae !== undefined) { parts.push({ v: MAE_SCORE[c.mae], w: 0.45 }); sources.push(DIM_SOURCES.security.mae); }
  if (c?.fcdo !== undefined) { parts.push({ v: FCDO_SCORE[c.fcdo], w: 0.25 }); sources.push(DIM_SOURCES.security.fcdo); }
  if (c?.usState !== undefined) { parts.push({ v: US_STATE_SCORE[c.usState], w: 0.20 }); sources.push(DIM_SOURCES.security.usState); }
  if (c?.dfat !== undefined) { parts.push({ v: DFAT_SCORE[c.dfat], w: 0.10 }); sources.push(DIM_SOURCES.security.dfat); }
  if (parts.length === 0) return { score: 65, sources: [], official: false };
  return { score: wavg(parts), sources, official: true };
}

function computeHealth(c: CountryRisk | null, numbeoHealth?: number): DimResult {
  const parts: Array<{ v: number; w: number }> = [];
  const sources: string[] = [];
  if (c?.whoActiveAlerts !== undefined) {
    const v = c.whoActiveAlerts === 0 ? 100 : clamp(100 - Math.min(30, c.whoActiveAlerts * 15));
    parts.push({ v, w: 0.40 }); sources.push(DIM_SOURCES.health.who);
  }
  if (c?.lancetHaq !== undefined) { parts.push({ v: clamp(c.lancetHaq), w: 0.10 }); sources.push(DIM_SOURCES.health.haq); }
  if (parts.length === 0) {
    if (numbeoHealth !== undefined) return { score: clamp(numbeoHealth), sources: [], official: false };
    return { score: 70, sources: [], official: false };
  }
  return { score: wavg(parts), sources, official: true };
}

function computeNature(c: CountryRisk | null, liveSeverity: 'orange' | 'red' | null, numbeoPollution?: number): DimResult {
  const parts: Array<{ v: number; w: number }> = [];
  const sources: string[] = [];
  // N_act (60%) : priorité aux alertes live
  let nAct = 100;
  if (liveSeverity === 'red') { nAct = 30; sources.push(DIM_SOURCES.nature.usgs, DIM_SOURCES.nature.reliefweb); }
  else if (liveSeverity === 'orange') { nAct = 60; sources.push(DIM_SOURCES.nature.usgs, DIM_SOURCES.nature.reliefweb); }
  else { sources.push(DIM_SOURCES.nature.gdacs); }
  parts.push({ v: nAct, w: 0.60 });
  // N_str (40%) : EM-DAT
  if (c?.emdatStructural !== undefined) { parts.push({ v: clamp(c.emdatStructural), w: 0.40 }); sources.push(DIM_SOURCES.nature.emdat); }
  else if (numbeoPollution !== undefined) { parts.push({ v: clamp(100 - numbeoPollution), w: 0.40 }); }
  else { parts.push({ v: 70, w: 0.40 }); }
  const official = c?.emdatStructural !== undefined || liveSeverity !== null;
  return { score: wavg(parts), sources: official ? sources : [], official };
}

function computeInfra(c: CountryRisk | null, numbeoQol?: number): DimResult {
  const parts: Array<{ v: number; w: number }> = [];
  const sources: string[] = [];
  if (c?.wjpRuleOfLaw !== undefined) { parts.push({ v: clamp(c.wjpRuleOfLaw), w: 0.30 }); sources.push(DIM_SOURCES.infrastructure.wjp); }
  if (c?.cpiCorruption !== undefined) { parts.push({ v: clamp(c.cpiCorruption), w: 0.25 }); sources.push(DIM_SOURCES.infrastructure.cpi); }
  if (c?.whoRoadSafety !== undefined) { parts.push({ v: clamp(c.whoRoadSafety), w: 0.20 }); sources.push(DIM_SOURCES.infrastructure.whoRoad); }
  if (c?.wbStability !== undefined) { parts.push({ v: clamp(c.wbStability), w: 0.15 }); sources.push(DIM_SOURCES.infrastructure.wb); }
  if (c?.gsmaConnectivity !== undefined) { parts.push({ v: clamp(c.gsmaConnectivity), w: 0.10 }); sources.push(DIM_SOURCES.infrastructure.gsma); }
  if (parts.length === 0) {
    if (numbeoQol !== undefined) return { score: clamp(numbeoQol), sources: [], official: false };
    return { score: 70, sources: [], official: false };
  }
  return { score: wavg(parts), sources, official: true };
}

function composite(dims: { security: number; health: number; nature: number; infrastructure: number }, profile: string): number {
  const w = PROFILE_WEIGHTS[profile] ?? PROFILE_WEIGHTS.default;
  return Math.round(clamp(
    dims.security * w.security + dims.health * w.health +
    dims.nature * w.nature + dims.infrastructure * w.infrastructure
  ));
}

function levelOf(score: number): { level: string; label: string } {
  if (score >= 80) return { level: 'safe', label: 'Sécurisée' };
  if (score >= 60) return { level: 'vigilance', label: 'Vigilance' };
  if (score >= 40) return { level: 'risk', label: 'Risque élevé' };
  if (score >= 20) return { level: 'high-risk', label: 'Très risqué' };
  return { level: 'forbidden', label: 'Interdit' };
}

// ════════════════════════════════════════════════════════════════════════
//  Alertes nature live (USGS + ReliefWeb) — cache global 30 min
// ════════════════════════════════════════════════════════════════════════
const ISO3_TO_ISO2: Record<string, string> = {
  FRA:'FR',DEU:'DE',GBR:'GB',ESP:'ES',ITA:'IT',PRT:'PT',NLD:'NL',BEL:'BE',CHE:'CH',AUT:'AT',IRL:'IE',SWE:'SE',NOR:'NO',DNK:'DK',FIN:'FI',ISL:'IS',POL:'PL',CZE:'CZ',GRC:'GR',RUS:'RU',TUR:'TR',USA:'US',CAN:'CA',MEX:'MX',BRA:'BR',ARG:'AR',MAR:'MA',EGY:'EG',ARE:'AE',ISR:'IL',ZAF:'ZA',JPN:'JP',CHN:'CN',HKG:'HK',KOR:'KR',THA:'TH',SGP:'SG',MYS:'MY',IDN:'ID',IND:'IN',AUS:'AU',NZL:'NZ',HUN:'HU',ROU:'RO',HRV:'HR',SVN:'SI',SVK:'SK',EST:'EE',VNM:'VN',PHL:'PH',TWN:'TW',CHL:'CL',COL:'CO',PER:'PE',URY:'UY',KEN:'KE',TUN:'TN',JOR:'JO',SAU:'SA',QAT:'QA',
};
const USGS_PLACE_TO_ISO: Record<string, string> = {
  'Japan':'JP','China':'CN','Indonesia':'ID','Philippines':'PH','Mexico':'MX','Chile':'CL','Peru':'PE','Turkey':'TR','Greece':'GR','Italy':'IT','United States':'US','Russia':'RU','India':'IN','Taiwan':'TW','New Zealand':'NZ','Colombia':'CO','Argentina':'AR','Morocco':'MA','Egypt':'EG','Thailand':'TH','Malaysia':'MY','South Africa':'ZA','France':'FR','Spain':'ES',
};

let alertsCache: { sev: Map<string, 'orange' | 'red'>; ts: number } | null = null;

async function getNatureAlerts(): Promise<Map<string, 'orange' | 'red'>> {
  if (alertsCache && Date.now() - alertsCache.ts < 30 * 60 * 1000) return alertsCache.sev;
  const sev = new Map<string, 'orange' | 'red'>();
  // USGS earthquakes M4.5+ week
  try {
    const r = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const d = await r.json();
      for (const f of d.features ?? []) {
        const mag = f.properties?.mag;
        const place: string = f.properties?.place ?? '';
        if (!mag || mag < 6) continue;
        const country = place.split(',').map((s: string) => s.trim()).pop() ?? '';
        const iso = USGS_PLACE_TO_ISO[country];
        if (!iso) continue;
        const s = mag >= 7 ? 'red' : 'orange';
        if (sev.get(iso) !== 'red') sev.set(iso, s);
      }
    }
  } catch { /* ignore */ }
  // ReliefWeb ongoing disasters
  try {
    const r = await fetch('https://api.reliefweb.int/v1/disasters?appname=lokadia.fr&filter[field]=status&filter[value]=ongoing&limit=200&fields[include][]=country', { signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      const d = await r.json();
      for (const item of d.data ?? []) {
        for (const c of item.fields?.country ?? []) {
          const iso2 = c.iso3 ? ISO3_TO_ISO2[c.iso3.toUpperCase()] : null;
          if (iso2 && !sev.has(iso2)) sev.set(iso2, 'orange');
        }
      }
    }
  } catch { /* ignore */ }
  alertsCache = { sev, ts: Date.now() };
  return sev;
}

// ════════════════════════════════════════════════════════════════════════
//  Advisories live (mode live=1) — appelle les sous-fonctions, cache 1h
// ════════════════════════════════════════════════════════════════════════
const ISO_TO_MAE_SLUG: Record<string, string> = {
  FR:'france',DE:'allemagne',ES:'espagne',IT:'italie',GB:'royaume-uni',PT:'portugal',NL:'pays-bas',BE:'belgique',CH:'suisse',AT:'autriche',IE:'irlande',SE:'suede',NO:'norvege',DK:'danemark',FI:'finlande',IS:'islande',PL:'pologne',CZ:'republique-tcheque',GR:'grece',RU:'russie',TR:'turquie',US:'etats-unis-d-amerique',CA:'canada',MX:'mexique',BR:'bresil',AR:'argentine',MA:'maroc',EG:'egypte',AE:'emirats-arabes-unis',IL:'israel-territoires-palestiniens',ZA:'afrique-du-sud',JP:'japon',CN:'chine',HK:'hong-kong',KR:'coree-du-sud',TH:'thailande',SG:'singapour',MY:'malaisie',ID:'indonesie',IN:'inde',AU:'australie',
};
const ISO_TO_FCDO_SLUG: Record<string, string> = {
  FR:'france',DE:'germany',ES:'spain',IT:'italy',PT:'portugal',NL:'netherlands',BE:'belgium',CH:'switzerland',AT:'austria',IE:'ireland',SE:'sweden',NO:'norway',DK:'denmark',FI:'finland',IS:'iceland',PL:'poland',CZ:'czech-republic',GR:'greece',RU:'russia',TR:'turkey',US:'usa',CA:'canada',MX:'mexico',BR:'brazil',AR:'argentina',MA:'morocco',EG:'egypt',AE:'united-arab-emirates',IL:'israel',ZA:'south-africa',JP:'japan',CN:'china',HK:'hong-kong',KR:'south-korea',TH:'thailand',SG:'singapore',MY:'malaysia',ID:'indonesia',IN:'india',AU:'australia',
};

const advisoryCache = new Map<string, { mae?: string; fcdo?: string; usState?: number; who?: number; ts: number }>();

async function getLiveAdvisories(iso: string, baseUrl: string, key: string) {
  const cached = advisoryCache.get(iso);
  if (cached && Date.now() - cached.ts < 60 * 60 * 1000) return cached;
  const headers = { Authorization: `Bearer ${key}` };
  const maeSlug = ISO_TO_MAE_SLUG[iso];
  const fcdoSlug = ISO_TO_FCDO_SLUG[iso];
  const [mae, fcdo, us, who] = await Promise.all([
    maeSlug ? fetch(`${baseUrl}/advisories-mae?country=${maeSlug}`, { headers, signal: AbortSignal.timeout(7000) }).then(r => r.ok ? r.json() : null).catch(() => null) : null,
    fcdoSlug ? fetch(`${baseUrl}/advisories-fcdo?country=${fcdoSlug}`, { headers, signal: AbortSignal.timeout(7000) }).then(r => r.ok ? r.json() : null).catch(() => null) : null,
    fetch(`${baseUrl}/advisories-us-state?country=${iso}`, { headers, signal: AbortSignal.timeout(7000) }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${baseUrl}/advisories-who?country=${iso}`, { headers, signal: AbortSignal.timeout(7000) }).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);
  const result = {
    mae: mae && mae.level !== 'unknown' ? mae.level : undefined,
    fcdo: fcdo && fcdo.level !== 'unknown' ? fcdo.level : undefined,
    usState: us && typeof us.level === 'number' ? us.level : undefined,
    who: who && typeof who.activeAlertCount === 'number' ? who.activeAlertCount : undefined,
    ts: Date.now(),
  };
  advisoryCache.set(iso, result);
  return result;
}

// ════════════════════════════════════════════════════════════════════════
//  Handler
// ════════════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = new URL(req.url);
  const destination = url.searchParams.get('destination');
  const profile = url.searchParams.get('profile') ?? 'default';
  const wantLive = url.searchParams.get('live') === '1';

  if (!destination) {
    return new Response(JSON.stringify({ error: 'Missing destination' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  try {
    const iso = DESTINATION_TO_COUNTRY_ISO[destination] ?? null;
    let country = iso ? COUNTRY_RISK_DATA[iso] : null;

    // Mode live : enrichir les données curées avec les advisories temps réel
    let usedLive = false;
    if (wantLive && iso && country) {
      try {
        const baseUrl = `${url.protocol}//${url.host}/functions/v1`;
        const key = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
        const live = await getLiveAdvisories(iso, baseUrl, key);
        if (live.mae !== undefined || live.fcdo !== undefined || live.usState !== undefined || live.who !== undefined) {
          country = {
            ...country,
            mae: (live.mae as string) ?? country.mae,
            fcdo: (live.fcdo as string) ?? country.fcdo,
            usState: live.usState ?? country.usState,
            whoActiveAlerts: live.who ?? country.whoActiveAlerts,
          };
          usedLive = true;
        }
      } catch { /* fallback curé */ }
    }

    // Alertes nature live
    const alertSev = iso ? (await getNatureAlerts()).get(iso) ?? null : null;

    // Calcul des 4 dimensions
    const S = computeSecurity(country);
    const H = computeHealth(country);
    const N = computeNature(country, alertSev);
    const I = computeInfra(country);

    const dims = { security: S.score, health: H.score, nature: N.score, infrastructure: I.score };
    const score = composite(dims, profile);
    const lvl = levelOf(score);
    const hasOfficial = S.official || H.official || N.official || I.official;

    if (!country && !hasOfficial) {
      // Destination non curée : pas de données. Le client gère le fallback.
      return new Response(JSON.stringify({ destination, score: null, available: false }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const body = {
      destination,
      profile,
      score,
      level: lvl.level,
      label: lvl.label,
      dimensions: {
        security: Math.round(dims.security),
        health: Math.round(dims.health),
        nature: Math.round(dims.nature),
        infrastructure: Math.round(dims.infrastructure),
      },
      sources: {
        security: S.sources,
        health: H.sources,
        nature: N.sources,
        infrastructure: I.sources,
      },
      hasOfficialSource: hasOfficial,
      usedLiveAdvisories: usedLive,
      natureAlert: alertSev,
      available: true,
      lastUpdate: new Date().toISOString(),
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), destination, available: false }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
