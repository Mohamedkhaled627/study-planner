"use client";

import { useEffect, useSyncExternalStore } from "react";

export type Lang = "en" | "ar";

let lang: Lang = "en";
const subs = new Set<() => void>();

export function setLang(l: Lang) {
  lang = l;
  try { localStorage.setItem("lang", l); } catch { /* private mode */ }
  if (typeof document !== "undefined") {
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }
  subs.forEach((f) => f());
}

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}
export function getLang() {
  return lang;
}

export const DICT: Record<string, { en: string; ar: string }> = {
  "home.eyebrow": { en: "your week, on one page", ar: "أسبوعك في صفحة واحدة" },
  "home.t1": { en: "Plan your semester like a", ar: "خطِّط فصلك الدراسي بـ" },
  "home.t2": { en: "real schedule", ar: "جدولٍ زمنيٍّ حقيقي" },
  "home.t3": { en: ", not a to-do list", ar: "، لا بقائمة مهام" },
  "home.sub": {
    en: "Add your subjects, hours and deadlines — we fit them into your week and track progress with checkmarks. Built for CS students juggling labs, projects and exams.",
    ar: "أضف موادك وساعاتك ومواعيدك النهائية — وسيتم توزيعها على أسبوعك تلقائيًا، مع تتبُّع تقدّمك بعلامات الإنجاز. مصمَّم لطلبة علوم الحاسب الذين يوازنون بين المعامل والمشاريع والاختبارات.",
  },
  "home.ctaPlan": { en: "Start planning", ar: "ابدأ التخطيط" },
  "home.ctaSignin": { en: "Sign in", ar: "تسجيل الدخول" },
  "home.s1t": { en: "Add subjects & tasks", ar: "أضف المواد والمهام" },
  "home.s1d": { en: "Courses, labs and assignments with the hours each needs.", ar: "المواد والمعامل والواجبات، مع عدد الساعات التي يحتاجها كل منها." },
  "home.s2t": { en: "Mark your hours", ar: "حدِّد وقتك المتاح" },
  "home.s2d": { en: "Tell the planner when you're actually free.", ar: "أخبر المخطط متى تكون متاحًا فعليًا." },
  "home.s3t": { en: "Generate your week", ar: "أنشئ أسبوعك" },
  "home.s3d": { en: "A balanced timetable; done tasks get highlighted.", ar: "جدول متوازن، وتُبرز المخطط المهام المكتملة." },

  "day.Mon": { en: "Mon", ar: "الاثنين" },
  "day.Tue": { en: "Tue", ar: "الثلاثاء" },
  "day.Wed": { en: "Wed", ar: "الأربعاء" },
  "day.Thu": { en: "Thu", ar: "الخميس" },
  "day.Fri": { en: "Fri", ar: "الجمعة" },
  "day.Sat": { en: "Sat", ar: "السبت" },
  "day.Sun": { en: "Sun", ar: "الأحد" },

  "nav.login": { en: "Login", ar: "تسجيل الدخول" },
  "nav.register": { en: "Register", ar: "إنشاء حساب" },
  "nav.planner": { en: "Planner", ar: "المخطط" },
  "nav.subjects": { en: "Subjects", ar: "المواد" },
  "nav.resources": { en: "Resources", ar: "المصادر" },
  "nav.availability": { en: "Availability", ar: "الوقت المتاح" },

  "login.title": { en: "🔐 Login", ar: "🔐 تسجيل الدخول" },
  "login.submit": { en: "Sign in", ar: "دخول" },
  "login.err": { en: "Bad credentials", ar: "بيانات الدخول غير صحيحة" },
  "login.needAccount": { en: "Need an account? Register", ar: "ليس لديك حساب؟ سجِّل الآن" },
  "ph.email": { en: "email", ar: "البريد الإلكتروني" },
  "ph.password": { en: "password", ar: "كلمة المرور" },
  "register.title": { en: "🚀 Register", ar: "🚀 إنشاء حساب" },
  "register.submit": { en: "Create account", ar: "إنشاء الحساب" },
  "register.passPh": { en: "password (min 6 chars)", ar: "كلمة المرور (6 أحرف على الأقل)" },
  "register.emailUsed": { en: "Email already in use", ar: "البريد الإلكتروني مستخدم بالفعل" },
  "register.haveAccount": { en: "Have an account? Login", ar: "لديك حساب؟ سجِّل الدخول" },

  "subjects.h1": { en: "📚 Subjects", ar: "📚 المواد" },
  "subjects.add": { en: "Add subject", ar: "إضافة مادة" },
  "subjects.namePh": { en: "e.g. OS", ar: "مثال: OS" },
  "subjects.createFirst": { en: "Create a subject first.", ar: "أنشئ مادةً أولًا." },
  "subjects.tasksCount": { en: "{n} tasks", ar: "{n} مهام" },
  "subjects.exam": { en: " — exam {d}", ar: " — اختبار {d}" },
  "subjects.tasksH": { en: "Tasks", ar: "المهام" },
  "subjects.yourTasks": { en: "Your tasks", ar: "مهامك" },
  "task.titlePh": { en: "Task title", ar: "عنوان المهمة" },
  "task.add": { en: "Add task", ar: "إضافة مهمة" },
  "task.min": { en: "min", ar: "د" },
  "task.due": { en: " · due {d}", ar: " · استحقاق {d}" },
  "task.done": { en: "Done", ar: "تم" },
  "task.skip": { en: "Skip", ar: "تخطّي" },
  "task.undo": { en: "Undo", ar: "تراجع" },
  "task.unskip": { en: "Unskip", ar: "إلغاء التخطّي" },
  "st.TODO": { en: "TODO", ar: "قيد التنفيذ" },
  "st.DONE": { en: "DONE", ar: "مكتملة" },
  "st.SKIPPED": { en: "SKIPPED", ar: "مؤجَّلة" },
  "notify.taskAdded": { en: "✓ Task added", ar: "✓ تمت إضافة المهمة" },
  "mail.subject": { en: "Study planner: task due today", ar: "المخطط الدراسي: مهمة مستحققة اليوم" },
  "mail.body": { en: 'Your task "{title}" ({d}) is due today.', ar: 'مهمتك "{title}" ({d}) مستحققة اليوم.' },
  "pr.LOW": { en: "LOW", ar: "منخفضة" },
  "pr.MED": { en: "MED", ar: "متوسطة" },
  "pr.HIGH": { en: "HIGH", ar: "عالية" },

  "resources.h1": { en: "📖 Resources", ar: "📖 المصادر" },
  "resources.none": { en: "No resources yet.", ar: "لا مصادر بعد." },
  "resources.addH": { en: "Add", ar: "إضافة" },
  "resources.save": { en: "Save link", ar: "حفظ الرابط" },
  "resources.titlePh": { en: "title", ar: "العنوان" },
  "resources.delete": { en: "Delete", ar: "حذف" },
  "cit.VIDEO": { en: "VIDEO", ar: "فيديو" },
  "cit.DOC": { en: "DOC", ar: "ملف" },
  "cit.COURSE": { en: "COURSE", ar: "دورة" },
  "cit.REPO": { en: "REPO", ar: "مستودع" },
  "cit.OTHER": { en: "OTHER", ar: "أخرى" },

  "avail.h1": { en: "⏰ Availability", ar: "⏰ الوقت المتاح" },
  "avail.save": { en: "Save availability", ar: "حفظ الوقت المتاح" },

  "planner.h1": { en: "🗓️ Planner", ar: "🗓️ المخطط" },
  "planner.generate": { en: "Generate week", ar: "توليد الأسبوع" },
  "planner.todo": { en: "TODO ({n})", ar: "مهام معلّقة ({n})" },
  "planner.weekOf": { en: "Week of {w}", ar: "أسبوع {w}" },
  "planner.noPlan": { en: "No plan yet — click Generate.", ar: "لا خطة بعد — اضغط «توليد الأسبوع»." },
  "planner.warn": { en: "{supply}h available, {demand}h demanded — {short}", ar: "المتاح {supply} ساعة، والمطلوب {demand} ساعة — {short}" },

  "loading": { en: "Loading…", ar: "جارٍ التحميل…" },
};

export function t(key: string, vars?: Record<string, string | number>): string {
  const row = DICT[key];
  const s = (row && (row[lang] ?? row.en)) || key;
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en" as Lang);
}

export function LangToggle() {
  const l = useLang();
  useEffect(() => {
    try {
      const s = localStorage.getItem("lang");
      if (s === "ar" || s === "en") setLang(s);
    } catch { /* private mode */ }
  }, []);
  return (
    <button
      className="sp-lang btn-outline"
      onClick={() => setLang(l === "en" ? "ar" : "en")}
      aria-label="Switch language"
    >
      {l === "en" ? "عربي" : "English"}
    </button>
  );
}
