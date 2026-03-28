
import React, { useState, useMemo } from 'react';
import { Registration, Participant, Payment, HealthDeclaration, PaymentStatus } from '@/types';
import ParticipantsSummaryCards from '@/components/participants/ParticipantsSummaryCards';
import ParticipantsTable from '@/components/participants/ParticipantsTable';
import EmptyParticipantsState from '@/components/participants/EmptyParticipantsState';

interface ParticipantsContentProps {
  registrations: Registration[];
  totalParticipants: number;
  product: any;
  totalExpected: number;
  totalPaid: number;
  registrationsFilled: number;
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registrationId: string) => Payment[];
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  onEditParticipant: (participant: Participant) => void;
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  registrations,
  totalParticipants,
  product,
  totalExpected,
  totalPaid,
  registrationsFilled,
  getParticipantForRegistration,
  getPaymentsForRegistration,
  getHealthDeclarationForRegistration,
  calculatePaymentStatus,
  getStatusClassName,
  onAddPayment,
  onDeleteRegistration,
  onUpdateHealthApproval,
  onOpenHealthForm,
  onEditParticipant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter registrations based on searchQuery
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    
    return registrations.filter(registration => {
      const participant = getParticipantForRegistration(registration);
      if (!participant) return false;
      
      const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
      const idNumber = participant.idNumber?.toLowerCase() || '';
      const phone = participant.phone?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || idNumber.includes(query) || phone.includes(query);
    });
  }, [registrations, searchQuery, getParticipantForRegistration]);
  
  // Create adapter functions to handle the type conversion
  const getPaymentsAdapter = (registration: Registration) => {
    return getPaymentsForRegistration(registration.id);
  };
  
  // Fixed: The adapter now correctly expects a registrationId string
  const updateHealthApprovalAdapter = (registrationId: string, isApproved: boolean) => {
    onUpdateHealthApproval(registrationId, isApproved);
  };

  return (
    <>
      <ParticipantsSummaryCards 
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
      />

      {registrations.length === 0 ? (
        <EmptyParticipantsState />
      ) : (
        <ParticipantsTable
          registrations={filteredRegistrations}
          getParticipantForRegistration={getParticipantForRegistration}
          getPaymentsForRegistration={getPaymentsAdapter}
          getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
          calculatePaymentStatus={calculatePaymentStatus}
          getStatusClassName={getStatusClassName}
          onAddPayment={onAddPayment}
          onDeleteRegistration={onDeleteRegistration}
          onUpdateHealthApproval={updateHealthApprovalAdapter}
          onOpenHealthForm={onOpenHealthForm}
          onEditParticipant={onEditParticipant}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </>
  );
};

export default ParticipantsContent;
