import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link href="/" className="sp-brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="2.5" y="3" width="17" height="15" rx="3" stroke="#26313F" strokeWidth="1.8" />
          <path d="M2.5 9h17" stroke="#26313F" strokeWidth="1.8" />
          <path d="M11 9v9" stroke="#26313F" strokeWidth="1.8" />
          <rect x="4" y="10.5" width="4.5" height="3" fill="#FFE066" rx="1" />
        </svg>
        study-planner
      </Link>

      <div className="sp-hero">
        <div className="sp-hero-copy">
          <p className="sp-eyebrow">your week, on one page</p>
          <h1>
            Plan your semester like a <span className="sp-marked">real schedule</span>, not a to-do list
          </h1>
          <p className="sp-muted">
            Add your subjects, hours and deadlines — we fit them into your week and track progress with
            checkmarks. Built for CS students juggling labs, projects and exams.
          </p>
          <div className="sp-cta">
            <Link href="/planner" className="btn btn-accent">Start planning</Link>
            <Link href="/login" className="btn btn-outline">Sign in</Link>
          </div>
        </div>

        <div className="sp-hero-art" aria-hidden="true">
          <svg viewBox="0 0 320 250" fill="none">
            <rect x="10" y="12" width="300" height="228" rx="14" fill="#fff" stroke="#26313F" strokeWidth="2" />
            <path d="M10 52h300" stroke="#26313F" strokeWidth="2" />
            <text x="28" y="40" fontFamily="Caveat, cursive" fontSize="20" fill="#26313F">this week</text>
            {["MON", "TUE", "WED", "THU", "FRI"].map((d, i) => (
              <text key={d} x={40 + i * 53} y="74" fontSize="10" fontWeight="700" fill="#5B6472" textAnchor="middle" fontFamily="Inter, sans-serif">{d}</text>
            ))}
            {/* study blocks with highlighter marks */}
            <rect x="26" y="88" width="40" height="26" rx="5" fill="#E7EFFC" stroke="#2F6DF6" strokeWidth="1.2" />
            <text x="46" y="105" fontSize="9" fill="#2F6DF6" textAnchor="middle" fontWeight="600">DSA</text>
            <rect x="79" y="88" width="40" height="26" rx="5" fill="#FFF6D6" stroke="#E0AC00" strokeWidth="1.2" />
            <text x="99" y="105" fontSize="9" fill="#8a6d00" textAnchor="middle" fontWeight="600">WEB</text>
            <rect x="132" y="88" width="40" height="26" rx="5" fill="#E7EFFC" stroke="#2F6DF6" strokeWidth="1.2" />
            <text x="152" y="105" fontSize="9" fill="#2F6DF6" textAnchor="middle" fontWeight="600">DB</text>
            <rect x="185" y="120" width="40" height="26" rx="5" fill="#FFF6D6" stroke="#E0AC00" strokeWidth="1.2" />
            <text x="205" y="137" fontSize="9" fill="#8a6d00" textAnchor="middle" fontWeight="600">ML</text>
            <rect x="238" y="88" width="40" height="26" rx="5" fill="#E7EFFC" stroke="#2F6DF6" strokeWidth="1.2" />
            <text x="258" y="105" fontSize="9" fill="#2F6DF6" textAnchor="middle" fontWeight="600">OS</text>
            {/* checkmarks on done tasks */}
            <path d="M42 122l6 7 11-12" stroke="#2F9E44" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M95 156l6 7 11-12" stroke="#2F9E44" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M148 156l6 7 11-12" stroke="#2F9E44" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* pencil writing a note */}
            <path d="M212 158l6 7 11-12" stroke="#9AA3AF" strokeWidth="2" strokeLinecap="round" />
            {/* sticky note */}
            <rect x="228" y="150" width="52" height="52" rx="6" fill="#FFE066" opacity="0.9" />
            <path d="M236 168h36M236 178h36M236 188h24" stroke="#26313F" strokeWidth="1.6" strokeLinecap="round" />
            <text x="20" y="196" fill="#9AA3AF" fontFamily="Caveat, cursive" fontSize="14">highlight what</text>
            <text x="20" y="212" fill="#9AA3AF" fontFamily="Caveat, cursive" fontSize="14">got done ✓</text>
          </svg>
        </div>
      </div>

      <div className="sp-steps">
        <div className="card sp-step"><strong>1 · Add subjects & tasks</strong>Courses, labs and assignments with the hours each needs.</div>
        <div className="card sp-step"><strong>2 · Mark your hours</strong>Tell the planner when you're actually free.</div>
        <div className="card sp-step"><strong>3 · Generate your week</strong>A balanced timetable, done tasks get highlighted.</div>
      </div>
    </main>
  );
}
