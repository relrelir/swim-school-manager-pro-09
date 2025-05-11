
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
  
  // Enhanced pattern matching for parent name - detect both Hebrew and English variable names
  const parentNameMatch = cleanedNotes.match(/(?:שם הורה|הורה\/אפוטרופוס|Parent Name:|parent_?name:?)\s*([^,\n]+)/i);
  if (parentNameMatch && parentNameMatch[1]) {
    parentName = parentNameMatch[1].trim();
    // Clean up any variable-like text
    parentName = parentName
      .replace(/parent_?name:?/i, '')
      .replace(/Parent Name:?/i, '')
      .replace(/שם הורה:?/, '')
      .replace(/הורה\/אפוטרופוס:?/, '')
      .trim();
  }
  
  // Enhanced pattern matching for parent ID - detect both Hebrew and English variable names
  const parentIdMatch = cleanedNotes.match(/(?:ת\.ז\.\s*הורה|ת\.ז\.|תעודת זהות|Parent ID:|parent_?id:?)\s*([^,\n]+)/i);
  if (parentIdMatch && parentIdMatch[1]) {
    parentId = parentIdMatch[1].trim();
    // Clean up any variable-like text
    parentId = parentId
      .replace(/parent_?id:?/i, '')
      .replace(/Parent ID:?/i, '')
      .replace(/ת\.ז\.\s*הורה:?/, '')
      .replace(/ת\.ז\.:?/, '')
      .replace(/תעודת זהות:?/, '')
      .trim();
  }
  
  console.log("Extracted parent info:", { parentName, parentId });
  return { parentName, parentId };
};

/**
 * Extract medical notes from health declaration notes (removing parent info)
 */
export const parseMedicalNotes = (notes: string | null): string => {
  if (!notes) return '';
  
  // Enhanced clean up - remove both Hebrew and English parent info sections
  let cleanedNotes = notes
    .replace(/(?:שם הורה|הורה\/אפוטרופוס):?\s*[^,\n]+/g, '')
    .replace(/(?:ת\.ז\.\s*הורה|ת\.ז\.|תעודת זהות):?\s*[^,\n]+/g, '')
    .replace(/Parent Name:?\s*[^,\n]+/gi, '')
    .replace(/Parent ID:?\s*[^,\n]+/gi, '')
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
