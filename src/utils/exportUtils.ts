
import { RegistrationWithDetails, PaymentDetails } from '@/types';

// Function to convert data to CSV with UTF-8 BOM support for Hebrew
export const convertToCSV = (data: any[], columns: { key: string, header: string }[]) => {
  // Add UTF-8 BOM for proper Hebrew support
  const bom = '\uFEFF';
  
  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(col => {
      // Handle nested properties
      const path = col.key.split('.');
      let value = item;
      for (const key of path) {
        if (value === null || value === undefined) return '';
        value = value[key];
      }
      
      // Format value (handle strings with commas)
      if (typeof value === 'string') {
        // Always wrap in quotes for consistent Hebrew display
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== undefined && value !== null ? `"${value}"` : '""';
    }).join(',');
  }).join('\n');
  
  // Combine BOM, header and data
  return `${bom}${headerRow}\n${dataRows}`;
};

// Function to create and download a CSV file
export const downloadCSV = (data: any[], columns: { key: string, header: string }[], filename: string) => {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to export all registrations to CSV
export const exportRegistrationsToCSV = (registrations: RegistrationWithDetails[], filename: string = 'registrations.csv') => {
  // Process registration data to combine payment information and include meeting progress
  const processedRegistrations = registrations.map(reg => {
    // If reg.payments exists, process them
    const payments = reg.payments || [];
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const receiptNumbers = payments.map(payment => payment.receiptNumber).join(', ');
    
    // Calculate meeting progress for this registration's product
    const meetingCurrent = reg.product.meetingsCount ? Math.min(
      Math.ceil((new Date().getTime() - new Date(reg.product.startDate).getTime()) / (24 * 60 * 60 * 1000) / 7) + 1,
      reg.product.meetingsCount
    ) : 0;
    
    const meetingTotal = reg.product.meetingsCount || 0;
    
    // Format the meeting progress in Hebrew format
    const meetingProgress = `${meetingCurrent} מתוך ${meetingTotal}`;
    
    // effectiveRequiredAmount is always pre-computed by getAllRegistrationsWithDetails
    const effectiveRequiredAmount = reg.effectiveRequiredAmount;

    return {
      ...reg,
      paidAmount: totalPaid,
      effectiveRequiredAmount,
      receiptNumbers: receiptNumbers,
      meetingProgress: meetingProgress,
      discountAmount: reg.discountApproved ? (reg.discountAmount || 0) : 0
    };
  });
  
  const columns = [
    { key: 'participant.firstName', header: 'שם פרטי' },
    { key: 'participant.lastName', header: 'שם משפחה' },
    { key: 'participant.idNumber', header: 'תעודת זהות' },
    { key: 'participant.phone', header: 'טלפון' },
    { key: 'season.name', header: 'עונה' },
    { key: 'product.name', header: 'מוצר' },
    { key: 'product.type', header: 'סוג מוצר' },
    { key: 'meetingProgress', header: 'מפגשים' },
    { key: 'requiredAmount', header: 'סכום מקורי' },
    { key: 'effectiveRequiredAmount', header: 'סכום לתשלום' },
    { key: 'paidAmount', header: 'סכום ששולם' },
    { key: 'discountAmount', header: 'סכום הנחה' },
    { key: 'receiptNumbers', header: 'מספרי קבלות' },
    { key: 'paymentStatus', header: 'סטטוס תשלום' },
    { key: 'discountApproved', header: 'הנחה אושרה' },
  ];
  
  downloadCSV(processedRegistrations, columns, filename);
};

// Function to export daily activities to CSV
export const exportDailyActivitiesToCSV = (activities: any[], filename: string = 'daily-activities.csv') => {
  // Process activities to include the correct day of week and meeting number info
  const processedActivities = activities.map(activity => {
    // The meeting info is already calculated in the UI
    const currentMeeting = activity.currentMeeting || '';
    const totalMeetings = activity.totalMeetings || '';
    
    // Format meeting number in Hebrew format "X מתוך Y"
    const meetingNumberText = `${currentMeeting} מתוך ${totalMeetings}`;
    
    return {
      ...activity,
      meetingNumber: meetingNumberText
    };
  });

  const columns = [
    { key: 'product.name', header: 'שם פעילות' },
    { key: 'product.type', header: 'סוג פעילות' },
    { key: 'startTime', header: 'שעת התחלה' },
    { key: 'formattedDayOfWeek', header: 'יום בשבוע' }, 
    { key: 'meetingNumber', header: 'מפגש מספר' }, 
    { key: 'numParticipants', header: 'מספר משתתפים' },
  ];
  
  downloadCSV(processedActivities, columns, filename);
};
