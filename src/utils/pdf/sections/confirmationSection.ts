
import { jsPDF } from 'jspdf';

/**
 * Add confirmation section to the PDF document
 */
export function addConfirmationSection(
  pdf: jsPDF,
  currentY: number,
  margin: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('אישור', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Create a smaller box for confirmation
  const confirmationHeight = 15; // Reduced height
  pdf.rect(margin, currentY, pageWidth - (2 * margin), confirmationHeight);
  
  pdf.text('אני מאשר/ת את פרטיי האישיים וכי כל הפרטים שמסרתי הם נכונים.', 
    pageWidth - margin - 5, currentY + 7, { align: 'right' });
  
  // Add space after confirmation - reduced spacing
  return currentY + confirmationHeight + 8;
}
