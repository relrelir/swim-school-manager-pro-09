
import { jsPDF } from 'jspdf';
import { configureHebrewFont, applyFontFallback } from './fontConfig';
import { configureDocumentStyle } from './documentStyle';
import { addPageBackground } from './backgroundImage';

/**
 * Creates a new PDF document with RTL support for Hebrew
 */
export const createRtlPdf = async (): Promise<jsPDF> => {
  console.log("Creating RTL PDF with Hebrew support");
  
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add letterhead background before any content
  await addPageBackground(pdf);

  try {
    // Configure for Hebrew text support with Alef font
    await configureHebrewFont(pdf);
    console.log("Hebrew font configuration completed successfully");
    
    // CRITICAL: Set Hebrew language for better bidirectional support
    if (typeof pdf.setLanguage === 'function') {
      try {
        pdf.setLanguage('he');
        console.log("Hebrew language set successfully");
      } catch (langError) {
        console.warn('Failed to set Hebrew language', langError);
      }
    }
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
  } catch (error) {
    console.warn('Failed to configure Hebrew font, using fallback:', error);
    
    // Fallback to built-in font with RTL support
    applyFontFallback(pdf);
  }
  
  // Always enable RTL mode for the document regardless of font setup success
  pdf.setR2L(true);
  console.log("RTL mode enabled");
  
  // Apply standard document styling
  configureDocumentStyle(pdf);
  
  return pdf;
};
