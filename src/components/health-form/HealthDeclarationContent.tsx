
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface HealthDeclarationContentProps {
  participantName: string;
  participantId?: string;
  participantPhone?: string;
  formState: {
    agreement: boolean;
    notes: string;
    parentName: string;
    parentId: string;
  };
  handleAgreementChange: (checked: boolean) => void;
  handleNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleParentNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParentIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideNotes?: boolean; // Added optional property for hiding notes input
}

const HealthDeclarationContent: React.FC<HealthDeclarationContentProps> = ({
  participantName,
  participantId,
  participantPhone,
  formState,
  handleAgreementChange,
  handleNotesChange,
  handleParentNameChange,
  handleParentIdChange,
  hideNotes = false // Default to showing notes
}) => {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Participant Information */}
      <div className="space-y-2 rounded-md border p-4">
        <h3 className="font-medium">פרטי המשתתף:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">שם מלא:</span> {participantName}</div>
          {participantId && <div><span className="font-semibold">ת.ז.:</span> {participantId}</div>}
          {participantPhone && <div><span className="font-semibold">טלפון:</span> {participantPhone}</div>}
        </div>
      </div>

      {/* Parent Information */}
      <div className="space-y-3">
        <h3 className="font-medium">פרטי המצהיר:</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parentName">שם מלא </Label>
            <Input 
              id="parentName" 
              placeholder="ישראל ישראלי"
              value={formState.parentName}
              onChange={handleParentNameChange}
              required
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">ת.ז.</Label>
            <Input 
              id="parentId" 
              placeholder="מספר תעודת זהות"
              value={formState.parentId}
              onChange={handleParentIdChange}
              required
              dir="rtl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2 space-y-0">
          <Label 
            htmlFor="health-declaration" 
            className="flex-grow text-base font-medium"
          >
            אני מצהיר/ה בזאת כי:
          </Label>
        </div>
        
        <div className="text-sm space-y-2 rounded-md border p-4">
          <p>• אני מצהיר/ה כי בני/בתי בריא/ה ובכושר ובמצב בריאותי תקין המאפשר השתתפות בפעילות.</p>
          <p>• לא ידוע לי על מגבלות רפואיות המונעות להשתתף בפעילות.</p>
          <p>• לא ידוע לי על רגישויות, מחלות או בעיות רפואיות אחרות שעלולות להשפיע על ההשתתפות בפעילות.</p>
          <p>• במידה ויש מגבלה רפואית, יש לציין אותה בהערות למעלה ולצרף אישור רפואי המאשר השתתפות.</p>
          <p>• אני מתחייב/ת לעדכן את המדריכים על כל שינוי במצב הבריאותי.</p>
          <p>• אני מאשר/ת לצוות הרפואי לתת טיפול ראשוני במקרה הצורך.</p>
          <p>• ידוע לי שללא הצהרת בריאות חתומה לא יוכל בני/בתי להשתתף בפעילות.</p>
        </div>
        
        <div className="flex items-center space-x-2 space-y-0 pt-2">
          <Checkbox 
            id="health-agreement" 
            checked={formState.agreement}
            onCheckedChange={checked => handleAgreementChange(checked === true)}
            required
          />
          <Label 
            htmlFor="health-agreement" 
            className="mr-2 text-sm"
          >
            אני מאשר/ת את הצהרת הבריאות
          </Label>
        </div>
      </div>
      
      {/* Only show notes field if hideNotes is false */}
      {!hideNotes && (
        <div className="space-y-2">
          <Label htmlFor="notes">הערות רפואיות (אופציונלי)</Label>
          <Textarea 
            id="notes" 
            placeholder="אם יש מידע רפואי נוסף שעלינו לדעת, אנא ציין כאן"
            value={formState.notes}
            onChange={handleNotesChange}
            dir="rtl"
          />
        </div>
      )}
    </div>
  );
};

export default HealthDeclarationContent;
