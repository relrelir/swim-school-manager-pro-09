
import { jsPDF } from 'jspdf';
import { Registration, Participant, Payment, RegistrationWithDetails } from '@/types';
import { calculatePaymentStatus } from '@/services/firebase/registrations';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { addPdfTitle, addPdfDate, addSectionTitle, createDataTable, createPlainTextTable } from './pdfHelpers';
import { processTextDirection, forceLtrDirection } from './helpers/textDirection';

/**
 * Builds a registration PDF with participant and payment information
 * Enhanced with improved bidirectional text handling
 */
export function buildRegistrationPDF(
  pdf: jsPDF,
  registration: Registration,
  participant: Participant,
  payments: Payment[],
  productName: string
): string {
  try {
    console.log("Building registration PDF with enhanced bidirectional text support...");
    
    // Format current date for display - use explicit format with day first
    // Apply strongest possible LTR control for date display
    const currentDate = forceLtrDirection(format(new Date(), 'dd/MM/yyyy'));
    
    // Create a filename
    const fileName = `registration_${participant.firstName}_${participant.lastName}_${registration.id.substring(0, 8)}.pdf`;
    
    // Add PDF title
    addPdfTitle(pdf, 'אישור רישום למוצר');
    console.log("Title added to PDF");
    
    // Add date to document with explicit LTR control
    addPdfDate(pdf, currentDate);
    
    // Add product name - Hebrew content gets RTL
    pdf.setR2L(true); // Enable RTL just for this section
    pdf.setFontSize(16);
    pdf.text(`מוצר: ${productName}`, pdf.internal.pageSize.width / 2, 35, { align: 'center' });
    pdf.setR2L(false); // Disable RTL for next operations
    
    // Participant information section
    addSectionTitle(pdf, 'פרטי משתתף:', 50);
    
    // Process participant data with explicit content type direction control
    // For Hebrew names, use basic processing
    const fullName = `${participant.firstName} ${participant.lastName}`;
    
    // For IDs and phone numbers, use strongest possible LTR control
    const idNumber = forceLtrDirection(participant.idNumber);
    const phone = forceLtrDirection(participant.phone);
    
    // Create participant data - now with explicit label/value direction handling
    // Hebrew labels and text (value, label)
    const participantData = [
      [fullName, 'שם מלא:'],
      [idNumber, 'תעודת זהות:'],
      [phone, 'טלפון:'],
    ];
    
    // Create table with participant data
    let yPosition = createDataTable(pdf, participantData, 55);
    console.log("Added participant data");
    
    // Registration information - MODIFIED as per requirements
    addSectionTitle(pdf, 'פרטי רישום:', yPosition + 15);
    
    // Use pre-computed effectiveRequiredAmount from RegistrationWithDetails when available;
    // fall back to the inline formula for plain Registration objects.
    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount =
      (registration as RegistrationWithDetails).effectiveRequiredAmount ??
      Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));

    // Compute actual paid amount from the payments array passed to this function.
    // This is always authoritative (same source used by DataContext) and avoids reading
    // the potentially-stale registration.paidAmount field from Firestore.
    const actualPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    // Use the canonical calculatePaymentStatus for consistent 7-state status logic.
    // Map to a 3-state human-readable PDF label.
    const canonicalStatus = calculatePaymentStatus({ ...registration, paidAmount: actualPaidAmount });
    const paymentStatusText =
      canonicalStatus === 'מלא' || canonicalStatus === 'מלא / הנחה' || canonicalStatus === 'הנחה'
        ? 'שולם במלואו'
        : canonicalStatus === 'יתר'
        ? 'שולם ביתר'
        : actualPaidAmount > 0
        ? 'תשלום חלקי'
        : 'טרם שולם';
    
    // Format the registration date with day first and explicit LTR control
    const formattedRegistrationDate = forceLtrDirection(format(new Date(registration.registrationDate), 'dd/MM/yyyy'));
    
    // Modified registration data table with only the requested fields
    const registrationData = [
      [formattedRegistrationDate, 'תאריך רישום:'],
      [productName, 'מוצר:'],
      [formatCurrency(effectiveRequiredAmount), 'סכום לתשלום:'],
      [participant.healthApproval ? 'כן' : 'לא', 'הצהרת בריאות:'],
      [paymentStatusText, 'סטטוס תשלום:'],
    ];
    
    // Create table with registration data
    yPosition = createDataTable(pdf, registrationData, yPosition + 20);
    console.log("Added registration data");
    
    // Payment details section
    if (payments.length > 0) {
      addSectionTitle(pdf, 'פרטי תשלומים:', yPosition + 15);
      
      // Create payment details table header
      const paymentHeaders = [
        'סכום',
        'מספר קבלה', 
        'תאריך תשלום'
      ];
      
      // Create payment details rows with enhanced direction control
      // Apply strongest LTR control for all numeric/receipt data
      const paymentData = payments.map(payment => [
        formatCurrency(payment.amount),
        forceLtrDirection(payment.receiptNumber),
        forceLtrDirection(format(new Date(payment.paymentDate), 'dd/MM/yyyy'))
      ]);
      
      // Create table with payment data and headers - reversed for RTL display
      yPosition = createDataTable(pdf, [[...paymentHeaders].reverse(), ...paymentData.map(row => [...row].reverse())], yPosition + 20, true);
      console.log("Added payments data");
    }
    
    // Add footer
    pdf.setR2L(true); // Enable RTL for Hebrew footer text
    const footerText = 'מסמך זה מהווה אישור רשמי על רישום ותשלום.';
    pdf.setFontSize(10);
    pdf.text(footerText, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 20, { align: 'center' });
    pdf.setR2L(false); // Reset RTL setting
    console.log("Added footer");
    
    return fileName;
  } catch (error) {
    console.error('Error in buildRegistrationPDF:', error);
    throw error;
  }
}
