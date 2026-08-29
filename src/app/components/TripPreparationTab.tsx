import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ShieldCheck, 
  Pill, 
  Shield, 
  Wallet, 
  Smartphone, 
  Lock, 
  Heart,
  ListChecks,
  Lightbulb,
  Plus,
  ChevronRight,
  FileText,
  CheckCircle2,
  type LucideIcon
} from 'lucide-react';
import { generatePreparationSections } from '../lib/tripBriefService';
import type { TripDashboard } from '../lib/tripBriefService';
import {
  loadChecklistFromStorage,
  saveChecklistToStorage,
  type ChecklistItem,
} from '../lib/checklist-generator';

/**
 * Source unique de la section « Documents à emporter » : la liste affichée et
 * celle qu'ajoute le bouton sortent d'ici. Les tenir en double — une dans le
 * JSX, une dans le handler — les aurait laissées diverger dès la première
 * modification.
 */
const DOCUMENTS_SECTION = {
  id: 'documents',
  title: 'Documents à emporter',
  summary: [
    "Passeport valide (vérifier date d'expiration)",
    "Visa ou autorisation d'entrée (si requis)",
    "Carte d'identité (backup)",
    "Billets d'avion/train (version électronique + papier)",
    'Réservations hôtels',
    'Assurance voyage (attestation)',
    'Carte bancaire internationale + backup',
    'Carnet de vaccination (si requis)',
    'Ordonnances médicales (si médicaments)',
    "Photos d'identité (backup)",
  ],
};

/**
 * Onglet de la fiche destination qui détaille chaque section de préparation.
 *
 * Le bouton « Voir détails » n'apparaissait que pour la section Sécurité —
 * la seule à porter un `detailsLink` — et, quand il apparaissait, il ne
 * faisait rien. Les identifiants ci-dessous sont ceux réellement produits par
 * `generatePreparationSections` ; une section absente de cette table n'affiche
 * simplement pas le bouton, plutôt que d'en montrer un qui n'irait nulle part.
 */
const SECTION_TO_DESTINATION_TAB: Record<string, string> = {
  'entry-visa': 'entry',
  'visa-check': 'entry',
  health: 'health',
  vaccines: 'health',
  insurance: 'health',
  money: 'scams',
  telecom: 'culture',
  esim: 'culture',
  culture: 'culture',
  security: 'safety',
};

interface Props {
  dashboard: TripDashboard;
}

// Mapping des noms d'icônes vers les composants Lucide
const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Pill,
  Shield,
  Wallet,
  Smartphone,
  Lock,
  Heart,
};

export default function TripPreparationTab({ dashboard }: Props) {
  const navigate = useNavigate();
  const sections = generatePreparationSections(dashboard.trip, dashboard.destination);

  // Les deux boutons de cette carte ne faisaient rien : ils appelaient un
  // `console.log` suivi d'un `// TODO`. À l'écran, le bouton réagissait au
  // survol, se laissait cliquer, et rien ne se passait — un échec silencieux
  // sur un écran de préparation de voyage.
  const [addedSections, setAddedSections] = useState<string[]>([]);

  const handleAddToChecklist = (section: { id: string; title: string; summary: string[] }) => {
    const destinationId = dashboard.trip.destinationId;
    const existing = loadChecklistFromStorage(destinationId) ?? [];

    // Les entrées déjà présentes ne sont pas dupliquées : on compare sur le
    // libellé, seul identifiant stable entre deux générations de la section.
    const knownLabels = new Set(existing.map((item) => item.label.trim().toLowerCase()));
    const nextId = existing.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const additions: ChecklistItem[] = section.summary
      .map((label) => label.trim())
      .filter((label) => label.length > 0 && !knownLabels.has(label.toLowerCase()))
      .map((label, index) => ({
        id: nextId + index,
        category: section.title,
        label,
        isDone: false,
        priority: 'medium' as const,
      }));

    if (additions.length > 0) {
      saveChecklistToStorage(destinationId, [...existing, ...additions]);
    }
    setAddedSections((prev) => (prev.includes(section.id) ? prev : [...prev, section.id]));
  };

  const handleViewDetails = (sectionId: string) => {
    const tab = SECTION_TO_DESTINATION_TAB[sectionId];
    navigate(
      `/destination/${dashboard.trip.destinationId}${tab ? `?tab=${tab}` : ''}`
    );
  };

  return (
    <div className="space-y-4">
      {/* Bouton d'accès à la checklist */}
      <button
        onClick={() => navigate(`/checklist/${dashboard.trip.destinationId}`)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
      >
        <ListChecks size={22} />
        Ouvrir ma checklist complète
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-sm text-blue-900">
            <strong>Astuce :</strong> Ces informations sont extraites de la fiche destination. 
            Ajoutez les éléments importants à votre checklist pour ne rien oublier !
          </p>
        </div>
      </div>

      {sections.map((section) => {
        const IconComponent = iconMap[section.icon] || Heart;
        return (
          <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <IconComponent size={24} className="flex-shrink-0" />
                {section.title}
              </h2>
            </div>

            {/* Content */}
            <div className="p-5">
              <ul className="space-y-2 mb-4">
                {section.summary.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {section.canAddToChecklist && (
                  <button
                    onClick={() => handleAddToChecklist(section)}
                    disabled={addedSections.includes(section.id)}
                    className="flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-70"
                  >
                    {addedSections.includes(section.id) ? (
                      <>
                        <CheckCircle2 size={16} />
                        Ajouté à ma checklist
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Ajouter à ma checklist
                      </>
                    )}
                  </button>
                )}
                {SECTION_TO_DESTINATION_TAB[section.id] && (
                  <button
                    onClick={() => handleViewDetails(section.id)}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Voir détails
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Section Documents à emporter */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-5 py-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={22} />
            Documents à emporter
          </h2>
        </div>
        <div className="p-5">
          <ul className="space-y-2 mb-4">
            {DOCUMENTS_SECTION.summary.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleAddToChecklist(DOCUMENTS_SECTION)}
            disabled={addedSections.includes(DOCUMENTS_SECTION.id)}
            className="flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-100 transition-colors border border-green-200 w-full justify-center disabled:opacity-70"
          >
            {addedSections.includes(DOCUMENTS_SECTION.id) ? (
              <>
                <CheckCircle2 size={16} />
                Documents ajoutés à ma checklist
              </>
            ) : (
              <>
                <Plus size={16} />
                Ajouter tous les documents à ma checklist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conseils généraux */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="text-purple-700" size={22} />
          Conseils généraux
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Faites des photocopies de tous vos documents importants</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Envoyez-vous par email les copies de vos documents</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Notez les numéros d'urgence dans votre téléphone</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Prévenez votre banque de votre voyage à l'étranger</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Téléchargez les apps utiles avant le départ (traduction, maps, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={16} />
            <span>Vérifiez votre forfait mobile international ou prévoyez une eSIM</span>
          </li>
        </ul>
      </div>
    </div>
  );
}