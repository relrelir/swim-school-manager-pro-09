
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { HealthDeclaration } from '@/types';
import HealthFormLink from './health-declaration/HealthFormLink';

interface HealthDeclarationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  participantName: string;
  defaultPhone: string;
  healthDeclaration?: HealthDeclaration;
  afterSubmit?: () => void;
}

const HealthDeclarationForm: React.FC<HealthDeclarationFormProps> = ({
  isOpen,
  onOpenChange,
  participantId,
  participantName,
  healthDeclaration,
}) => {
  const isFormSigned = Boolean(
    healthDeclaration &&
    healthDeclaration.formStatus === 'signed'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הצהרת בריאות</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            {isFormSigned
              ? `הצהרת הבריאות עבור ${participantName} כבר חתומה`
              : `יצירת טופס הצהרת בריאות עבור ${participantName}`
            }
          </p>

          {isFormSigned ? (
            <p className="text-sm text-green-600 font-medium">
              הצהרת הבריאות מולאה ונחתמה בהצלחה. תוכל להדפיס אותה דרך הטבלה.
            </p>
          ) : (
            <p className="text-sm mb-4">
              לחץ על הכפתור להלן כדי ליצור קישור ייחודי להצהרת בריאות. הקישור יועתק ללוח.
            </p>
          )}
        </div>

        <DialogFooter>
          {!isFormSigned && (
            <HealthFormLink
              participantId={participantId}
              participantName={participantName}
              participantPhone={defaultPhone}
              isDisabled={false}
              className="w-full"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HealthDeclarationForm;
