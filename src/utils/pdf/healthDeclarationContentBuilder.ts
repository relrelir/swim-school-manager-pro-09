
// Import only what's needed to be added or modified
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';
import { getFormattedDate } from './pdfConfig';

// Import section utilities
import { addTitleSection } from './sections/titleSection';
import { addDateSection } from './sections/dateSection';
import { addParticipantSection } from './sections/participantSection';
import { addParentSection } from './sections/parentSection';
import { addDeclarationContentSection } from './sections/declarationContentSection';
import { addMedicalNotesSection } from './sections/medicalNotesSection';
import { addConfirmationSection } from './sections/confirmationSection';
import { addSignatureSection } from './sections/signatureSection';

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
    
    const margin = 20;
    let currentY = 20; // Start position for content

    // Add title section
    currentY = addTitleSection(pdf, currentY);

    // Add date section
    const dateStr = healthDeclaration.submission_date ? 
      new Date(healthDeclaration.submission_date).toLocaleDateString('he-IL') : 
      getFormattedDate();
    addDateSection(pdf, currentY, margin, dateStr);
    
    // Add participant information section
    currentY = addParticipantSection(pdf, currentY, margin, {
      fullName: participant.fullName || '',
      idnumber: participant.idnumber || '',
      phone: participant.phone || ''
    });

    // Add parent/guardian information section
    currentY = addParentSection(pdf, currentY, margin, {
      name: healthDeclaration.parent_name || '',
      id: healthDeclaration.parent_id || ''
    });

    // Add declaration content section
    currentY = addDeclarationContentSection(pdf, currentY, margin);
    
    // Add medical notes section
    currentY = addMedicalNotesSection(pdf, currentY, margin, healthDeclaration.notes);

    // Add confirmation section 
    currentY = addConfirmationSection(pdf, currentY, margin);
    
    // Add signature section - moved AFTER confirmation section
    currentY = addSignatureSection(pdf, currentY, margin, healthDeclaration.signature);
    
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
