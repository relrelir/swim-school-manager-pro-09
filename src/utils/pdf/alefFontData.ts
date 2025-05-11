
import { jsPDF } from 'jspdf';

// Function to configure jsPDF for Hebrew text support with Alef font
export const configureHebrewFont = async (pdf: jsPDF): Promise<void> => {
  try {
    console.log("Configuring PDF for Hebrew text support with Alef font");
    
    // Set global RTL mode for Hebrew text
    pdf.setR2L(true);
    
    // Load TTF fonts directly from public directory
    const fontBaseUrl = '/fonts/'; // This points to the public/fonts directory
    
    try {
      // Register Alef Regular font
      console.log("Adding Alef Regular font from", `${fontBaseUrl}Alef-Regular.ttf`);
      await pdf.addFont(`${fontBaseUrl}Alef-Regular.ttf`, 'Alef', 'normal');
      console.log("Alef Regular font added successfully");
      
      // Register Alef Bold font
      console.log("Adding Alef Bold font from", `${fontBaseUrl}Alef-Bold.ttf`);
      await pdf.addFont(`${fontBaseUrl}Alef-Bold.ttf`, 'Alef', 'bold');
      console.log("Alef Bold font added successfully");
      
      // Use Alef font that properly supports Hebrew characters
      pdf.setFont('Alef');
      console.log("Font set to Alef");
    } catch (fontError) {
      console.error("Error loading Alef font files:", fontError);
      throw new Error(`Failed to load Alef font: ${fontError instanceof Error ? fontError.message : 'Unknown error'}`);
    }
    
    // Add PDF metadata with Hebrew titles
    pdf.setProperties({
      title: 'הצהרת בריאות',
      subject: 'הצהרת בריאות',
      creator: 'מערכת ניהול'
    });
    
    // Set font size for better readability with Hebrew text
    pdf.setFontSize(14);
    
    // Set text color to ensure better contrast
    pdf.setTextColor(0, 0, 0);
    
    console.log("Hebrew font configuration completed successfully");
  } catch (error) {
    console.error("Error configuring Alef font:", error);
    // Fallback to basic configuration with standard font
    pdf.setR2L(true); // Keep RTL enabled for Hebrew text
    pdf.setFont('helvetica');
    console.warn("Falling back to helvetica font due to error");
    
    throw new Error(`Failed to configure Hebrew font: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
