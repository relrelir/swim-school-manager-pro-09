
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';
import { getFormattedDate } from './pdfConfig';
import { forceLtrDirection, reverseString } from './helpers/textFormatting';


const PAGE_W = 210;
const MARGIN = 20;
const COL_GAP = 4;
const COL_W = (PAGE_W - 2 * MARGIN - COL_GAP) / 2; // 83mm
const RIGHT_COL_X = MARGIN + COL_W + COL_GAP;       // 107mm (participant)
const LEFT_COL_X = MARGIN;                            // 20mm  (parent)
const ROW_H = 7;
const CONTENT_W = PAGE_W - 2 * MARGIN;               // 170mm

function drawTwoColTable(
  pdf: jsPDF,
  colX: number,
  startY: number,
  title: string,
  rows: [string, string][]
): void {
  // header row
  pdf.setFillColor(225, 242, 245);
  pdf.setDrawColor(180);
  pdf.rect(colX, startY, COL_W, ROW_H, 'FD');
  pdf.setFont('Alef', 'bold');
  pdf.setFontSize(10);
  pdf.text(title, colX + COL_W - 3, startY + 5, { align: 'right' });
  pdf.setFont('Alef', 'normal');

  rows.forEach(([label, value], i) => {
    const rowY = startY + ROW_H + i * ROW_H;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(colX, rowY, COL_W, ROW_H, 'FD');
    // vertical divider at half-width
    pdf.line(colX + COL_W / 2, rowY, colX + COL_W / 2, rowY + ROW_H);
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(9);
    pdf.text(label, colX + COL_W - 3, rowY + 5, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(9);
    pdf.text(value || '', colX + COL_W / 2 - 3, rowY + 5, { align: 'right' });
  });
}

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
    configureDocumentStyle(pdf);
    pdf.setR2L(true);
    pdf.setDrawColor(180);

    const dateStr = healthDeclaration.submission_date
      ? new Date(healthDeclaration.submission_date).toLocaleDateString('he-IL')
      : getFormattedDate();

    // ── Title ──────────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(17);
    pdf.text('הצהרת בריאות', PAGE_W / 2, 63, { align: 'center' });
    pdf.setFont('Alef', 'normal');

    // ── Date ───────────────────────────────────────────────────────────────
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(
      reverseString(forceLtrDirection(dateStr)),
      PAGE_W - MARGIN,
      71,
      { align: 'right' }
    );
    pdf.setTextColor(0);

    // ── Two-column info ────────────────────────────────────────────────────
    const infoY = 77;

    drawTwoColTable(pdf, RIGHT_COL_X, infoY, 'פרטי המשתתף', [
      ['שם מלא',       participant.fullName || ''],
      ['תעודת זהות',   reverseString(forceLtrDirection(participant.idnumber || ''))],
      ['טלפון',        reverseString(forceLtrDirection(participant.phone || ''))],
    ]);

    drawTwoColTable(pdf, LEFT_COL_X, infoY, 'פרטי הורה/אפוטרופוס', [
      ['שם מלא',     healthDeclaration.parent_name || ''],
      ['תעודת זהות', reverseString(forceLtrDirection(healthDeclaration.parent_id || ''))],
    ]);

    // max rows is participant (3) → ends at infoY + ROW_H + 3*ROW_H = infoY + 28
    let y = infoY + ROW_H + 3 * ROW_H + 6; // ≈ 111

    // ── Declaration ────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(11);
    pdf.text('תוכן ההצהרה', PAGE_W - MARGIN, y, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    y += 5;

    const declarationItems = [
      'אני מצהיר/ה כי בני/בתי בריא/ה ובכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.',
      'לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.',
      'לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות.',
      'במידה ויש מגבלה רפואית, יש לציין אותה בהערות ולצרף אישור רפואי המאשר השתתפות.',
      'אני מתחייב/ת לעדכן את המדריכים על כל שינוי במצב הבריאותי.',
      'אני מאשר/ת לצוות הרפואי לתת טיפול ראשוני במקרה הצורך.',
      'ידוע לי שללא הצהרת בריאות חתומה לא יוכל בני/בתי להשתתף בפעילות.',
    ];

    const itemH = 7;
    const boxH = declarationItems.length * itemH + 6;
    pdf.setDrawColor(180);
    pdf.setFillColor(252, 252, 252);
    pdf.rect(MARGIN, y, CONTENT_W, boxH, 'FD');
    pdf.setFontSize(9);
    let itemY = y + 5;
    declarationItems.forEach(text => {
      pdf.text(`• ${text}`, PAGE_W - MARGIN - 3, itemY, {
        align: 'right',
        maxWidth: CONTENT_W - 6,
      });
      itemY += itemH;
    });
    y += boxH + 5;

    // ── Notes + Confirmation side by side ──────────────────────────────────
    const bottomBoxH = 20;

    // Heading right (notes)
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(10);
    pdf.text('הערות רפואיות', RIGHT_COL_X + COL_W - 3, y, { align: 'right' });
    // Heading left (confirmation)
    pdf.text('אישור', LEFT_COL_X + COL_W - 3, y, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    y += 5;

    // Notes box
    pdf.setFillColor(252, 252, 252);
    pdf.setDrawColor(180);
    pdf.rect(RIGHT_COL_X, y, COL_W, bottomBoxH, 'FD');
    pdf.setFontSize(9);
    const notesText = healthDeclaration.notes && healthDeclaration.notes.trim()
      ? healthDeclaration.notes
      : 'אין הערות רפואיות';
    pdf.text(notesText, RIGHT_COL_X + COL_W - 3, y + 7, {
      align: 'right',
      maxWidth: COL_W - 6,
    });

    // Confirmation box
    pdf.setFillColor(252, 252, 252);
    pdf.rect(LEFT_COL_X, y, COL_W, bottomBoxH, 'FD');
    pdf.setFontSize(8.5);
    pdf.text(
      'אני מאשר/ת את פרטיי האישיים וכי כל הפרטים שמסרתי הם נכונים.',
      LEFT_COL_X + COL_W - 3,
      y + 7,
      { align: 'right', maxWidth: COL_W - 6 }
    );
    y += bottomBoxH + 7;

    // ── Signature ──────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(11);
    pdf.text('חתימה', PAGE_W - MARGIN, y, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    y += 4;

    if (healthDeclaration.signature) {
      try {
        const sigW = 90;
        const sigH = 30;
        pdf.addImage(
          healthDeclaration.signature,
          'PNG',
          PAGE_W / 2 - sigW / 2,
          y,
          sigW,
          sigH
        );
        y += sigH + 4;
      } catch {
        // fallback to line
        pdf.setDrawColor(100);
        pdf.line(MARGIN + 20, y + 18, PAGE_W - MARGIN - 20, y + 18);
        y += 24;
      }
    } else {
      pdf.setDrawColor(100);
      pdf.line(MARGIN + 20, y + 18, PAGE_W - MARGIN - 20, y + 18);
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text('חתימת ההורה/אפוטרופוס', PAGE_W / 2, y + 23, { align: 'center' });
      pdf.setTextColor(0);
      y += 28;
    }

    const cleanName = participant.fullName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `health_declaration_${cleanName}_${timestamp}.pdf`;
  } catch (error) {
    console.error('Error building health declaration PDF:', error);
    return `health_declaration_${new Date().toISOString().split('T')[0]}.pdf`;
  }
}
