
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Participant, Registration, HealthDeclaration } from '@/types';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';
import { useAuth } from '@/context/AuthContext';
import HealthFormLink from './health-declaration/HealthFormLink';

interface TableHealthStatusProps {
  registration: Registration;
  participant?: Participant;
  onUpdateHealthApproval: (isApproved: boolean) => void;
  onOpenHealthForm?: () => void;
  productType?: string;
  productName?: string;
}

const TableHealthStatus: React.FC<TableHealthStatusProps> = ({
  registration,
  participant,
  onUpdateHealthApproval,
  productType,
  productName,
}) => {
  const [healthDeclaration, setHealthDeclaration] = useState<HealthDeclaration | undefined>(undefined);
  const { getHealthDeclarationForRegistration } = useHealthDeclarationsContext();
  const { isAdmin } = useAuth();

  const participantId = useMemo(() => registration?.participantId, [registration?.participantId]);

  const fetchHealthDeclaration = useCallback(async () => {
    if (!participantId) return;
    try {
      const declaration = await getHealthDeclarationForRegistration(participantId);
      if (declaration?.id !== healthDeclaration?.id) {
        setHealthDeclaration(declaration);
      }
    } catch (error) {
      console.error('Error fetching health declaration:', error);
    }
  }, [participantId, getHealthDeclarationForRegistration, healthDeclaration?.id]);

  useEffect(() => {
    fetchHealthDeclaration();
  }, [fetchHealthDeclaration]);

  if (!participant) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {participant.healthApproval ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent>אישור בריאות התקבל</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent>אישור בריאות חסר</TooltipContent>
        </Tooltip>
      )}

      {/* Send reminder button — only shown when health approval is still pending */}
      {!participant.healthApproval && (
        <HealthFormLink
          participantId={participantId}
          participantName={`${participant.firstName} ${participant.lastName}`}
          participantIdNumber={participant.idNumber}
          participantPhone={participant.phone}
          isDisabled={!isAdmin()}
          productType={productType}
          productName={productName}
          registration={registration}
        />
      )}
    </div>
  );
};

export default TableHealthStatus;
