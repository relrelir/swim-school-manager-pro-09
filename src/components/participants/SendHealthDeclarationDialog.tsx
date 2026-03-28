import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MessageCircle, Mail, Copy, CheckCircle } from 'lucide-react';
import {
  sendHealthDeclarationByWhatsApp,
  sendHealthDeclarationByEmail,
  copyHealthDeclarationLink,
} from '@/services/notifications/sendHealthDeclaration';

export interface HealthDeclarationSendInfo {
  participantId: string;
  participantName: string;
  phone: string;
  healthFormUrl: string;
}

interface SendHealthDeclarationDialogProps {
  info: HealthDeclarationSendInfo | null;
  onClose: () => void;
}

const SendHealthDeclarationDialog = ({
  info,
  onClose,
}: SendHealthDeclarationDialogProps) => {
  const [copied, setCopied] = useState(false);

  if (!info) return null;

  const handleWhatsApp = () => {
    sendHealthDeclarationByWhatsApp(info.participantName, info.phone, info.healthFormUrl);
    toast({ title: 'נפתח WhatsApp', description: 'שלחו את ההודעה המוכנה לחתימה על הצהרת הבריאות' });
  };

  const handleEmail = () => {
    if (!info.healthFormUrl) return;
    sendHealthDeclarationByEmail(info.participantName, '', info.healthFormUrl);
    toast({ title: 'נפתח לקוח מייל', description: 'שלחו את המייל המוכן לחתימה על הצהרת הבריאות' });
  };

  const handleCopy = async () => {
    const ok = await copyHealthDeclarationLink(info.healthFormUrl);
    if (ok) {
      setCopied(true);
      toast({ title: 'הקישור הועתק', description: 'הדביקו ושלחו ללקוח' });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Dialog open={!!info} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>שליחת הצהרת בריאות</DialogTitle>
          <DialogDescription>
            רישום <strong>{info.participantName}</strong> נוצר בהצלחה.
            שלחו את הקישור לחתימה על הצהרת הבריאות:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* WhatsApp */}
          <Button
            className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            שלח ב-WhatsApp ({info.phone})
          </Button>

          {/* Email */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleEmail}
          >
            <Mail className="h-4 w-4" />
            שלח במייל
          </Button>

          {/* Copy link */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <><CheckCircle className="h-4 w-4 text-green-500" /> הקישור הועתק!</>
            ) : (
              <><Copy className="h-4 w-4" /> העתק קישור</>
            )}
          </Button>

          {/* URL preview */}
          <p className="text-xs text-muted-foreground break-all text-center border rounded p-2 bg-muted/30">
            {info.healthFormUrl}
          </p>

          {/* Skip */}
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            דלג — אשלח מאוחר יותר
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendHealthDeclarationDialog;
