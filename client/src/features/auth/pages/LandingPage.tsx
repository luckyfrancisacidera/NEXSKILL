import { useState, useEffect, useRef } from "react";

/* ─── Google Fonts injected via style tag ─── */
const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body { background: #ffffff; }

    .font-display { font-family: 'Instrument Serif', serif; }
    .font-body    { font-family: 'Outfit', sans-serif; }

    /* fade-in on scroll */
    .reveal        { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .reveal.visible{ opacity: 1; transform: translateY(0); }

    /* stagger helpers */
    .delay-100 { transition-delay: 0.10s; }
    .delay-200 { transition-delay: 0.20s; }
    .delay-300 { transition-delay: 0.30s; }
    .delay-400 { transition-delay: 0.40s; }
    .delay-500 { transition-delay: 0.50s; }

    /* hero image mask */
    .hero-image-wrap {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    }
    .hero-image-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to right,  rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0) 60%),
        linear-gradient(to bottom, rgba(255,255,255,0)    60%, rgba(255,255,255,0.85) 100%),
        linear-gradient(to top,    rgba(255,255,255,0)    70%, rgba(255,255,255,0.6)  100%);
      pointer-events: none;
    }

    /* mesh gradient background */
    .hero-bg {
      background:
        radial-gradient(ellipse 80% 60% at 68% 40%, rgba(212,212,216,0.30) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 20% 80%, rgba(212,212,216,0.18) 0%, transparent 60%),
        #ffffff;
    }

    /* feature card hover */
    .feature-card {
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .feature-card:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      transform: translateY(-3px);
    }

    /* step connector line */
    .step-line::before {
      content: '';
      position: absolute;
      top: 22px;
      left: calc(50% + 28px);
      width: calc(100% - 56px);
      height: 1px;
      background: linear-gradient(to right, #d4d4d8, #e4e4e7);
    }

    /* CTA glow */
    .btn-primary {
      background: #27272a;
      color: #ffffff;
      transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
    }
    .btn-primary:hover {
      background: #18181b;
      box-shadow: 0 8px 24px rgba(39,39,42,0.28);
      transform: translateY(-1px);
    }

    /* nav link underline */
    .nav-link {
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 1px;
      background: #27272a;
      transition: width 0.22s ease;
    }
    .nav-link:hover::after { width: 100%; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #fafafa; }
    ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
  `}</style>
);

/* ─── Reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Icons (inline SVG, zero dependencies) ─── */
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  brain:     "M9.5 2a4.5 4.5 0 0 1 0 9m5-9a4.5 4.5 0 0 1 0 9M4 20a8 8 0 0 1 16 0",
  target:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4",
  pipeline:  "M3 6h18M3 12h18M3 18h18",
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  insight:   "M12 20V10M18 20V4M6 20v-4",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  cpu:       "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  check:     "M20 6L9 17l-5-5",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  menu:      "M3 12h18M3 6h18M3 18h18",
  x:         "M18 6 6 18M6 6l12 12",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

/* ─── Nav ─── */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`font-body fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <span className="text-white text-xs font-semibold tracking-tight">SS</span>
          </div>
          <span className="text-zinc-800 font-semibold text-[15px] tracking-tight">SkillSense</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Why SkillSense"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="nav-link text-zinc-500 hover:text-zinc-800 text-sm font-medium transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-sm text-zinc-600 font-medium hover:text-zinc-800 transition-colors px-3 py-2">
            Sign In
          </a>
          <a href="#" className="btn-primary text-sm font-medium px-4 py-2 rounded-lg">
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-zinc-700" onClick={() => setOpen(!open)}>
          <Icon d={open ? ICONS.x : ICONS.menu} size={22} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-4 flex flex-col gap-4">
          {["Features", "How it Works", "Why SkillSense"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-zinc-600 text-sm font-medium" onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-zinc-100">
            <a href="#" className="text-sm text-zinc-600 font-medium py-2">Sign In</a>
            <a href="#" className="btn-primary text-sm font-medium px-4 py-2 rounded-lg">Get Started</a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="hero-bg font-body relative overflow-hidden min-h-screen flex items-center pt-20">
      {/* Decorative blobs */}
      <div className="absolute top-32 right-0 w-[520px] h-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(161,161,170,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,212,216,0.15) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: copy */}
          <div className="space-y-7 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-zinc-200 rounded-full px-4 py-1.5
              bg-white/80 backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
              <span className="text-zinc-500 text-xs font-medium tracking-wide uppercase">
                Semantic ATS Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-[3.2rem] sm:text-[3.8rem] leading-[1.08] text-zinc-800">
              Hiring that<br />
              <em className="italic font-display text-zinc-500">understands</em>{" "}
              your candidates.
            </h1>

            {/* Sub */}
            <p className="text-zinc-500 text-lg leading-relaxed max-w-md font-light">
              SkillSense moves beyond keyword filtering. Our semantic engine reads
              resumes the way humans do — understanding context, skills, and fit —
              so your pipeline surfaces the right candidates, faster.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
                Start Screening
                <Icon d={ICONS.arrow} size={16} />
              </a>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                border border-zinc-200 text-zinc-700 text-sm font-semibold bg-white
                hover:border-zinc-400 hover:bg-zinc-50 transition-all">
                See How It Works
              </a>
            </div>

            {/* Social proof line */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["#a1a1aa","#71717a","#52525b","#3f3f46"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white"
                    style={{ background: c }} />
                ))}
              </div>
              <p className="text-zinc-400 text-sm">
                Built for modern recruitment teams &amp; academic research
              </p>
            </div>
          </div>

          {/* Right: hero image with fade */}
          <div className="relative lg:h-[520px] h-[340px] hidden sm:block">
            <div className="hero-image-wrap w-full h-full">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&auto=format&fit=crop&q=80"
                alt="SkillSense recruitment dashboard"
                className="w-full h-full object-cover object-center rounded-2xl"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute bottom-8 left-4 bg-white rounded-xl shadow-lg px-4 py-3
              border border-zinc-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                <Icon d={ICONS.target} size={18} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wide">Match Accuracy</p>
                <p className="text-zinc-800 text-sm font-semibold">Semantically ranked results</p>
              </div>
            </div>
            {/* Floating insight card */}
            <div className="absolute top-8 right-2 bg-white rounded-xl shadow-lg px-4 py-3
              border border-zinc-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
                <Icon d={ICONS.brain} size={18} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium">AI Insights</p>
                <p className="text-zinc-800 text-sm font-semibold">Explainable fit scores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust bar ─── */
function TrustBar() {
  const ref = useReveal();
  const items = [
    "Semantic Resume Analysis",
    "Intelligent Candidate Ranking",
    "ATS Pipeline Tracking",
    "Explainable AI Matching",
    "Academic Research Grade",
  ];
  return (
    <div ref={ref} className="reveal font-body border-y border-zinc-100 bg-zinc-50 py-5">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-x-10 gap-y-3">
        {items.map(i => (
          <div key={i} className="flex items-center gap-2 text-zinc-400 text-xs font-medium tracking-wide uppercase">
            <Icon d={ICONS.check} size={13} />
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Features ─── */
const FEATURES = [
  { icon: ICONS.brain, title: "Semantic Resume Analysis", desc: "NLP-powered parsing that understands job skills, context, and experience depth — not just keyword presence." },
  { icon: ICONS.target, title: "Intelligent Candidate Matching", desc: "Vector-based similarity scoring aligns candidates to job descriptions with human-like comprehension and nuance." },
  { icon: ICONS.pipeline, title: "ATS Pipeline Tracking", desc: "Track every applicant across hiring stages from application to offer in a structured, visual workflow." },
  { icon: ICONS.dashboard, title: "Recruiter Dashboards", desc: "Clean, data-rich views that give recruiters everything they need without cognitive overload." },
  { icon: ICONS.insight, title: "Explainable Fit Insights", desc: "Understand why a candidate ranks highly with transparent breakdowns of skill alignment and gap areas." },
  { icon: ICONS.star, title: "Ranked Shortlists", desc: "Automatically surface the top candidates per job posting, prioritized by semantic fit score, not post order." },
];

function Features() {
  const ref = useReveal();
  return (
    <section id="features" className="font-body py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal text-center mb-16 space-y-3">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Platform Features</p>
          <h2 className="font-display text-4xl sm:text-5xl text-zinc-800 leading-tight">
            Everything a modern ATS<br />
            <em className="italic text-zinc-400">should have been.</em>
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto pt-1 leading-relaxed">
            Built around semantic understanding, SkillSense replaces guesswork with
            evidence-based hiring intelligence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const ref2 = useReveal();
            return (
              <div key={f.title} ref={ref2}
                className={`reveal delay-${(i % 3) * 100 + 100} feature-card
                  bg-white border border-zinc-100 rounded-2xl p-7 space-y-4
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]`}>
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100
                  flex items-center justify-center text-zinc-600">
                  <Icon d={f.icon} size={19} />
                </div>
                <div>
                  <h3 className="text-zinc-800 font-semibold text-base mb-1.5">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
const STEPS = [
  { n: "01", icon: ICONS.upload, title: "Upload or Apply", desc: "Candidates submit resumes through the portal. Recruiters post job descriptions with structured role requirements." },
  { n: "02", icon: ICONS.cpu, title: "Semantic Processing", desc: "Our NLP engine parses every resume and job description, extracting skills, experience, context, and intent." },
  { n: "03", icon: ICONS.target, title: "Matching & Ranking", desc: "Candidates are ranked per job by cosine similarity across semantic embeddings — not keyword count." },
  { n: "04", icon: ICONS.dashboard, title: "Review & Decide", desc: "Recruiters receive a ranked shortlist with fit scores, skill gaps, and explainable match reasoning." },
];

function HowItWorks() {
  const ref = useReveal();
  return (
    <section id="how-it-works" className="font-body py-28 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="reveal text-center mb-16 space-y-3">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Process</p>
          <h2 className="font-display text-4xl sm:text-5xl text-zinc-800 leading-tight">
            Four steps from posting<br />
            <em className="italic text-zinc-400">to perfect hire.</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => {
            const ref2 = useReveal();
            return (
              <div key={s.n} ref={ref2}
                className={`reveal delay-${i * 100 + 100} relative bg-white border border-zinc-100
                  rounded-2xl p-7 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]`}>
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
                    <Icon d={s.icon} size={18} />
                  </div>
                  <span className="font-display text-4xl text-zinc-100 select-none">{s.n}</span>
                </div>
                <div>
                  <h3 className="text-zinc-800 font-semibold text-base mb-1.5">{s.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Why SkillSense ─── */
const COMPARISONS = [
  { label: "Keyword ATS", items: ["Filters by exact word matches", "Misses synonyms & related skills", "Penalizes non-standard formatting", "No context for experience depth", "High false-negative rate"] },
  { label: "SkillSense", items: ["Understands skill intent & meaning", "Maps synonyms and adjacent skills", "Reads semantic structure, not format", "Weighs experience depth contextually", "Ranked confidence with explainability"], highlight: true },
];

function WhySkillSense() {
  const ref = useReveal();
  return (
    <section id="why-skillsense" className="font-body py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div ref={ref} className="reveal text-center mb-16 space-y-3">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Why It Matters</p>
          <h2 className="font-display text-4xl sm:text-5xl text-zinc-800 leading-tight">
            Keyword matching is<br />
            <em className="italic text-zinc-400">not enough anymore.</em>
          </h2>
          <p className="text-zinc-400 text-base max-w-lg mx-auto pt-1 leading-relaxed">
            Traditional ATS platforms filter by exact terms and miss qualified candidates.
            SkillSense reads meaning — the way a skilled recruiter would.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {COMPARISONS.map(col => {
            const ref2 = useReveal();
            return (
              <div key={col.label} ref={ref2}
                className={`reveal rounded-2xl p-8 space-y-5 border
                  ${col.highlight
                    ? "bg-zinc-800 border-zinc-700 shadow-[0_8px_40px_rgba(39,39,42,0.18)]"
                    : "bg-zinc-50 border-zinc-100"
                  }`}>
                <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full
                  ${col.highlight ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-500"}`}>
                  {col.highlight && <Icon d={ICONS.star} size={12} />}
                  {col.label}
                </div>
                <ul className="space-y-3">
                  {col.items.map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 ${col.highlight ? "text-zinc-300" : "text-zinc-300"}`}>
                        <Icon d={col.highlight ? ICONS.check : "M6 18L18 6M6 6l12 12"} size={15} />
                      </span>
                      <span className={`text-sm leading-relaxed ${col.highlight ? "text-zinc-200" : "text-zinc-400"}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  const ref = useReveal();
  return (
    <section className="font-body py-28 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div ref={ref} className="reveal space-y-6">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Get Started</p>
          <h2 className="font-display text-4xl sm:text-5xl text-zinc-800 leading-tight">
            Ready to hire<br />
            <em className="italic text-zinc-400">smarter?</em>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-md mx-auto">
            Explore SkillSense as a recruiter or candidate.
            Experience semantic hiring that actually understands your resume.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href="#" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold">
              Sign In as Recruiter
              <Icon d={ICONS.arrow} size={16} />
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
              border border-zinc-200 text-zinc-700 text-sm font-semibold bg-white
              hover:border-zinc-400 transition-all">
              Browse Jobs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="font-body bg-zinc-800 text-zinc-400 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">SS</span>
          </div>
          <span className="text-white text-sm font-medium">SkillSense</span>
          <span className="text-zinc-600 text-xs ml-2">Semantic ATS Platform</span>
        </div>
        <p className="text-xs text-zinc-500">
          © 2025 SkillSense. Capstone / Thesis Project — Academic Use.
        </p>
        <div className="flex gap-5 text-xs">
          <a href="#" className="hover:text-zinc-200 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-200 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-200 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Root ─── */
export default function SkillSenseLanding() {
  return (
    <>
      <FontInjector />
      <div className="font-body antialiased text-zinc-800 bg-white overflow-x-hidden">
        <Nav />
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <WhySkillSense />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}