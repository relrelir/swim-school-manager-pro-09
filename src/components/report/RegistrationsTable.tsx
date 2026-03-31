import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle } from 'lucide-react';
import { PaymentStatus, Registration, RegistrationWithDetails } from '@/types';
import { useData } from '@/context/DataContext';
import TableRowActions from '@/components/participants/TableRowActions';
import HealthFormLink from '@/components/participants/health-declaration/HealthFormLink';

interface RegistrationsTableProps {
  registrations: RegistrationWithDetails[];
  onAddPayment: (registration: Registration) => void;
  onDeleteRegistration: (registrationId: string) => void;
}
const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  onAddPayment,
  onDeleteRegistration,
}) => {
  const {
    calculateMeetingProgress
  } = useData();

  // Calculate payment status class
  const getStatusClassName = (status: PaymentStatus): string => {
    switch (status) {
      case 'מלא':
        return 'text-green-800 bg-green-100 bg-opacity-50 px-2 py-1 rounded';
      case 'חלקי':
        return 'text-yellow-800 bg-yellow-100 bg-opacity-50 px-2 py-1 rounded';
      case 'יתר':
        return 'text-red-800 bg-red-100 bg-opacity-50 px-2 py-1 rounded';
      case 'מלא / הנחה':
        return 'text-green-800 bg-green-100 bg-opacity-50 px-2 py-1 rounded';
      case 'חלקי / הנחה':
        return 'text-yellow-800 bg-yellow-100 bg-opacity-50 px-2 py-1 rounded';
      case 'הנחה':
        return 'text-blue-800 bg-blue-100 bg-opacity-50 px-2 py-1 rounded';
      case 'לא שולם':
        return 'text-red-800 bg-red-100 bg-opacity-50 px-2 py-1 rounded';
      default:
        return '';
    }
  };

  return <>
      {registrations.length === 0 ? <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">לא נמצאו רישומים מתאימים לסינון שנבחר.</p>
        </div> : <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>ת.ז</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>עונה</TableHead>
                <TableHead>מוצר</TableHead>
                <TableHead>סוג מוצר</TableHead>
                <TableHead>סכום מקורי</TableHead>
                <TableHead>סכום לתשלום</TableHead>
                <TableHead>סכום ששולם</TableHead>
                <TableHead>הנחה</TableHead>
                <TableHead>מספרי קבלות</TableHead>
                <TableHead>מפגש נוכחי</TableHead>
                <TableHead>סטטוס תשלום</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map(registration => {
            // Get receipt numbers from payments
            const actualPayments = registration.payments ? registration.payments.filter(p => p.receiptNumber !== '') : [];
            const receiptNumbers = actualPayments.map(p => p.receiptNumber).join(', ');
            const actualPaidAmount = registration.paidAmount;
            const discountAmount = registration.discountAmount || 0;
            const effectiveRequiredAmount = registration.effectiveRequiredAmount;

            // Calculate meeting progress
            const meetingProgress = calculateMeetingProgress(registration.product);
            return <TableRow key={registration.id}>
                    <TableCell>{`${registration.participant.firstName} ${registration.participant.lastName}`}</TableCell>
                    <TableCell>{registration.participant.idNumber}</TableCell>
                    <TableCell>{registration.participant.phone}</TableCell>
                    <TableCell>{registration.season.name}</TableCell>
                    <TableCell>{registration.product.name}</TableCell>
                    <TableCell>{registration.product.type}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', {
                  style: 'currency',
                  currency: 'ILS'
                }).format(registration.requiredAmount)}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', {
                  style: 'currency',
                  currency: 'ILS'
                }).format(effectiveRequiredAmount)}</TableCell>
                    <TableCell>{Intl.NumberFormat('he-IL', {
                  style: 'currency',
                  currency: 'ILS'
                }).format(actualPaidAmount)}</TableCell>
                    <TableCell>
                      {discountAmount > 0 && registration.discountApproved ? <span className="font-medium text-[#47474e]">
                          {Intl.NumberFormat('he-IL', {
                    style: 'currency',
                    currency: 'ILS'
                  }).format(discountAmount)}
                        </span> : '-'}
                    </TableCell>
                    <TableCell>{receiptNumbers || '-'}</TableCell>
                    <TableCell>
                      {meetingProgress.current}/{meetingProgress.total}
                    </TableCell>
                    <TableCell className={`font-semibold ${getStatusClassName(registration.paymentStatus)}`}>
                      {registration.paymentStatus}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {registration.participant.healthApproval ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>אישור בריאות התקבל</TooltipContent>
                          </Tooltip>
                        ) : (
                          <HealthFormLink
                            participantId={registration.participant.id}
                            participantName={`${registration.participant.firstName} ${registration.participant.lastName}`}
                            participantPhone={registration.participant.phone}
                          />
                        )}
                        <TableRowActions
                          registration={registration}
                          hasPayments={(registration.payments?.length ?? 0) > 0}
                          payments={registration.payments ?? []}
                          participantName={`${registration.participant.firstName} ${registration.participant.lastName}`}
                          onAddPayment={onAddPayment}
                          onDeleteRegistration={onDeleteRegistration}
                        />
                      </div>
                    </TableCell>
                  </TableRow>;
          })}
            </TableBody>
          </Table>
        </div>}
    </>;
};
export default RegistrationsTable;