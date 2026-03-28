import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types';

const STATUS_STYLE: Record<LeadStatus, string> = {
  'חדש':          'bg-blue-100 text-blue-800 border-blue-200',
  'מטופל':        'bg-yellow-100 text-yellow-800 border-yellow-200',
  'רשום':         'bg-green-100 text-green-800 border-green-200',
  'לא מעוניין':   'bg-red-100 text-red-800 border-red-200',
  'ביצירת קשר':   'bg-purple-100 text-purple-800 border-purple-200',
  'ישן':          'bg-gray-100 text-gray-500 border-gray-200',
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLE[status]}>
      {status}
    </Badge>
  );
}
