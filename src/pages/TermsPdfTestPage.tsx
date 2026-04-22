/**
 * DEV-ONLY page for testing the terms PDF layout.
 * Route: /dev/terms-pdf-test
 * Remove before final release.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createRtlPdf } from '@/utils/pdf/pdfConfig';
import { buildTermsPDF } from '@/utils/pdf/termsContentBuilder';

// A simple 1×1 black pixel as a stand-in signature
const MOCK_SIGNATURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const TermsPdfTestPage: React.FC = () => {
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const pdf = await createRtlPdf();
      const fileName = buildTermsPDF(
        pdf,
        {
          termsSignedDate: new Date().toISOString(),
          termsSignature: MOCK_SIGNATURE,
          parentName: 'ישראל ישראלי',
          parentId: '123456789',
        },
        {
          firstname: 'ילד',
          lastname: 'בדיקה',
          idnumber: '987654321',
          phone: '050-1234567',
          fullName: 'ילד בדיקה',
        }
      );
      setTimeout(() => pdf.save(fileName), 100);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto py-20 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">בדיקת PDF תקנון</h1>
      <Button onClick={generate} disabled={busy} size="lg">
        {busy ? 'מייצר...' : 'הורד PDF תקנון לבדיקה'}
      </Button>
    </div>
  );
};

export default TermsPdfTestPage;
