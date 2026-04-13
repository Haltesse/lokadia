import type { DestinationDetails } from './types';
import { additionalDestinations } from './additionalDestinations';
import { newDestinations } from './newDestinations';
import { moreDetailedDestinations } from './moreDetailedDestinations';
import { moreDetailedDestinations2 } from './moreDetailedDestinations2';
import { moreDetailedDestinations3 } from './moreDetailedDestinations3';
import { moreDetailedDestinations4 } from './moreDetailedDestinations4';
import { destinationsDatabase } from './destinationData';

// Fusionner toutes les sources de destinations
export const allDestinations: Record<string, DestinationDetails> = {
  ...destinationsDatabase,
  ...additionalDestinations,
  ...newDestinations,
  ...moreDetailedDestinations,
  ...moreDetailedDestinations2,
  ...moreDetailedDestinations3,
  ...moreDetailedDestinations4,
};

// Export par défaut également
export default allDestinations;