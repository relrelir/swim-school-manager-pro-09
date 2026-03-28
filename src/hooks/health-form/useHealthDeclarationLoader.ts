import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getHealthDeclarationByToken } from '@/services/firebase/healthDeclarations';
import { getParticipant } from '@/services/firebase/participants';

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
        return;
      }

      setHealthDeclarationToken(declaration.token);

      const participant = await getParticipant(declaration.participantId);
      if (!participant) {
        setError('לא נמצאו פרטי משתתף תקינים');
        return;
      }

      setParticipantName(`${participant.firstName} ${participant.lastName}`);
      setParticipantId(participant.idNumber);
      setParticipantPhone(participant.phone);
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
