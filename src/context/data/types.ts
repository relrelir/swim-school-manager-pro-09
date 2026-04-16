import { Participant, Product, Registration, Season, Pool, Payment, PaymentStatus, HealthDeclaration, Lead } from '@/types';
import { DailyActivity, RegistrationWithDetails } from '@/types';
import { LeadsContextType } from './LeadsProvider';

export interface SeasonsContextType {
  seasons: Season[];
  addSeason: (season: Omit<Season, 'id'>) => Promise<Season | undefined> | undefined;
  updateSeason: (season: Season) => void;
  deleteSeason: (id: string) => void;
  loading: boolean;
}

export interface PoolsContextType {
  pools: Pool[];
  addPool: (pool: Omit<Pool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Pool | undefined> | undefined;
  updatePool: (pool: Pool) => Promise<void>;
  deletePool: (id: string) => Promise<void>;
  getPoolsBySeason: (seasonId: string) => Pool[];
  loading: boolean;
}

export interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined> | undefined;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductsBySeason: (seasonId: string) => Product[];
  getProductsByPool: (poolId: string) => Product[];
  loading: boolean;
}

export interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id'>) => Promise<Participant | undefined> | void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  loading: boolean;
}

export interface RegistrationsContextType {
  registrations: Registration[];
  addRegistration: (registration: Omit<Registration, 'id'>) => Promise<Registration | undefined> | undefined;
  updateRegistration: (registration: Registration) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByProduct: (productId: string) => Registration[];
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  loading: boolean;
}

export interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | undefined> | undefined;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByRegistration: (registrationId: string) => Payment[];
  loading: boolean;
}

export interface HealthDeclarationsContextType {
  healthDeclarations: HealthDeclaration[];
  addHealthDeclaration: (healthDeclaration: Omit<HealthDeclaration, 'id'>) => Promise<HealthDeclaration | undefined>;
  updateHealthDeclaration: (id: string, updates: Partial<HealthDeclaration>) => Promise<HealthDeclaration | undefined>;
  getHealthDeclarationForRegistration: (participantId: string) => Promise<HealthDeclaration | undefined>;
  deleteHealthDeclaration: (id: string) => Promise<void>;
  createHealthDeclarationLink: (participantId: string, participantData?: { name: string; idNumber: string; phone: string }) => Promise<string | undefined>;
  getHealthDeclarationByToken: (token: string) => Promise<HealthDeclaration | undefined>;
  loading: boolean;
}

export interface CombinedDataContextType
  extends SeasonsContextType,
    PoolsContextType,
    ProductsContextType,
    ParticipantsContextType,
    RegistrationsContextType,
    PaymentsContextType,
    HealthDeclarationsContextType,
    LeadsContextType {
  getAllRegistrationsWithDetails: () => RegistrationWithDetails[];
  calculateMeetingProgress: (product: Product) => { current: number; total: number };
  getDailyActivities: (date: string) => DailyActivity[];
}

// Re-export for convenience
export type { LeadsContextType };
