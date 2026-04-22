import { jsPDF } from 'jspdf';

export const CONTENT_START_Y = 60; // mm — below logo area at top of letterhead

export async function addPageBackground(pdf: jsPDF): Promise<void> {
  try {
    const response = await fetch('/pdf-background.png');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    pdf.addImage(`data:image/png;base64,${base64}`, 'PNG', 0, 0, 210, 297);
    console.log('Background image added to PDF');
  } catch (error) {
    console.warn('Failed to add background image to PDF:', error);
  }
}
