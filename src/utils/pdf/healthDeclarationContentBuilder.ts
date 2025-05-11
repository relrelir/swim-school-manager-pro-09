
// Import only what's needed to be added or modified
import { jsPDF } from 'jspdf';

export function buildHealthDeclarationPDF(
  pdf: jsPDF, 
  healthDeclaration: {
    id: string;
    participant_id: string;
    submission_date: string | null;
    notes: string | null;
    form_status: string;
    signature: string | null;
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
    // For plain standard fonts, no need for addFont - this is safer
    pdf.setFont("helvetica");
    pdf.setR2L(true);  
    pdf.setFontSize(14);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let currentY = 20; // Start a bit lower for better spacing

    // Helper function for adding text safely
    const addLine = (text: string, indent = 0) => {
      try {
        // For RTL text, we position from the right margin
        pdf.text(text, pageWidth - margin - indent, currentY);
        currentY += 10;
      } catch (error) {
        console.warn(`Could not add line "${text}": `, error);
        // Add fallback text instead of failing
        currentY += 10;
      }
    };

    // Title
    pdf.setFontSize(18);
    pdf.text("הצהרת בריאות", pageWidth / 2, currentY, { align: "center" });
    currentY += 20;

    // Reset font size for content
    pdf.setFontSize(14);

    // Use basic text methods that are more reliable
    addLine(`שם מלא: ${participant.fullName}`);
    addLine(`תעודת זהות: ${participant.idnumber}`);
    addLine(`טלפון: ${participant.phone}`);
    currentY += 5; // Add extra space

    addLine(`הצהרת בריאות מספר: ${healthDeclaration.id}`);
    addLine(`תאריך הצהרה: ${healthDeclaration.submission_date || 'לא צוין'}`);
    addLine(`סטטוס: ${healthDeclaration.form_status}`);
    currentY += 5; // Add extra space

    // Parse and display parent information from notes if available
    if (healthDeclaration.notes) {
      const notes = healthDeclaration.notes;
      // Look for parent information in the notes
      const parentNameMatch = notes.match(/Parent Name: ([^\n]+)/);
      const parentIdMatch = notes.match(/Parent ID: ([^\n]+)/);
      
      if (parentNameMatch) {
        addLine(`שם הורה: ${parentNameMatch[1]}`);
      }
      
      if (parentIdMatch) {
        addLine(`ת.ז. הורה: ${parentIdMatch[1]}`);
      }
      
      // Add remaining notes if any (after filtering out parent info)
      const remainingNotes = notes
        .replace(/Parent Name: [^\n]+\n?/, '')
        .replace(/Parent ID: [^\n]+\n?/, '')
        .trim();
        
      if (remainingNotes) {
        currentY += 5; // Add extra space
        addLine(`הערות:`);
        
        // Split notes into lines for better display
        const noteLines = remainingNotes.split('\n');
        noteLines.forEach(line => {
          addLine(line, 10); // Indent notes
        });
      }
    }

    // Add signature section if available
    if (healthDeclaration.signature) {
      try {
        currentY += 15;
        addLine("חתימה:");
        currentY += 5;
        
        // Create a safe dimension for the signature image
        const sigWidth = 50;
        const sigHeight = 30;
        const sigX = pageWidth - margin - sigWidth;
        
        // Try to add the signature image
        pdf.addImage(
          healthDeclaration.signature, 
          'PNG', 
          sigX, 
          currentY, 
          sigWidth, 
          sigHeight
        );
        
        currentY += sigHeight + 10;
      } catch (error) {
        console.warn("Could not add signature to PDF:", error);
        addLine("[חתימה אלקטרונית]");
      }
    }
    
    // Return the filename
    const cleanName = participant.fullName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `health_declaration_${cleanName}_${timestamp}.pdf`;
  } catch (error) {
    console.error("Error building health declaration PDF:", error);
    throw new Error("Failed to build health declaration PDF");
  }
}
