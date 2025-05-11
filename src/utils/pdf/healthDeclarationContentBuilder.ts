
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
      ['שם מלא', participant.fullName || ''], // Headers
      [
        ['תעודת זהות', participant.idnumber || ''],
        ['טלפון', participant.phone || '']
      ]
    );

    // Parent/Guardian Information Table
    addSectionHeader('פרטי ההורה/אפוטרופוס');
    
    // Get parent info directly from the enhanced declaration data
    const parentName = healthDeclaration.parent_name || '';
    const parentId = healthDeclaration.parent_id || '';
    
    createTable(
      ['שם מלא', parentName], // Header row
      [['תעודת זהות', parentId]] // Data row
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
    
    // Signature Section - Moved up by 2-3 cm and reduced size
    addSectionHeader('חתימה');
    
    // Add signature if available - improved positioning
    if (healthDeclaration.signature) {
      try {
        // Calculate signature dimensions - smaller size
        const maxSignatureWidth = 80; // Reduced from 100
        const signatureHeight = 30; // Reduced from 40
        
        // Add the signature image - centered horizontally and moved up by 2-3 cm (20-30mm)
        pdf.addImage(
          healthDeclaration.signature,
          'PNG',
          (pageWidth / 2) - (maxSignatureWidth / 2), // Center horizontally
          currentY,  // Position at current Y
          maxSignatureWidth,
          signatureHeight
        );
        
        currentY += signatureHeight + 5; // Add space after signature
      } catch (error) {
        console.warn('Failed to add signature image to PDF:', error);
        // Add a line for manual signature if the image fails
        pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
        currentY += 20;
      }
    } else {
      // Add a line for manual signature if no digital signature
      pdf.line(margin + 20, currentY + 15, pageWidth - margin - 20, currentY + 15);
      currentY += 20;
    }
    
    // Medical Notes Section (if any) - Moved after the signature
    addSectionHeader('הערות רפואיות');
    
    // Create a box for notes
    const notesHeight = 20;
    pdf.rect(margin, currentY, pageWidth - (2 * margin), notesHeight);
    
    // Display only medical notes (parent info has already been removed by parseMedicalNotes)
    if (healthDeclaration.notes && healthDeclaration.notes !== '') {
      // If there are actual medical notes
      pdf.text(healthDeclaration.notes, pageWidth - margin - 5, currentY + 7, { align: 'right' });
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
