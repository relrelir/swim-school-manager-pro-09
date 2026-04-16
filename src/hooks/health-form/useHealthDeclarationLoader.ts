import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getHealthDeclarationByToken } from '@/services/firebase/healthDeclarations';

export const useHealthDeclarationLoader = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const token = params.token || searchParams.get('token') || '';

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [healthDeclarationToken, setHealthDeclarationToken] = useState<string | null>(null);

  const loadHealthDeclaration = useCallback(async () => {
    if (!token) {
      setError('מזהה הצהרת בריאות חסר בקישור');
      setIsLoadingData(false);
      return;
    }

    try {
      const declaration = await getHealthDeclarationByToken(token);
      if (!declaration) {
        setError('הצהרת בריאות לא נמצאה או שפג תוקפה');
        setIsLoadingData(false);
        return;
      }

      setHealthDeclarationToken(declaration.token);
      // Use cached participant data stored in the declaration when the link was created.
      // This avoids querying /participants which requires authentication.
      setParticipantName(declaration.participantName ?? '');
      setParticipantId(declaration.participantIdNumber ?? '');
      setParticipantPhone(declaration.participantPhone ?? '');
    } catch (err) {
      console.error('Error loading health declaration:', err);
      setError('אירעה שגיאה בטעינת הצהרת הבריאות');
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => { loadHealthDeclaration(); }, [loadHealthDeclaration]);

  return { isLoadingData, participantName, participantId, participantPhone, error, healthDeclarationId: healthDeclarationToken };
};
