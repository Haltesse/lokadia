/**
 * Lokascore — calcul des 4 dimensions à partir des sources officielles
 *
 * Phase 3 de la méthodologie : agrège les vraies sources documentées
 * (MAE / FCDO / US State / DFAT / OMS / GDACS / WJP / TI / WB) au lieu
 * de la simple approximation Numbeo de la Phase 1.
 *
 * Cf. mémoire méthodologique v1.0 §2 :
 *   S = 0.45 × MAE + 0.25 × FCDO + 0.20 × US State + 0.10 × DFAT
 *   H = 0.40 × OMS + 0.30 × ECDC + 0.20 × CDC + 0.10 × Lancet HAQ
 *   N = 0.60 × N_act (GDACS+ReliefWeb+NASA) + 0.40 × N_str (EM-DAT)
 *   I = 0.30 × WJP + 0.25 × CPI + 0.20 × WHO Road + 0.15 × WB Stability + 0.10 × GSMA
 *
 * Quand une source n'est pas encore curée pour un pays, on tombe en fallback
 * sur l'indice Numbeo correspondant (Phase 1).
 */
import type { LokascoreDimensions } from './lokascore';
import {
  CountryRisk,
  COUNTRY_RISK_DATA,
  MAE_SCORE,
  FCDO_SCORE,
  US_STATE_SCORE,
  DFAT_SCORE,
  getCountryRiskForDestination,
  DESTINATION_TO_COUNTRY_ISO,
} from '../data/countryRiskData';
import {
  getMaxAlertSeverityForCountry,
  getAlertsForCountry,
  type LiveAlert,
} from './liveAlertsService';
import { getLiveAdvisoriesForCountry } from './liveAdvisoriesService';

export interface NumbeoFallback {
  /** Tous optionnels : permet de calculer un Lokascore même si Numbeo est en panne */
  safetyIndex?: number;
  healthCareIndex?: number;
  qualityOfLifeIndex?: number;
  pollutionIndex?: number;
}

export interface SourceContribution {
  /** Identifiant court de la source (mae, fcdo, who...) */
  id: string;
  /** Nom affiché */
  label: string;
  /** Valeur normalisée 0-100 */
  value: number;
  /** Poids dans la dimension parente (0-1) */
  weight: number;
}

export interface DimensionTrace {
  /** Score final de la dimension 0-100 */
  score: number;
  /** Détail des sources contributrices */
  contributions: SourceContribution[];
  /** True si on a au moins une source officielle (sinon = fallback Numbeo seul) */
  hasOfficialSource: boolean;
}

export interface LokascoreSourceTrace {
  security: DimensionTrace;
  health: DimensionTrace;
  nature: DimensionTrace;
  infrastructure: DimensionTrace;
  /** True si au moins une source officielle a contribué */
  hasAnyOfficialSource: boolean;
  /** Alertes live actuellement actives pour ce pays (USGS / ReliefWeb) */
  liveAlerts?: LiveAlert[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Moyenne pondérée d'une liste de contributions (poids re-normalisés sur
 * les sources réellement disponibles).
 */
function weightedAverage(contribs: SourceContribution[]): number {
  if (contribs.length === 0) return 0;
  const totalWeight = contribs.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = contribs.reduce((sum, c) => sum + c.value * c.weight, 0);
  return clamp(weighted / totalWeight);
}

// ─── Calcul de chaque dimension ─────────────────────────────────────────────

function computeSecurity(country: CountryRisk | null, numbeo: NumbeoFallback): DimensionTrace {
  const contribs: SourceContribution[] = [];
  if (country?.mae !== undefined) {
    contribs.push({ id: 'mae', label: 'MAE France', value: MAE_SCORE[country.mae], weight: 0.45 });
  }
  if (country?.fcdo !== undefined) {
    contribs.push({ id: 'fcdo', label: 'UK FCDO', value: FCDO_SCORE[country.fcdo], weight: 0.25 });
  }
  if (country?.usState !== undefined) {
    contribs.push({ id: 'usState', label: 'US State Dept', value: US_STATE_SCORE[country.usState], weight: 0.20 });
  }
  if (country?.dfat !== undefined) {
    contribs.push({ id: 'dfat', label: 'AU DFAT', value: DFAT_SCORE[country.dfat], weight: 0.10 });
  }
  const hasOfficial = contribs.length > 0;
  if (!hasOfficial) {
    if (numbeo.safetyIndex !== undefined) {
      contribs.push({ id: 'numbeo', label: 'Numbeo Safety Index', value: clamp(numbeo.safetyIndex), weight: 1 });
    } else {
      // Aucune source dispo : valeur neutre "vigilance moyenne"
      contribs.push({ id: 'fallback', label: 'Estimation (sources indisponibles)', value: 65, weight: 1 });
    }
  }
  return {
    score: weightedAverage(contribs),
    contributions: contribs,
    hasOfficialSource: hasOfficial,
  };
}

function computeHealth(country: CountryRisk | null, numbeo: NumbeoFallback): DimensionTrace {
  const contribs: SourceContribution[] = [];
  // H1 OMS : on calcule sur base d'alertes actives (décroissance temporelle simplifiée)
  // Pas d'alertes actives = 100. Chaque alerte enlève 15pts (cap à 30 si >2 alertes).
  if (country?.whoActiveAlerts !== undefined) {
    const alertCount = country.whoActiveAlerts;
    const whoValue = alertCount === 0 ? 100 : clamp(100 - Math.min(30, alertCount * 15));
    contribs.push({ id: 'who', label: 'OMS Disease Outbreak', value: whoValue, weight: 0.40 });
  }
  if (country?.ecdcAlert !== undefined) {
    contribs.push({ id: 'ecdc', label: 'ECDC', value: country.ecdcAlert ? 60 : 100, weight: 0.30 });
  }
  if (country?.cdcAlert !== undefined) {
    contribs.push({ id: 'cdc', label: 'CDC USA', value: country.cdcAlert ? 60 : 100, weight: 0.20 });
  }
  if (country?.lancetHaq !== undefined) {
    contribs.push({ id: 'haq', label: 'Lancet HAQ', value: clamp(country.lancetHaq), weight: 0.10 });
  }
  const hasOfficial = contribs.length > 0;
  // Fallback Numbeo
  if (!hasOfficial && numbeo.healthCareIndex !== undefined) {
    contribs.push({ id: 'numbeo-health', label: 'Numbeo Healthcare', value: clamp(numbeo.healthCareIndex), weight: 1 });
  } else if (!hasOfficial) {
    contribs.push({ id: 'fallback', label: 'Estimation (donnée manquante)', value: 70, weight: 1 });
  }
  return {
    score: weightedAverage(contribs),
    contributions: contribs,
    hasOfficialSource: hasOfficial,
  };
}

function computeNature(
  country: CountryRisk | null,
  numbeo: NumbeoFallback,
  liveAlertSeverity: 'orange' | 'red' | null
): DimensionTrace {
  const contribs: SourceContribution[] = [];

  // N_act : 60% — priorité aux alertes LIVE USGS/ReliefWeb si présentes,
  // sinon GDACS statique de la base, sinon neutre 100
  let nActValue: number = 100;
  let nActLabel = 'Aucune alerte active';
  let nActId = 'live-none';
  if (liveAlertSeverity === 'red') {
    nActValue = 30;
    nActLabel = 'USGS/ReliefWeb (alerte rouge)';
    nActId = 'live-red';
  } else if (liveAlertSeverity === 'orange') {
    nActValue = 60;
    nActLabel = 'USGS/ReliefWeb (alerte orange)';
    nActId = 'live-orange';
  } else if (country?.gdacsActive === 'red') {
    nActValue = 30;
    nActLabel = 'GDACS (alerte rouge)';
    nActId = 'gdacs-red';
  } else if (country?.gdacsActive === 'orange') {
    nActValue = 60;
    nActLabel = 'GDACS (alerte orange)';
    nActId = 'gdacs-orange';
  }
  contribs.push({ id: nActId, label: nActLabel, value: nActValue, weight: 0.60 });

  // N_str : 40% — risque structurel EM-DAT
  if (country?.emdatStructural !== undefined) {
    contribs.push({ id: 'emdat', label: 'EM-DAT (structurel)', value: clamp(country.emdatStructural), weight: 0.40 });
  } else if (numbeo.pollutionIndex !== undefined) {
    // Fallback : pollution Numbeo inversée comme proxy de risque environnemental
    contribs.push({
      id: 'numbeo-pollution',
      label: 'Numbeo Pollution (proxy)',
      value: clamp(100 - numbeo.pollutionIndex),
      weight: 0.40,
    });
  } else {
    contribs.push({ id: 'fallback', label: 'Estimation', value: 70, weight: 0.40 });
  }

  // hasOfficial = on a soit EM-DAT, soit une vraie alerte live, soit GDACS
  const hasOfficial =
    country?.emdatStructural !== undefined ||
    liveAlertSeverity !== null ||
    country?.gdacsActive !== undefined;

  return {
    score: weightedAverage(contribs),
    contributions: contribs,
    hasOfficialSource: hasOfficial,
  };
}

function computeInfrastructure(country: CountryRisk | null, numbeo: NumbeoFallback): DimensionTrace {
  const contribs: SourceContribution[] = [];
  if (country?.wjpRuleOfLaw !== undefined) {
    contribs.push({ id: 'wjp', label: 'WJP Rule of Law', value: clamp(country.wjpRuleOfLaw), weight: 0.30 });
  }
  if (country?.cpiCorruption !== undefined) {
    contribs.push({ id: 'cpi', label: 'Transparency CPI', value: clamp(country.cpiCorruption), weight: 0.25 });
  }
  if (country?.whoRoadSafety !== undefined) {
    contribs.push({ id: 'whoRoad', label: 'WHO Road Safety', value: clamp(country.whoRoadSafety), weight: 0.20 });
  }
  if (country?.wbStability !== undefined) {
    contribs.push({ id: 'wb', label: 'World Bank Stability', value: clamp(country.wbStability), weight: 0.15 });
  }
  if (country?.gsmaConnectivity !== undefined) {
    contribs.push({ id: 'gsma', label: 'GSMA Connectivity', value: clamp(country.gsmaConnectivity), weight: 0.10 });
  }
  const hasOfficial = contribs.length > 0;
  // Fallback Numbeo : qualityOfLife
  if (!hasOfficial && numbeo.qualityOfLifeIndex !== undefined) {
    contribs.push({ id: 'numbeo-qol', label: 'Numbeo Quality of Life', value: clamp(numbeo.qualityOfLifeIndex), weight: 1 });
  } else if (!hasOfficial) {
    contribs.push({ id: 'fallback', label: 'Estimation (donnée manquante)', value: 70, weight: 1 });
  }
  return {
    score: weightedAverage(contribs),
    contributions: contribs,
    hasOfficialSource: hasOfficial,
  };
}

/**
 * Calcule les 4 dimensions Lokascore à partir des sources officielles +
 * fallback Numbeo, en intégrant les alertes LIVE actives (USGS / ReliefWeb).
 * Retourne aussi la trace complète pour l'UI.
 *
 * @param liveCountryOverride - Si fourni, remplace les données pays curées
 *   par les valeurs live fraîchement fetchées depuis les Edge Functions
 *   MAE/FCDO/US State/OMS.
 */
export function computeDimensionsFromSources(
  destinationId: string,
  numbeo: NumbeoFallback,
  liveCountryOverride?: CountryRisk | null
): { dimensions: LokascoreDimensions; trace: LokascoreSourceTrace } {
  const country = liveCountryOverride ?? getCountryRiskForDestination(destinationId);
  const iso = DESTINATION_TO_COUNTRY_ISO[destinationId] ?? country?.iso ?? null;
  // Alerte live active sur le pays (USGS/ReliefWeb) — null si rien
  const liveAlertSeverity = iso ? getMaxAlertSeverityForCountry(iso) : null;
  const liveAlerts = iso ? getAlertsForCountry(iso) : [];

  const S = computeSecurity(country, numbeo);
  const H = computeHealth(country, numbeo);
  const N = computeNature(country, numbeo, liveAlertSeverity);
  const I = computeInfrastructure(country, numbeo);

  return {
    dimensions: {
      security: S.score,
      health: H.score,
      nature: N.score,
      infrastructure: I.score,
    },
    trace: {
      security: S,
      health: H,
      nature: N,
      infrastructure: I,
      hasAnyOfficialSource:
        S.hasOfficialSource || H.hasOfficialSource || N.hasOfficialSource || I.hasOfficialSource,
      liveAlerts: liveAlerts.length > 0 ? liveAlerts : undefined,
    },
  };
}

/**
 * Variante ASYNC qui fetche d'abord les Edge Functions MAE/FCDO/US State/OMS,
 * fusionne avec les données curées, puis calcule les dimensions live.
 *
 * Si les Edge Functions ne sont pas déployées, retombe silencieusement sur
 * la version synchrone (données curées statiques).
 */
export async function computeDimensionsFromSourcesLive(
  destinationId: string,
  numbeo: NumbeoFallback
): Promise<{ dimensions: LokascoreDimensions; trace: LokascoreSourceTrace; usedLiveAdvisories: boolean }> {
  const iso = DESTINATION_TO_COUNTRY_ISO[destinationId];
  if (!iso) {
    return { ...computeDimensionsFromSources(destinationId, numbeo), usedLiveAdvisories: false };
  }

  // Fetch les advisories live (MAE, FCDO, US State, OMS) en parallèle interne
  const live = await getLiveAdvisoriesForCountry(iso);
  if (!live) {
    // Edge Functions pas déployées ou toutes en erreur : fallback sur curé
    return { ...computeDimensionsFromSources(destinationId, numbeo), usedLiveAdvisories: false };
  }

  // Merge : valeurs live > valeurs curées
  const staticData = COUNTRY_RISK_DATA[iso];
  const merged: CountryRisk = {
    ...(staticData ?? { iso, name: iso }),
    iso,
    name: staticData?.name ?? iso,
    mae: live.mae ?? staticData?.mae,
    fcdo: live.fcdo ?? staticData?.fcdo,
    usState: live.usState ?? staticData?.usState,
    whoActiveAlerts: live.whoActiveAlerts ?? staticData?.whoActiveAlerts,
  };

  return {
    ...computeDimensionsFromSources(destinationId, numbeo, merged),
    usedLiveAdvisories: true,
  };
}
