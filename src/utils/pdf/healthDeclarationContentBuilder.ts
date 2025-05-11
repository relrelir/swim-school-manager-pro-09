
// Import only what's needed to be added or modified
// For the existing PDF content builder, make sure it accepts the right interface

// Update the function to accept our new HealthDeclarationData type
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
  pdf.addFont('David', 'normal');
  pdf.setFont('David');
  pdf.setR2L(true);  // Fixed: setRTL -> setR2L
  pdf.setFontSize(14);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  let currentY = 10;

  const addLine = (text: string) => {
    const textWidth = pdf.getTextWidth(text);
    // Fixed: Add the proper arguments for text() function (x, y, text)
    pdf.text(text, pageWidth - margin - textWidth, currentY);
    currentY += 10;
  };

  addLine(`שם מלא: ${participant.fullName}`);
  addLine(`תעודת זהות: ${participant.idnumber}`);
  addLine(`טלפון: ${participant.phone}`);
  addLine(`הצהרת בריאות מספר: ${healthDeclaration.id}`);
  addLine(`תאריך הצהרה: ${healthDeclaration.submission_date || 'לא צוין'}`);
  addLine(`סטטוס: ${healthDeclaration.form_status}`);

  if (healthDeclaration.notes) {
    addLine(`הערות: ${healthDeclaration.notes}`);
  }
  
  // Return the filename
  const cleanName = participant.fullName.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `health_declaration_${cleanName}_${timestamp}.pdf`;
}
