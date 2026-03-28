
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Registration } from '@/types';
import { exportRegistrationsToCSV } from '@/utils/exportUtils';
import { ReportFilters } from '@/utils/reportFilters';
import ReportSummaryCards from '@/components/report/ReportSummaryCards';
import RegistrationsTable from '@/components/report/RegistrationsTable';
import ReportFiltersComponent from '@/components/report/ReportFilters';
import { filterRegistrations } from '@/utils/reportFilters';
import AddPaymentDialog from '@/components/participants/AddPaymentDialog';
import { FileDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ReportPage: React.FC = () => {
  const {
    seasons, products, pools, participants,
    getAllRegistrationsWithDetails,
    addPayment, updateRegistration, deleteRegistration,
  } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    receiptNumber: '',
    seasonId: 'all',
    productId: 'all',
    paymentStatus: 'all',
    poolId: 'all', // Add pool filter
  });
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog state
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    receiptNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  
  const allRegistrations = getAllRegistrationsWithDetails();
  const filteredRegistrations = filterRegistrations(allRegistrations, filters);

  // Payment handlers
  const handleOpenAddPayment = (registration: Registration) => {
    setCurrentRegistration(registration);
    setNewPayment({ amount: 0, receiptNumber: '', paymentDate: new Date().toISOString().split('T')[0] });
    setIsAddPaymentOpen(true);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRegistration) return;
    await addPayment({ ...newPayment, registrationId: currentRegistration.id });
    await updateRegistration({ ...currentRegistration, paidAmount: currentRegistration.paidAmount + newPayment.amount });
    setIsAddPaymentOpen(false);
    toast({ title: 'תשלום נוסף בהצלחה' });
  };

  const handleApplyDiscount = async (amount: number, registrationId?: string) => {
    const regId = registrationId ?? currentRegistration?.id;
    if (!regId) return;
    const reg = allRegistrations.find(r => r.id === regId);
    if (!reg) return;
    await updateRegistration({ ...reg, discountApproved: true, discountAmount: amount });
    setIsAddPaymentOpen(false);
    toast({ title: 'הנחה אושרה בהצלחה' });
  };

  const handleDeleteRegistration = (id: string) => deleteRegistration(id);

  // Handle exporting to CSV
  const handleExport = () => {
    if (filteredRegistrations.length === 0) {
      toast({
        title: "אין נתונים לייצוא",
        description: "לא נמצאו רשומות התואמות את הפילטרים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportRegistrationsToCSV(
        filteredRegistrations,
        `דוח-רישומים-${new Date().toISOString().slice(0, 10)}.csv`
      );
      
      toast({
        title: "הייצוא הושלם בהצלחה",
        description: `יוצאו ${filteredRegistrations.length} רשומות לקובץ CSV`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בעת ייצוא הנתונים",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold font-alef">דו"ח מאוחד - כל הרישומים</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? 'הסתר פילטרים' : 'הצג פילטרים'}</span>
          </Button>
          
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>ייצוא לאקסל (CSV)</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/40 p-4 rounded-lg border animate-scale-in">
          <ReportFiltersComponent 
            filters={filters} 
            setFilters={setFilters} 
            seasons={seasons} 
            products={products}
            pools={pools} 
          />
        </div>
      )}

      <ReportSummaryCards registrations={filteredRegistrations} />
      
      <div className="bg-white rounded-lg shadow-card">
        <RegistrationsTable
          registrations={filteredRegistrations}
          onAddPayment={handleOpenAddPayment}
          onDeleteRegistration={handleDeleteRegistration}
        />
      </div>

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
    </div>
  );
};

export default ReportPage;
