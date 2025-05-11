
import { jsPDF } from 'jspdf';
import { formatPdfField, forceLtrDirection } from '../helpers/textFormatting';

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
  
  // Add date in top right corner with correct LTR formatting
  pdf.setFontSize(10);
  // Apply forceLtrDirection to ensure date displays correctly
  pdf.text(forceLtrDirection(dateStr), pageWidth - margin, 10, { align: 'right' });
  
  // Reset font size for content
  pdf.setFontSize(12);
}
