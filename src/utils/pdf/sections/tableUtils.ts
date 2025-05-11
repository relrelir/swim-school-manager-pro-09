
import { jsPDF } from 'jspdf';

/**
 * Create a table with two columns in the PDF document
 */
export function createTable(
  pdf: jsPDF,
  currentY: number,
  margin: number,
  headers: string[],
  rows: string[][],
  rowHeight: number = 10
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableWidth = pageWidth - (2 * margin);
  const colWidth = tableWidth / 2;
  
  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, currentY, tableWidth, rowHeight, 'FD');
  
  // Add header text
  pdf.setFont('Alef', 'bold');
  pdf.text(headers[0], pageWidth - margin - 5, currentY + 7, { align: 'right' });
  pdf.text(headers[1], margin + colWidth - 5, currentY + 7, { align: 'right' });
  
  // Reset font
  pdf.setFont('Alef', 'normal');
  
  // Move to next row
  currentY += rowHeight;
  
  // Draw table rows
  rows.forEach((row) => {
    // Draw row rectangle
    pdf.rect(margin, currentY, tableWidth, rowHeight);
    // Draw column separator
    pdf.line(margin + colWidth, currentY, margin + colWidth, currentY + rowHeight);
    
    // Add row text
    pdf.text(row[0], pageWidth - margin - 5, currentY + 7, { align: 'right' });
    pdf.text(row[1], margin + colWidth - 5, currentY + 7, { align: 'right' });
    
    // Move to next row
    currentY += rowHeight;
  });
  
  // Return new Y position
  return currentY;
}
