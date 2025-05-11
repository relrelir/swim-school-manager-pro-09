
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '../utils';
import type { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Submit a completed health form
 */
export const submitHealthFormService = async (
  declarationId: string, 
  agreement: boolean, 
  notes: string | undefined,
  signature?: string,
  parentName?: string,
  parentId?: string
) => {

  try {
    if (!agreement) {
      throw new Error('Must agree to health declaration');
    }
    
    // Create an updates object with only the fields that exist in the database
    const updates: {
      form_status: string;
      submission_date: string;
      signature: string | null;
      parent_name: string | null;
      notes: string | null;
    } = {
      form_status: 'signed',
      submission_date: new Date().toISOString(),
      signature: signature || null,
      parent_name: parentName || null,
      notes: null
    };

    // Combine parentId info and notes if available
    let combinedNotes = notes || '';
    if (parentId) {
      combinedNotes = `Parent ID: ${parentId}${combinedNotes ? '\n\n' + combinedNotes : ''}`;
    }
    updates.notes = combinedNotes || null;
    
    console.log('Submitting health form for declaration:', declarationId, 'with data:', updates);
    
    // Breaking down the query chain and using explicit typing
    const response: PostgrestResponse<any> = await supabase
      .from('health_declarations')
      .update(updates)
      .eq('id', declarationId)
      .select('participant_id');
    
    const { data, error } = response;

    if (error) {
      console.error('Supabase error during health form submission:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to retrieve registration data after form submission');
    }
    
    // Get the participant_id to update their health approval status
    const participantId = data[0].participant_id;
    
    // Update the participant's health approval status
    const participantResponse = await supabase
      .from('participants')
      .update({ healthapproval: true })
      .eq('id', participantId);
      
    if (participantResponse.error) {
      console.error('Error updating participant health approval:', participantResponse.error);
      throw participantResponse.error;
    }
    
    console.log('Successfully updated health approval for participant:', participantId);
    
    // Return the participant_id for further processing
    return participantId;
  } catch (error) {
    console.error('Error submitting health form:', error);
    throw error;
  }
};
