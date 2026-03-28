import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Participant } from '@/types';

interface EditParticipantDialogProps {
  participant: Participant | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Participant) => void;
}

const EditParticipantDialog = ({
  participant,
  isOpen,
  onOpenChange,
  onSave,
}: EditParticipantDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-populate when participant changes
  useEffect(() => {
    if (participant) {
      setFirstName(participant.firstName);
      setLastName(participant.lastName);
      setIdNumber(participant.idNumber);
      setPhone(participant.phone);
    }
  }, [participant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant || !firstName.trim() || !lastName.trim()) return;
    onSave({
      ...participant,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      idNumber: idNumber.trim(),
      phone: phone.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>עריכת פרטי משתתף</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-first-name">שם פרטי *</Label>
              <Input
                id="edit-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-last-name">שם משפחה *</Label>
              <Input
                id="edit-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-id-number">תעודת זהות</Label>
            <Input
              id="edit-id-number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-phone">טלפון</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit">שמור שינויים</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditParticipantDialog;
