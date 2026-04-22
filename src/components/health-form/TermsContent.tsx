import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsContentProps {
  termsAgreement: boolean;
  onTermsAgreementChange: (checked: boolean) => void;
  productType?: string | null;
  afterCare?: boolean;
  onAfterCareChange?: (checked: boolean) => void;
}

const TERMS_SECTIONS = [
  {
    title: '1. הרשמה ופתיחת קבוצות',
    items: [
      'פתיחת קבוצת לימוד מותנית במספר מינימלי של משתתפים, בהתאם לשיקול דעתה של הנהלת בית הספר לשחייה.',
      'המחיר עבור הפעילות הינו המחיר הנקוב בטופס אישור הרישום שנשלח ללקוח.',
    ],
  },
  {
    title: '2. נוכחות, היעדרויות ולוחות זמנים',
    items: [
      'מועדי השיעורים ולוחות הזמנים נקבעים מראש. הלו"ז כפוף לאילוצי הבריכה וייתכנו שינויים במידת הצורך; הודעה על שינויים תימסר מראש.',
      'לא יינתן החזר כספי או שיעור השלמה בגין מפגשים שהוחסרו על ידי הלקוח (מכל סיבה שהיא) או בגין איחור של המשתתף לשיעור.',
    ],
  },
  {
    title: '3. ליווי, השגחה ואחריות הורים',
    items: [
      'אחריות המדריך חלה על המשתתף אך ורק בזמן שהותו במים במהלך השיעור.',
      'האחריות המלאה על הילד/ה מחוץ למים (לפני, במהלך לצורך יציאה לשירותים, ובסיום השיעור) חלה על ההורה המלווה בלבד.',
      'עבור ילדים מתחת לגיל 6: חובה על הורה מלווה להיות נוכח בבריכה בתחילת השיעור ובסיומו.',
      'על הורי המשתתפים להיות נוכחים במתחם לאורך כל זמן השיעור.',
      'כניסת מלווה למים בזמן השיעור (למי שאינו מנוי בבריכה) כרוכה בתשלום נפרד בקופת הבריכה.',
    ],
  },
  {
    title: '4. ציוד ולבוש',
    items: [
      'חובה להגיע עם ציוד אישי: כובע שחייה ומשקפת. אטמי אוזניים במידת הצורך.',
      'זמן השהייה בבריכה מוגבל ל-10 דקות לפני תחילת השיעור ועד 10 דקות לאחר סיומו.',
      'בזמן "שחיית משפחות": חובה ללבוש חולצה ומכנסיים בתוך המים ומחוצה להם.',
      'יש להישמע להוראות המציל ולתקנון הכללי של הבריכה.',
    ],
  },
  {
    title: '5. מדיניות ביטולים',
    items: [
      'בקשת ביטול תוגש בכתב בלבד להנהלת בית הספר לשחייה.',
      'ביטול לאחר ההרשמה: כל ביטול שיתבצע לאחר אישור הרישום יחויב בדמי ביטול בסך 10% מעלות החוג/הפעילות.',
      'ביטול סמוך למועד הפתיחה: החל מ-36 שעות לפני מועד פתיחת הפעילות (השיעור הראשון), לא ניתן יהיה לבטל את הרישום ולא יינתן החזר כספי.',
      'בקשות לביטול עקב מקרים חריגים ייבחנו לגופם ובהתאם לשיקול דעתה הבלעדי של הנהלת בית הספר לשחייה.',
    ],
  },
];

const CAMP_SECTION = {
  title: 'מועדי הקייטנה ושעות פעילות',
  items: [
    'הקייטנה מתקיימת בימים א\'–ה\' בשעות 07:45–13:30.',
    'צהרון (בתשלום נפרד): 13:30–16:00, ברישום מראש. תיאום ותשלום הצהרון מתבצעים ישירות מול מפעיל הצהרון ואינם מתקיימים בשטח הבריכה.',
  ],
};

const TermsContent: React.FC<TermsContentProps> = ({
  termsAgreement,
  onTermsAgreementChange,
  productType,
  afterCare,
  onAfterCareChange,
}) => {
  const isCamp = productType === 'קייטנה';

  return (
    <div className="space-y-4" dir="rtl">
      <div
        className="border rounded-lg p-4 max-h-72 overflow-y-auto bg-gray-50 space-y-4 text-sm"
        dir="rtl"
      >
        {isCamp && (
          <div className="border-r-4 border-blue-400 pr-3 bg-blue-50 rounded-sm py-2">
            <p className="font-semibold mb-1">{CAMP_SECTION.title}</p>
            <ul className="space-y-1 list-none">
              {CAMP_SECTION.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-right">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {TERMS_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="font-semibold mb-1">{section.title}</p>
            <ul className="space-y-1 list-none">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-right">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {isCamp && onAfterCareChange && (
        <div className="flex items-start gap-3 pt-1 border rounded-lg p-3 bg-blue-50">
          <Checkbox
            id="after-care"
            checked={afterCare ?? false}
            onCheckedChange={(checked) => onAfterCareChange(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="after-care" className="text-sm leading-snug cursor-pointer">
            הרישום כולל <strong>צהרון</strong> (13:30–16:00) — התשלום וההסדר מול מפעיל הצהרון בנפרד
          </Label>
        </div>
      )}

      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="terms-agreement"
          checked={termsAgreement}
          onCheckedChange={(checked) => onTermsAgreementChange(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="terms-agreement" className="text-sm leading-snug cursor-pointer">
          קראתי את תקנון הפעילות, הבנתי את תוכנו ואני מסכים/ה לכל הכתוב בו
        </Label>
      </div>
    </div>
  );
};

export default TermsContent;
