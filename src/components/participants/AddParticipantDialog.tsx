
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Participant } from '@/types';

interface AddParticipantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newParticipant: Omit<Participant, 'id'>;
  setNewParticipant: React.Dispatch<React.SetStateAction<Omit<Participant, 'id'>>>;
  onSubmit: (e: React.FormEvent) => void;
}

const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  isOpen,
  onOpenChange,
  newParticipant,
  setNewParticipant,
  onSubmit
}) => {
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>הוסף משתתף חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">שם פרטי</Label>
                <Input id="first-name" value={newParticipant.firstName} onChange={e => setNewParticipant({
                ...newParticipant,
                firstName: e.target.value
              })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">שם משפחה</Label>
                <Input id="last-name" value={newParticipant.lastName} onChange={e => setNewParticipant({
                ...newParticipant,
                lastName: e.target.value
              })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id-number">תעודת זהות</Label>
                <Input id="id-number" value={newParticipant.idNumber} onChange={e => setNewParticipant({
                ...newParticipant,
                idNumber: e.target.value
              })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" value={newParticipant.phone} onChange={e => setNewParticipant({
                ...newParticipant,
                phone: e.target.value
              })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={newParticipant.email ?? ''}
                onChange={e => setNewParticipant({ ...newParticipant, email: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit">רשום משתתף</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
};

export default AddParticipantDialog;
