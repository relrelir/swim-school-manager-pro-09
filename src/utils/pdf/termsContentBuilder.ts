
import jsPDF from 'jspdf';
import { configureDocumentStyle } from './pdfConfig';
import { getFormattedDate } from './pdfConfig';
import { forceLtrDirection, reverseString } from './helpers/textFormatting';


const PAGE_W = 210;
const MARGIN = 20;
const COL_GAP = 4;
const COL_W = (PAGE_W - 2 * MARGIN - COL_GAP) / 2;   // 83mm
const RIGHT_COL_X = MARGIN + COL_W + COL_GAP;          // 107mm
const LEFT_COL_X = MARGIN;                              // 20mm
const ROW_H = 6;                                        // info table row height
const CONTENT_W = PAGE_W - 2 * MARGIN;                 // 170mm

// Section layout — balanced to use full content area (63–255mm)
const ITEM_FONT_SIZE = 8;
const ITEM_LINE_H = 3.5;   // mm per wrapped line
const BOX_PAD_TOP = 1.5;   // mm inside box above first item
const BOX_PAD_BOT = 1.0;   // mm inside box below last item
const SECTION_TITLE_H = 5; // mm: space for section title text above the box
const SECTION_GAP = 1.0;   // mm between boxes
const ITEM_MAX_W = CONTENT_W - 8; // 162mm — 4mm left+right margin inside box

// Accurate box height via splitTextToSize line-wrap measurement
function sectionBoxHeight(pdf: jsPDF, items: string[]): number {
  pdf.setFont('Alef', 'normal');
  pdf.setFontSize(ITEM_FONT_SIZE);
  let h = BOX_PAD_TOP;
  for (const item of items) {
    const lines = pdf.splitTextToSize(`• ${item}`, ITEM_MAX_W) as string[];
    h += lines.length * ITEM_LINE_H;
  }
  h += BOX_PAD_BOT;
  return h;
}

function drawInfoTable(
  pdf: jsPDF,
  colX: number,
  startY: number,
  title: string,
  rows: [string, string][]
): void {
  pdf.setFillColor(225, 242, 245);
  pdf.setDrawColor(180);
  pdf.rect(colX, startY, COL_W, ROW_H, 'FD');
  pdf.setFont('Alef', 'bold');
  pdf.setFontSize(9);
  pdf.text(title, colX + COL_W - 3, startY + 4.3, { align: 'right' });
  pdf.setFont('Alef', 'normal');

  rows.forEach(([label, value], i) => {
    const rowY = startY + ROW_H + i * ROW_H;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(colX, rowY, COL_W, ROW_H, 'FD');
    pdf.line(colX + COL_W / 2, rowY, colX + COL_W / 2, rowY + ROW_H);
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(8);
    pdf.text(label, colX + COL_W - 3, rowY + 4, { align: 'right' });
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(8);
    pdf.text(value || '', colX + COL_W / 2 - 3, rowY + 4, { align: 'right' });
  });
}

const CAMP_TERMS_SECTION = {
  title: 'מועדי הקייטנה ושעות פעילות',
  items: [
    'הקייטנה מתקיימת בימים א\'–ה\' בשעות 07:45–13:30.',
    'צהרון (בתשלום נפרד): 13:30–16:00, ברישום מראש. תיאום ותשלום הצהרון מתבצעים ישירות מול מפעיל הצהרון ואינם מתקיימים בשטח הבריכה.',
  ],
};

const TERMS_SECTIONS = [
  {
    title: '1. הרשמה ופתיחת קבוצות',
    items: [
      'פתיחת קבוצת לימוד מותנית במספר מינימלי של משתתפים, בהתאם לשיקול דעתה של הנהלת בית הספר לשחייה.',
      'המחיר עבור הפעילות הינו המחיר הנקוב בטופס אישור הרישום שנשלח ללקוח.',
    ],
  },
  {
    title: '2. נוכחות, היעדרויות ולוחות זמנים',
    items: [
      'מועדי השיעורים ולוחות הזמנים נקבעים מראש. הלו"ז כפוף לאילוצי הבריכה וייתכנו שינויים במידת הצורך; הודעה על שינויים תימסר מראש.',
      'לא יינתן החזר כספי או שיעור השלמה בגין מפגשים שהוחסרו על ידי הלקוח (מכל סיבה שהיא) או בגין איחור של המשתתף לשיעור.',
    ],
  },
  {
    title: '3. ליווי, השגחה ואחריות הורים',
    items: [
      'אחריות המדריך חלה על המשתתף אך ורק בזמן שהותו במים במהלך השיעור.',
      'האחריות המלאה על הילד/ה מחוץ למים (לפני, במהלך לצורך יציאה לשירותים, ובסיום השיעור) חלה על ההורה המלווה בלבד.',
      'עבור ילדים מתחת לגיל 6: חובה על הורה מלווה להיות נוכח בבריכה בתחילת השיעור ובסיומו.',
      'על הורי המשתתפים להיות נוכחים במתחם לאורך כל זמן השיעור.',
      'כניסת מלווה למים בזמן השיעור (למי שאינו מנוי בבריכה) כרוכה בתשלום נפרד בקופת הבריכה.',
    ],
  },
  {
    title: '4. ציוד ולבוש',
    items: [
      'חובה להגיע עם ציוד אישי: כובע שחייה ומשקפת. אטמי אוזניים במידת הצורך.',
      'זמן השהייה בבריכה מוגבל ל-10 דקות לפני תחילת השיעור ועד 10 דקות לאחר סיומו.',
      'בזמן "שחיית משפחות": חובה ללבוש חולצה ומכנסיים בתוך המים ומחוצה להם.',
      'יש להישמע להוראות המציל ולתקנון הכללי של הבריכה.',
    ],
  },
  {
    title: '5. מדיניות ביטולים',
    items: [
      'בקשת ביטול תוגש בכתב בלבד להנהלת בית הספר לשחייה.',
      'ביטול לאחר ההרשמה: כל ביטול שיתבצע לאחר אישור הרישום יחויב בדמי ביטול בסך 10% מעלות החוג/הפעילות.',
      'ביטול סמוך למועד הפתיחה: החל מ-36 שעות לפני מועד פתיחת הפעילות (השיעור הראשון), לא ניתן יהיה לבטל את הרישום ולא יינתן החזר כספי.',
      'בקשות לביטול עקב מקרים חריגים ייבחנו לגופם ובהתאם לשיקול דעתה הבלעדי של הנהלת בית הספר לשחייה.',
    ],
  },
];

export function buildTermsPDF(
  pdf: jsPDF,
  declaration: {
    termsSignedDate?: string | null;
    termsSignature?: string | null;
    parentName?: string | null;
    parentId?: string | null;
    productType?: string | null;
    afterCare?: boolean | null;
  },
  participant: {
    firstname: string;
    lastname: string;
    idnumber: string;
    phone: string;
    fullName: string;
  }
): string {
  try {
    configureDocumentStyle(pdf);
    pdf.setR2L(true);
    pdf.setDrawColor(180);

    const dateStr = declaration.termsSignedDate
      ? new Date(declaration.termsSignedDate).toLocaleDateString('he-IL')
      : getFormattedDate();

    // ── Title (y=63 — same safe start as all other PDFs, below logo) ────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(15);
    pdf.text('תקנון פעילות – בית הספר לשחייה', PAGE_W / 2, 63, { align: 'center' });

    // ── Date ───────────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(reverseString(forceLtrDirection(dateStr)), PAGE_W - MARGIN, 71, { align: 'right' });
    pdf.setTextColor(0);

    // ── Info tables (infoY=77, ROW_H=6, 3 data rows → ends at 77+24=101mm) ─
    const infoY = 77;
    drawInfoTable(pdf, RIGHT_COL_X, infoY, 'פרטי המשתתף', [
      ['שם מלא',     participant.fullName || ''],
      ['תעודת זהות', reverseString(forceLtrDirection(participant.idnumber || ''))],
      ['טלפון',      reverseString(forceLtrDirection(participant.phone || ''))],
    ]);
    drawInfoTable(pdf, LEFT_COL_X, infoY, 'פרטי הורה/אפוטרופוס', [
      ['שם מלא',     declaration.parentName || ''],
      ['תעודת זהות', reverseString(forceLtrDirection(declaration.parentId || ''))],
    ]);

    // Tables end at: 77 + 6(header) + 3×6(rows) = 101mm  → start sections at 103
    let y = infoY + ROW_H + 3 * ROW_H + 2; // = 103mm

    const isCamp = declaration.productType === 'קייטנה';
    const allSections = isCamp ? [CAMP_TERMS_SECTION, ...TERMS_SECTIONS] : TERMS_SECTIONS;

    // ── Terms sections ──────────────────────────────────────────────────────
    for (let si = 0; si < allSections.length; si++) {
      const { title, items } = allSections[si];
      const isLast = si === allSections.length - 1;

      pdf.setFont('Alef', 'bold');
      pdf.setFontSize(9);
      pdf.text(title, PAGE_W - MARGIN, y + 4, { align: 'right' });
      y += SECTION_TITLE_H;

      const boxH = sectionBoxHeight(pdf, items);
      pdf.setDrawColor(180);
      pdf.setFillColor(252, 252, 252);
      pdf.rect(MARGIN, y, CONTENT_W, boxH, 'FD');

      pdf.setFont('Alef', 'normal');
      pdf.setFontSize(ITEM_FONT_SIZE);
      let itemY = y + BOX_PAD_TOP + ITEM_LINE_H;
      for (const item of items) {
        const lines = pdf.splitTextToSize(`• ${item}`, ITEM_MAX_W) as string[];
        pdf.text(`• ${item}`, PAGE_W - MARGIN - 3, itemY, {
          align: 'right',
          maxWidth: ITEM_MAX_W,
        });
        itemY += lines.length * ITEM_LINE_H;
      }

      y += boxH;
      if (!isLast) y += SECTION_GAP;
    }

    y += 1;

    // ── Confirmation ───────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(9);
    pdf.text('אישור', PAGE_W - MARGIN, y + 4, { align: 'right' });
    y += 5;

    pdf.setFillColor(252, 252, 252);
    pdf.setDrawColor(180);
    pdf.rect(MARGIN, y, CONTENT_W, 9, 'FD');
    pdf.setFont('Alef', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(
      'קראתי את תקנון הפעילות, הבנתי את תוכנו ואני מסכים/ה לכל הכתוב בו.',
      PAGE_W - MARGIN - 3,
      y + 6,
      { align: 'right', maxWidth: CONTENT_W - 6 }
    );
    y += 13;

    // ── Signature ───────────────────────────────────────────────────────────
    pdf.setFont('Alef', 'bold');
    pdf.setFontSize(9);
    pdf.text('חתימה', PAGE_W - MARGIN, y + 4, { align: 'right' });
    y += 4;

    if (declaration.termsSignature) {
      try {
        const sigW = 70;
        const sigH = 16;
        pdf.addImage(
          declaration.termsSignature,
          'PNG',
          PAGE_W / 2 - sigW / 2,
          y,
          sigW,
          sigH
        );
      } catch {
        pdf.setDrawColor(100);
        pdf.line(MARGIN + 20, y + 12, PAGE_W - MARGIN - 20, y + 12);
      }
    } else {
      pdf.setDrawColor(100);
      pdf.line(MARGIN + 20, y + 12, PAGE_W - MARGIN - 20, y + 12);
      pdf.setFontSize(7.5);
      pdf.setTextColor(120);
      pdf.text('חתימת ההורה/אפוטרופוס', PAGE_W / 2, y + 17, { align: 'center' });
      pdf.setTextColor(0);
    }

    const cleanName = participant.fullName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `terms_${cleanName}_${timestamp}.pdf`;
  } catch (error) {
    console.error('Error building terms PDF:', error);
    return `terms_${new Date().toISOString().split('T')[0]}.pdf`;
  }
}
