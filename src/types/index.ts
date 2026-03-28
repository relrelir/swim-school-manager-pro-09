
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  active?: boolean;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  notes?: string;
  seasonId: string;
  poolId?: string | null;
  type: ProductType;
  meetingsCount?: number;
  startTime?: string;
  daysOfWeek?: string[];
  discountAmount?: number | null;
  effectivePrice?: number | null;
}

export type ProductType = 'קורס' | 'חוג' | 'קייטנה';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Pool {
  id: string;
  name: string;
  seasonId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  healthApproval: boolean;
  idNumber: string;
}

export interface Registration {
  id: string;
  productId: string;
  participantId: string;
  registrationDate: string;
  requiredAmount: number;
  paidAmount: number;
  discountApproved: boolean;
  discountAmount?: number | null;
  receiptNumber?: string | null;
}

export interface Payment {
  id: string;
  registrationId: string;
  paymentDate: string;
  amount: number;
  receiptNumber: string;
}

// Hebrew-only payment statuses (consistent)
export type PaymentStatus = 'מלא' | 'חלקי' | 'יתר' | 'הנחה' | 'מלא / הנחה' | 'חלקי / הנחה' | 'לא שולם';

export interface PaymentStatusDetails {
  paid: number;
  expected: number;
  status: PaymentStatus;
}

// Consistent camelCase – no duplicate snake_case fields
export interface HealthDeclaration {
  id: string;
  participantId: string;
  token: string;
  formStatus: 'pending' | 'signed' | 'expired' | 'completed';
  submissionDate?: string | null;
  notes?: string | null;
  signature?: string | null;
  parentName?: string | null;
  parentId?: string | null;
  createdAt?: string;
  sentAt?: string | null;
}

export interface RegistrationWithDetails extends Registration {
  participant: Participant;
  product: Product;
  season: Season;
  payments?: Payment[];
  paymentStatus: PaymentStatus;
}

export interface PaymentDetails {
  id: string;
  registrationId: string;
  amount: number;
  receiptNumber: string;
  createdAt: string;
}

export interface DailyActivity {
  product: Product;
  startTime: string;
  numParticipants: number;
  currentMeetingNumber: number;
  totalMeetings: number;
}

// Leads module
export type LeadStatus = 'חדש' | 'מטופל' | 'רשום' | 'לא מעוניין' | 'ביצירת קשר' | 'ישן';

export interface Lead {
  id: string;
  name: string;                              // שם מלא
  idNumber: string;                          // ת.ז.
  phone: string;
  email: string;
  status: LeadStatus;
  requestedProductType?: ProductType | null; // קורס / חוג / קייטנה
  notes?: string | null;
  convertedToParticipantId?: string | null;  // לשימוש עתידי — המרה לרישום
  marketingConsent?: boolean;                // הסכמה לקבל עדכונים שיווקיים
  createdAt: string;
  updatedAt?: string;
}
