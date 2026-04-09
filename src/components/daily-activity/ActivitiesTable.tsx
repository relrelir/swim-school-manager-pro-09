
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { calculateMeetingNumberForDate } from '@/utils/meetingCalculations';

interface ActivityParticipant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  email?: string;
  healthApproval: boolean;
}

interface Activity {
  product: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    meetingsCount?: number;
    daysOfWeek?: string[];
  };
  startTime?: string;
  numParticipants: number;
  participants?: ActivityParticipant[];
}

interface ActivitiesTableProps {
  activities: Activity[];
  selectedDate: Date;
}

const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  activities,
  selectedDate,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-500">אין פעילויות ביום זה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-8"></TableHead>
            <TableHead className="text-right">שם הפעילות</TableHead>
            <TableHead className="text-right">שעת התחלה</TableHead>
            <TableHead className="text-right">מפגש מספר</TableHead>
            <TableHead className="text-right">מספר משתתפים</TableHead>
            <TableHead className="text-right">סוג</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity, idx) => {
            const meetingInfo = calculateMeetingNumberForDate(activity.product, selectedDate);
            const isExpanded = expandedRows.has(idx);
            const participants = activity.participants ?? [];

            return (
              <React.Fragment key={idx}>
                <TableRow
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRow(idx)}
                >
                  <TableCell className="text-right py-2">
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-gray-500" />
                      : <ChevronLeft className="h-4 w-4 text-gray-500" />}
                  </TableCell>
                  <TableCell className="font-medium text-right">{activity.product.name}</TableCell>
                  <TableCell className="text-right">{activity.startTime || 'לא מוגדר'}</TableCell>
                  <TableCell className="text-right">
                    {`${meetingInfo.current} מתוך ${meetingInfo.total}`}
                  </TableCell>
                  <TableCell className="text-right">{activity.numParticipants}</TableCell>
                  <TableCell className="text-right">{activity.product.type}</TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={6} className="p-0">
                      {participants.length === 0 ? (
                        <p className="text-sm text-gray-500 text-right p-4">אין משתתפים רשומים</p>
                      ) : (
                        <div className="px-6 py-3">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200">
                                <TableHead className="text-right text-xs py-2">#</TableHead>
                                <TableHead className="text-right text-xs py-2">שם מלא</TableHead>
                                <TableHead className="text-right text-xs py-2">ת.ז</TableHead>
                                <TableHead className="text-right text-xs py-2">טלפון</TableHead>
                                <TableHead className="text-right text-xs py-2">מייל</TableHead>
                                <TableHead className="text-right text-xs py-2">אישור בריאות</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {participants.map((p, pIdx) => (
                                <TableRow key={p.id} className="border-b border-gray-100 last:border-0">
                                  <TableCell className="text-right text-sm py-1.5 text-gray-500">{pIdx + 1}</TableCell>
                                  <TableCell className="text-right text-sm py-1.5 font-medium">{p.firstName} {p.lastName}</TableCell>
                                  <TableCell className="text-right text-sm py-1.5">{p.idNumber || '—'}</TableCell>
                                  <TableCell className="text-right text-sm py-1.5">{p.phone || '—'}</TableCell>
                                  <TableCell className="text-right text-sm py-1.5">{p.email || '—'}</TableCell>
                                  <TableCell className="text-right text-sm py-1.5">
                                    {p.healthApproval
                                      ? <span className="text-green-600 font-medium">✓ אושר</span>
                                      : <span className="text-red-500">לא</span>}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivitiesTable;
