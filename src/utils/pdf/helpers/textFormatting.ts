
/**
 * Utility functions for text formatting in PDFs
 * Handles bidirectional text (RTL Hebrew and LTR numbers)
 */

/**
 * Reverses a string to correct display issues in PDFs with RTL context
 * @param text The text to reverse
 * @returns The reversed text
 */
export const reverseString = (text: string): string => {
  if (text === null || text === undefined || text === '') return '';
  
  // Split the string into an array of characters, reverse it, then join it back
  return text.split('').reverse().join('');
};

/**
 * Format text for PDF display with appropriate direction markers
 * - Hebrew text works correctly with the global RTL setting
 * - Numbers need special handling with RTL marks
 */
export const formatPdfField = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Check if the text contains Hebrew characters
  const containsHebrew = /[\u0590-\u05FF]/.test(textStr);
  
  // Check if the text contains only numbers, spaces, hyphens, and typical numeric symbols
  const isNumeric = /^[\d\s\-+()\/\.,:]+$/.test(textStr);
  
  // In a globally RTL document:
  // - Hebrew text already displays correctly (RTL)
  // - Numbers need explicit RTL marks to display correctly
  if (isNumeric && !containsHebrew) {
    // Use LRM (U+200E) for numbers to ensure they display correctly in RTL context
    return '\u200E' + textStr + '\u200E';
  } else if (containsHebrew) {
    // Hebrew text - reverse it to correct display in global RTL
    return reverseString(textStr);
  } else {
    // Non-Hebrew, non-numeric text - reverse for correct display in global RTL
    return reverseString(textStr);
  }
};

/**
 * Force LTR direction for numbers, IDs, dates regardless of content
 */
export const forceLtrDirection = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  
  const textStr = String(text);
  
  // Use LRM (U+200E) to ensure proper display of numeric content in RTL context
  return '\u200E' + textStr + '\u200E';
};

/**
 * Force RTL direction for Hebrew text regardless of content
 */
export const forceRtlDirection = (text: string): string => {
  if (text === null || text === undefined) return '';
  
  // Reverse Hebrew text to correct display in global RTL context
  return reverseString(text);
};

/**
 * Special formatting for table cells
 */
export const formatTableCell = (text: string | number): string => {
  return formatPdfField(text);
};
