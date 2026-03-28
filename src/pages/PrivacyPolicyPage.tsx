import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold">מדיניות פרטיות</h1>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">

        <section aria-labelledby="intro-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="intro-heading" className="text-xl font-bold text-gray-900 mb-4">כללי</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            מדיניות פרטיות זו מסבירה כיצד <strong>ענבר במדבר - בית ספר לשחייה</strong> (להלן: "בית הספר")
            אוסף, מאחסן ומשתמש במידע האישי שנמסר לנו.
          </p>
          <p className="text-gray-600 leading-relaxed">
            מדיניות זו מוסדרת בהתאם ל<strong>חוק הגנת הפרטיות, תשמ"א-1981</strong> ותקנותיו.
            שימושך באתר ומסירת פרטיך מהווה הסכמה למדיניות זו.
          </p>
        </section>

        <section aria-labelledby="collected-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="collected-heading" className="text-xl font-bold text-gray-900 mb-4">מידע שנאסף</h2>
          <p className="text-gray-600 mb-3">בעת מילוי טופס ההרשמה אנו אוספים:</p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>שם מלא</li>
            <li>מספר תעודת זהות</li>
            <li>מספר טלפון נייד</li>
            <li>כתובת דואר אלקטרוני</li>
            <li>סוג הפעילות המבוקשת (קורס, חוג, קייטנה)</li>
            <li>הערות נוספות (אופציונלי)</li>
          </ul>
          <p className="text-gray-600 mt-4">
            לאחר ביצוע הרשמה סופית, נאסף גם <strong>מידע בריאותי</strong> (הצהרת בריאות)
            הנחוץ לצורך פיקוח בטיחותי בשיעורי השחייה.
          </p>
        </section>

        <section aria-labelledby="purpose-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="purpose-heading" className="text-xl font-bold text-gray-900 mb-4">מטרת איסוף המידע</h2>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>יצירת קשר חוזר לצורך השלמת הרשמה לשיעורים</li>
            <li>ניהול רישומים, תשלומים ומעקב אחר שוחים</li>
            <li>שמירה על בטיחות — אימות מידע בריאותי</li>
            <li>שליחת עדכונים ומידע שיווקי — <strong>בהסכמה מפורשת בלבד</strong></li>
          </ul>
        </section>

        <section aria-labelledby="transfer-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="transfer-heading" className="text-xl font-bold text-gray-900 mb-4">העברת מידע לצד שלישי</h2>
          <p className="text-gray-600 leading-relaxed">
            המידע האישי שלך <strong>אינו מועבר, נמכר או מושאל לצד שלישי כלשהו</strong>,
            למעט לצורך תפעול תשתית האחסון (Google Firebase / Google Cloud)
            בכפוף למדיניות הפרטיות של Google.
          </p>
        </section>

        <section aria-labelledby="retention-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="retention-heading" className="text-xl font-bold text-gray-900 mb-4">שמירת מידע</h2>
          <p className="text-gray-600 leading-relaxed">
            המידע נשמר כל עוד הקשר עם בית הספר פעיל או כל עוד נדרש לצרכים תפעוליים וחשבונאיים.
            ניתן לבקש מחיקת המידע בכל עת — ראה "זכויותיך" להלן.
          </p>
        </section>

        <section aria-labelledby="security-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="security-heading" className="text-xl font-bold text-gray-900 mb-4">אבטחת מידע</h2>
          <p className="text-gray-600 leading-relaxed">
            המידע מאוחסן בשירות Firebase (Google Cloud) עם הצפנה מלאה בתעבורה (TLS/HTTPS)
            ובאחסון. הגישה למידע מוגבלת לצוות המורשה של בית הספר בלבד
            באמצעות אימות דו-שלבי.
          </p>
        </section>

        <section aria-labelledby="marketing-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="marketing-heading" className="text-xl font-bold text-gray-900 mb-4">הודעות שיווקיות</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            בהתאם ל<strong>חוק התקשורת (בזק ושידורים), תשמ"ב-1982 (תיקון מס׳ 40)</strong>,
            הודעות שיווקיות ישלחו אך ורק למי שהסכימו לכך במפורש בטופס ההרשמה.
          </p>
          <p className="text-gray-600 leading-relaxed">
            לביטול הסכמה לקבלת הודעות שיווקיות ניתן לפנות אלינו בכל עת
            (ראה פרטי יצירת קשר להלן).
          </p>
        </section>

        <section aria-labelledby="rights-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="rights-heading" className="text-xl font-bold text-gray-900 mb-4">זכויותיך</h2>
          <p className="text-gray-600 mb-3">בהתאם לחוק הגנת הפרטיות, יש לך זכות:</p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li><strong>עיון</strong> — לקבל עותק של המידע השמור עליך</li>
            <li><strong>תיקון</strong> — לתקן מידע שגוי או לא מדויק</li>
            <li><strong>מחיקה</strong> — לבקש מחיקת המידע האישי שלך</li>
            <li><strong>ביטול הסכמה לשיווק</strong> — בכל עת, ללא תנאי</li>
          </ul>
          <p className="text-gray-600 mt-4">
            לממש זכויות אלה, פנה/י אלינו דרך פרטי יצירת הקשר המפורטים להלן.
          </p>
        </section>

        <section aria-labelledby="contact-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="contact-heading" className="text-xl font-bold text-gray-900 mb-4">יצירת קשר</h2>
          <p className="text-gray-600 mb-4">
            לכל שאלה, בקשה או תלונה בנושא פרטיות:
          </p>
          <address className="not-italic space-y-2 text-gray-700">
            <p><strong>ענבר במדבר - בית ספר לשחייה</strong></p>
            <p>
              <strong>טלפון: </strong>
              <a href="tel:0546575683" className="text-blue-600 hover:underline">054-6575683</a>
            </p>
            <p>
              <strong>דואר אלקטרוני: </strong>
              <a href="mailto:relrelir@gmail.com" className="text-blue-600 hover:underline">relrelir@gmail.com</a>
            </p>
          </address>
          <p className="text-gray-500 text-sm mt-4">
            אנו מתחייבים לטפל בפניות תוך 14 ימי עסקים.
          </p>
        </section>

        <section aria-labelledby="date-heading" className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 id="date-heading" className="text-xl font-bold text-gray-900 mb-3">תאריך עדכון</h2>
          <p className="text-gray-600">
            מדיניות זו עודכנה לאחרונה ב-<time dateTime="2026-03">מרץ 2026</time>.
          </p>
        </section>

        <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/join"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            חזרה לעמוד ההרשמה
          </Link>
          <Link
            to="/accessibility"
            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-3 rounded-full transition-colors"
          >
            הצהרת נגישות
          </Link>
        </div>

      </main>

      <footer role="contentinfo" className="text-center py-6 text-gray-400 text-sm">
        <p>© 2026 ענבר במדבר - בית ספר לשחייה — כל הזכויות שמורות</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
