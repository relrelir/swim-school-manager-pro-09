
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';

import { forceLtrDirection, reverseString } from './helpers/textFormatting';
import { Registration, Participant, Payment, RegistrationWithDetails } from '@/types';
import { calculatePaymentStatus } from '@/services/firebase/registrations';
import { formatCurrencyForUI } from '@/utils/formatters';
import { format } from 'date-fns';

const PAGE_W = 210;
const MARGIN = 20;
const COL_GAP = 4;
const COL_W = (PAGE_W - 2 * MARGIN - COL_GAP) / 2; // 83mm
const RIGHT_COL_X = MARGIN + COL_W + COL_GAP;       // 107mm
const LEFT_COL_X = MARGIN;                            // 20mm
const ROW_H = 7;
const CONTENT_W = PAGE_W - 2 * MARGIN;               // 170mm

// Numbers/dates: pre-reverse so jsPDF RTL rendering shows them correctly
const rtlNum = (val: string) => reverseString(forceLtrDirection(val));
// Currency: use plain format then same pre-reverse treatment
const rtlAmount = (amount: number) =>
  reverseString(forceLtrDirection(formatCurrencyForUI(amount)));

function setLightBorder(pdf: jsPDF) {
  pdf.setDrawColor(180, 180, 180);
}

function drawTwoColTable(
  pdf: jsPDF,
  colX: number,
  startY: number,
  title: string,
  rows: [string, string][]
): void {
  // header
  pdf.setFillColor(225, 242, 245);
  setLightBorder(pdf);
  pdf.rect(colX, startY, COL_W, ROW_H, 'FD');
  pdf.setFont('Alef', 'bold');
  pdf.setFontSize(10);
  pdf.text(title, colX + COL_W - 3, startY + 5, { align: 'right' });
  pdf.setFont('Alef', 'normal');

  rows.forEach(([label, value], i) => {
    const rowY = startY + ROW_H + i * ROW_H;
    pdf.setFillColor(255, 255, 255);
    setLightBorder(pdf);
    pdf.rect(colX, rowY, COL_W, ROW_H, 'FD');
    setLightBorder(pdf);
    pdf.line(colX + COL_W / 2, rowY, colX + COL_W / 2, rowY + ROW_H);
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(9);
    pdf.text(label, colX + COL_W - 3, rowY + 5, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(9);
    pdf.text(value || '', colX + COL_W / 2 - 3, rowY + 5, { align: 'right' });
  });
}

function drawPaymentsTable(pdf: jsPDF, startY: number, payments: Payment[]): number {
  // 3 equal columns, right-to-left: תאריך תשלום | מספר קבלה | סכום
  const colW = CONTENT_W / 3; // ~56.7mm
  const divider1 = MARGIN + colW;           // left edge of middle col
  const divider2 = MARGIN + 2 * colW;       // left edge of right col

  // Column text anchors (right-aligned text within each column):
  //   right col  (תאריך תשלום): x = MARGIN + 3*colW - 3 = PAGE_W - MARGIN - 3
  //   middle col (מספר קבלה):   x = MARGIN + 2*colW - 3
  //   left col   (סכום):        x = MARGIN + colW - 3
  const textX = [PAGE_W - MARGIN - 3, MARGIN + 2 * colW - 3, MARGIN + colW - 3];

  const drawRow = (y: number, vals: string[], fillR: number, fillG: number, fillB: number, bold = false) => {
    pdf.setFillColor(fillR, fillG, fillB);
    setLightBorder(pdf);
    pdf.rect(MARGIN, y, CONTENT_W, ROW_H, 'FD');
    setLightBorder(pdf);
    pdf.line(divider1, y, divider1, y + ROW_H);
    pdf.line(divider2, y, divider2, y + ROW_H);
    vals.forEach((val, i) => {
      pdf.setFont('Alef', bold ? 'bold' : 'normal');
      pdf.setFontSize(9);
      pdf.text(val, textX[i], y + 5, { align: 'right' });
    });
  };

  // Header
  drawRow(startY, ['תאריך תשלום', 'מספר קבלה', 'סכום'], 225, 242, 245, true);
  let y = startY + ROW_H;

  // Data rows
  payments.forEach((payment, idx) => {
    const bg = idx % 2 === 0 ? 255 : 250;
    drawRow(
      y,
      [
        rtlNum(format(new Date(payment.paymentDate), 'dd/MM/yyyy')),
        rtlNum(payment.receiptNumber || '—'),
        rtlAmount(payment.amount),
      ],
      bg, bg, bg
    );
    y += ROW_H;
  });

  // Total row
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  drawRow(y, ['', 'סה"כ שולם', rtlAmount(totalPaid)], 240, 247, 248, true);
  y += ROW_H;

  return y;
}

export function buildRegistrationPDF(
  pdf: jsPDF,
  registration: Registration,
  participant: Participant,
  payments: Payment[],
  productName: string,
  options?: { productType?: string; afterCare?: boolean | null }
): string {
  try {
    configureDocumentStyle(pdf);
    pdf.setR2L(true);
    setLightBorder(pdf);

    // Override the shared PDF metadata set by createRtlPdf
    pdf.setProperties({ title: 'אישור רישום', subject: 'אישור רישום' });

    const fullName = `${participant.firstName} ${participant.lastName}`;

    // ── Title ──────────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(17);
    pdf.text('אישור רישום', PAGE_W / 2, 63, { align: 'center' });
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(productName, PAGE_W / 2, 71, { align: 'center' });
    pdf.setTextColor(0, 0, 0);

    // ── Date ───────────────────────────────────────────────────────────────
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      rtlNum(format(new Date(), 'dd/MM/yyyy')),
      PAGE_W - MARGIN,
      79,
      { align: 'right' }
    );
    pdf.setTextColor(0, 0, 0);

    // ── Two-column info ────────────────────────────────────────────────────
    const infoY = 85;

    drawTwoColTable(pdf, RIGHT_COL_X, infoY, 'פרטי משתתף', [
      ['שם מלא',     fullName],
      ['תעודת זהות', rtlNum(participant.idNumber || '')],
      ['טלפון',      rtlNum(participant.phone || '')],
    ]);

    const formattedRegDate = rtlNum(
      format(new Date(registration.registrationDate), 'dd/MM/yyyy')
    );

    const discountAmount = registration.discountAmount || 0;
    const effectiveRequiredAmount =
      (registration as RegistrationWithDetails).effectiveRequiredAmount ??
      Math.max(0, registration.requiredAmount - (registration.discountApproved ? discountAmount : 0));

    drawTwoColTable(pdf, LEFT_COL_X, infoY, 'פרטי רישום', [
      ['מוצר',        productName],
      ['תאריך רישום', formattedRegDate],
      ['סכום לתשלום', rtlAmount(effectiveRequiredAmount)],
    ]);

    // 3 rows → ends at infoY + ROW_H + 3*ROW_H = infoY + 28
    let y = infoY + ROW_H + 3 * ROW_H + 8;

    // ── Status box ─────────────────────────────────────────────────────────
    const actualPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const canonicalStatus = calculatePaymentStatus({ ...registration, paidAmount: actualPaidAmount });
    const paymentStatusText =
      canonicalStatus === 'מלא' || canonicalStatus === 'מלא / הנחה' || canonicalStatus === 'הנחה'
        ? 'שולם במלואו'
        : canonicalStatus === 'יתר'
        ? 'שולם ביתר'
        : actualPaidAmount > 0
        ? 'תשלום חלקי'
        : 'טרם שולם';

    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(11);
    pdf.text('סטטוס', PAGE_W - MARGIN, y, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    y += 5;

    const statusRows: [string, string][] = [
      ['הצהרת בריאות', participant.healthApproval ? 'כן' : 'לא'],
      ['סטטוס תשלום',  paymentStatusText],
      ...(options?.productType === 'קייטנה' && options?.afterCare !== null && options?.afterCare !== undefined
        ? [['צהרון', options.afterCare ? 'כולל צהרון' : 'ללא צהרון'] as [string, string]]
        : []),
    ];
    const statusBoxH = statusRows.length * ROW_H + 6;
    pdf.setFillColor(252, 252, 252);
    setLightBorder(pdf);
    pdf.rect(MARGIN, y, CONTENT_W, statusBoxH, 'FD');
    pdf.setFontSize(9);
    statusRows.forEach(([label, value], i) => {
      const rowY = y + 4 + i * ROW_H;
      pdf.setFont('Alef', 'bold');
      pdf.text(`${label}:`, PAGE_W - MARGIN - 3, rowY + 4, { align: 'right' });
      pdf.setFont('Alef', 'normal');
      pdf.text(value, PAGE_W - MARGIN - 50, rowY + 4, { align: 'right' });
    });
    y += statusBoxH + 8;

    // ── Payments table ─────────────────────────────────────────────────────
    if (payments.length > 0) {
      pdf.setFont('Alef', 'bold');
      pdf.setFontSize(11);
      pdf.text('פרטי תשלומים', PAGE_W - MARGIN, y, { align: 'right' });
      pdf.setFont('Alef', 'normal');
      y += 5;

      y = drawPaymentsTable(pdf, y, payments);
      y += 8;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    return `registration_${fullName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  } catch (error) {
    console.error('Error in buildRegistrationPDF:', error);
    throw error;
  }
}
