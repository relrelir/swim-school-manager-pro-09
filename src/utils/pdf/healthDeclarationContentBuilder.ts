// Import only what's needed to be added or modified
// For the existing PDF content builder, make sure it accepts the right interface
import jsPDF from 'jspdf';

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
    // Try to add the David font - we'll keep this but add better error handling
    pdf.addFont('David', 'David', 'normal');
    pdf.setFont('David');
  } catch (error) {
    console.warn('Failed to load David font, falling back to built-in font', error);
    // Fall back to a built-in font if David fails to load
    pdf.setFont('helvetica');
  }
  
  // Always set RTL mode regardless of font
  pdf.setR2L(true);
  pdf.setFontSize(14);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  let currentY = 20; // Start a bit lower to make room for a title

  // Add title
  pdf.setFontSize(18);
  pdf.text('הצהרת בריאות', pageWidth / 2, 10, { align: 'center' });
  pdf.setFontSize(14);

  // Helper function to add text with proper RTL positioning
  const addLine = (text: string, indent = 0) => {
    try {
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, pageWidth - margin - textWidth - indent, currentY);
      currentY += 10;
    } catch (error) {
      console.warn('Error adding text to PDF:', error);
      // Alternative method if the first fails
      pdf.text(text, pageWidth - margin - indent, currentY, { align: 'right' });
      currentY += 10;
    }
  };

  // Add participant information section
  addLine(`שם מלא: ${participant.fullName}`);
  addLine(`תעודת זהות: ${participant.idnumber}`);
  addLine(`טלפון: ${participant.phone}`);
  
  // Add a separator line
  currentY += 5;
  pdf.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
  currentY += 5;
  
  // Add declaration information
  addLine(`הצהרת בריאות מספר: ${healthDeclaration.id}`);
  addLine(`תאריך הצהרה: ${healthDeclaration.submission_date || 'לא צוין'}`);
  addLine(`סטטוס: ${healthDeclaration.form_status}`);

  // Parse parent information from notes if available
  if (healthDeclaration.notes) {
    // Add notes header
    currentY += 5;
    pdf.setFontSize(16);
    addLine('פרטי הצהרה:');
    pdf.setFontSize(14);
    
    // Add actual notes with some indentation
    const notesLines = healthDeclaration.notes.split('\n');
    notesLines.forEach(line => {
      if (line.trim()) {
        addLine(line, 5);
      } else {
        currentY += 5; // Add some space for empty lines
      }
    });
  }

  // Add signature section if available
  if (healthDeclaration.signature) {
    currentY += 10;
    addLine('חתימה:');
    try {
      // Add the signature image if available
      pdf.addImage(
        healthDeclaration.signature,
        'PNG',
        pageWidth - 80, // X position
        currentY,       // Y position
        70,             // Width
        40              // Height
      );
      currentY += 45;
    } catch (error) {
      console.warn('Failed to add signature image to PDF:', error);
      addLine('(חתימה דיגיטלית)');
    }
  }
  
  // Return the filename with clean formatting
  const cleanName = participant.fullName.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `health_declaration_${cleanName}_${timestamp}.pdf`;
}
