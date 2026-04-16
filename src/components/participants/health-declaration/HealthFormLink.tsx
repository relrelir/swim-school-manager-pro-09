import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import { useHealthDeclarationsContext } from '@/context/data/HealthDeclarationsProvider';
import { useAuth } from '@/context/AuthContext';
import SendHealthDeclarationDialog, {
  type HealthDeclarationSendInfo,
} from '@/components/participants/SendHealthDeclarationDialog';

interface HealthFormLinkProps {
  participantId: string;
  participantName?: string;
  participantIdNumber?: string;
  participantPhone?: string;
  isDisabled?: boolean;
  className?: string;
}

const HealthFormLink = ({
  participantId,
  participantName = '',
  participantIdNumber = '',
  participantPhone = '',
  isDisabled,
  className,
}: HealthFormLinkProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendInfo, setSendInfo] = useState<HealthDeclarationSendInfo | null>(null);
  const { createHealthDeclarationLink } = useHealthDeclarationsContext();
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        <Send className="h-4 w-4 ml-1" />
        שלח תזכורת
      </Button>
    );
  }

  const handleSendReminder = async () => {
    setIsGenerating(true);
    try {
      // createHealthDeclarationLink resets existing token or creates new one
      const path = await createHealthDeclarationLink(participantId, {
        name: participantName,
        idNumber: participantIdNumber,
        phone: participantPhone,
      });
      if (path) {
        const fullUrl = `${window.location.origin}${path}`;
        setSendInfo({
          participantId,
          participantName,
          phone: participantPhone,
          healthFormUrl: fullUrl,
        });
      } else {
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה ביצירת הקישור',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating health form link:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה ביצירת הקישור',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={handleSendReminder}
        disabled={isGenerating || isDisabled}
      >
        {isGenerating ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent ml-1" />
        ) : (
          <Send className="h-3 w-3 ml-1" />
        )}
        שלח תזכורת
      </Button>

      <SendHealthDeclarationDialog
        info={sendInfo}
        onClose={() => setSendInfo(null)}
      />
    </>
  );
};

export default HealthFormLink;
