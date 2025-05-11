
import { containsHebrew, isNumberOnly, isDateFormat, isPhoneFormat, isEnglishOrNumber, isHebrewCurrency } from './contentDetection';
import { formatPdfField, forceLtrDirection as forceLtrDirectionFormat, forceRtlDirection as forceRtlDirectionFormat } from './textFormatting';

/**
 * Process text to ensure correct display direction in PDF
 * Using format utilities for consistent bidirectional text handling
 */
export const processTextDirection = (text: string): string => {
  if (!text) return '';
  
  // For numbers, dates, phone numbers, and English text, we use special handling in RTL context
  if (isNumberOnly(text) || isDateFormat(text) || isPhoneFormat(text) || isEnglishOrNumber(text)) {
    // Use our utility function for numeric/LTR text in RTL context
    return forceLtrDirectionFormat(text);
  }

  // For Hebrew or mixed content, no special handling needed in RTL context
  if (containsHebrew(text)) {
    return text; // Hebrew works correctly with global RTL
  }
  
  // Default - assume LTR in RTL context
  return forceLtrDirectionFormat(text);
};

/**
 * Force LTR direction for numeric content in RTL context
 */
export const forceLtrDirection = (text: string): string => {
  return forceLtrDirectionFormat(text);
};

/**
 * Force RTL direction specifically for Hebrew text
 * In global RTL, this is a no-op
 */
export const forceRtlDirection = (text: string): string => {
  return text; // Hebrew already works correctly in global RTL
};

/**
 * DEPRECATED - Never use this function!
 * This function is preserved only for backward compatibility
 */
export const manuallyReverseString = (text: string): string => {
  // Never reverse the string - just return it as is
  return text;
};

/**
 * Special processor for table cells to handle mixed content
 */
export const processTableCellText = (text: string): string => {
  if (!text) return '';
  
  return formatPdfField(text);
};

/**
 * Special formatter for Hebrew currency values in tables
 */
export const processHebrewCurrencyForTable = (text: string): string => {
  // Currency needs special handling in RTL context
  return forceLtrDirectionFormat(text);
};

/**
 * Helper function to ensure Hebrew text is properly displayed in PDF
 */
export const encodeHebrewText = (text: string): string => {
  if (!text) return '';
  
  return text; // Hebrew already works correctly in global RTL
};

/**
 * Legacy helper function kept for backward compatibility
 */
export const reverseText = (text: string): string => {
  return text ? text : ''; // No need to reverse in global RTL
};

/**
 * Helper function specifically for tables to ensure RTL text is displayed correctly
 */
export const prepareRtlText = (text: string): string => {
  return text; // Hebrew already works correctly in global RTL
};
