/**
 * Client-side utilities for sending health declaration links
 * via WhatsApp (wa.me deep link) and Gmail (compose URL).
 *
 * These open the user's WhatsApp / Gmail in a new tab pre-filled
 * with the form link — no backend required.
 */

export function sendHealthDeclarationByWhatsApp(
  participantName: string,
  phone: string,
  healthFormUrl: string
): void {
  // Normalise Israeli phone: remove non-digits, replace leading 0 with 972
  const cleaned = phone.replace(/\D/g, '').replace(/^0/, '972');
  const message = encodeURIComponent(
    `שלום ${participantName},\nאנא מלאו את הצהרת הבריאות לפני תחילת הפעילות:\n${healthFormUrl}`
  );
  window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
}

export function sendHealthDeclarationByEmail(
  participantName: string,
  email: string,
  healthFormUrl: string
): void {
  const subject = encodeURIComponent(`הצהרת בריאות — ${participantName}`);
  const body = encodeURIComponent(
    `שלום ${participantName},\n\nאנא מלאו את הצהרת הבריאות לפני תחילת הפעילות:\n${healthFormUrl}\n\nתודה`
  );
  const to = email ? encodeURIComponent(email) : '';
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1${to ? `&to=${to}` : ''}&su=${subject}&body=${body}`;
  // Use anchor click instead of window.open to avoid popup blockers falling back to mailto:/Outlook
  const a = document.createElement('a');
  a.href = gmailUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function copyHealthDeclarationLink(healthFormUrl: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(healthFormUrl)
    .then(() => true)
    .catch(() => {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement('textarea');
      ta.value = healthFormUrl;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    });
}
