
import { jsPDF } from 'jspdf';

/**
 * Add parent/guardian information section to the PDF document
 */
export function addParentSection(
  pdf: jsPDF, 
  currentY: number,
  margin: number,
  parentInfo: {
    name: string;
    id: string;
  }
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('פרטי ההורה/אפוטרופוס', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Create table with parent info
  const tableWidth = pageWidth - (2 * margin);
  const colWidth = tableWidth / 2;
  const rowHeight = 10;
  
  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, currentY, tableWidth, rowHeight, 'FD');
  
  // Add header text
  pdf.setFont('Alef', 'bold');
  pdf.text('שם מלא', pageWidth - margin - 5, currentY + 7, { align: 'right' });
  pdf.text(parentInfo.name || '', margin + colWidth - 5, currentY + 7, { align: 'right' });
  
  // Reset font
  pdf.setFont('Alef', 'normal');
  
  // Move to next row
  currentY += rowHeight;
  
  // Draw table row for ID
  // Draw row rectangle
  pdf.rect(margin, currentY, tableWidth, rowHeight);
  // Draw column separator
  pdf.line(margin + colWidth, currentY, margin + colWidth, currentY + rowHeight);
  
  // Add row text
  pdf.text('תעודת זהות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
  pdf.text(parentInfo.id || '', margin + colWidth - 5, currentY + 7, { align: 'right' });
  
  // Move to next row
  currentY += rowHeight;
  
  // Add space after table
  return currentY + 10;
}
