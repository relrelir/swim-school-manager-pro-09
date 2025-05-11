
/**
 * Utilities for parsing health declaration data from various formats
 */

/**
 * Extract parent information from health declaration notes
 */
export const parseParentInfo = (notes: string | null): { parentName: string; parentId: string } => {
  if (!notes) return { parentName: '', parentId: '' };
  
  const cleanedNotes = notes.trim();
  let parentName = '';
  let parentId = '';
  
  // Try to extract parent name with improved pattern matching
  const parentNameMatch = cleanedNotes.match(/(?:שם הורה|הורה\/אפוטרופוס):?\s*([^,\n]+)/i);
  if (parentNameMatch && parentNameMatch[1]) {
    parentName = parentNameMatch[1].trim();
  }
  
  // Try to extract parent ID with improved pattern matching
  const parentIdMatch = cleanedNotes.match(/(?:ת\.ז\.\s*הורה|ת\.ז\.|תעודת זהות):?\s*([^,\n]+)/i);
  if (parentIdMatch && parentIdMatch[1]) {
    parentId = parentIdMatch[1].trim();
  }
  
  return { parentName, parentId };
};

/**
 * Extract medical notes from health declaration notes (removing parent info)
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  // Clean up the notes - more aggressively remove parent info sections including variable names
  let cleanedNotes = notes
    .replace(/שם הורה:?\s*[^,\n]+/g, '')
    .replace(/ת\.ז\.\s*הורה:?\s*[^,\n]+/g, '')
    .replace(/הורה\/אפוטרופוס:?\s*[^,\n]+/g, '')
    .replace(/תעודת זהות:?\s*[^,\n]+/g, '')
    .replace(/PARENT NAME:?\s*[^,\n]+/g, '')  // Remove English variable names too
    .replace(/PARENT ID:?\s*[^,\n]+/g, '')    // Remove English variable names too
    .replace(/parent_name:?\s*[^,\n]+/g, '')  // Remove code variable names
    .replace(/parent_id:?\s*[^,\n]+/g, '')    // Remove code variable names
    .trim();
  
  // Remove any empty lines
  cleanedNotes = cleanedNotes
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return cleanedNotes;
};
