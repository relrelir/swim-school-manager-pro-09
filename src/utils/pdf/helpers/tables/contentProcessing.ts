
import { processTableCellText, forceLtrDirection } from '../textDirection';
import { containsHebrew } from '../contentDetection';
import { formatPdfField, reverseString } from '../textFormatting';

/**
 * Process cell text based on content type for optimal table display
 * Applying appropriate direction markers for bidirectional text
 */
export const processCellContent = (cell: any): { text: string, isRtl: boolean, isCurrency: boolean } => {
  if (cell === null || cell === undefined) {
    return { text: '', isRtl: false, isCurrency: false };
  }
  
  const content = String(cell);
  const isHebrewContent = containsHebrew(content);
  const isCurrency = /[₪$€£]|ILS/.test(content) || /^[\d,\.]+\s*(?:[₪$€£]|ILS)/.test(content);
  
  console.log(`Processing cell: ${content}, Hebrew: ${isHebrewContent}, Currency: ${isCurrency}`);
  
  // Handle participant ID numbers and other numeric IDs
  if (/^\d{5,9}$/.test(content)) {
    // ID numbers need LTR formatting in RTL context
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Currency with Hebrew text
  else if (isCurrency && isHebrewContent) {
    return { 
      text: formatPdfField(content),
      isRtl: true,
      isCurrency: true 
    };
  }
  // Non-Hebrew currency
  else if (isCurrency) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: true 
    };
  }
  // Date format - always needs LTR in RTL context
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(content)) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Pure numbers - need LTR in RTL context
  else if (/^[0-9\s\-\.\/]+$/.test(content)) {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
  // Hebrew text - works correctly with global RTL
  else if (isHebrewContent) {
    return { 
      // Apply reverseString to Hebrew text for proper display in global RTL
      text: reverseString(content),
      isRtl: true,
      isCurrency: false 
    };
  }
  // Other content (English, etc)
  else {
    return { 
      text: forceLtrDirection(content),
      isRtl: false,
      isCurrency: false 
    };
  }
};
