
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
  
  // Declaration content
  const declarationText = [
    '• אני מצהיר/ה בזאת כי בני/בתי/אני נמצא/ת בכושר ובמצב בריאותי תקין/מסוגל להשתתף בפעילות.',
    '• בהצהרה זו הנני מתחייב/ת, כי אם יחול שינוי במצבו/ה הבריאותי, אעדכן אותך באופן מיידי.',
    '• אני מתחייב/ת לדווח לך על כל שינוי במצב הבריאותי.',
    '• אני מאשר/ת לגופכם הרפואי לטפל באופן ראשוני במקרה הצורך.',
    '• ידוע לי שאחריות בריאותו של בני/בתי חלה עלי בכל ההשתתפות בפעילות.'
  ];
  
  // Draw a box for declaration content
  pdf.rect(margin, currentY, pageWidth - (2 * margin), declarationText.length * 10 + 10);
  currentY += 8;
  
  // Add the bullet points
  declarationText.forEach(text => {
    pdf.text(text, pageWidth - margin - 5, currentY, { align: 'right' });
    currentY += 10;
  });
  
  // Add space after declaration
  return currentY + 8;
}
