import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Participant, PaymentStatus, Registration, RegistrationWithDetails, Payment, HealthDeclaration } from '@/types';
import TableHealthStatus from './TableHealthStatus';
import TablePaymentInfo from './TablePaymentInfo';
import TableReceiptNumbers from './TableReceiptNumbers';
import TableRowActions from './TableRowActions';
import ParticipantsTableHeader from './ParticipantsTableHeader';
import EditParticipantDialog from './EditParticipantDialog';
import { formatCurrencyForTableUI } from '@/utils/formatters';

interface ParticipantsTableProps {
  registrations: RegistrationWithDetails[];
  getParticipantForRegistration: (registration: Registration) => Participant | undefined;
  getPaymentsForRegistration: (registration: Registration) => Payment[];
  getHealthDeclarationForRegistration: (registrationId: string) => Promise<HealthDeclaration | undefined>;
  calculatePaymentStatus: (registration: Registration) => PaymentStatus;
  getStatusClassName: (status: string) => string;
  onAddPayment: (registration: RegistrationWithDetails) => void;
  onDeleteRegistration: (id: string) => void;
  onUpdateHealthApproval: (registrationId: string, isApproved: boolean) => void;
  onOpenHealthForm: (registrationId: string) => void;
  onEditParticipant: (participant: Participant) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  registrations,
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
  searchQuery,
  setSearchQuery
}) => {
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  return (
    <div className="space-y-4">
      <ParticipantsTableHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם מלא</TableHead>
            <TableHead>ת.ז</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>סכום מקורי</TableHead>
            <TableHead>סכום לתשלום</TableHead>
            <TableHead>תשלומים</TableHead>
            <TableHead>מספרי קבלות</TableHead>
            <TableHead>הנחה</TableHead>
            <TableHead>הצהרת בריאות</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const participant = getParticipantForRegistration(registration);
            const registrationPayments = getPaymentsForRegistration(registration);
            const discountAmount = registration.discountAmount || 0;
            // effectiveRequiredAmount is pre-computed by getAllRegistrationsWithDetails
            const effectiveRequiredAmount = registration.effectiveRequiredAmount;
            // paymentStatus is pre-computed; no need to call calculatePaymentStatus again
            const status = registration.paymentStatus;
            const hasPayments = registrationPayments.length > 0;
            
            if (!participant) return null;
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
                <TableCell>{participant.idNumber}</TableCell>
                <TableCell>{participant.phone}</TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(registration.requiredAmount)}
                </TableCell>
                <TableCell>
                  {formatCurrencyForTableUI(effectiveRequiredAmount)}
                </TableCell>
                <TableCell>
                  <TablePaymentInfo 
                    payments={registrationPayments} 
                    discountAmount={discountAmount}
                    discountApproved={registration.discountApproved}
                  />
                </TableCell>
                <TableCell>
                  <TableReceiptNumbers payments={registrationPayments} />
                </TableCell>
                <TableCell>
                  {registration.discountApproved && discountAmount > 0 ? 
                    formatCurrencyForTableUI(discountAmount) : 
                    'לא'}
                </TableCell>
                <TableCell>
                  <TableHealthStatus 
                    registration={registration}
                    participant={participant}
                    onUpdateHealthApproval={(isApproved) => onUpdateHealthApproval(registration.id, isApproved)}
                    onOpenHealthForm={() => onOpenHealthForm(registration.id)}
                  />
                </TableCell>
                <TableCell className={`font-semibold ${getStatusClassName(status)}`}>
                  {status}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="ערוך פרטי משתתף"
                      onClick={() => setEditingParticipant(participant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <TableRowActions
                      registration={registration}
                      hasPayments={hasPayments}
                      payments={registrationPayments}
                      participantName={`${participant.firstName} ${participant.lastName}`}
                      onAddPayment={onAddPayment}
                      onDeleteRegistration={onDeleteRegistration}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit Participant Dialog */}
      <EditParticipantDialog
        participant={editingParticipant}
        isOpen={!!editingParticipant}
        onOpenChange={(open) => { if (!open) setEditingParticipant(null); }}
        onSave={(updated) => { onEditParticipant(updated); setEditingParticipant(null); }}
      />
    </div>
  );
};

export default ParticipantsTable;
