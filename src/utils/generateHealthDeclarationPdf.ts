
import { supabase } from '@/integrations/supabase/client';
import { createRtlPdf } from './pdf/pdfConfig';
import { buildHealthDeclarationPDF } from './pdf/healthDeclarationContentBuilder';
import { toast } from "@/components/ui/use-toast";

// Define an interface for the health declaration data
interface HealthDeclarationData {
  id: string;
  participant_id: string;
  submission_date: string | null;
  notes: string | null;
  form_status: string;
  signature: string | null;
  parent_name?: string | null;
  parent_id?: string | null;
}

export const generateHealthDeclarationPdf = async (participantId: string) => {
  try {
    console.log("Starting health declaration PDF generation for participant ID:", participantId);
    
    if (!participantId) {
      console.error("Participant ID is missing or invalid");
      throw new Error('מזהה המשתתף חסר או לא תקין');
    }
    
    // 1. Get the participant details using the participantId
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('firstname, lastname, idnumber, phone')
      .eq('id', participantId)
      .maybeSingle();
    
    if (participantError || !participant) {
      console.error("Participant details not found:", participantError);
      throw new Error('פרטי המשתתף לא נמצאו');
    }

    if (!participant.firstname || !participant.lastname) {
      throw new Error("חסר שם פרטי או שם משפחה למשתתף");
    }

    const fullName = `${participant.firstname} ${participant.lastname}`.trim();
    
    console.log("Participant data fetched successfully:", participant);
    
    // 2. Get health declaration data (if exists)
    let { data: healthDeclaration, error: healthDeclarationError } = await supabase
      .from('health_declarations')
      .select('id, participant_id, submission_date, notes, form_status, signature, parent_name, parent_id')
      .eq('participant_id', participantId)
      .maybeSingle();
    
    // Try to extract parent info from notes if not explicitly available
    let parentName = null;
    let parentId = null;
    
    // If no health declaration exists, create a default object for PDF generation
    const defaultDeclaration: HealthDeclarationData = {
      id: 'טיוטה',
      participant_id: participantId,
      submission_date: new Date().toISOString(),
      notes: null,
      form_status: 'pending',
      signature: null,
      parent_name: null,
      parent_id: null
    };
    
    const declarationData: HealthDeclarationData = healthDeclaration || defaultDeclaration;
    
    // Extract parent info from notes if not in dedicated fields
    if (declarationData.notes && (!declarationData.parent_name || !declarationData.parent_id)) {
      const notesText = declarationData.notes;
      
      // Look for parent name in the notes
      const parentNameMatch = notesText.match(/שם הורה:?\s*([^,\n]+)/i);
      if (parentNameMatch && parentNameMatch[1]) {
        parentName = parentNameMatch[1].trim();
      }
      
      // Look for parent ID in the notes
      const parentIdMatch = notesText.match(/ת\.ז\.\s*הורה:?\s*([^,\n]+)/i);
      if (parentIdMatch && parentIdMatch[1]) {
        parentId = parentIdMatch[1].trim();
      }
      
      // Merge with declaration data if found
      if (parentName) declarationData.parent_name = parentName;
      if (parentId) declarationData.parent_id = parentId;
    }
    
    if (healthDeclarationError && healthDeclarationError.code !== 'PGRST116') {
      // Log only if it's not the "no rows returned" error
      console.error("Error fetching health declaration:", healthDeclarationError);
    } else if (healthDeclaration) {
      console.log("Found health declaration:", declarationData.id);
    } else {
      console.log("No health declaration found, using default object");
    }
    
    try {
      // Create the PDF document with RTL and font support
      console.log("Creating PDF with RTL support");
      const pdf = await createRtlPdf();
      console.log("PDF object created successfully");
      
      // Build the PDF content with improved layout
      console.log("Building PDF content");
      const fileName = buildHealthDeclarationPDF(pdf, declarationData, {
        ...participant,
        fullName,
      });

      console.log("PDF content built successfully, filename:", fileName);
      
      // Save the PDF - add timeout to ensure rendering is complete
      setTimeout(() => {
        pdf.save(fileName);
        console.log("PDF saved successfully");
      }, 100);
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הצהרת הבריאות נשמרה במכשיר שלך",
      });
      
      return fileName;
    } catch (error) {
      console.error('Error during PDF generation:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת PDF",
        description: "אירעה תקלה בעת יצירת המסמך. נא לנסות שוב",
      });
      throw new Error('אירעה שגיאה ביצירת מסמך ה-PDF');
    }
  } catch (error) {
    console.error('Error in generateHealthDeclarationPdf:', error);
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : 'אירעה שגיאה ביצירת ה-PDF',
      variant: "destructive",
    });
    throw error;
  }
};
