
import { jsPDF } from 'jspdf';
import { forceLtrDirection } from '../helpers/textFormatting';

/**
 * Add participant information section to the PDF document
 */
export function addParticipantSection(
  pdf: jsPDF, 
  currentY: number,
  margin: number,
  participantInfo: {
    fullName: string;
    idnumber: string;
    phone: string;
  }
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('פרטי המשתתף', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Create table with participant info
  const tableWidth = pageWidth - (2 * margin);
  const colWidth = tableWidth / 2;
  const rowHeight = 10;
  
  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, currentY, tableWidth, rowHeight, 'FD');
  
  // Add header text
  pdf.setFont('Alef', 'bold');
  pdf.text('שם מלא', pageWidth - margin - 5, currentY + 7, { align: 'right' });
  pdf.text(participantInfo.fullName || '', margin + colWidth - 5, currentY + 7, { align: 'right' });
  
  // Reset font
  pdf.setFont('Alef', 'normal');
  
  // Move to next row
  currentY += rowHeight;
  
  // Draw table rows for ID and phone
  const rows = [
    ['תעודת זהות', forceLtrDirection(participantInfo.idnumber || '')],
    ['טלפון', forceLtrDirection(participantInfo.phone || '')]
  ];
  
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
  
  // Add space after table
  return currentY + 10;
}
