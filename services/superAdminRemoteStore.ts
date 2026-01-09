import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  getDoc,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebaseClient';
import { Company, Role } from '../types';

export type SuperAdminStoredUser = {
  id: string;
  name: string;
  email: string;
  emailNorm: string;
  password?: string;
  role: Role;
  orgId: string;
  companyId?: string;
  isEnabled?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SuperAdminStoredCompany = {
  id: string;
  name: string;
  orgId: string;
  isActive?: boolean;
  loginAllowed?: boolean;
  subscriptionStatus?: string;
  validFrom?: string;
  validTo?: string;
  plan?: any;
  limits?: any;
  usage?: any;
  createdAt?: string;
  updatedAt?: string;
};

const COLLECTIONS = {
  users: 'sa_users',
  companies: 'sa_companies',
};

const toIso = (value: any): string | undefined => {
  if (!value) return undefined;
  try {
    const dt = value instanceof Date ? value : new Date(value);
    return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
  } catch {
    return undefined;
  }
};

export const isRemoteStoreEnabled = (): boolean => {
  return !!getFirestoreDb();
};

export const fetchAllRemoteUsers = async (): Promise<SuperAdminStoredUser[]> => {
  const db = getFirestoreDb();
  if (!db) return [];

  const snap = await getDocs(collection(db, COLLECTIONS.users));
  const out: SuperAdminStoredUser[] = [];
  snap.forEach((d) => {
    out.push(d.data() as any);
  });
  return out;
};

export const fetchAllRemoteCompanies = async (): Promise<SuperAdminStoredCompany[]> => {
  const db = getFirestoreDb();
  if (!db) return [];

  const snap = await getDocs(collection(db, COLLECTIONS.companies));
  const out: SuperAdminStoredCompany[] = [];
  snap.forEach((d) => {
    out.push(d.data() as any);
  });
  return out;
};

export const findRemoteUserByEmailNorm = async (emailNorm: string): Promise<SuperAdminStoredUser | null> => {
  const db = getFirestoreDb();
  if (!db) return null;

  const q = query(
    collection(db, COLLECTIONS.users),
    where('emailNorm', '==', emailNorm),
    limit(1)
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  return first ? (first.data() as any) : null;
};

export const upsertRemoteUser = async (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  companyId?: string;
  isEnabled?: boolean;
  active?: boolean;
  password?: string;
  createdAt?: any;
  updatedAt?: any;
}): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) return;

  const emailNorm = String(user.email ?? '').trim().toLowerCase();
  const payload: SuperAdminStoredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailNorm,
    password: user.password,
    role: user.role,
    orgId: user.orgId,
    companyId: user.companyId,
    isEnabled: user.isEnabled,
    active: user.active,
    createdAt: toIso(user.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(user.updatedAt) ?? new Date().toISOString(),
  };

  await setDoc(doc(db, COLLECTIONS.users, user.id), payload, { merge: true });
};

export const upsertRemoteCompany = async (company: Company): Promise<void> => {
  const db = getFirestoreDb();
  if (!db) return;

  const payload: SuperAdminStoredCompany = {
    id: company.id,
    name: company.name,
    orgId: company.orgId,
    isActive: company.isActive,
    loginAllowed: company.loginAllowed,
    subscriptionStatus: company.subscriptionStatus as any,
    validFrom: toIso((company as any).validFrom),
    validTo: toIso((company as any).validTo),
    plan: (company as any).plan,
    limits: (company as any).limits,
    usage: (company as any).usage,
    createdAt: toIso((company as any).createdAt),
    updatedAt: toIso((company as any).updatedAt),
  };

  await setDoc(doc(db, COLLECTIONS.companies, company.id), payload, { merge: true });
};

export const getRemoteCompanyById = async (companyId: string): Promise<SuperAdminStoredCompany | null> => {
  const db = getFirestoreDb();
  if (!db) return null;

  const snap = await getDoc(doc(db, COLLECTIONS.companies, companyId));
  return snap.exists() ? (snap.data() as any) : null;
};
