
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
  
  // Updated declaration content
  const declarationText = [
    '• אני מצהיר/ה כי בני/בתי בריא/ה ואין לו/לה מגבלות בריאותיות המונעות ממנו/ממנה להשתתף בפעילות.',
    '• במידה ויש מגבלה רפואית, יש לציין אותה בהערות למעלה ולצרף אישור רפואי המאשר השתתפות.',
    '• אני מתחייב/ת לעדכן על כל שינוי במצב הבריאותי.',
    '• אני מאשר/ת לצוות הרפואי לתת טיפול ראשוני במקרה הצורך.',
    '• ידוע לי שללא הצהרת בריאות חתומה לא יוכל בני/בתי להשתתף בפעילות.'
  ];
  
  // Draw a box for declaration content - make it more compact
  const boxHeight = declarationText.length * 8 + 8; // Reduced height from 10 to 8 per line
  pdf.rect(margin, currentY, pageWidth - (2 * margin), boxHeight);
  currentY += 6; // Reduced from 8
  
  // Add the bullet points with smaller spacing
  declarationText.forEach(text => {
    pdf.text(text, pageWidth - margin - 5, currentY, { align: 'right' });
    currentY += 8; // Reduced spacing between lines from 10 to 8
  });
  
  // Add reduced space after declaration
  return currentY + 6; // Reduced from 8
}
