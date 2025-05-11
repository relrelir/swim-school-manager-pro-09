
import { jsPDF } from 'jspdf';

/**
 * Add title section to the PDF document
 */
export function addTitleSection(pdf: jsPDF, currentY: number): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title - centered
  pdf.setFontSize(18);
  pdf.text('הצהרת בריאות', pageWidth / 2, currentY, { align: 'center' });
  return currentY + 15; // Return the next Y position
}
