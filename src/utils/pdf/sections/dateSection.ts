
import { jsPDF } from 'jspdf';
import { formatPdfField, forceLtrDirection, reverseString } from '../helpers/textFormatting';

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
  
  // Add date below title with correct LTR formatting
  pdf.setFontSize(10);
  pdf.text(reverseString(forceLtrDirection(dateStr)), pageWidth - margin, currentY, { align: 'right' });
  
  // Reset font size for content
  pdf.setFontSize(12);
}
