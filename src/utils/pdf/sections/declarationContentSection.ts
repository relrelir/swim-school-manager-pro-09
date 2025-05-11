
import { jsPDF } from 'jspdf';

/**
 * Add declaration content section to the PDF document
 */
export function addDeclarationContentSection(
  pdf: jsPDF,
  currentY: number,
  margin: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add section header
  pdf.setFontSize(14);
  pdf.text('תוכן ההצהרה', pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pdf.setFontSize(12);
  
  // Declaration content - made more compact
  const declarationText = 
    'אני מצהיר/ה כי בני/בתי/אני בכושר ובמצב בריאותי תקין, כי אעדכן על כל שינוי במצב הבריאותי, וכי אני מאשר/ת טיפול רפואי ראשוני במקרה הצורך.';
  
  // Draw a smaller box for declaration content
  pdf.rect(margin, currentY, pageWidth - (2 * margin), 25);
  currentY += 8;
  
  // Add the compact text with word wrapping
  const textWidth = pageWidth - (2 * margin) - 10; // 5px padding on each side
  const wrappedText = pdf.splitTextToSize(declarationText, textWidth);
  
  pdf.text(wrappedText, pageWidth - margin - 5, currentY, { align: 'right' });
  
  // Add space after declaration - reduced spacing
  return currentY + 20;
}
