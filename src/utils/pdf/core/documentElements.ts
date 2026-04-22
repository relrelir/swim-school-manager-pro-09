
import { jsPDF } from 'jspdf';
import { configureDocumentStyle } from '../pdfConfig';

/**
 * Adds a title to the PDF document
 */
export const addPdfTitle = (pdf: jsPDF, title: string): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(20);

  // Hebrew title should be RTL
  pdf.setR2L(true);
  pdf.text(title, pdf.internal.pageSize.width / 2, 65, { align: 'center' });
  pdf.setR2L(false); // Reset for subsequent operations
};

/**
 * Adds the current date to the PDF document
 */
export const addPdfDate = (pdf: jsPDF, date: string): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(10);

  // Date is always LTR (numbers)
  pdf.setR2L(false);
  pdf.text(date, pdf.internal.pageSize.width - 20, 73, { align: 'right' });
};

/**
 * Adds a section title to the PDF document
 */
export const addSectionTitle = (pdf: jsPDF, title: string, y: number): void => {
  configureDocumentStyle(pdf);
  pdf.setFontSize(14);
  
  // Hebrew section title should be RTL
  pdf.setR2L(true);
  pdf.text(title, pdf.internal.pageSize.width - 20, y, { align: 'right' });
  pdf.setR2L(false); // Reset for subsequent operations
};
