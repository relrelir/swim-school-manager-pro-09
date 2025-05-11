
import { jsPDF } from 'jspdf';

/**
 * Add signature section to the PDF document
 */
export function addSignatureSection(
  pdf: jsPDF,
  currentY: number,
  margin: number,
  signature: string | null
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('חתימה', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Add signature if available
  if (signature) {
    try {
      // Calculate signature dimensions - better size and position
      const maxSignatureWidth = 80; // Smaller signature width
      const signatureHeight = 30; // Smaller signature height
      
      // Add the signature image - centered horizontally
      pdf.addImage(
        signature,
        'PNG',
        (pageWidth / 2) - (maxSignatureWidth / 2), // Center horizontally
        currentY,  // Position at current Y
        maxSignatureWidth,
        signatureHeight
      );
      
      currentY += signatureHeight + 5; // Add space after signature
    } catch (error) {
      console.warn('Failed to add signature image to PDF:', error);
      // Add a line for manual signature if the image fails
      pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
      currentY += 20;
    }
  } else {
    // Add a line for manual signature if no digital signature
    pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
    currentY += 20;
  }
  
  return currentY;
}
