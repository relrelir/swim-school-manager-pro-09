
import { jsPDF } from 'jspdf';

/**
 * Add date section to the PDF document
 */
export function addDateSection(
  pdf: jsPDF, 
  currentY: number,
  margin: number,
  dateStr: string
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add date in top right corner
  pdf.setFontSize(10);
  pdf.text(dateStr, pageWidth - margin, 10, { align: 'right' });
  
  // Reset font size for content
  pdf.setFontSize(12);
}
