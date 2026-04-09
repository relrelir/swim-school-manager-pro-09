import React, { useState, useRef } from 'react';
import { Check, Award, Shield, Users, Zap } from 'lucide-react';
import { createLead } from '@/services/firebase/leads';
import { validateIsraeliId, validateIsraeliPhone, validateEmail } from '@/utils/validation';
import type { ProductType } from '@/types';

/* ─────────────── types ─────────────── */
interface FormData {
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  requestedProductType: string;
  notes: string;
  marketingConsent: boolean;
}
type FormErrors = Partial<Record<keyof FormData, string>>;
const EMPTY: FormData = { name: '', idNumber: '', phone: '', email: '', requestedProductType: '', notes: '', marketingConsent: false };

/* ─────────────── helpers ─────────────── */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

/* ─────────────── constants ─────────────── */
const PRODUCT_TYPES: ProductType[] = ['קורס', 'חוג', 'קייטנה'];
const SCHOOL_NAME = 'ענבר במדבר - בית ספר לשחייה';


/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
const LeadRegistrationPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'שדה חובה';
    if (!form.idNumber.trim()) e.idNumber = 'שדה חובה';
    else if (!validateIsraeliId(form.idNumber)) e.idNumber = 'מספר ת.ז. אינו תקין';
    if (!form.phone.trim()) e.phone = 'שדה חובה';
    else if (!validateIsraeliPhone(form.phone)) e.phone = 'מספר טלפון אינו תקין';
    if (!form.email.trim()) e.email = 'שדה חובה';
    else if (!validateEmail(form.email)) e.email = 'כתובת אימייל אינה תקינה';
    if (!form.marketingConsent) e.marketingConsent = 'יש לאשר קבלת עדכונים להמשך';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await withTimeout(createLead({
        name: form.name.trim(),
        idNumber: form.idNumber.replace(/\D/g, '').padStart(9, '0'),
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: 'חדש',
        requestedProductType: (form.requestedProductType as ProductType) || null,
        notes: form.notes.trim() || null,
        marketingConsent: form.marketingConsent,
        convertedToParticipantId: null,
      }), 12000);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message === 'timeout'
        ? 'הבקשה לקחה יותר מדי זמן. אנא בדוק את החיבור לאינטרנט ונסה שנית.'
        : 'אירעה שגיאה בשליחת הטופס. אנא נסה שנית.';
      setSubmitError(msg);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ── Success screen ── */
  if (submitted) {
    return (
      <main
        dir="rtl"
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #1e3a5f 100%)' }}
      >
        {/* bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute rounded-full bg-white/10 animate-ping"
            style={{
              width: `${30 + i * 15}px`,
              height: `${30 + i * 15}px`,
              top: `${10 + i * 10}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
        <div className="relative z-10 text-center px-6 max-w-lg">
          <div aria-hidden="true" className="mx-auto mb-6 w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/50 shadow-2xl">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <div role="status" aria-live="polite">
            <h1 className="text-4xl font-extrabold text-white mb-3">הפרטים התקבלו!</h1>
            <p className="text-xl text-blue-100 mb-2">תודה על פנייתך.</p>
            <p className="text-blue-200 text-lg">אחד מנציגינו יצור איתך קשר בהקדם האפשרי.</p>
          </div>
          <div className="mt-8 inline-block bg-white/10 backdrop-blur border border-white/30 rounded-2xl px-8 py-4 text-white text-lg font-semibold">
            {SCHOOL_NAME} 🏊
          </div>
        </div>
      </main>
    );
  }

  /* ══════════════════════════════════════ */
  return (
    <div dir="rtl" className="overflow-x-hidden font-sans">

      {/* ══ SKIP LINK ══ */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] focus:bg-white focus:text-blue-900 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        דלג לתוכן עיקרי
      </a>

      {/* ══ GLOBAL STYLES injected ══ */}
      <style>{`
        @keyframes wave { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-30px)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes swimmer { 0%{left:0} 100%{left:calc(100% - 32px)} }
        .wave-anim { animation: wave 8s ease-in-out infinite; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .ripple-ring {
          position:absolute; inset:-8px; border-radius:9999px;
          border:2px solid rgba(96,165,250,0.5);
          animation: ripple 2.5s ease-out infinite;
        }
        .swimmer-btn { position:relative; overflow:hidden; }
        .swimmer-btn .swimmer-icon {
          position:absolute; top:50%; transform:translateY(-50%);
          left:0; font-size:20px;
          animation: swimmer 2s linear infinite;
        }
        .glass { backdrop-filter:blur(12px); background:rgba(255,255,255,0.12); }
        .glass-dark { backdrop-filter:blur(16px); background:rgba(0,20,60,0.55); }
        input:focus, select:focus, textarea:focus { outline:none; box-shadow:0 0 0 2px #38bdf8; }
      `}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav
        aria-label="ניווט עמוד הרשמה"
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(2,22,55,0.85)', backdropFilter: 'blur(14px)' }}
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-2xl">🏊</span>
          <span className="text-white font-extrabold text-lg tracking-tight">{SCHOOL_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/972509455250"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="צור קשר בוואטסאפ"
            className="text-green-400 hover:text-green-300 font-semibold text-sm transition-colors hidden sm:inline-flex items-center gap-1"
          >
            📞 צור קשר
          </a>
          <button
            onClick={scrollToForm}
            aria-label="עבור לטופס הרשמה"
            className="bg-gradient-to-r from-orange-300 to-pink-400 hover:from-orange-400 hover:to-pink-500 text-gray-900 font-bold px-5 py-2 rounded-full text-sm shadow-lg transition-all hover:scale-105"
          >
            הצטרפו אלינו
          </button>
        </div>
      </nav>

      <main id="main-content">

        {/* ══════════ HERO ══════════ */}
        <section
          aria-labelledby="hero-heading"
          className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #021637 0%, #0c4a9e 45%, #0ea5e9 80%, #38bdf8 100%)',
          }}
        >
          {/* Decorative wave layers */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/10"
                style={{
                  width: `${300 + i * 200}px`,
                  height: `${300 + i * 200}px`,
                  top: `${40 - i * 5}%`,
                  left: `${50 - (300 + i * 200) / 2}px`,
                  opacity: 0.15 - i * 0.02,
                }}
              />
            ))}
            {/* Bubbles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: `${8 + (i % 4) * 6}px`,
                  height: `${8 + (i % 4) * 6}px`,
                  bottom: `${5 + (i * 7) % 80}%`,
                  left: `${(i * 8) % 95}%`,
                  animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Wave SVG at bottom */}
          <div aria-hidden="true" className="absolute bottom-0 inset-x-0">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-24 wave-anim">
              <path d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,100 L0,100 Z" fill="white" fillOpacity="0.08"/>
              <path d="M0,80 C400,40 800,100 1200,60 C1320,48 1400,70 1440,80 L1440,100 L0,100 Z" fill="white" fillOpacity="0.06"/>
            </svg>
          </div>

          <div className="relative z-10 px-6 max-w-4xl mx-auto pt-24 pb-32">
            <div className="inline-block bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              ✨ עונת 2026 — מקומות אחרונים!
            </div>
            <h1
              id="hero-heading"
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.4)', letterSpacing: '-1px' }}
            >
              לשחות כמו דגים במים
              <br />
              <span className="text-cyan-300">עם ענבר במדבר!</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              בית הספר המוביל לשחייה מזמין אתכם להצטרף אלינו.
            </p>
            <button
              onClick={scrollToForm}
              aria-label="עבור לטופס הרשמה"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-300 to-pink-400 hover:from-orange-400 hover:to-pink-500 text-gray-900 font-extrabold text-xl px-10 py-5 rounded-full shadow-2xl transition-all hover:scale-105"
              style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.4)' }}
            >
              <span>הצטרפו אלינו!</span>
              <span aria-hidden="true" className="text-2xl">🌊</span>
            </button>
            <p className="mt-4 text-blue-300 text-sm">ללא עלות — נחזור אליכם בהקדם</p>
          </div>
        </section>

        {/* ══════════ WHY US ══════════ */}
        <section aria-labelledby="why-us-heading" className="py-24 bg-white" dir="rtl">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="why-us-heading" className="text-4xl font-extrabold text-gray-900 mb-3">למה לבחור בנו?</h2>
              <p className="text-lg text-gray-500">מקצועיות, בטיחות וכיף — תחת קורת גג אחת</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Award aria-hidden="true" className="w-8 h-8" />,
                  color: 'from-cyan-400 to-teal-500',
                  bg: 'bg-cyan-50',
                  title: 'מדריכים מוסמכים',
                  desc: 'צוות מקצועי עם ניסיון רב בהוראת שחייה',
                },
                {
                  icon: <Users aria-hidden="true" className="w-8 h-8" />,
                  color: 'from-blue-400 to-cyan-500',
                  bg: 'bg-blue-50',
                  title: 'קבוצות קטנות',
                  desc: 'יחס אישי ומותאם לכל תלמיד',
                },
                {
                  icon: <Shield aria-hidden="true" className="w-8 h-8" />,
                  color: 'from-purple-400 to-indigo-500',
                  bg: 'bg-purple-50',
                  title: 'לכל הגילאים',
                  desc: 'קורסים מותאמים לילדים, נוער ומבוגרים',
                },
                {
                  icon: <Zap aria-hidden="true" className="w-8 h-8" />,
                  color: 'from-green-400 to-teal-500',
                  bg: 'bg-green-50',
                  title: 'אווירה נעימה',
                  desc: 'סביבת לימוד תומכת ומהנה',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`relative ${card.bg} rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group cursor-default`}
                >
                  {/* Ripple */}
                  <div className="relative inline-flex mb-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                      {card.icon}
                    </div>
                    <div aria-hidden="true" className="ripple-ring opacity-0 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════ REGISTRATION FORM ══════════ */}
        <section
          ref={formRef}
          aria-labelledby="form-heading"
          className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 40%, #0ea5e9 100%)' }}
          dir="rtl"
          id="register"
        >
          {/* wave top */}
          <div aria-hidden="true" className="absolute top-0 inset-x-0 pointer-events-none">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-16">
              <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,0 L0,0 Z" fill="#f9fafb"/>
            </svg>
          </div>

          {/* Bubbles */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${20 + (i % 5) * 20}px`,
                height: `${20 + (i % 5) * 20}px`,
                bottom: `${(i * 11) % 80}%`,
                left: `${(i * 9) % 95}%`,
                animation: `float ${3 + i % 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}

          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 id="form-heading" className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                הצטרפו אלינו!
              </h2>
              <p className="text-blue-100 text-lg">מלאו את הפרטים הבאים כדי להירשם לשיעורי שחייה</p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="טופס הרשמה לבית הספר לשחייה"
              className="glass-dark rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl"
            >
              {/* Row: name + id */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="field-name" className="block text-white text-sm font-semibold mb-1.5">
                    שם מלא <span className="text-cyan-300" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="ישראל ישראלי"
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    className={`w-full bg-white/10 border ${errors.name ? 'border-red-400' : 'border-white/30'} rounded-xl px-4 py-3 text-white placeholder-blue-200 transition-colors`}
                  />
                  {errors.name && <p id="error-name" role="alert" className="text-red-300 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="field-id" className="block text-white text-sm font-semibold mb-1.5">
                    תעודת זהות <span className="text-cyan-300" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-id"
                    type="text"
                    value={form.idNumber}
                    onChange={set('idNumber')}
                    placeholder="000000000"
                    maxLength={9}
                    inputMode="numeric"
                    dir="ltr"
                    aria-required="true"
                    aria-invalid={!!errors.idNumber}
                    aria-describedby={errors.idNumber ? 'error-id' : undefined}
                    className={`w-full bg-white/10 border ${errors.idNumber ? 'border-red-400' : 'border-white/30'} rounded-xl px-4 py-3 text-white placeholder-blue-200 text-right transition-colors`}
                  />
                  {errors.idNumber && <p id="error-id" role="alert" className="text-red-300 text-xs mt-1">{errors.idNumber}</p>}
                </div>
              </div>

              {/* Row: phone + email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="field-phone" className="block text-white text-sm font-semibold mb-1.5">
                    טלפון נייד <span className="text-cyan-300" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="050-0000000"
                    dir="ltr"
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'error-phone' : undefined}
                    className={`w-full bg-white/10 border ${errors.phone ? 'border-red-400' : 'border-white/30'} rounded-xl px-4 py-3 text-white placeholder-blue-200 text-right transition-colors`}
                  />
                  {errors.phone && <p id="error-phone" role="alert" className="text-red-300 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="field-email" className="block text-white text-sm font-semibold mb-1.5">
                    אימייל <span className="text-cyan-300" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="name@example.com"
                    dir="ltr"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    className={`w-full bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/30'} rounded-xl px-4 py-3 text-white placeholder-blue-200 text-right transition-colors`}
                  />
                  {errors.email && <p id="error-email" role="alert" className="text-red-300 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Activity type */}
              <div className="mb-4">
                <label htmlFor="field-type" className="block text-white text-sm font-semibold mb-1.5">סוג פעילות מבוקשת</label>
                <select
                  id="field-type"
                  value={form.requestedProductType}
                  onChange={set('requestedProductType')}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white transition-colors appearance-none"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="" style={{ background: '#0c4a9e' }}>— בחרו סוג (אופציונלי) —</option>
                  {PRODUCT_TYPES.map(t => (
                    <option key={t} value={t} style={{ background: '#0c4a9e' }}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="field-notes" className="block text-white text-sm font-semibold mb-1.5">הערות נוספות</label>
                <textarea
                  id="field-notes"
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="גיל, רמת שחייה, בקשות מיוחדות..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-blue-200 resize-none transition-colors"
                />
              </div>

              {/* Marketing consent */}
              <div className="mb-5">
                <div className="flex items-start gap-3">
                  <input
                    id="field-marketing"
                    type="checkbox"
                    checked={form.marketingConsent}
                    onChange={e => {
                      setForm(prev => ({ ...prev, marketingConsent: e.target.checked }));
                      setErrors(prev => ({ ...prev, marketingConsent: undefined }));
                      setSubmitError(null);
                    }}
                    className="mt-1 w-4 h-4 rounded cursor-pointer flex-shrink-0 accent-cyan-400"
                  />
                  <label htmlFor="field-marketing" className="text-blue-200 text-sm leading-relaxed cursor-pointer">
                    אני מסכים/ה לקבל עדכונים, מבצעים ומידע על תוכניות השחייה מ-ענבר במדבר
                    <span className="text-red-400 mr-1">*</span>
                  </label>
                </div>
                {errors.marketingConsent && (
                  <p className="text-red-400 text-xs mt-1 mr-7">{errors.marketingConsent}</p>
                )}
              </div>

              {/* Submit error banner */}
              {submitError && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-400 text-red-200 text-sm text-center">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="swimmer-btn w-full bg-gradient-to-r from-orange-300 to-pink-400 hover:from-orange-400 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-gray-900 font-extrabold text-xl py-4 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] disabled:cursor-not-allowed"
                style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg aria-hidden="true" className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    שולח...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>שלחו את הטופס</span>
                    <span aria-hidden="true" className="text-xl">🏊</span>
                  </span>
                )}
              </button>

              <p className="text-blue-200 text-xs text-center mt-4">
                שדות המסומנים ב-<span className="text-cyan-300 font-bold" aria-hidden="true">*</span>
                <span className="sr-only">כוכבית</span> הינם חובה.{' '}
                פרטיך מאובטחים ולא יועברו לצד שלישי.{' '}
                <a href="/privacy-policy" className="underline hover:text-white transition-colors">
                  מדיניות הפרטיות שלנו
                </a>
              </p>
            </form>
          </div>
        </section>

      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer
        role="contentinfo"
        className="pt-0 pb-8 text-center relative"
        style={{ background: '#021637' }}
        dir="rtl"
      >
        {/* Wave top */}
        <div aria-hidden="true" className="mb-8">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,10 1440,30 L1440,60 L0,60 Z"
              style={{ fill: '#0369a1' }}/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span aria-hidden="true" className="text-3xl">🏊</span>
            <span className="text-white font-extrabold text-xl">{SCHOOL_NAME}</span>
          </div>
          <p className="text-blue-400 text-sm mb-4">מצוינות בשחייה — לכל גיל ורמה</p>

          {/* Contact info */}
          <address className="not-italic text-blue-300 text-sm mb-6 space-y-1">
            <p>
              <a href="tel:0509455250" className="hover:text-white transition-colors">
                ☎ 050-9455250
              </a>
            </p>
            <p>
              <a href="mailto:reutva88@gmail.com" className="hover:text-white transition-colors">
                ✉ reutva88@gmail.com
              </a>
            </p>
          </address>

          <div className="flex items-center justify-center gap-6 mb-6">
            <button aria-label="עמוד הפייסבוק שלנו" className="text-blue-400 hover:text-white text-sm transition-colors">📘 פייסבוק</button>
            <button aria-label="עמוד האינסטגרם שלנו" className="text-blue-400 hover:text-white text-sm transition-colors">📸 אינסטגרם</button>
            <button aria-label="ערוץ היוטיוב שלנו" className="text-blue-400 hover:text-white text-sm transition-colors">▶️ יוטיוב</button>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-blue-600 text-xs">© 2026 {SCHOOL_NAME} — כל הזכויות שמורות</p>
            <a href="/accessibility" className="text-blue-400 hover:text-white text-xs transition-colors underline">
              הצהרת נגישות
            </a>
            <a href="/privacy-policy" className="text-blue-400 hover:text-white text-xs transition-colors underline">
              מדיניות פרטיות
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LeadRegistrationPage;
