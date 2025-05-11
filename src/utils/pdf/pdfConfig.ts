
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { configureHebrewFont } from './alefFontData';

// Function to set up document with proper Hebrew font support
export const createRtlPdf = async (): Promise<jsPDF> => {
  console.log("Creating RTL PDF with Hebrew support");
  
  // Create PDF with standard settings
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

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
    
  } catch (error) {
    console.warn('Failed to configure Hebrew font, using fallback:', error);
    
    // Fallback to built-in font with RTL support
    try {
      // Try to use any built-in font that might work
      pdf.setFont('helvetica');
      console.log('Using fallback font: helvetica');
    } catch (fontError) {
      console.error('Font fallback also failed:', fontError);
    }
  }
  
  // Always enable RTL mode for the document regardless of font setup success
  pdf.setR2L(true);
  console.log("RTL mode enabled");
  
  return pdf;
};

// Helper function to format document date
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd/MM/yyyy');
};

// Helper to configure standard document styling
export const configureDocumentStyle = (pdf: jsPDF): void => {
  // Always start by enabling RTL
  pdf.setR2L(true);
  
  try {
    console.log("Configuring document style with Alef font");
    // Try to use Alef font as default
    pdf.setFont('Alef');
    
    // Standard settings
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    console.log("Document style configured successfully with Alef");
  } catch (error) {
    console.warn("Failed to set Alef font, using fallback:", error);
    // Fallback to default font
    try {
      pdf.setFont('helvetica');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      console.log("Using fallback helvetica font");
    } catch (e) {
      console.warn('Failed to set standard font, using default', e);
    }
  }
}
