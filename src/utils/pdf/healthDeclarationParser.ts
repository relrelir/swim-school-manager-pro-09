
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
  
  // Improved pattern matching for parent name
  // Look for explicit patterns with "parent name" or similar text
  const parentNameMatch = cleanedNotes.match(/(?:שם הורה|הורה\/אפוטרופוס):?\s*([^,\n]+)/i);
  if (parentNameMatch && parentNameMatch[1]) {
    parentName = parentNameMatch[1].trim();
    // Clean up any variable-like text
    parentName = parentName.replace(/parent_?name:?/i, '').trim();
  }
  
  // Improved pattern matching for parent ID
  const parentIdMatch = cleanedNotes.match(/(?:ת\.ז\.\s*הורה|ת\.ז\.|תעודת זהות):?\s*([^,\n]+)/i);
  if (parentIdMatch && parentIdMatch[1]) {
    parentId = parentIdMatch[1].trim();
    // Clean up any variable-like text
    parentId = parentId.replace(/parent_?id:?/i, '').trim();
  }
  
  return { parentName, parentId };
};

/**
 * Extract medical notes from health declaration notes (removing parent info)
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  // Clean up the notes - remove parent info sections and variable names
  let cleanedNotes = notes
    .replace(/(?:שם הורה|הורה\/אפוטרופוס):?\s*[^,\n]+/g, '')
    .replace(/(?:ת\.ז\.\s*הורה|ת\.ז\.|תעודת זהות):?\s*[^,\n]+/g, '')
    .replace(/parent_?name:?\s*[^,\n]+/gi, '')
    .replace(/parent_?id:?\s*[^,\n]+/gi, '')
    .trim();
  
  // Remove any empty lines
  cleanedNotes = cleanedNotes
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
  
  return cleanedNotes;
};
