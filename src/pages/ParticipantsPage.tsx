
import React, { useState } from 'react';
import { useParticipants } from '@/hooks/useParticipants';
import { useData } from '@/context/DataContext';
import { toast } from "@/components/ui/use-toast";
import { Registration, Participant } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';

import ParticipantsHeader from '@/components/participants/ParticipantsHeader';
import ParticipantsContent from '@/components/participants/ParticipantsContent';
import ParticipantsDialogs from '@/components/participants/ParticipantsDialogs';
import SendHealthDeclarationDialog from '@/components/participants/SendHealthDeclarationDialog';

const ParticipantsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { updateParticipant, getAllRegistrationsWithDetails } = useData();
  const {
    product,
    registrations,
    isAddParticipantOpen,
    setIsAddParticipantOpen,
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    isLinkDialogOpen,
    setIsLinkDialogOpen,
    currentHealthDeclaration,
    setCurrentHealthDeclaration,
    newParticipant,
    setNewParticipant,
    currentRegistration,
    setCurrentRegistration,
    newPayment,
    setNewPayment,
    totalParticipants,
    registrationsFilled,
    totalExpected,
    totalPaid,
    participants,
    handleAddParticipant,
    handleAddPayment,
    handleApplyDiscount,
    handleDeleteRegistration,
    handleUpdateHealthApproval,
    handleOpenHealthForm,
    pendingHealthSend,
    clearPendingHealthSend,
    resetForm,
    getParticipantForRegistration,
    getPaymentsForRegistration,
    getStatusClassName,
    calculatePaymentStatus,
    getHealthDeclarationForRegistration,
  } = useParticipants();

  // Handler for opening add participant dialog
  const handleOpenAddParticipant = () => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה להוסיף משתתפים",
        variant: "destructive",
      });
      return;
    }

    resetForm();
    setIsAddParticipantOpen(true);
  };

  // Handler for opening payment dialog
  const handleOpenAddPayment = (registration: Registration) => {
    setCurrentRegistration(registration);
    setNewPayment({
      amount: 0,
      receiptNumber: '',
      paymentDate: new Date().toISOString().substring(0, 10),
      ...(registration.id ? { registrationId: registration.id } : {})
    });
    setIsAddPaymentOpen(true);
  };

  // Create adapter functions to match ParticipantsContent expected function signatures
  const getPaymentsForRegistrationById = (registrationId: string) => {
    // Find the registration object first
    const registration = registrations.find(r => r.id === registrationId);
    // Only call getPaymentsForRegistration if we found the registration
    if (registration) {
      return getPaymentsForRegistration(registration);
    }
    return [];
  };
  
  const updateHealthApprovalById = (registrationId: string, isApproved: boolean) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לאשר הצהרות בריאות",
        variant: "destructive",
      });
      return;
    }
    
    handleUpdateHealthApproval(registrationId, isApproved);
  };

  // Create an adapter for the handleApplyDiscount function to match the expected signature
  const handleApplyDiscountWrapper = (amount: number, registrationId?: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לאשר הנחות",
        variant: "destructive",
      });
      return;
    }
    
    // handleApplyDiscount already calls setIsAddPaymentOpen(false) on success —
    // do NOT pass setIsAddPaymentOpen as an argument (it would be used as registrationId!)
    handleApplyDiscount(amount, registrationId);
  };

  // CSV export for current product's participants
  const handleExport = () => {
    if (!isAdmin()) return;
    if (!product) return;
    const allWithDetails = getAllRegistrationsWithDetails();
    const productRegs = allWithDetails.filter(r => r.productId === product.id);
    if (productRegs.length === 0) {
      toast({ title: "אין נתונים לייצוא", variant: "destructive" });
      return;
    }
    const filename = `משתתפים-${product.name}-${new Date().toISOString().slice(0, 10)}.csv`;
    exportRegistrationsToCSV(productRegs, filename);
    toast({ title: "הייצוא הושלם", description: `יוצאו ${productRegs.length} רשומות` });
  };

  // Handler for editing a participant
  const handleEditParticipant = (participant: Participant) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה לערוך פרטי משתתפים",
        variant: "destructive",
      });
      return;
    }
    updateParticipant(participant);
  };

  // Enhanced delete registration handler
  const secureDeleteRegistration = (registrationId: string) => {
    if (!isAdmin()) {
      toast({
        title: "אין הרשאה",
        description: "אין לך הרשאה למחוק רישומים",
        variant: "destructive",
      });
      return;
    }
    
    handleDeleteRegistration(registrationId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ParticipantsHeader 
        product={product}
        onExport={handleExport}
        onAddParticipant={handleOpenAddParticipant}
      />

      {/* Main Content */}
      <ParticipantsContent
        registrations={registrations}
        totalParticipants={totalParticipants}
        product={product}
        totalExpected={totalExpected}
        totalPaid={totalPaid}
        registrationsFilled={registrationsFilled}
        getParticipantForRegistration={getParticipantForRegistration}
        getPaymentsForRegistration={getPaymentsForRegistrationById}
        getHealthDeclarationForRegistration={getHealthDeclarationForRegistration}
        calculatePaymentStatus={calculatePaymentStatus}
        getStatusClassName={getStatusClassName}
        onAddPayment={handleOpenAddPayment}
        onDeleteRegistration={secureDeleteRegistration}
        onUpdateHealthApproval={updateHealthApprovalById}
        onOpenHealthForm={handleOpenHealthForm}
        onEditParticipant={handleEditParticipant}
      />

      {/* Auto-send health declaration dialog — opens after new registration */}
      <SendHealthDeclarationDialog
        info={pendingHealthSend}
        onClose={clearPendingHealthSend}
      />

      {/* Dialogs */}
      <ParticipantsDialogs
        isAddParticipantOpen={isAddParticipantOpen}
        setIsAddParticipantOpen={setIsAddParticipantOpen}
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        isHealthFormOpen={isLinkDialogOpen}
        setIsHealthFormOpen={setIsLinkDialogOpen}
        newParticipant={newParticipant}
        setNewParticipant={setNewParticipant}
        currentRegistration={currentRegistration}
        participants={participants}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        currentHealthDeclaration={currentHealthDeclaration}
        setCurrentHealthDeclaration={setCurrentHealthDeclaration}
        handleAddParticipant={handleAddParticipant}
        handleAddPayment={handleAddPayment}
        handleApplyDiscount={handleApplyDiscountWrapper}
      />
    </div>
  );
};

export default ParticipantsPage;
