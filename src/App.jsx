import { useState, useEffect } from "react";

/*
 * ┌──────────────────────────────────────────────────────┐
 * │  SETUP: Google Sheets Integration                     │
 * │                                                        │
 * │  1. Create a Google Sheet with these column headers:   │
 * │     A: Timestamp                                       │
 * │     B: Name                                            │
 * │     C: Email                                           │
 * │     D: Phone                                           │
 * │     E: Complexity Score                                │
 * │     F: Engagement Model                                │
 * │     G: Archetype                                       │
 * │     H: Secondary Archetype                             │
 * │     I: Day 1 Priority                                  │
 * │     J: Day 30 Priority                                 │
 * │     K: All Answers (JSON)                              │
 * │                                                        │
 * │  2. Go to Extensions → Apps Script                     │
 * │  3. Paste this code:                                   │
 * │                                                        │
 * │  function doPost(e) {                                  │
 * │    var sheet = SpreadsheetApp                           │
 * │      .getActiveSpreadsheet()                           │
 * │      .getActiveSheet();                                │
 * │    var data = JSON.parse(e.postData.contents);         │
 * │    sheet.appendRow([                                   │
 * │      new Date(),                                       │
 * │      data.name,                                        │
 * │      data.email,                                       │
 * │      data.phone,                                       │
 * │      data.complexityScore,                             │
 * │      data.engagementModel,                             │
 * │      data.archetype,                                   │
 * │      data.secondaryArchetype,                          │
 * │      data.dayOne,                                      │
 * │      data.dayThirty,                                   │
 * │      JSON.stringify(data.answers)                      │
 * │    ]);                                                 │
 * │    return ContentService                               │
 * │      .createTextOutput(                                │
 * │        JSON.stringify({ status: "ok" })                │
 * │      )                                                 │
 * │      .setMimeType(ContentService.MimeType.JSON);       │
 * │  }                                                     │
 * │                                                        │
 * │  4. Deploy → New deployment → Web app                  │
 * │     Execute as: Me                                     │
 * │     Who has access: Anyone                             │
 * │  5. Copy the URL and paste it below ↓                  │
 * └──────────────────────────────────────────────────────┘
 */
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzo_2fc4r1dMBJp4EE-cgKPVAHvT9KgaawXEGGQ1MVrTT8DX1u3Hy0_eRYhUXyvXyENiQ/exec";

/* ─────────────────────────── PHASE 1 ─────────────────────────── */
const PHASE1_QUESTIONS = [
  {
    id: "reports",
    question: "How many people report directly to you?",
    subtext: "Include anyone who has a recurring 1:1 with you",
    options: [
      { label: "1–4", value: 1, icon: "○" },
      { label: "5–8", value: 2, icon: "○○" },
      { label: "9–12", value: 3, icon: "○○○" },
      { label: "13+", value: 4, icon: "○○○○" },
    ],
  },
  {
    id: "bottleneck",
    question: "How often are you the bottleneck on decisions?",
    subtext: "Things that can't move forward without your input",
    options: [
      { label: "Rarely", value: 1, icon: "◇" },
      { label: "Sometimes", value: 2, icon: "◇◇" },
      { label: "Often", value: 3, icon: "◇◇◇" },
      { label: "Constantly", value: 4, icon: "◇◇◇◇" },
    ],
  },
  {
    id: "strategic",
    question: "What percentage of your week is spent on strategic work?",
    subtext: "Long-term planning, vision, high-leverage thinking",
    options: [
      { label: "60%+", value: 1, icon: "▲" },
      { label: "40–60%", value: 2, icon: "▲▲" },
      { label: "20–40%", value: 3, icon: "▲▲▲" },
      { label: "Under 20%", value: 4, icon: "▲▲▲▲" },
    ],
  },
  {
    id: "meetings",
    question: "How many hours per week are you in meetings?",
    subtext: "All meetings — 1:1s, team syncs, external calls",
    options: [
      { label: "Under 15", value: 1, icon: "□" },
      { label: "15–25", value: 2, icon: "□□" },
      { label: "25–35", value: 3, icon: "□□□" },
      { label: "35+", value: 4, icon: "□□□□" },
    ],
  },
  {
    id: "crossfunc",
    question: "How often do cross-functional initiatives stall or misalign?",
    subtext: "Projects that span multiple teams or departments",
    options: [
      { label: "Rarely", value: 1, icon: "△" },
      { label: "Occasionally", value: 2, icon: "△△" },
      { label: "Frequently", value: 3, icon: "△△△" },
      { label: "It's chaos", value: 4, icon: "△△△△" },
    ],
  },
  {
    id: "delegate",
    question: "Is there someone who can represent you in a room?",
    subtext: "Someone who knows your thinking well enough to act on your behalf",
    options: [
      { label: "Yes, reliably", value: 1, icon: "●" },
      { label: "Sort of", value: 2, icon: "●○" },
      { label: "Not really", value: 3, icon: "○●" },
      { label: "Absolutely not", value: 4, icon: "○" },
    ],
  },
  {
    id: "stage",
    question: "What stage is your organization?",
    subtext: "Roughly — where things feel right now",
    options: [
      { label: "Early (under 50)", value: 1, icon: "⊡" },
      { label: "Growth (50–200)", value: 2, icon: "⊡⊡" },
      { label: "Scale (200–1000)", value: 3, icon: "⊡⊡⊡" },
      { label: "Enterprise (1000+)", value: 4, icon: "⊡⊡⊡⊡" },
    ],
  },
  {
    id: "duration",
    question: "How long do you anticipate needing this support?",
    subtext: "Think about whether this is a season or a permanent shift",
    options: [
      { label: "A specific initiative (3–6 months)", value: "project", icon: "⧖" },
      { label: "A transition period (6–12 months)", value: "transition", icon: "⧗" },
      { label: "Ongoing, but not ready for a full hire", value: "fractional", icon: "◐" },
      { label: "Permanently — this is a core role", value: "permanent", icon: "●" },
    ],
  },
  {
    id: "budget",
    question: "What's your realistic budget for this role?",
    subtext: "Be honest — it shapes the recommendation",
    options: [
      { label: "Under $80K / year", value: "low", icon: "$" },
      { label: "$80K–$150K / year", value: "mid", icon: "$$" },
      { label: "$150K–$250K / year", value: "high", icon: "$$$" },
      { label: "$250K+ / year", value: "top", icon: "$$$$" },
    ],
  },
];

/* ─────────────────────────── PHASE 2: MULTIPLE CHOICE ─────────────────────────── */
const PHASE2_MC_QUESTIONS = [
  {
    id: "pain",
    question: "What keeps you up at night?",
    subtext: "The thing that would change everything if it were solved",
    options: [
      { label: "We don't have a clear long-term plan", value: "strategic", icon: "🧭" },
      { label: "Execution is broken — things fall through cracks", value: "operational", icon: "⚙️" },
      { label: "Key relationships aren't being managed well", value: "external", icon: "🤝" },
      { label: "We're growing faster than our systems can handle", value: "growth", icon: "📈" },
    ],
    otherPrompt: "Something else keeps me up…",
  },
  {
    id: "delegate_first",
    question: "If you could hand off one thing tomorrow, what would it be?",
    subtext: "The first thing you'd take off your plate",
    options: [
      { label: "Board prep, investor updates, strategic projects", value: "strategic", icon: "◇" },
      { label: "Team cadences, OKRs, internal processes", value: "operational", icon: "□" },
      { label: "Partner calls, external comms, stakeholder meetings", value: "external", icon: "△" },
      { label: "Org design, new team standup, change management", value: "growth", icon: "○" },
    ],
    otherPrompt: "Something else entirely…",
  },
  {
    id: "missed_meeting",
    question: "What's the most important meeting you're missing or underprepared for?",
    subtext: "Where your absence or distraction costs the most",
    options: [
      { label: "Board meetings and investor check-ins", value: "external", icon: "◆" },
      { label: "Quarterly planning and strategy sessions", value: "strategic", icon: "◆" },
      { label: "Leadership team syncs and cross-functional reviews", value: "operational", icon: "◆" },
      { label: "All-hands, town halls, and culture moments", value: "growth", icon: "◆" },
    ],
    otherPrompt: "A different meeting…",
  },
  {
    id: "failure_mode",
    question: "When things go wrong, it's usually because…",
    subtext: "The pattern you keep seeing",
    options: [
      { label: "We reacted instead of planned", value: "strategic", icon: "→" },
      { label: "Nobody owned the follow-through", value: "operational", icon: "→" },
      { label: "A key stakeholder was surprised or misaligned", value: "external", icon: "→" },
      { label: "We outgrew the process before we replaced it", value: "growth", icon: "→" },
    ],
    otherPrompt: "A different pattern…",
  },
  {
    id: "superpower",
    question: "What superpower matters most in this person?",
    subtext: "The non-negotiable capability",
    options: [
      { label: "Thinks three moves ahead", value: "strategic", icon: "✦" },
      { label: "Makes the trains run on time", value: "operational", icon: "✦" },
      { label: "Commands a room on my behalf", value: "external", icon: "✦" },
      { label: "Thrives in chaos and builds while running", value: "growth", icon: "✦" },
    ],
    otherPrompt: "A different superpower…",
  },
];

/* ─────────────────────────── PHASE 2: WRITE-IN QUESTIONS ─────────────────────────── */
const PHASE2_WRITEIN_QUESTIONS = [
  {
    id: "day_one",
    question: "If your Chief of Staff started today, what would you hand them first?",
    subtext: "The most urgent thing on your plate — the thing you'd brief them on in the first hour",
    placeholder: "e.g. \"I need someone to take over our quarterly planning process — it's a mess and the exec team is losing confidence in our ability to ship on time.\"",
  },
  {
    id: "day_thirty",
    question: "What about 30 days from now — what should they own by then?",
    subtext: "Think about what 'settled in and delivering' looks like after a month",
    placeholder: "e.g. \"By day 30 I'd want them running the weekly leadership sync, owning the OKR dashboard, and preparing a board deck draft without my input.\"",
  },
];

/* ─────────────────────────── RESULT DATA ─────────────────────────── */
const COS_TYPES = {
  strategic: {
    title: "Strategic Chief of Staff",
    tagline: "Your thinking partner. Your second brain.",
    color: "#2c5f8a",
    accent: "#e8f0f7",
    icon: "🧭",
    description: "You need someone who can operate at altitude — synthesizing complex information, running high-stakes projects, and ensuring the organization's long-term direction stays sharp while you handle the day-to-day demands of leadership.",
    whatTheyDo: [
      "Own annual and quarterly planning end-to-end",
      "Run special strategic projects from scoping to execution",
      "Prepare board materials, investor decks, and executive communications",
      "Conduct competitive analysis and market positioning work",
      "Serve as a sounding board for your biggest decisions",
      "Drive M&A diligence and integration planning",
    ],
    whatToLookFor: [
      "Former management consultant, strategy, or biz ops background",
      "Exceptional analytical and synthesis skills",
      "Comfortable with ambiguity — can structure the unstructured",
      "Strong written communication (they'll draft in your voice)",
      "High trust threshold — you'd share your real concerns with them",
    ],
    interviewQs: [
      "Walk me through a time you had to synthesize a complex problem into a clear recommendation for a senior leader.",
      "How would you approach building our 3-year strategic plan from scratch?",
      "Tell me about a decision you influenced without having direct authority.",
    ],
    compRange: { ft: "$140K–$250K+", frac: "$8K–$18K/mo" },
  },
  operational: {
    title: "Operational Chief of Staff",
    tagline: "The machine that makes your machine work.",
    color: "#8b6914",
    accent: "#faf5e8",
    icon: "⚙️",
    description: "Your organization's biggest gap is between decisions and execution. You need someone who can build the operating system — the cadences, rituals, tracking mechanisms, and accountability structures that turn leadership intent into organizational action.",
    whatTheyDo: [
      "Design and run the leadership team operating cadence",
      "Own OKR/goal setting, tracking, and accountability",
      "Project-manage cross-functional initiatives",
      "Build internal communications rhythm and templates",
      "Run organizational health checks and team diagnostics",
      "Ensure decisions actually translate into shipped outcomes",
    ],
    whatToLookFor: [
      "Operations, program management, or COO-track background",
      "Systems thinker who can see both forest and trees",
      "Obsessive about follow-through and closing loops",
      "Process designer — not just process follower",
      "Diplomatic enough to hold people accountable without creating friction",
    ],
    interviewQs: [
      "Describe a time you built an operating cadence or process from scratch. What worked and what didn't?",
      "How do you hold a leadership team accountable to commitments without being seen as a taskmaster?",
      "Walk me through how you'd diagnose why cross-functional projects keep stalling here.",
    ],
    compRange: { ft: "$120K–$200K+", frac: "$7K–$15K/mo" },
  },
  external: {
    title: "External-Facing Chief of Staff",
    tagline: "Your voice in every room you can't be in.",
    color: "#6b3a6b",
    accent: "#f5edf5",
    icon: "🤝",
    description: "Your primary need is someone who can represent you with the people who matter most — the board, investors, key partners, regulators, and other external stakeholders. This person needs executive presence, political savvy, and your deep trust.",
    whatTheyDo: [
      "Manage board relationships and prep for board meetings",
      "Own investor communications and reporting cadence",
      "Serve as executive liaison with key partners and clients",
      "Draft high-stakes communications in your voice",
      "Manage government, regulatory, or industry relationships",
      "Represent you at external events and in partner negotiations",
    ],
    whatToLookFor: [
      "Strong executive presence — you'd trust them in front of your board",
      "Exceptional communicator (written and verbal)",
      "Natural relationship builder with high EQ",
      "Politically savvy — reads the room and plays the long game",
      "Discretion and judgment under pressure",
    ],
    interviewQs: [
      "Tell me about a time you represented a senior leader in a high-stakes external meeting. What was your approach?",
      "How do you build trust with a board member or key stakeholder who's skeptical?",
      "Describe a situation where you had to deliver difficult news to an external partner.",
    ],
    compRange: { ft: "$150K–$250K+", frac: "$10K–$20K/mo" },
  },
  growth: {
    title: "Transformation Chief of Staff",
    tagline: "A scaling architect for what comes next.",
    color: "#c4532b",
    accent: "#fdf0ec",
    icon: "📈",
    description: "Your organization is changing faster than your operating model can keep up. You need someone who can redesign how you work while the plane is in flight — standing up new teams, codifying culture, integrating acquisitions, and building the next version of your company without breaking the current one.",
    whatTheyDo: [
      "Lead organizational restructuring and team design",
      "Stand up new functions, teams, or business units",
      "Manage acquisition integration or major business transitions",
      "Codify and protect culture during rapid scaling",
      "Build and iterate on processes that can evolve with the org",
      "Run change management for major internal shifts",
    ],
    whatToLookFor: [
      "High-growth startup or transformation experience",
      "Change management instincts — not just frameworks",
      "Comfortable building and tearing down processes fast",
      "Can operate with incomplete information and shifting priorities",
      "Energized (not drained) by ambiguity and speed",
    ],
    interviewQs: [
      "Tell me about a time you had to redesign an organization while it was still operating. How did you manage the transition?",
      "How do you decide what to systematize vs. what to keep scrappy?",
      "Describe a situation where you had to preserve team culture through a major change.",
    ],
    compRange: { ft: "$130K–$220K+", frac: "$8K–$16K/mo" },
  },
};

/* ─────────────────────────── SCORING ─────────────────────────── */
function getPhase1Result(answers) {
  const complexityIds = ["reports", "bottleneck", "strategic", "meetings", "crossfunc", "delegate", "stage"];
  const totalScore = complexityIds.reduce((s, id) => s + (answers[id] || 0), 0);
  const duration = answers["duration"];
  const budget = answers["budget"];
  const stage = answers["stage"] || 0;

  if (totalScore <= 12) return { need: "none", totalScore };

  const f = [], ft = [];
  if (duration === "project") f.push("You're solving for a specific initiative, not an ongoing gap");
  if (duration === "transition") f.push("You need this through a transition — fractional gives flexibility to reassess");
  if (duration === "fractional") f.push("You already sense this doesn't need to be full-time");
  if (duration === "permanent") ft.push("You see this as a permanent, core role on your team");
  if (budget === "low") f.push("Your budget is better suited to fractional — senior talent part-time vs. junior talent full-time");
  if (budget === "mid" && stage <= 2) f.push("At your stage and budget, fractional gives you more experienced talent");
  if (budget === "mid" && stage >= 3) ft.push("Your budget supports a full-time hire at your org's scale");
  if (budget === "high" || budget === "top") ft.push("Your budget supports a strong full-time hire");
  if (stage <= 1) f.push("Early-stage orgs often benefit more from fractional — needs shift fast");
  if (stage >= 3 && totalScore >= 22) ft.push("At your scale and complexity, you need someone embedded full-time");
  if (totalScore <= 18) f.push("Your complexity score suggests part-time support could close the gap");
  if (totalScore >= 23) ft.push("Your organizational complexity calls for a dedicated, full-time presence");

  const isFrac = f.length > ft.length;
  const isDef = Math.abs(f.length - ft.length) >= 2;
  return {
    need: "yes", totalScore,
    model: isFrac ? "fractional" : "fulltime",
    strength: isDef ? "strong" : "lean",
    modelTitle: isFrac ? (isDef ? "Fractional Chief of Staff" : "Likely Fractional") : (isDef ? "Full-Time Chief of Staff" : "Likely Full-Time"),
    modelSubtitle: isFrac
      ? (isDef ? "You don't need someone five days a week — you need the right person two or three." : "The signals lean fractional, though full-time could work too.")
      : (isDef ? "You need someone fully embedded in your operating rhythm." : "The signals lean full-time, though you could start fractional and convert."),
    signals: isFrac ? f : ft,
    counterSignals: isFrac ? ft : f,
  };
}

function getPhase2Result(answers) {
  const tally = { strategic: 0, operational: 0, external: 0, growth: 0 };
  PHASE2_MC_QUESTIONS.forEach((q) => { const v = answers[q.id]; if (v && tally[v] !== undefined) tally[v]++; });
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][1] > 0 ? sorted[1][0] : null, tally };
}

/* ─────────────────────────── SHEETS SUBMIT ─────────────────────────── */
function submitToSheets(payload) {
  try {
    var url = GOOGLE_SHEETS_WEBHOOK_URL + "?payload=" + encodeURIComponent(JSON.stringify(payload));
    var img = new Image();
    img.src = url;
    return true;
  } catch (err) {
    console.error("Sheet error:", err);
    return false;
  }
}

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function ChiefOfStaffAssessment() {
  // phase: intro | phase1 | phase1result | phase2intro | phase2mc | phase2writein | final
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [p1Answers, setP1Answers] = useState({});
  const [p2Answers, setP2Answers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [writeInAnswers, setWriteInAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const [p1Result, setP1Result] = useState(null);
  const [p2Result, setP2Result] = useState(null);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  // Write-in current value (for the textarea)
  const [writeInValue, setWriteInValue] = useState("");

  useEffect(() => { setFadeIn(false); const t = setTimeout(() => setFadeIn(true), 30); return () => clearTimeout(t); }, [phase, step]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [phase]);

  // ── Phase 1 handlers
  const handleP1Select = (qId, value) => {
    setSelected(value);
    const na = { ...p1Answers, [qId]: value }; setP1Answers(na);
    setTimeout(() => {
      setSelected(null);
      if (step + 1 < PHASE1_QUESTIONS.length) setStep(step + 1);
      else { setP1Result(getPhase1Result(na)); setPhase("phase1result"); }
    }, 350);
  };

  // ── Phase 2 MC handlers
  const handleP2MCSelect = (qId, value) => {
    setSelected(value); setShowOtherInput(false); setOtherValue("");
    const na = { ...p2Answers, [qId]: value }; setP2Answers(na);
    setTimeout(() => {
      setSelected(null);
      if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1);
      else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); }
    }, 350);
  };

  const handleOtherClick = () => { setShowOtherInput(true); setOtherValue(""); };
  const handleOtherSubmit = (qId) => {
    if (!otherValue.trim()) return;
    setOtherTexts((p) => ({ ...p, [qId]: otherValue.trim() }));
    const na = { ...p2Answers, [qId]: "other" }; setP2Answers(na);
    setShowOtherInput(false); setOtherValue("");
    setTimeout(() => {
      if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1);
      else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); }
    }, 350);
  };

  // ── Phase 2 Write-in handlers
  const currentWriteIn = phase === "phase2writein" ? PHASE2_WRITEIN_QUESTIONS[step] : null;

  const handleWriteInNext = () => {
    if (writeInValue.trim()) {
      setWriteInAnswers((p) => ({ ...p, [currentWriteIn.id]: writeInValue.trim() }));
    }
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) {
      setStep(step + 1); setWriteInValue("");
    } else {
      setP2Result(getPhase2Result(p2Answers));
      setPhase("final");
    }
  };

  const handleWriteInSkip = () => {
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) {
      setStep(step + 1); setWriteInValue("");
    } else {
      setP2Result(getPhase2Result(p2Answers));
      setPhase("final");
    }
  };

  // ── Navigation
  const goBack = () => {
    if (step > 0) { setSelected(null); setShowOtherInput(false); setOtherValue(""); setWriteInValue(""); setStep(step - 1); }
  };

  const restart = () => {
    setPhase("intro"); setStep(0);
    setP1Answers({}); setP2Answers({}); setOtherTexts({}); setWriteInAnswers({});
    setP1Result(null); setP2Result(null); setSelected(null);
    setLeadName(""); setLeadEmail(""); setLeadPhone("");
    setLeadSubmitted(false); setShowOtherInput(false); setOtherValue(""); setWriteInValue("");
  };

  const startPhase2 = () => { setStep(0); setPhase("phase2intro"); };
  const beginPhase2 = () => { setStep(0); setShowOtherInput(false); setOtherValue(""); setPhase("phase2mc"); };

  // ── Lead submit
  const handleLeadSubmit = () => {
    if (!leadEmail.trim()) return;
    setLeadSubmitting(true);
    submitToSheets({
      name: leadName.trim(), email: leadEmail.trim(), phone: leadPhone.trim(),
      complexityScore: p1Result?.totalScore || null,
      engagementModel: p1Result?.need === "yes" ? p1Result.modelTitle : "No CoS needed",
      archetype: p2Result ? COS_TYPES[p2Result.primary]?.title : null,
      secondaryArchetype: p2Result?.secondary ? COS_TYPES[p2Result.secondary]?.title : null,
      dayOne: writeInAnswers.day_one || "",
      dayThirty: writeInAnswers.day_thirty || "",
      answers: { phase1: p1Answers, phase2: p2Answers, otherResponses: otherTexts, writeIns: writeInAnswers },
    });
    setLeadSubmitted(true); setLeadSubmitting(false);
  };

  const finalType = p2Result ? COS_TYPES[p2Result.primary] : null;
  const secondaryType = p2Result?.secondary ? COS_TYPES[p2Result.secondary] : null;

  // Total phase 2 steps for progress bar
  const totalP2Steps = PHASE2_MC_QUESTIONS.length + PHASE2_WRITEIN_QUESTIONS.length;
  const currentP2Step = phase === "phase2mc" ? step : phase === "phase2writein" ? PHASE2_MC_QUESTIONS.length + step : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5", fontFamily: "'Newsreader', 'Georgia', serif", color: "#1a1a1a", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fade-enter { opacity: 0; transform: translateY(12px); }
        .fade-active { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease, transform 0.5s ease; }
        .option-btn { width: 100%; text-align: left; padding: 18px 24px; background: transparent; border: 1.5px solid #d4d0ca; border-radius: 4px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 400; color: #1a1a1a; transition: all 0.2s ease; display: flex; align-items: center; gap: 16px; letter-spacing: 0.01em; }
        .option-btn:hover { border-color: #1a1a1a; background: #f0ede8; }
        .option-btn.selected { border-color: #1a1a1a; background: #1a1a1a; color: #faf8f5; }
        .option-btn.other-active { border-color: #1a1a1a; background: #f7f5f2; }
        .progress-segment { height: 2px; background: #d4d0ca; flex: 1; border-radius: 1px; transition: background 0.4s ease; }
        .progress-segment.filled { background: #1a1a1a; }
        .back-btn { background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; color: #999; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 0; transition: color 0.2s; }
        .back-btn:hover { color: #1a1a1a; }
        .primary-btn { background: #1a1a1a; color: #faf8f5; border: none; padding: 16px 48px; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.25s ease; border-radius: 2px; }
        .primary-btn:hover { background: #333; transform: translateY(-1px); }
        .primary-btn:disabled { background: #ccc; cursor: default; transform: none; }
        .secondary-btn { background: none; border: 1.5px solid #d4d0ca; padding: 12px 32px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; color: #666; transition: all 0.2s; border-radius: 2px; }
        .secondary-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .result-tag { display: inline-block; padding: 6px 14px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 2px; color: white; }
        .trait-item { padding: 10px 0; border-bottom: 1px solid #eae7e2; font-family: 'DM Mono', monospace; font-size: 13px; color: #444; display: flex; align-items: baseline; gap: 12px; line-height: 1.5; }
        .section-label { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; margin-bottom: 16px; }
        .divider { display: flex; align-items: center; gap: 16px; margin: 40px 0; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #ccc; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e4e0da; }
        .signal-row { padding: 8px 0; font-family: 'DM Mono', monospace; font-size: 12px; color: #555; display: flex; align-items: baseline; gap: 10px; line-height: 1.5; }
        .model-card { border: 2px solid; border-radius: 6px; padding: 28px; position: relative; overflow: hidden; }
        .cta-box { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 6px; padding: 32px; color: #faf8f5; position: relative; overflow: hidden; }
        .cta-box::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.04) 0%, transparent 60%); pointer-events: none; }
        .cta-btn { display: inline-block; background: #faf8f5; color: #1a1a1a; border: none; padding: 14px 36px; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.25s ease; border-radius: 3px; text-decoration: none; font-weight: 500; }
        .cta-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .interview-q { padding: 14px 18px; background: #f7f5f2; border-left: 3px solid; margin-bottom: 8px; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.6; color: #444; font-style: italic; font-weight: 300; }
        .lead-input { width: 100%; padding: 14px 16px; border: 1.5px solid #d4d0ca; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 14px; background: transparent; color: #1a1a1a; outline: none; transition: border-color 0.2s; }
        .lead-input:focus { border-color: #1a1a1a; }
        .lead-input::placeholder { color: #bbb; }
        .other-input { width: 100%; padding: 14px 16px; border: 1.5px solid #1a1a1a; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 14px; background: #faf8f5; color: #1a1a1a; outline: none; margin-top: 8px; }
        .other-input::placeholder { color: #bbb; }
        .other-submit { margin-top: 8px; padding: 10px 24px; background: #1a1a1a; color: #faf8f5; border: none; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .other-submit:hover { background: #333; }
        .other-submit:disabled { background: #ccc; cursor: default; }
        .success-card { border: 2px solid #4a7c6f; border-radius: 6px; padding: 28px; text-align: center; background: linear-gradient(135deg, #f5faf7 0%, #faf8f5 100%); }
        .writein-textarea { width: 100%; min-height: 140px; padding: 18px; border: 1.5px solid #d4d0ca; border-radius: 6px; font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.7; background: transparent; color: #1a1a1a; outline: none; transition: border-color 0.2s; resize: vertical; font-weight: 300; }
        .writein-textarea:focus { border-color: #1a1a1a; }
        .writein-textarea::placeholder { color: #c0bdb8; font-style: italic; }
        .skip-btn { background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; color: #bbb; letter-spacing: 0.05em; transition: color 0.2s; padding: 8px 0; }
        .skip-btn:hover { color: #888; }
      `}</style>

      {/* Corner marks */}
      <div style={{ position: "fixed", top: 24, left: 24, width: 20, height: 20, borderTop: "1.5px solid #d4d0ca", borderLeft: "1.5px solid #d4d0ca", zIndex: 10 }} />
      <div style={{ position: "fixed", top: 24, right: 24, width: 20, height: 20, borderTop: "1.5px solid #d4d0ca", borderRight: "1.5px solid #d4d0ca", zIndex: 10 }} />
      <div style={{ position: "fixed", bottom: 24, left: 24, width: 20, height: 20, borderBottom: "1.5px solid #d4d0ca", borderLeft: "1.5px solid #d4d0ca", zIndex: 10 }} />
      <div style={{ position: "fixed", bottom: 24, right: 24, width: 20, height: 20, borderBottom: "1.5px solid #d4d0ca", borderRight: "1.5px solid #d4d0ca", zIndex: 10 }} />

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "60px 32px", minHeight: "100vh" }}>

        {/* ═══════ INTRO ═══════ */}
        {phase === "intro" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", marginBottom: 32 }}>Assessment Tool</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.01em" }}>
              Do You Need a<br /><em style={{ fontWeight: 500 }}>Chief of Staff?</em>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#666", maxWidth: 440, margin: "0 auto 20px", fontWeight: 300 }}>
              A two-part assessment. First we'll figure out if you need one and how to engage them. Then we'll pinpoint exactly what kind.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#aaa", maxWidth: 380, margin: "0 auto 48px", fontFamily: "'DM Mono', monospace" }}>
              Part 1 → Need + Engagement Model<br />Part 2 → Archetype + Hiring Blueprint
            </p>
            <button className="primary-btn" onClick={() => { setStep(0); setPhase("phase1"); }}>Begin Assessment</button>
            <div style={{ marginTop: 32, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#bbb" }}>Takes about 4 minutes</div>
          </div>
        )}

        {/* ═══════ PHASE 1 QUESTIONS ═══════ */}
        {phase === "phase1" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", marginBottom: 24 }}>Part 1 — Do You Need One?</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 48 }}>
              {PHASE1_QUESTIONS.map((_, i) => <div key={i} className={`progress-segment ${i <= step ? "filled" : ""}`} />)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Question {step + 1} of {PHASE1_QUESTIONS.length}</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{PHASE1_QUESTIONS[step].question}</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 36, fontWeight: 300, fontStyle: "italic" }}>{PHASE1_QUESTIONS[step].subtext}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PHASE1_QUESTIONS[step].options.map((opt) => (
                <button key={opt.label} className={`option-btn ${selected === opt.value ? "selected" : ""}`} onClick={() => handleP1Select(PHASE1_QUESTIONS[step].id, opt.value)}>
                  <span style={{ opacity: 0.4, fontSize: 12, minWidth: 48 }}>{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
            {step > 0 && <div style={{ marginTop: 32 }}><button className="back-btn" onClick={goBack}>← Back</button></div>}
          </div>
        )}

        {/* ═══════ PHASE 1 RESULT ═══════ */}
        {phase === "phase1result" && p1Result && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            {p1Result.need === "none" ? (
              <>
                <div style={{ marginBottom: 24 }}><span className="result-tag" style={{ background: "#4a7c6f" }}>Part 1 Result</span></div>
                <h2 style={{ fontSize: "clamp(28px, 4.5vw, 40px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>You Probably Don't Need One Yet</h2>
                <p style={{ fontSize: 18, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 32 }}>But keep this bookmarked.</p>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 40, fontWeight: 300 }}>
                  Based on your answers, your current operating model can handle the complexity you're facing. A Chief of Staff makes sense when organizational friction significantly outpaces your ability to manage it yourself.
                </p>
                <div style={{ marginBottom: 40 }}>
                  <div className="section-label">Why we think this</div>
                  {["Your direct report count is manageable", "You still have strategic thinking time", "Cross-functional work is mostly on track", "You're not yet the primary bottleneck"].map((s, i) => (
                    <div key={i} className="trait-item"><span style={{ color: "#4a7c6f", fontSize: 16 }}>→</span> {s}</div>
                  ))}
                </div>
                <div style={{ padding: 20, background: "#f0ede8", borderRadius: 4, marginBottom: 40 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Consider instead</div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                    A strong Executive Assistant or senior Program Manager might be a better fit right now. If things shift in 6 months, come back and retake this.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="secondary-btn" onClick={restart}>Retake Assessment</button>
                  <button className="primary-btn" onClick={startPhase2} style={{ fontSize: 12 }}>I still want to explore types →</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}><span className="result-tag" style={{ background: "#1a1a1a" }}>Part 1 Result</span></div>
                <h2 style={{ fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>Yes, you need a Chief of Staff.</h2>
                <p style={{ fontSize: 17, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 32, lineHeight: 1.5 }}>
                  Your complexity score is {p1Result.totalScore}/28. That's well above the threshold.
                </p>
                <div className="model-card" style={{ borderColor: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f", background: p1Result.model === "fractional" ? "linear-gradient(135deg, #f7f9fb 0%, #faf8f5 100%)" : "linear-gradient(135deg, #f5faf7 0%, #faf8f5 100%)", marginBottom: 32 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f" }} />
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f", marginBottom: 12, fontWeight: 500 }}>Engagement Model</div>
                  <h3 style={{ fontSize: 24, fontWeight: 400, marginBottom: 6 }}>{p1Result.modelTitle}</h3>
                  <p style={{ fontSize: 15, color: "#666", fontWeight: 300, fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>{p1Result.modelSubtitle}</p>
                  <div className="section-label" style={{ marginBottom: 10 }}>Why this model</div>
                  {p1Result.signals.map((s, i) => <div key={i} className="signal-row"><span style={{ color: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f" }}>✓</span> {s}</div>)}
                  {p1Result.counterSignals.length > 0 && (
                    <>
                      <div className="section-label" style={{ marginBottom: 10, marginTop: 20 }}>{p1Result.model === "fractional" ? "Signals that could shift to full-time" : "Signals that could work fractional"}</div>
                      {p1Result.counterSignals.map((s, i) => <div key={i} className="signal-row" style={{ color: "#999" }}><span>○</span> {s}</div>)}
                    </>
                  )}
                </div>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 16, color: "#666", marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>Now let's figure out exactly <em>what kind</em> of Chief of Staff you need.</p>
                  <button className="primary-btn" onClick={startPhase2}>Continue to Part 2 →</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════ PHASE 2 INTRO ═══════ */}
        {phase === "phase2intro" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2c5f8a", marginBottom: 32 }}>Part 2</div>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20 }}>What Kind of<br /><em style={{ fontWeight: 500 }}>Chief of Staff?</em></h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#666", maxWidth: 420, margin: "0 auto 48px", fontWeight: 300 }}>
              Seven questions — five quick picks and two short write-ins — to identify your ideal archetype and build a detailed hiring blueprint.
            </p>
            <button className="primary-btn" onClick={beginPhase2}>Let's Go</button>
          </div>
        )}

        {/* ═══════ PHASE 2 MC QUESTIONS ═══════ */}
        {phase === "phase2mc" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2c5f8a", marginBottom: 24 }}>Part 2 — What Kind?</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 48 }}>
              {Array.from({ length: totalP2Steps }).map((_, i) => <div key={i} className={`progress-segment ${i <= currentP2Step ? "filled" : ""}`} />)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Question {currentP2Step + 1} of {totalP2Steps}</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{PHASE2_MC_QUESTIONS[step].question}</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 36, fontWeight: 300, fontStyle: "italic" }}>{PHASE2_MC_QUESTIONS[step].subtext}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PHASE2_MC_QUESTIONS[step].options.map((opt) => (
                <button key={opt.label} className={`option-btn ${selected === opt.value ? "selected" : ""}`} onClick={() => handleP2MCSelect(PHASE2_MC_QUESTIONS[step].id, opt.value)}>
                  <span style={{ opacity: 0.4, fontSize: 12, minWidth: 48 }}>{opt.icon}</span>{opt.label}
                </button>
              ))}
              {PHASE2_MC_QUESTIONS[step].otherPrompt && (
                <>
                  <button className={`option-btn ${showOtherInput ? "other-active" : ""}`} onClick={handleOtherClick}>
                    <span style={{ opacity: 0.4, fontSize: 12, minWidth: 48 }}>✎</span>{PHASE2_MC_QUESTIONS[step].otherPrompt}
                  </button>
                  {showOtherInput && (
                    <div style={{ marginTop: 4 }}>
                      <input className="other-input" type="text" placeholder="Tell us more…" value={otherValue} onChange={(e) => setOtherValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id); }} autoFocus maxLength={200} />
                      <button className="other-submit" onClick={() => handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id)} disabled={!otherValue.trim()}>Submit →</button>
                    </div>
                  )}
                </>
              )}
            </div>
            {step > 0 && <div style={{ marginTop: 32 }}><button className="back-btn" onClick={goBack}>← Back</button></div>}
          </div>
        )}

        {/* ═══════ PHASE 2 WRITE-IN QUESTIONS ═══════ */}
        {phase === "phase2writein" && currentWriteIn && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2c5f8a", marginBottom: 24 }}>Part 2 — Your Priorities</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 48 }}>
              {Array.from({ length: totalP2Steps }).map((_, i) => <div key={i} className={`progress-segment ${i <= currentP2Step ? "filled" : ""}`} />)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Question {currentP2Step + 1} of {totalP2Steps}</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{currentWriteIn.question}</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 28, fontWeight: 300, fontStyle: "italic" }}>{currentWriteIn.subtext}</p>
            <textarea
              className="writein-textarea"
              placeholder={currentWriteIn.placeholder}
              value={writeInValue}
              onChange={(e) => setWriteInValue(e.target.value)}
              maxLength={500}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {step > 0 && <button className="back-btn" onClick={goBack}>← Back</button>}
                <button className="skip-btn" onClick={handleWriteInSkip}>Skip this question →</button>
              </div>
              <button className="primary-btn" style={{ padding: "12px 32px", fontSize: 12 }} onClick={handleWriteInNext} disabled={!writeInValue.trim()}>
                {step + 1 < PHASE2_WRITEIN_QUESTIONS.length ? "Next →" : "See Results →"}
              </button>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#ccc", marginTop: 12, textAlign: "right" }}>
              {writeInValue.length}/500
            </div>
          </div>
        )}

        {/* ═══════ FINAL RESULT ═══════ */}
        {phase === "final" && finalType && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            <div style={{ marginBottom: 8 }}><span className="result-tag" style={{ background: finalType.color }}>{finalType.icon} Your Archetype</span></div>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>{finalType.title}</h2>
            <p style={{ fontSize: 19, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 32 }}>{finalType.tagline}</p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 40, fontWeight: 300 }}>{finalType.description}</p>

            <div style={{ marginBottom: 40 }}>
              <div className="section-label">What this person does</div>
              {finalType.whatTheyDo.map((item, i) => <div key={i} className="trait-item"><span style={{ color: finalType.color, fontSize: 14 }}>◆</span> {item}</div>)}
            </div>

            <div style={{ marginBottom: 40 }}>
              <div className="section-label">What to look for</div>
              {finalType.whatToLookFor.map((item, i) => <div key={i} className="trait-item"><span style={{ color: finalType.color, fontSize: 16 }}>→</span> {item}</div>)}
            </div>

            <div style={{ marginBottom: 40 }}>
              <div className="section-label">Interview questions to ask</div>
              {finalType.interviewQs.map((q, i) => <div key={i} className="interview-q" style={{ borderLeftColor: finalType.color }}>{q}</div>)}
            </div>

            <div style={{ marginBottom: 40 }}>
              <div className="section-label">Typical compensation range</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, padding: 20, background: "#f7f5f2", borderRadius: 4 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Full-Time</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500 }}>{finalType.compRange.ft}</div>
                </div>
                <div style={{ flex: 1, minWidth: 200, padding: 20, background: "#f7f5f2", borderRadius: 4 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Fractional</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500 }}>{finalType.compRange.frac}</div>
                </div>
              </div>
            </div>

            {secondaryType && (
              <div style={{ padding: 20, background: secondaryType.accent, borderRadius: 4, borderLeft: `3px solid ${secondaryType.color}`, marginBottom: 40 }}>
                <div className="section-label" style={{ color: secondaryType.color, marginBottom: 8 }}>Secondary signal: {secondaryType.title}</div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                  Your answers also showed strong signals for a {secondaryType.title.toLowerCase()}. The ideal candidate might blend both — someone who leads with {p2Result.primary} skills but can flex into {p2Result.secondary} work when needed.
                </p>
              </div>
            )}

            {p1Result?.need === "yes" && <div className="divider">{p1Result.modelTitle}</div>}

            {/* ── LEAD CAPTURE ── */}
            <div className="divider">Stay Connected</div>
            {!leadSubmitted ? (
              <div style={{ border: "1.5px solid #d4d0ca", borderRadius: 6, padding: 32, marginBottom: 40, background: "linear-gradient(135deg, #fdfcfa 0%, #f7f5f2 100%)" }}>
                <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>
                  Want help finding your {finalType.title.split(" ").slice(0, -1).join(" ").toLowerCase()} CoS?
                </h3>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>
                  Leave your info and I'll send you a tailored job description template and — if you're going fractional — connect you with vetted candidates who match your profile.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <input className="lead-input" type="text" placeholder="Your name" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
                  <input className="lead-input" type="email" placeholder="Email address *" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
                  <input className="lead-input" type="tel" placeholder="Phone (optional)" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
                </div>
                <button className="primary-btn" style={{ width: "100%" }} onClick={handleLeadSubmit} disabled={!leadEmail.trim() || leadSubmitting}>
                  {leadSubmitting ? "Sending…" : "Get My Blueprint →"}
                </button>
                <p style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Mono', monospace", marginTop: 12, textAlign: "center" }}>
                  No spam. Just your results and a personalized follow-up.
                </p>
              </div>
            ) : (
              <div className="success-card" style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
                <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>You're in.</h3>
                <p style={{ fontSize: 14, color: "#666", fontWeight: 300, lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
                  I'll send your tailored {finalType.title.toLowerCase()} blueprint to <strong>{leadEmail}</strong> shortly.
                  {p1Result?.model === "fractional" && " I'll also reach out about fractional matches."}
                </p>
              </div>
            )}

            <div style={{ borderTop: "1px solid #eae7e2", paddingTop: 32, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button className="secondary-btn" onClick={restart}>Start Over</button>
              <button className="secondary-btn" onClick={() => { setStep(0); setP2Answers({}); setOtherTexts({}); setWriteInAnswers({}); setP2Result(null); setWriteInValue(""); setPhase("phase2intro"); }}>Retake Part 2</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, textAlign: "center", padding: "12px 0", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#ccc", background: "linear-gradient(transparent, #faf8f5)", pointerEvents: "none", zIndex: 5 }}>
        CHIEF OF STAFF ASSESSMENT
      </div>
    </div>
  );
}
