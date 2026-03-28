import React from 'react';
import { Link } from 'react-router-dom';

const AccessibilityStatementPage: React.FC = () => {
  return (
    <div
      dir="rtl"
      lang="he"
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <header
        className="text-white py-6 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #021637 0%, #0c4a9e 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span aria-hidden="true" className="text-3xl">🏊</span>
            <span className="text-xl font-extrabold">ענבר במדבר - בית ספר לשחייה</span>
          </div>
          <h1 className="text-2xl font-bold">הצהרת נגישות</h1>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">

        <section aria-labelledby="intro-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="intro-heading" className="text-xl font-bold text-gray-900 mb-4">מחויבות לנגישות</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            <strong>ענבר במדבר - בית ספר לשחייה</strong> מחויבים לנגישות דיגיטלית ולהבטחת שווה-זכויות לכלל המשתמשים,
            לרבות אנשים עם מוגבלויות.
          </p>
          <p className="text-gray-600 leading-relaxed">
            אתר זה עומד בדרישות תקן ישראלי <strong>ת"י 5568</strong> ברמה AA, המבוסס על
            הנחיות WCAG 2.1 ברמה AA.
          </p>
        </section>

        <section aria-labelledby="level-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="level-heading" className="text-xl font-bold text-gray-900 mb-4">רמת הנגישות</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>ניווט מלא במקלדת — ניתן לנווט בכל האתר ללא עכבר</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>תאימות לקוראי מסך (NVDA, JAWS, VoiceOver)</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>ניגודיות צבעים העומדת בדרישת 4.5:1 לפחות</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>טקסט חלופי לתמונות ואייקונים</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>כל הטפסים מכילים תוויות ברורות ומסרי שגיאה נגישים</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>שפת האתר מוגדרת כעברית (lang="he") עם כיוון RTL</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-500 font-bold mt-0.5">✓</span>
              <span>קישור "דלג לתוכן עיקרי" זמין בתחילת כל עמוד ציבורי</span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="contact-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="contact-heading" className="text-xl font-bold text-gray-900 mb-4">יצירת קשר בנושאי נגישות</h2>
          <p className="text-gray-600 mb-4">
            נתקלתם בבעיית נגישות? נשמח לעזור. ניתן ליצור קשר:
          </p>
          <address className="not-italic space-y-2 text-gray-700">
            <p>
              <strong>טלפון: </strong>
              <a href="tel:0546575683" className="text-blue-600 hover:underline">054-6575683</a>
            </p>
            <p>
              <strong>דואר אלקטרוני: </strong>
              <a href="mailto:relrelir@gmail.com" className="text-blue-600 hover:underline">relrelir@gmail.com</a>
            </p>
            <p>
              <strong>וואטסאפ: </strong>
              <a
                href="https://wa.me/972546575683"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                שלחו הודעה
              </a>
            </p>
          </address>
          <p className="text-gray-500 text-sm mt-4">
            אנו מתחייבים לטפל בפניות נגישות תוך 5 ימי עסקים.
          </p>
        </section>

        <section aria-labelledby="date-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="date-heading" className="text-xl font-bold text-gray-900 mb-3">תאריך עדכון ההצהרה</h2>
          <p className="text-gray-600">
            <time dateTime="2026-03">מרץ 2026</time>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            הצהרה זו נסקרת ומעודכנת אחת לשנה.
          </p>
        </section>

        <div className="text-center mt-8">
          <Link
            to="/join"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            חזרה לעמוד ההרשמה
          </Link>
        </div>

      </main>

      <footer role="contentinfo" className="text-center py-6 text-gray-400 text-sm">
        <p>© 2026 ענבר במדבר - בית ספר לשחייה — כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};

export default AccessibilityStatementPage;
