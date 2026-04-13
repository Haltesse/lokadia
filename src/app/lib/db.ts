// Service de base de données locale utilisant IndexedDB

const DB_NAME = 'lokadia_db';
const DB_VERSION = 2; // Incrémenté pour la migration

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  photo?: string;
  isPremium: boolean;
  premiumExpiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  countryDestinationId: string; // Nouveau: ID du pays principal
  startDate: string;
  endDate: string;
  travelers: number;
  travelerProfile?: {
    type: 'solo' | 'couple' | 'family' | 'friends';
    pace: 'relax' | 'normal' | 'intense';
    interests: string[]; // culture, nature, food, nightlife, adventure, etc.
  };
  activeCityDestinationId?: string; // Ville courante pendant le voyage
  notes?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TripStop {
  id: string;
  tripId: string;
  destinationId: string; // ID de la ville/destination
  destinationName: string;
  orderIndex: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TripSegment {
  id: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  recommendedMode: 'train' | 'bus' | 'flight' | 'car' | 'ferry';
  alternatives: Array<{
    mode: 'train' | 'bus' | 'flight' | 'car' | 'ferry';
    duration: number; // minutes
    cost?: string;
    provider?: string;
    notes?: string;
    ranking: 'practical' | 'fast' | 'economic';
  }>;
  distanceKm: number;
  durationMinEstimated: number;
  metadata?: {
    passRecommended?: string;
    bookingAdvice?: string;
    luggageNotes?: string;
    tips?: string[];
  };
  source: 'internal' | 'provider';
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  destinationId: string;
  createdAt: string;
}

export interface FollowedTip {
  id: string;
  userId: string;
  tipId: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  tripId?: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private db: IDBDatabase | null = null;

  /**
   * Initialise la base de données
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erreur lors de l\'ouverture de la base de données');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de données initialisée avec succès');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Table Users
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Table Trips
        if (!db.objectStoreNames.contains('trips')) {
          const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
          tripStore.createIndex('userId', 'userId', { unique: false });
          tripStore.createIndex('status', 'status', { unique: false });
        }

        // Table TripStops (Nouveau)
        if (!db.objectStoreNames.contains('tripStops')) {
          const stopStore = db.createObjectStore('tripStops', { keyPath: 'id' });
          stopStore.createIndex('tripId', 'tripId', { unique: false });
          stopStore.createIndex('orderIndex', 'orderIndex', { unique: false });
        }

        // Table TripSegments (Nouveau)
        if (!db.objectStoreNames.contains('tripSegments')) {
          const segmentStore = db.createObjectStore('tripSegments', { keyPath: 'id' });
          segmentStore.createIndex('tripId', 'tripId', { unique: false });
        }

        // Table Favorites
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('userId', 'userId', { unique: false });
          favStore.createIndex('destinationId', 'destinationId', { unique: false });
        }

        // Table FollowedTips
        if (!db.objectStoreNames.contains('followedTips')) {
          const tipStore = db.createObjectStore('followedTips', { keyPath: 'id' });
          tipStore.createIndex('userId', 'userId', { unique: false });
          tipStore.createIndex('tipId', 'tipId', { unique: false });
        }

        // Table ChecklistItems
        if (!db.objectStoreNames.contains('checklistItems')) {
          const checklistStore = db.createObjectStore('checklistItems', { keyPath: 'id' });
          checklistStore.createIndex('userId', 'userId', { unique: false });
          checklistStore.createIndex('tripId', 'tripId', { unique: false });
        }

        console.log('✅ Schéma de base de données créé');
      };
    });
  }

  /**
   * Obtient la base de données
   */
  private getDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Base de données non initialisée. Appelez init() d\'abord.');
    }
    return this.db;
  }

  /**
   * Ajoute un élément
   */
  async add<T>(storeName: string, item: T): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupère un élément par ID
   */
  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupère un élément par index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T | null> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupère tous les éléments
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupère tous les éléments par index
   */
  async getAllByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Met à jour un élément
   */
  async update<T>(storeName: string, item: T): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprime un élément
   */
  async delete(storeName: string, id: string): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprime tous les éléments par index
   */
  async deleteAllByIndex(storeName: string, indexName: string, value: string): Promise<void> {
    const items = await this.getAllByIndex<any>(storeName, indexName, value);
    const db = this.getDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      let hasError = false;

      if (items.length === 0) {
        resolve();
        return;
      }

      items.forEach(item => {
        const request = store.delete(item.id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === items.length && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  /**
   * Compte les éléments
   */
  async count(storeName: string): Promise<number> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Efface toutes les données d'un store
   */
  async clear(storeName: string): Promise<void> {
    const db = this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton
export const db = new DatabaseService();