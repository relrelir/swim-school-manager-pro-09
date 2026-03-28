
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationWithDetails } from '@/types';
import { formatPriceForUI } from '@/utils/formatters';

interface ReportSummaryCardsProps {
  registrations: RegistrationWithDetails[];
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ registrations }) => {
  // Calculate totals
  const totalRegistrations = registrations.length;
  
  // Calculate total effective amount (after discounts)
  const totalEffectiveAmount = registrations.reduce((sum, reg) => 
    sum + Math.max(0, reg.requiredAmount - (reg.discountApproved ? (reg.discountAmount || 0) : 0)), 0);
  
  // Calculate total paid from payments (or fallback to paidAmount)
  // IMPORTANT: This excludes the discount amounts
  const totalPaidAmount = registrations.reduce((sum, reg) => {
    if (!reg.payments) return sum + reg.paidAmount;
    // Only sum the actual payment amounts, excluding discounts
    return sum + reg.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
  }, 0);
  
  // Balance = amount still owed (positive = debt, zero/negative = fully paid)
  const balance = totalEffectiveAmount - totalPaidAmount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{totalRegistrations}</div>
          <div className="text-sm text-gray-500">סה"כ רישומים</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalEffectiveAmount)}
          </div>
          <div className="text-sm text-gray-500">סה"כ לתשלום (אחרי הנחות)</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">
            {formatPriceForUI(totalPaidAmount)}
          </div>
          <div className="text-sm text-gray-500">סה"כ שולם</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex flex-col items-center">
          <div className={`text-2xl font-bold ${balance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPriceForUI(Math.abs(balance))}
          </div>
          <div className="text-sm text-gray-500">
            {balance <= 0 ? 'שולם במלואו ✓' : 'יתרה לגביה'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSummaryCards;
