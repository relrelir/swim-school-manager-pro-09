
import { jsPDF } from 'jspdf';

/**
 * Configure standard document styling for PDF
 */
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
};

/**
 * Apply bold text style to PDF
 */
export const applyBoldStyle = (pdf: jsPDF): void => {
  try {
    pdf.setFont('Alef', 'bold');
  } catch (error) {
    console.warn("Failed to set bold style, using fallback:", error);
    try {
      pdf.setFont('helvetica', 'bold');
    } catch (e) {
      console.warn('Failed to set bold font, using default', e);
    }
  }
};

/**
 * Reset to normal text style in PDF
 */
export const resetToNormalStyle = (pdf: jsPDF): void => {
  try {
    pdf.setFont('Alef', 'normal');
  } catch (error) {
    console.warn("Failed to reset style, using fallback:", error);
    try {
      pdf.setFont('helvetica', 'normal');
    } catch (e) {
      console.warn('Failed to reset font, using default', e);
    }
  }
};
