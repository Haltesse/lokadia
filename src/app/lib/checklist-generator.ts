// Générateur de checklist intelligent basé sur les caractéristiques de la destination

import { getDestinationData, type DestinationDetails } from '../data/destinationData';

export interface ChecklistItem {
  id: number;
  category: string;
  label: string;
  isDone: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface ChecklistCategory {
  name: string;
  items: Omit<ChecklistItem, 'id' | 'isDone'>[];
}

/**
 * Génère une checklist personnalisée en fonction de la destination
 */
export function generateChecklistForDestination(destinationId: string): ChecklistItem[] {
  const destination = getDestinationData(destinationId);
  
  if (!destination) {
    return getDefaultChecklist();
  }

  const checklist: ChecklistCategory[] = [];

  // DOCUMENTS (toujours présent)
  const documents: ChecklistCategory = {
    name: 'Documents',
    items: [
      { category: 'Documents', label: 'Passeport valide (min. 6 mois)', priority: 'high' },
      { category: 'Documents', label: 'Carte d\'identité', priority: 'high' },
      { category: 'Documents', label: 'Réservations d\'hôtel imprimées', priority: 'medium' },
      { category: 'Documents', label: 'Billets d\'avion', priority: 'high' },
      { category: 'Documents', label: 'Assurance voyage', priority: 'high' },
    ]
  };

  // Ajouter visa si requis
  if (destination.visaRequired) {
    documents.items.unshift({
      category: 'Documents',
      label: `Visa ${destination.country}`,
      priority: 'high'
    });
  }

  checklist.push(documents);

  // SANTÉ
  const health: ChecklistCategory = {
    name: 'Santé',
    items: [
      { category: 'Santé', label: 'Médicaments personnels', priority: 'high' },
      { category: 'Santé', label: 'Trousse de premiers secours', priority: 'medium' },
      { category: 'Santé', label: 'Ordonnances médicales', priority: 'medium' },
    ]
  };

  // Ajouter vaccins si nécessaires
  if (destination.vaccines && destination.vaccines.length > 0) {
    destination.vaccines.forEach(vaccine => {
      if (vaccine.status === 'required') {
        health.items.unshift({
          category: 'Santé',
          label: `Vaccin: ${vaccine.name}`,
          priority: 'high'
        });
      } else if (vaccine.status === 'recommended') {
        health.items.push({
          category: 'Santé',
          label: vaccine.name,
          priority: 'medium'
        });
      }
    });
  }

  checklist.push(health);

  // ARGENT
  const money: ChecklistCategory = {
    name: 'Argent',
    items: [
      { category: 'Argent', label: 'Carte bancaire internationale', priority: 'high' },
      { category: 'Argent', label: destination.currency ? `${destination.currency} en liquide` : 'Monnaie locale', priority: 'medium' },
      { category: 'Argent', label: 'Carte de crédit de secours', priority: 'medium' },
    ]
  };

  // Ajouter des recommandations spécifiques selon la destination
  if (destination.name === 'Tokyo' || destination.name === 'Kyoto') {
    money.items.push({
      category: 'Argent',
      label: 'Suffisamment de cash (carte peu acceptée)',
      priority: 'high'
    });
  }

  checklist.push(money);

  // TECH
  const tech: ChecklistCategory = {
    name: 'Tech',
    items: [
      { category: 'Tech', label: 'Chargeur téléphone', priority: 'high' },
      { category: 'Tech', label: 'Batterie externe', priority: 'medium' },
      { category: 'Tech', label: 'Câbles USB', priority: 'medium' },
      { category: 'Tech', label: 'Adaptateur de prise universel', priority: 'high' },
    ]
  };

  // Carte SIM locale si conseillé
  if (destination.language && !destination.language.includes('Français')) {
    tech.items.push({
      category: 'Tech',
      label: 'Carte SIM locale ou forfait international',
      priority: 'medium'
    });
  }

  checklist.push(tech);

  // BAGAGES - Adapté au climat et à la destination
  const luggage: ChecklistCategory = {
    name: 'Bagages',
    items: [
      { category: 'Bagages', label: 'Vêtements adaptés à la météo', priority: 'high' },
      { category: 'Bagages', label: 'Chaussures confortables de marche', priority: 'high' },
      { category: 'Bagages', label: 'Sac à dos de jour', priority: 'medium' },
    ]
  };

  // Ajouter des items selon la destination
  if (destination.name.includes('Tokyo') || destination.name.includes('Kyoto')) {
    luggage.items.push({
      category: 'Bagages',
      label: 'Tenue correcte (temples et restaurants)',
      priority: 'medium'
    });
  }

  if (destination.country.includes('tropicale') || destination.name.includes('Bangkok') || destination.name.includes('Bali')) {
    luggage.items.push(
      { category: 'Bagages', label: 'Vêtements légers et respirants', priority: 'high' },
      { category: 'Bagages', label: 'Crème solaire haute protection', priority: 'high' },
      { category: 'Bagages', label: 'Chapeau et lunettes de soleil', priority: 'medium' }
    );
  }

  if (destination.country.includes('Scandinavie') || destination.name.includes('Reykjavik')) {
    luggage.items.push(
      { category: 'Bagages', label: 'Manteau chaud et imperméable', priority: 'high' },
      { category: 'Bagages', label: 'Pulls et sous-vêtements thermiques', priority: 'high' }
    );
  }

  checklist.push(luggage);

  // SÉCURITÉ
  const security: ChecklistCategory = {
    name: 'Sécurité',
    items: [
      { category: 'Sécurité', label: 'Copies numériques des documents', priority: 'high' },
      { category: 'Sécurité', label: 'Numéros d\'urgence enregistrés', priority: 'high' },
      { category: 'Sécurité', label: 'Contact ambassade/consulat', priority: 'medium' },
      { category: 'Sécurité', label: 'Partager itinéraire avec proches', priority: 'medium' },
    ]
  };

  // Ajouter précautions selon niveau de sécurité
  if (destination.goSafeScore < 60) {
    security.items.push(
      { category: 'Sécurité', label: 'Antivol pour sac', priority: 'high' },
      { category: 'Sécurité', label: 'Ceinture cachette argent', priority: 'medium' }
    );
  }

  checklist.push(security);

  // Convertir en ChecklistItem avec IDs uniques
  let itemId = 1;
  const finalChecklist: ChecklistItem[] = [];

  checklist.forEach(category => {
    category.items.forEach(item => {
      finalChecklist.push({
        ...item,
        id: itemId++,
        isDone: false
      });
    });
  });

  console.log(`✨ Checklist générée pour ${destination.name}: ${finalChecklist.length} items`);
  return finalChecklist;
}

/**
 * Checklist par défaut si pas de destination spécifiée
 */
function getDefaultChecklist(): ChecklistItem[] {
  return [
    { id: 1, category: 'Documents', label: 'Passeport valide', isDone: false, priority: 'high' },
    { id: 2, category: 'Documents', label: 'Carte d\'identité', isDone: false, priority: 'high' },
    { id: 3, category: 'Documents', label: 'Assurance voyage', isDone: false, priority: 'high' },
    { id: 4, category: 'Documents', label: 'Réservations d\'hôtel', isDone: false, priority: 'medium' },
    { id: 5, category: 'Santé', label: 'Médicaments personnels', isDone: false, priority: 'high' },
    { id: 6, category: 'Santé', label: 'Trousse de premiers secours', isDone: false, priority: 'medium' },
    { id: 7, category: 'Argent', label: 'Carte bancaire internationale', isDone: false, priority: 'high' },
    { id: 8, category: 'Argent', label: 'Monnaie locale', isDone: false, priority: 'medium' },
    { id: 9, category: 'Tech', label: 'Chargeur téléphone', isDone: false, priority: 'high' },
    { id: 10, category: 'Tech', label: 'Batterie externe', isDone: false, priority: 'medium' },
    { id: 11, category: 'Bagages', label: 'Vêtements adaptés', isDone: false, priority: 'high' },
    { id: 12, category: 'Bagages', label: 'Chaussures confortables', isDone: false, priority: 'high' },
    { id: 13, category: 'Sécurité', label: 'Copies des documents', isDone: false, priority: 'high' },
    { id: 14, category: 'Sécurité', label: 'Numéros d\'urgence', isDone: false, priority: 'high' },
  ];
}

/**
 * Sauvegarde la checklist dans le localStorage
 */
export function saveChecklistToStorage(destinationId: string, items: ChecklistItem[]): void {
  const key = `lokadia_checklist_${destinationId}`;
  localStorage.setItem(key, JSON.stringify(items));
}

/**
 * Charge la checklist depuis le localStorage
 */
export function loadChecklistFromStorage(destinationId: string): ChecklistItem[] | null {
  const key = `lokadia_checklist_${destinationId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erreur lors du chargement de la checklist:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Supprime la checklist du localStorage
 */
export function clearChecklistFromStorage(destinationId: string): void {
  const key = `lokadia_checklist_${destinationId}`;
  localStorage.removeItem(key);
}