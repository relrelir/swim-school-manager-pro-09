
import { jsPDF } from 'jspdf';

/**
 * Add a section header to the PDF document
 */
export function addSectionHeader(
  pdf: jsPDF,
  text: string,
  currentY: number,
  margin: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(14);
  pdf.text(text, pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  return currentY;
}
