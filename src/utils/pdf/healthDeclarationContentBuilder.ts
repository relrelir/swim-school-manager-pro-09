
// Import only what's needed to be added or modified
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';
import { getFormattedDate } from './pdfConfig';

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

    // Create section header
    const addSectionHeader = (text: string) => {
      pdf.setFontSize(14);
      pdf.text(text, pageWidth - margin, currentY, { align: 'right' });
      currentY += 8;
      pdf.setFontSize(12);
    };

    // Create table with 2 columns
    const createTable = (headers: string[], rows: string[][], rowHeight: number = 10) => {
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
      
      // Add space after table
      currentY += 10;
    };
    
    // Participant Information Table
    addSectionHeader('פרטי המשתתף');
    createTable(
      ['שם מלא', 'אריאל דוזנבּרּג'], // Headers
      [
        ['תעודת זהות', participant.idnumber || ''],
        ['טלפון', participant.phone || '']
      ]
    );

    // Parent/Guardian Information Table
    addSectionHeader('פרטי ההורה/אפוטרופוס');
    
    // Parse parent name and ID from notes if available
    let parentName = '';
    let parentId = '';
    
    if (healthDeclaration.parent_name) {
      parentName = healthDeclaration.parent_name;
    }
    
    if (healthDeclaration.parent_id) {
      parentId = healthDeclaration.parent_id;
    }
    
    createTable(
      ['שם מלא', parentName || 'אריאל דוזנבּרּג'], // Headers
      [['תעודת זהות', parentId || '']]
    );

    // Declaration Content
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

    // Medical Notes Section (if any)
    addSectionHeader('הערות רפואיות');
    
    // Create a box for notes
    const notesHeight = 20;
    pdf.rect(margin, currentY, pageWidth - (2 * margin), notesHeight);
    
    if (healthDeclaration.notes) {
      const cleanedNotes = healthDeclaration.notes
        .replace(/הורה\/אפוטרופוס:?/g, '')
        .replace(/שם הורה:?/g, '')
        .replace(/ת\.ז\. הורה:?/g, '')
        .trim();
      
      // If there are actual medical notes
      if (cleanedNotes && cleanedNotes !== '') {
        pdf.text(cleanedNotes, pageWidth - margin - 5, currentY + 7, { align: 'right' });
      } else {
        // If no notes
        pdf.text('אין הערות רפואיות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
      }
    } else {
      // If no notes
      pdf.text('אין הערות רפואיות', pageWidth - margin - 5, currentY + 7, { align: 'right' });
    }
    
    currentY += notesHeight + 10;
    
    // Confirmation Section
    addSectionHeader('אישור');
    
    // Create a box for confirmation
    const confirmationHeight = 20;
    pdf.rect(margin, currentY, pageWidth - (2 * margin), confirmationHeight);
    
    pdf.text('אני מאשר/ת את פרטיי האישיים וכי כל הפרטים שמסרתי הם נכונים.', pageWidth - margin - 5, currentY + 10, { align: 'right' });
    
    currentY += confirmationHeight + 10;

    // Signature Section
    addSectionHeader('חתימה');
    
    // Add signature if available
    if (healthDeclaration.signature) {
      try {
        // Calculate signature dimensions - maintain aspect ratio but limit width
        const maxSignatureWidth = 100;
        const signatureHeight = 40;
        
        // Add the signature image
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
