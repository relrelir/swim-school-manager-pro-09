
import { jsPDF } from 'jspdf';

/**
 * Add medical notes section to the PDF document
 */
export function addMedicalNotesSection(
  pdf: jsPDF,
  currentY: number,
  margin: number,
  notes: string | null
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('הערות רפואיות', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Create a box for notes
  const notesHeight = 20;
  pdf.rect(margin, currentY, pageWidth - (2 * margin), notesHeight);
  
  // Display notes or default message
  if (notes && notes !== '') {
    // If there are actual medical notes
    pdf.text(notes, pageWidth - margin - 5, currentY + 7, { align: 'right' });
  } else {
    // If no notes
    pdf.text('אין הערות רפואיות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
  }
  
  // Add space after notes
  return currentY + notesHeight + 10;
}
