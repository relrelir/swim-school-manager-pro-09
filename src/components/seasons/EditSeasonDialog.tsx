import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Season } from '@/types';

interface EditSeasonDialogProps {
  season: Season | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Season) => void;
}

const EditSeasonDialog = ({ season, isOpen, onOpenChange, onSave }: EditSeasonDialogProps) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pre-populate when season changes
  useEffect(() => {
    if (season) {
      setName(season.name);
      setStartDate(season.startDate);
      setEndDate(season.endDate);
    }
  }, [season]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!season || !name.trim()) return;
    onSave({ ...season, name: name.trim(), startDate, endDate });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>עריכת עונה</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-season-name">שם העונה *</Label>
            <Input
              id="edit-season-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-season-start">תאריך התחלה</Label>
            <Input
              id="edit-season-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-season-end">תאריך סיום</Label>
            <Input
              id="edit-season-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

export default EditSeasonDialog;
