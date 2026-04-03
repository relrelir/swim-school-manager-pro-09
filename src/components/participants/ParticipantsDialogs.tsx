
import React from 'react';
import { Participant, RegistrationWithDetails, HealthDeclaration } from '@/types';
import AddParticipantDialog from '@/components/participants/AddParticipantDialog';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';
import HealthDeclarationForm from '@/components/participants/HealthDeclarationForm';

interface ParticipantsDialogsProps {
  isAddParticipantOpen: boolean;
  setIsAddParticipantOpen: (open: boolean) => void;
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  isHealthFormOpen: boolean;
  setIsHealthFormOpen: (open: boolean) => void;
  newParticipant: Omit<Participant, 'id'>;
  setNewParticipant: React.Dispatch<React.SetStateAction<Omit<Participant, 'id'>>>;
  currentRegistration: RegistrationWithDetails | null;
  participants: Participant[];
  newPayment: {
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  };
  setNewPayment: React.Dispatch<React.SetStateAction<{
    amount: number;
    receiptNumber: string;
    paymentDate: string;
    registrationId?: string;
  }>>;
  currentHealthDeclaration: {
    participantId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null;
  setCurrentHealthDeclaration: React.Dispatch<React.SetStateAction<{
    participantId: string;
    participantName: string;
    phone: string;
    declaration?: HealthDeclaration;
  } | null>>;
  handleAddParticipant: (e: React.FormEvent) => void;
  handleAddPayment: (e: React.FormEvent) => void;
  handleApplyDiscount: (amount: number, registrationId?: string) => void;
}

const ParticipantsDialogs: React.FC<ParticipantsDialogsProps> = ({
  isAddParticipantOpen,
  setIsAddParticipantOpen,
  isAddPaymentOpen,
  setIsAddPaymentOpen,
  isHealthFormOpen,
  setIsHealthFormOpen,
  newParticipant,
  setNewParticipant,
  currentRegistration,
  participants,
  newPayment,
  setNewPayment,
  currentHealthDeclaration,
  setCurrentHealthDeclaration,
  handleAddParticipant,
  handleAddPayment,
  handleApplyDiscount,
}) => {
  return (
    <>
      {/* Add Participant Dialog */}
      <AddParticipantDialog
        isOpen={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        onSubmit={handleAddParticipant}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        isOpen={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        onSubmit={handleAddPayment}
        onApplyDiscount={handleApplyDiscount}
      />

      {/* Health Declaration Form */}
      {currentHealthDeclaration && (
        <HealthDeclarationForm
          isOpen={isHealthFormOpen}
          onOpenChange={setIsHealthFormOpen}
          participantId={currentHealthDeclaration.participantId}
          participantName={currentHealthDeclaration.participantName}
          defaultPhone={currentHealthDeclaration.phone}
          healthDeclaration={currentHealthDeclaration.declaration}
          afterSubmit={() => {}}
        />
      )}
    </>
  );
};

export default ParticipantsDialogs;
