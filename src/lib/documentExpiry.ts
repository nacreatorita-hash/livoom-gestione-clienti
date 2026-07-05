import { DocumentDrive } from '../types';

export type ExpiryStatus = 'Scaduto' | 'Scade oggi' | 'In scadenza' | 'Valido';

const DAY_MS = 86_400_000;

export function getTodayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDocumentExpiry(document: DocumentDrive) {
  if (!document.scadenza) return null;
  const daysRemaining = Math.round((parseDateOnly(document.scadenza).getTime() - getTodayDateOnly().getTime()) / DAY_MS);
  const status: ExpiryStatus = daysRemaining < 0
    ? 'Scaduto'
    : daysRemaining === 0
      ? 'Scade oggi'
      : daysRemaining <= 30
        ? 'In scadenza'
        : 'Valido';

  return { daysRemaining, status };
}

export function getExpiryLabel(daysRemaining: number) {
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} giorni fa`;
  if (daysRemaining === 0) return 'Oggi';
  if (daysRemaining === 1) return 'Domani';
  return `Tra ${daysRemaining} giorni`;
}

export function getExpiryBadgeClass(status: ExpiryStatus) {
  if (status === 'Scaduto') return 'expiry-badge expiry-badge--expired';
  if (status === 'Scade oggi') return 'expiry-badge expiry-badge--today';
  if (status === 'In scadenza') return 'expiry-badge expiry-badge--soon';
  return 'expiry-badge expiry-badge--valid';
}
