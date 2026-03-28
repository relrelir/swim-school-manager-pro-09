import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pool } from '@/types';

interface EditPoolDialogProps {
  pool: Pool | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Pool) => void;
}

const EditPoolDialog = ({ pool, isOpen, onOpenChange, onSave }: EditPoolDialogProps) => {
  const [name, setName] = useState('');

  // Pre-populate when pool changes
  useEffect(() => {
    if (pool) setName(pool.name);
  }, [pool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pool || !name.trim()) return;
    onSave({ ...pool, name: name.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>עריכת בריכה</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-pool-name">שם הבריכה *</Label>
            <Input
              id="edit-pool-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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

export default EditPoolDialog;
