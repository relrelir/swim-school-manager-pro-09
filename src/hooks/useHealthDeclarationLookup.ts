import { useState } from 'react';
import { HealthDeclaration } from '@/types';
import { getHealthDeclarationByParticipant } from '@/services/firebase/healthDeclarations';

export const useHealthDeclarationLookup = (healthDeclarations: HealthDeclaration[]) => {
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const findDeclarationByParticipantId = async (participantId: string): Promise<HealthDeclaration | undefined> => {
    if (!participantId) {
      setLookupError('Participant ID is required');
      return undefined;
    }

    // Check cached state first
    const cached = healthDeclarations.find((hd) => hd.participantId === participantId);
    if (cached) return cached;

    setLookupLoading(true);
    setLookupError(null);
    try {
      const result = await getHealthDeclarationByParticipant(participantId);
      return result ?? undefined;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error looking up health declaration';
      setLookupError(msg);
      return undefined;
    } finally {
      setLookupLoading(false);
    }
  };

  // For backwards compatibility – now simply delegates to participant lookup
  const findDeclarationByRegistrationId = async (_registrationId: string): Promise<HealthDeclaration | undefined> => {
    return undefined;
  };

  return { findDeclarationByRegistrationId, findDeclarationByParticipantId, lookupLoading, lookupError };
};
