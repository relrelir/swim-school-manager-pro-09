
// Import only what's needed to be added or modified
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';
import { getFormattedDate } from './pdfConfig';
import { parseMedicalNotes } from './healthDeclarationParser';

export function buildHealthDeclarationPDF(
  pdf: jsPDF, 
  healthDeclaration: {
    id: string;
    participant_id: string;
    submission_date: string | null;
    notes: string | null;
    form_status: string;
    signature: string | null;
    parent_name?: string | null;
    parent_id?: string | null;
  },
  participant: {
    firstname: string;
    lastname: string;
    idnumber: string;
    phone: string;
    fullName: string;
  }
) {
  try {
    // Apply document style which includes Alef font setup
    configureDocumentStyle(pdf);
    
    // Always ensure RTL mode is set
    pdf.setR2L(true);
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = 20; // Start position for content

    // Add title - centered
    pdf.setFontSize(18);
    pdf.text('הצהרת בריאות', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Add date in top right corner
    pdf.setFontSize(10);
    const dateStr = healthDeclaration.submission_date ? 
      new Date(healthDeclaration.submission_date).toLocaleDateString('he-IL') : 
      getFormattedDate();
    pdf.text(dateStr, pageWidth - margin, 10, { align: 'right' });
    
    // Reset font size for content
    pdf.setFontSize(12);

    // Draw simple table with 2 cells - Following the example image exactly
    const drawSimpleTable = (row1Header: string, row1Value: string, currentY: number): number => {
      const tableWidth = pageWidth - (2 * margin);
      
      // Draw first row
      pdf.rect(margin, currentY, tableWidth, 10);
      pdf.setFont('Alef', 'normal');
      pdf.text(row1Header, pageWidth - margin - 5, currentY + 7, { align: 'right' });
      
      // Row 2 - Split into two cells
      currentY += 10;
      // Draw the full row rectangle
      pdf.rect(margin, currentY, tableWidth, 10);
      // Add the vertical line to split the row
      const middleX = pageWidth / 2;
      pdf.line(middleX, currentY, middleX, currentY + 10);
      
      // Add text to second row right cell
      pdf.text('תעודת זהות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
      
      // Return the updated Y position
      return currentY + 10;
    };

    // Create section header
    const addSectionHeader = (text: string) => {
      pdf.setFontSize(14);
      pdf.text(text, pageWidth - margin, currentY, { align: 'right' });
      currentY += 8;
      pdf.setFontSize(12);
    };
    
    // Participant Information Table - a simple two-row table
    currentY = drawSimpleTable('שם מלא', participant.fullName, currentY);
    
    // Declaration Content Section
    addSectionHeader('תוכן ההצהרה');
    
    // Create a box for the declaration content
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
    
    currentY += 8;

    // Medical Notes Section
    addSectionHeader('הערות רפואיות');
    
    // Create a box for notes
    const notesHeight = 20;
    pdf.rect(margin, currentY, pageWidth - (2 * margin), notesHeight);
    
    // Extract only medical notes (removing parent info)
    const medicalNotes = parseMedicalNotes(healthDeclaration.notes);
    
    if (medicalNotes && medicalNotes !== '') {
      // If there are actual medical notes
      pdf.text(medicalNotes, pageWidth - margin - 5, currentY + 7, { align: 'right' });
    } else {
      // If no notes
      pdf.text('אין הערות רפואיות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
    }
    
    currentY += notesHeight + 10;
    
    // Parent Information Table - following the example image
    addSectionHeader('פרטי ההורה/אפוטרופוס');
    
    // Draw parent info box
    const parentInfoWidth = pageWidth - (2 * margin);
    pdf.rect(margin, currentY, parentInfoWidth, 20);
    
    // Add the parent name with label - exact format from example image
    const parentName = healthDeclaration.parent_name || '';
    pdf.text(`Parent Name: ${parentName}`, pageWidth - margin - 5, currentY + 7, { align: 'right' });
    
    // Add the parent ID on the next line
    const parentId = healthDeclaration.parent_id || '';
    pdf.text(`Parent ID: ${parentId}`, pageWidth - margin - 5, currentY + 17, { align: 'right' });
    
    currentY += 30;
    
    // Confirmation Section
    addSectionHeader('אישור');
    
    // Create a box for confirmation
    const confirmationHeight = 20;
    pdf.rect(margin, currentY, pageWidth - (2 * margin), confirmationHeight);
    
    pdf.text('אני מאשר/ת את פרטיי האישיים וכי כל הפרטים שמסרתי הם נכונים.', pageWidth - margin - 5, currentY + 10, { align: 'right' });
    
    currentY += confirmationHeight + 10;

    // Signature Section
    addSectionHeader('חתימה');
    
    // Add signature or line for manual signature
    if (healthDeclaration.signature) {
      try {
        // Calculate signature dimensions - maintain aspect ratio but limit width
        const maxSignatureWidth = 100;
        const signatureHeight = 40;
        
        // Add the signature image centered
        pdf.addImage(
          healthDeclaration.signature,
          'PNG',
          (pageWidth / 2) - (maxSignatureWidth / 2), // Center horizontally
          currentY,
          maxSignatureWidth,
          signatureHeight
        );
        
        currentY += signatureHeight + 10;
      } catch (error) {
        console.warn('Failed to add signature image to PDF:', error);
        // Add a line for manual signature if the image fails
        pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
      }
    } else {
      // Add a line for manual signature if no digital signature
      pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
      currentY += 20;
    }
    
    // Return the filename with clean formatting
    const cleanName = participant.fullName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `health_declaration_${cleanName}_${timestamp}.pdf`;
  } catch (error) {
    console.error('Error building health declaration PDF:', error);
    // Return a generic filename in case of error
    return `health_declaration_${new Date().toISOString().split('T')[0]}.pdf`;
  }
}
