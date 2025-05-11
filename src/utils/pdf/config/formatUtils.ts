
import { format } from 'date-fns';

/**
 * Helper function to format document date
 */
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

/**
 * Helper function to format date and time
 */
export const getFormattedDateTime = (): string => {
  return format(new Date(), 'dd/MM/yyyy HH:mm');
};

/**
 * Format date from ISO string
 */
export const formatDateFromIso = (isoDate: string | null): string => {
  if (!isoDate) return getFormattedDate();
  
  try {
    return format(new Date(isoDate), 'dd/MM/yyyy');
  } catch (error) {
    console.warn('Failed to format date:', error);
    return getFormattedDate();
  }
};

/**
 * Generate clean filename from participant name and date
 */
export const generateCleanFilename = (baseName: string, participantName: string): string => {
  const cleanName = participantName.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}_${cleanName}_${timestamp}.pdf`;
};
