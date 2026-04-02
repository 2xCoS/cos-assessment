import { useState, useEffect } from "react";

const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzo_2fc4r1dMBJp4EE-cgKPVAHvT9KgaawXEGGQ1MVrTT8DX1u3Hy0_eRYhUXyvXyENiQ/exec";
const LINKEDIN_URL = "https://www.linkedin.com/in/elliott-fisher-cos/";

const PHASE1_QUESTIONS = [
  { id: "reports", question: "How many people report directly to you?", subtext: "Include anyone who has a recurring 1:1 with you", options: [{ label: "1\u20134", value: 1, icon: "\u25CB" },{ label: "5\u20138", value: 2, icon: "\u25CB\u25CB" },{ label: "9\u201312", value: 3, icon: "\u25CB\u25CB\u25CB" },{ label: "13+", value: 4, icon: "\u25CB\u25CB\u25CB\u25CB" }] },
  { id: "bottleneck", question: "How often are you the bottleneck on decisions?", subtext: "Things that can\u2019t move forward without your input", options: [{ label: "Rarely", value: 1, icon: "\u25C7" },{ label: "Sometimes", value: 2, icon: "\u25C7\u25C7" },{ label: "Often", value: 3, icon: "\u25C7\u25C7\u25C7" },{ label: "Constantly", value: 4, icon: "\u25C7\u25C7\u25C7\u25C7" }] },
  { id: "strategic", question: "What percentage of your week is spent on strategic work?", subtext: "Long-term planning, vision, high-leverage thinking", options: [{ label: "60%+", value: 1, icon: "\u25B2" },{ label: "40\u201360%", value: 2, icon: "\u25B2\u25B2" },{ label: "20\u201340%", value: 3, icon: "\u25B2\u25B2\u25B2" },{ label: "Under 20%", value: 4, icon: "\u25B2\u25B2\u25B2\u25B2" }] },
  { id: "meetings", question: "How many hours per week are you in meetings?", subtext: "All meetings \u2014 1:1s, team syncs, external calls", options: [{ label: "Under 15", value: 1, icon: "\u25A1" },{ label: "15\u201325", value: 2, icon: "\u25A1\u25A1" },{ label: "25\u201335", value: 3, icon: "\u25A1\u25A1\u25A1" },{ label: "35+", value: 4, icon: "\u25A1\u25A1\u25A1\u25A1" }] },
  { id: "crossfunc", question: "How often do cross-functional initiatives stall or misalign?", subtext: "Projects that span multiple teams or departments", options: [{ label: "Rarely", value: 1, icon: "\u25B3" },{ label: "Occasionally", value: 2, icon: "\u25B3\u25B3" },{ label: "Frequently", value: 3, icon: "\u25B3\u25B3\u25B3" },{ label: "It's chaos", value: 4, icon: "\u25B3\u25B3\u25B3\u25B3" }] },
  { id: "delegate", question: "Is there someone who can represent you in a room?", subtext: "Someone who knows your thinking well enough to act on your behalf", options: [{ label: "Yes, reliably", value: 1, icon: "\u25CF" },{ label: "Sort of", value: 2, icon: "\u25CF\u25CB" },{ label: "Not really", value: 3, icon: "\u25CB\u25CF" },{ label: "Absolutely not", value: 4, icon: "\u25CB" }] },
  { id: "stage", question: "What stage is your organization?", subtext: "Roughly \u2014 where things feel right now", options: [{ label: "Early (under 50)", value: 1, icon: "\u22A1" },{ label: "Growth (50\u2013200)", value: 2, icon: "\u22A1\u22A1" },{ label: "Scale (200\u20131000)", value: 3, icon: "\u22A1\u22A1\u22A1" },{ label: "Enterprise (1000+)", value: 4, icon: "\u22A1\u22A1\u22A1\u22A1" }] },
  { id: "duration", question: "How long do you anticipate needing this support?", subtext: "Think about whether this is a season or a permanent shift", options: [{ label: "A specific initiative (3\u20136 months)", value: "project", icon: "\u29D6" },{ label: "A transition period (6\u201312 months)", value: "transition", icon: "\u29D7" },{ label: "Ongoing, but not ready for a full hire", value: "fractional", icon: "\u25D0" },{ label: "Permanently \u2014 this is a core role", value: "permanent", icon: "\u25CF" }] },
  { id: "budget", question: "What's your realistic budget for this role?", subtext: "Be honest \u2014 it shapes the recommendation", options: [{ label: "Under $80K / year", value: "low", icon: "$" },{ label: "$80K\u2013$150K / year", value: "mid", icon: "$$" },{ label: "$150K\u2013$250K / year", value: "high", icon: "$$$" },{ label: "$250K+ / year", value: "top", icon: "$$$$" }] },
];

const PHASE2_MC_QUESTIONS = [
  { id: "pain", question: "What keeps you up at night?", subtext: "The thing that would change everything if it were solved", options: [{ label: "We don't have a clear long-term plan", value: "strategic", icon: "\uD83E\uDDED" },{ label: "Execution is broken \u2014 things fall through cracks", value: "operational", icon: "\u2699\uFE0F" },{ label: "Key relationships aren't being managed well", value: "external", icon: "\uD83E\uDD1D" },{ label: "We're growing faster than our systems can handle", value: "growth", icon: "\uD83D\uDCC8" }], otherPrompt: "Something else keeps me up\u2026" },
  { id: "delegate_first", question: "If you could hand off one thing tomorrow, what would it be?", subtext: "The first thing you'd take off your plate", options: [{ label: "Board prep, investor updates, strategic projects", value: "strategic", icon: "\u25C7" },{ label: "Team cadences, OKRs, internal processes", value: "operational", icon: "\u25A1" },{ label: "Partner calls, external comms, stakeholder meetings", value: "external", icon: "\u25B3" },{ label: "Org design, new team standup, change management", value: "growth", icon: "\u25CB" }], otherPrompt: "Something else entirely\u2026" },
  { id: "missed_meeting", question: "What's the most important meeting you're missing or underprepared for?", subtext: "Where your absence or distraction costs the most", options: [{ label: "Board meetings and investor check-ins", value: "external", icon: "\u25C6" },{ label: "Quarterly planning and strategy sessions", value: "strategic", icon: "\u25C6" },{ label: "Leadership team syncs and cross-functional reviews", value: "operational", icon: "\u25C6" },{ label: "All-hands, town halls, and culture moments", value: "growth", icon: "\u25C6" }], otherPrompt: "A different meeting\u2026" },
  { id: "failure_mode", question: "When things go wrong, it's usually because\u2026", subtext: "The pattern you keep seeing", options: [{ label: "We reacted instead of planned", value: "strategic", icon: "\u2192" },{ label: "Nobody owned the follow-through", value: "operational", icon: "\u2192" },{ label: "A key stakeholder was surprised or misaligned", value: "external", icon: "\u2192" },{ label: "We outgrew the process before we replaced it", value: "growth", icon: "\u2192" }], otherPrompt: "A different pattern\u2026" },
  { id: "superpower", question: "What superpower matters most in this person?", subtext: "The non-negotiable capability", options: [{ label: "Thinks three moves ahead", value: "strategic", icon: "\u2726" },{ label: "Makes the trains run on time", value: "operational", icon: "\u2726" },{ label: "Commands a room on my behalf", value: "external", icon: "\u2726" },{ label: "Thrives in chaos and builds while running", value: "growth", icon: "\u2726" }], otherPrompt: "A different superpower\u2026" },
];

const PHASE2_WRITEIN_QUESTIONS = [
  { id: "day_one", question: "If your Chief of Staff started today, what would you hand them first?", subtext: "The most urgent thing on your plate \u2014 the thing you'd brief them on in the first hour", placeholder: "e.g. \"I need someone to take over our quarterly planning process \u2014 it's a mess and the exec team is losing confidence in our ability to ship on time.\"" },
  { id: "day_thirty", question: "What about 30 days from now \u2014 what should they own by then?", subtext: "Think about what 'settled in and delivering' looks like after a month", placeholder: "e.g. \"By day 30 I'd want them running the weekly leadership sync, owning the OKR dashboard, and preparing a board deck draft without my input.\"" },
];

const COS_TYPES = {
  strategic: {
    title: "Strategic Chief of Staff", tagline: "Your thinking partner. Your second brain.", color: "#2c5f8a", accent: "#e8f0f7", icon: "\uD83E\uDDED",
    description: "You need someone who can operate at altitude \u2014 synthesizing complex information, running high-stakes projects, and ensuring the organization's long-term direction stays sharp while you handle the day-to-day demands of leadership.",
    whatTheyDo: ["Own annual and quarterly planning end-to-end","Run special strategic projects from scoping to execution","Prepare board materials, investor decks, and executive communications","Conduct competitive analysis and market positioning work","Serve as a sounding board for your biggest decisions","Drive M&A diligence and integration planning"],
    whatToLookFor: ["Former management consultant, strategy, or biz ops background","Exceptional analytical and synthesis skills","Comfortable with ambiguity \u2014 can structure the unstructured","Strong written communication (they'll draft in your voice)","High trust threshold \u2014 you'd share your real concerns with them"],
    interviewQs: ["Walk me through a time you had to synthesize a complex problem into a clear recommendation for a senior leader.","How would you approach building our 3-year strategic plan from scratch?","Tell me about a decision you influenced without having direct authority."],
    compRange: { ft: "$140K\u2013$250K+", frac: "$8K\u2013$18K/mo" },
    bestFor: "Leaders drowning in complexity who need someone to think alongside them. Common in companies navigating fundraising, M&A, or major strategic pivots.",
  },
  operational: {
    title: "Operational Chief of Staff", tagline: "The machine that makes your machine work.", color: "#8b6914", accent: "#faf5e8", icon: "\u2699\uFE0F",
    description: "Your organization's biggest gap is between decisions and execution. You need someone who can build the operating system \u2014 the cadences, rituals, tracking mechanisms, and accountability structures that turn leadership intent into organizational action.",
    whatTheyDo: ["Design and run the leadership team operating cadence","Own OKR/goal setting, tracking, and accountability","Project-manage cross-functional initiatives","Build internal communications rhythm and templates","Run organizational health checks and team diagnostics","Ensure decisions actually translate into shipped outcomes"],
    whatToLookFor: ["Operations, program management, or COO-track background","Systems thinker who can see both forest and trees","Obsessive about follow-through and closing loops","Process designer \u2014 not just process follower","Diplomatic enough to hold people accountable without creating friction"],
    interviewQs: ["Describe a time you built an operating cadence or process from scratch. What worked and what didn't?","How do you hold a leadership team accountable to commitments without being seen as a taskmaster?","Walk me through how you'd diagnose why cross-functional projects keep stalling here."],
    compRange: { ft: "$120K\u2013$200K+", frac: "$7K\u2013$15K/mo" },
    bestFor: "Organizations where great ideas keep dying in execution. Things get decided but never shipped. Teams are busy but misaligned.",
  },
  external: {
    title: "External-Facing Chief of Staff", tagline: "Your voice in every room you can't be in.", color: "#6b3a6b", accent: "#f5edf5", icon: "\uD83E\uDD1D",
    description: "Your primary need is someone who can represent you with the people who matter most \u2014 the board, investors, key partners, regulators, and other external stakeholders. This person needs executive presence, political savvy, and your deep trust.",
    whatTheyDo: ["Manage board relationships and prep for board meetings","Own investor communications and reporting cadence","Serve as executive liaison with key partners and clients","Draft high-stakes communications in your voice","Manage government, regulatory, or industry relationships","Represent you at external events and in partner negotiations"],
    whatToLookFor: ["Strong executive presence \u2014 you'd trust them in front of your board","Exceptional communicator (written and verbal)","Natural relationship builder with high EQ","Politically savvy \u2014 reads the room and plays the long game","Discretion and judgment under pressure"],
    interviewQs: ["Tell me about a time you represented a senior leader in a high-stakes external meeting. What was your approach?","How do you build trust with a board member or key stakeholder who's skeptical?","Describe a situation where you had to deliver difficult news to an external partner."],
    compRange: { ft: "$150K\u2013$250K+", frac: "$10K\u2013$20K/mo" },
    bestFor: "CEOs who are spread too thin across board, investor, and partner obligations. Common in companies with complex stakeholder landscapes or heavy regulatory environments.",
  },
  growth: {
    title: "Transformation Chief of Staff", tagline: "A scaling architect for what comes next.", color: "#c4532b", accent: "#fdf0ec", icon: "\uD83D\uDCC8",
    description: "Your organization is changing faster than your operating model can keep up. You need someone who can redesign how you work while the plane is in flight \u2014 standing up new teams, codifying culture, integrating acquisitions, and building the next version of your company without breaking the current one.",
    whatTheyDo: ["Lead organizational restructuring and team design","Stand up new functions, teams, or business units","Manage acquisition integration or major business transitions","Codify and protect culture during rapid scaling","Build and iterate on processes that can evolve with the org","Run change management for major internal shifts"],
    whatToLookFor: ["High-growth startup or transformation experience","Change management instincts \u2014 not just frameworks","Comfortable building and tearing down processes fast","Can operate with incomplete information and shifting priorities","Energized (not drained) by ambiguity and speed"],
    interviewQs: ["Tell me about a time you had to redesign an organization while it was still operating. How did you manage the transition?","How do you decide what to systematize vs. what to keep scrappy?","Describe a situation where you had to preserve team culture through a major change."],
    compRange: { ft: "$130K\u2013$220K+", frac: "$8K\u2013$16K/mo" },
    bestFor: "Companies doubling headcount, integrating acquisitions, or navigating a fundamental shift in business model. The org chart is changing faster than the culture can keep up.",
  },
};

function getPhase1Result(answers) {
  const ids = ["reports","bottleneck","strategic","meetings","crossfunc","delegate","stage"];
  const totalScore = ids.reduce((s, id) => s + (answers[id] || 0), 0);
  const duration = answers["duration"], budget = answers["budget"], stage = answers["stage"] || 0;
  if (totalScore <= 12) return { need: "none", totalScore };
  const f = [], ft = [];
  if (duration === "project") f.push("You're solving for a specific initiative, not an ongoing gap");
  if (duration === "transition") f.push("You need this through a transition \u2014 fractional gives flexibility to reassess");
  if (duration === "fractional") f.push("You already sense this doesn't need to be full-time");
  if (duration === "permanent") ft.push("You see this as a permanent, core role on your team");
  if (budget === "low") f.push("Your budget is better suited to fractional \u2014 senior talent part-time vs. junior talent full-time");
  if (budget === "mid" && stage <= 2) f.push("At your stage and budget, fractional gives you more experienced talent");
  if (budget === "mid" && stage >= 3) ft.push("Your budget supports a full-time hire at your org's scale");
  if (budget === "high" || budget === "top") ft.push("Your budget supports a strong full-time hire");
  if (stage <= 1) f.push("Early-stage orgs often benefit more from fractional \u2014 needs shift fast");
  if (stage >= 3 && totalScore >= 22) ft.push("At your scale and complexity, you need someone embedded full-time");
  if (totalScore <= 18) f.push("Your complexity score suggests part-time support could close the gap");
  if (totalScore >= 23) ft.push("Your organizational complexity calls for a dedicated, full-time presence");
  const isFrac = f.length > ft.length, isDef = Math.abs(f.length - ft.length) >= 2;
  return { need: "yes", totalScore, model: isFrac ? "fractional" : "fulltime", strength: isDef ? "strong" : "lean",
    modelTitle: isFrac ? (isDef ? "Fractional Chief of Staff" : "Likely Fractional") : (isDef ? "Full-Time Chief of Staff" : "Likely Full-Time"),
    modelSubtitle: isFrac ? (isDef ? "You don't need someone five days a week \u2014 you need the right person two or three days a week." : "The signals lean fractional, though full-time could work too.") : (isDef ? "You need someone fully embedded in your operating rhythm." : "The signals lean full-time, though you could start fractional and convert."),
    signals: isFrac ? f : ft, counterSignals: isFrac ? ft : f,
  };
}

function getPhase2Result(answers) {
  const tally = { strategic: 0, operational: 0, external: 0, growth: 0 };
  PHASE2_MC_QUESTIONS.forEach((q) => { const v = answers[q.id]; if (v && tally[v] !== undefined) tally[v]++; });
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], secondary: sorted[1][1] > 0 ? sorted[1][0] : null, tally };
}

function submitToSheets(payload) {
  try {
    var url = GOOGLE_SHEETS_WEBHOOK_URL + "?payload=" + encodeURIComponent(JSON.stringify(payload));
    var img = new Image();
    img.src = url;
    return true;
  } catch (err) { console.error("Sheet error:", err); return false; }
}

export default function ChiefOfStaffAssessment() {
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
  const [writeInValue, setWriteInValue] = useState("");
  const [prevPhase, setPrevPhase] = useState(null);
  const [expandedArchetypes, setExpandedArchetypes] = useState({});

  useEffect(() => { setFadeIn(false); const t = setTimeout(() => setFadeIn(true), 30); return () => clearTimeout(t); }, [phase, step]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [phase]);

  const handleP1Select = (qId, value) => {
    setSelected(value);
    const na = { ...p1Answers, [qId]: value }; setP1Answers(na);
    setTimeout(() => { setSelected(null); if (step + 1 < PHASE1_QUESTIONS.length) setStep(step + 1); else { setP1Result(getPhase1Result(na)); setPhase("phase1result"); } }, 350);
  };
  const handleP2MCSelect = (qId, value) => {
    setSelected(value); setShowOtherInput(false); setOtherValue("");
    const na = { ...p2Answers, [qId]: value }; setP2Answers(na);
    setTimeout(() => { setSelected(null); if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1); else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); } }, 350);
  };
  const handleOtherClick = () => { setShowOtherInput(true); setOtherValue(""); };
  const handleOtherSubmit = (qId) => {
    if (!otherValue.trim()) return;
    setOtherTexts((p) => ({ ...p, [qId]: otherValue.trim() }));
    const na = { ...p2Answers, [qId]: "other" }; setP2Answers(na);
    setShowOtherInput(false); setOtherValue("");
    setTimeout(() => { if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1); else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); } }, 350);
  };
  const currentWriteIn = phase === "phase2writein" ? PHASE2_WRITEIN_QUESTIONS[step] : null;
  const handleWriteInNext = () => {
    if (writeInValue.trim()) setWriteInAnswers((p) => ({ ...p, [currentWriteIn.id]: writeInValue.trim() }));
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) { setStep(step + 1); setWriteInValue(""); }
    else { setP2Result(getPhase2Result(p2Answers)); setPhase("final"); }
  };
  const handleWriteInSkip = () => {
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) { setStep(step + 1); setWriteInValue(""); }
    else { setP2Result(getPhase2Result(p2Answers)); setPhase("final"); }
  };
  const goBack = () => { if (step > 0) { setSelected(null); setShowOtherInput(false); setOtherValue(""); setWriteInValue(""); setStep(step - 1); } };
  const restart = () => {
    setPhase("intro"); setStep(0); setP1Answers({}); setP2Answers({}); setOtherTexts({}); setWriteInAnswers({});
    setP1Result(null); setP2Result(null); setSelected(null); setLeadName(""); setLeadEmail(""); setLeadPhone("");
    setLeadSubmitted(false); setShowOtherInput(false); setOtherValue(""); setWriteInValue("");
  };
  const startPhase2 = () => { setStep(0); setPhase("phase2intro"); };
  const beginPhase2 = () => { setStep(0); setShowOtherInput(false); setOtherValue(""); setPhase("phase2mc"); };
  const handleLeadSubmit = () => {
    if (!leadEmail.trim()) return;
    setLeadSubmitting(true);
    submitToSheets({ name: leadName.trim(), email: leadEmail.trim(), phone: leadPhone.trim(), complexityScore: p1Result?.totalScore || null, engagementModel: p1Result?.need === "yes" ? p1Result.modelTitle : "No CoS needed", archetype: p2Result ? COS_TYPES[p2Result.primary]?.title : null, secondaryArchetype: p2Result?.secondary ? COS_TYPES[p2Result.secondary]?.title : null, dayOne: writeInAnswers.day_one || "", dayThirty: writeInAnswers.day_thirty || "", source: "editorial", answers: { phase1: p1Answers, phase2: p2Answers, otherResponses: otherTexts, writeIns: writeInAnswers } });
    setLeadSubmitted(true); setLeadSubmitting(false);
  };
  const navigateTo = (dest) => { setPrevPhase(phase); setPhase(dest); };
  const goBackFromPage = () => { setPhase(prevPhase || "intro"); };

  const downloadResults = () => {
    if (!finalType || !p1Result) return;
    const secondary = secondaryType ? `\nSecondary Archetype: ${secondaryType.title}\nYour answers also showed strong signals for a ${secondaryType.title.toLowerCase()}. The ideal candidate might blend both.` : "";
    const dayOne = writeInAnswers.day_one ? `\nDay 1 Priority: ${writeInAnswers.day_one}` : "";
    const dayThirty = writeInAnswers.day_thirty ? `\nDay 30 Priority: ${writeInAnswers.day_thirty}` : "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Chief of Staff Assessment Results</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
body{font-family:'Newsreader',Georgia,serif;max-width:650px;margin:40px auto;padding:0 32px;color:#1a1a1a;line-height:1.7}
h1{font-size:32px;font-weight:400;margin-bottom:4px}h2{font-size:18px;font-weight:500;margin:28px 0 12px;font-family:'DM Mono',monospace;letter-spacing:0.05em;text-transform:uppercase;font-size:12px;color:#999}
.tag{display:inline-block;padding:5px 14px;background:${finalType.color};color:white;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;border-radius:2px;margin-bottom:16px}
.stat-row{display:flex;gap:16px;margin:16px 0}.stat{flex:1;padding:16px;background:#f7f5f2;border-radius:4px;text-align:center}
.stat-num{font-family:'DM Mono',monospace;font-size:22px;font-weight:500}.stat-label{font-family:'DM Mono',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px}
.item{padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#444}
.comp{display:flex;gap:16px;margin:12px 0}.comp-box{flex:1;padding:14px;background:#f7f5f2;border-radius:4px}
.comp-label{font-family:'DM Mono',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.1em}
.comp-val{font-family:'DM Mono',monospace;font-size:18px;font-weight:500;margin-top:4px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa;font-family:'DM Mono',monospace}
@media print{body{margin:20px auto}}</style></head><body>
<div class="tag">${finalType.icon} Your Archetype</div>
<h1>${finalType.title}</h1>
<p style="font-size:17px;color:#888;font-style:italic;font-weight:300">${finalType.tagline}</p>
<p style="margin-top:16px;font-size:15px;color:#444;font-weight:300">${finalType.description}</p>
<div style="padding:14px;background:#f7f5f2;border-radius:4px;border-left:3px solid ${finalType.color};margin:20px 0"><p style="font-family:'DM Mono',monospace;font-size:14px;color:#444;margin:0"><strong>Our recommendation: You need a ${p1Result.model === "fractional" ? "fractional" : "full-time"} ${finalType.title}.</strong>${p1Result.model === "fractional" ? " That means the right person 2\u20133 days a week \u2014 not a full-time hire." : " This person should be fully embedded in your team."}</p></div>
<div class="stat-row"><div class="stat"><div class="stat-num">${p1Result.totalScore}/28</div><div class="stat-label">Complexity Score</div></div><div class="stat"><div class="stat-num">${p1Result.model === "fractional" ? "Fractional" : "Full-Time"}</div><div class="stat-label">Type of Engagement</div></div></div>
<h2>What this person does</h2>${finalType.whatTheyDo.map(i => '<div class="item">\u25C6 ' + i + '</div>').join("")}
<h2>What to look for</h2>${finalType.whatToLookFor.map(i => '<div class="item">\u2192 ' + i + '</div>').join("")}
<h2>Interview questions</h2>${finalType.interviewQs.map(i => '<div class="item" style="font-style:italic">' + i + '</div>').join("")}
<h2>Compensation range</h2><div class="comp"><div class="comp-box"><div class="comp-label">Full-Time</div><div class="comp-val">${finalType.compRange.ft}</div></div><div class="comp-box"><div class="comp-label">Fractional</div><div class="comp-val">${finalType.compRange.frac}</div></div></div>
${secondary ? '<h2>Secondary Archetype</h2><p style="font-size:14px;color:#555">' + secondary + '</p>' : ''}
${dayOne || dayThirty ? '<h2>Your Priorities</h2>' + (dayOne ? '<p style="font-size:14px;color:#555"><strong>Day 1:</strong> ' + writeInAnswers.day_one + '</p>' : '') + (dayThirty ? '<p style="font-size:14px;color:#555"><strong>Day 30:</strong> ' + writeInAnswers.day_thirty + '</p>' : '') : ''}
<div class="footer">Chief of Staff Assessment \u00B7 Built by Elliott Fisher \u00B7 cos-assessment.vercel.app</div>
</body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const finalType = p2Result ? COS_TYPES[p2Result.primary] : null;
  const secondaryType = p2Result?.secondary ? COS_TYPES[p2Result.secondary] : null;
  const totalP2Steps = PHASE2_MC_QUESTIONS.length + PHASE2_WRITEIN_QUESTIONS.length;
  const currentP2Step = phase === "phase2mc" ? step : phase === "phase2writein" ? PHASE2_MC_QUESTIONS.length + step : 0;

  const isAssessmentPhase = ["intro","phase1","phase1result","phase2intro","phase2mc","phase2writein","final"].includes(phase);

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
        .lead-input { width: 100%; padding: 14px 16px; border: 1.5px solid #d4d0ca; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 14px; background: transparent; color: #1a1a1a; outline: none; transition: border-color 0.2s; }
        .lead-input:focus { border-color: #1a1a1a; }
        .lead-input::placeholder { color: #bbb; }
        .other-input { width: 100%; padding: 14px 16px; border: 1.5px solid #1a1a1a; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 14px; background: #faf8f5; color: #1a1a1a; outline: none; margin-top: 8px; }
        .other-input::placeholder { color: #bbb; }
        .other-submit { margin-top: 8px; padding: 10px 24px; background: #1a1a1a; color: #faf8f5; border: none; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
        .other-submit:disabled { background: #ccc; cursor: default; }
        .success-card { border: 2px solid #4a7c6f; border-radius: 6px; padding: 28px; text-align: center; background: linear-gradient(135deg, #f5faf7 0%, #faf8f5 100%); }
        .writein-textarea { width: 100%; min-height: 140px; padding: 18px; border: 1.5px solid #d4d0ca; border-radius: 6px; font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.7; background: transparent; color: #1a1a1a; outline: none; transition: border-color 0.2s; resize: vertical; font-weight: 300; }
        .writein-textarea:focus { border-color: #1a1a1a; }
        .writein-textarea::placeholder { color: #c0bdb8; font-style: italic; }
        .skip-btn { background: none; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; color: #bbb; letter-spacing: 0.05em; transition: color 0.2s; padding: 8px 0; }
        .skip-btn:hover { color: #888; }
        .interview-q { padding: 14px 18px; background: #f7f5f2; border-left: 3px solid; margin-bottom: 8px; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.6; color: #444; font-style: italic; font-weight: 300; }
        .impact-stat { flex: 1; min-width: 140px; padding: 20px; background: #f7f5f2; border-radius: 4px; text-align: center; }
        .impact-num { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
        .impact-label { font-family: 'DM Mono', monospace; font-size: 11px; color: #999; letter-spacing: 0.1em; text-transform: uppercase; }
        .nav-bar { position: sticky; top: 0; z-index: 20; background: #faf8f5; border-bottom: 1px solid #e4e0da; padding: 0 32px; display: flex; align-items: center; justify-content: center; gap: 32px; }
        .nav-link { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: #999; text-decoration: none; padding: 16px 0; cursor: pointer; border: none; background: none; transition: color 0.2s; border-bottom: 2px solid transparent; }
        .nav-link:hover { color: #1a1a1a; }
        .nav-link.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .archetype-card { border: 1.5px solid #e4e0da; border-radius: 6px; padding: 24px; margin-bottom: 20px; transition: border-color 0.2s; }
        .archetype-card:hover { border-color: #999; }
        .page-section { margin-bottom: 40px; }
        .page-section p { font-size: 16px; line-height: 1.75; color: #444; font-weight: 300; margin-bottom: 16px; }
      `}</style>

      {/* NAV BAR */}
      <div className="nav-bar">
        <button className={`nav-link ${isAssessmentPhase ? "active" : ""}`} onClick={() => setPhase("intro")}>Assessment</button>
        <button className={`nav-link ${phase === "archetypes" ? "active" : ""}`} onClick={() => navigateTo("archetypes")}>CoS Archetypes</button>
        <button className={`nav-link ${phase === "about" ? "active" : ""}`} onClick={() => navigateTo("about")}>About</button>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 32px", minHeight: "calc(100vh - 52px)" }}>

        {/* ═══ INTRO ═══ */}
        {phase === "intro" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh" }}>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.01em" }}>
              Do You Need a<br /><em style={{ fontWeight: 500 }}>Chief of Staff?</em>
            </h1>
            <p style={{ fontSize: 20, lineHeight: 1.7, color: "#444", maxWidth: 460, margin: "0 auto 28px", fontWeight: 500 }}>
              Chances are if you're asking yourself this question you're underwater and curious if a Chief of Staff can help. By taking this assessment, you'll get clarity fast.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#1a1a1a", maxWidth: 460, margin: "0 auto 0", fontWeight: 400 }}>
              A two-part assessment:
            </p>
            <div style={{ textAlign: "center", maxWidth: 520, margin: "12px auto 0", fontSize: 16, lineHeight: 1.8, color: "#1a1a1a", fontWeight: 300 }}>
              <p style={{ marginBottom: 4, whiteSpace: "nowrap" }}>First, determine if you need a CoS and the right engagement type.</p>
              <p>Then, narrow in on the right profile and archetype.</p>
            </div>
            <div style={{ height: 48 }} />
            <button className="primary-btn" onClick={() => { setStep(0); setPhase("phase1"); }}>Begin Assessment</button>
            <div style={{ marginTop: 24, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#bbb" }}>~4 minutes</div>

            <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #e4e0da", maxWidth: 440, margin: "48px auto 0" }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#888", fontWeight: 300 }}>
                Built by <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#2c5f8a", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid #2c5f8a33" }}>Elliott Fisher</a>, a 2x Chief of Staff.
              </p>
            </div>
          </div>
        )}

        {/* ═══ ABOUT PAGE ═══ */}
        {phase === "about" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            <button className="back-btn" onClick={goBackFromPage} style={{ marginBottom: 24 }}>&larr; Back</button>

            <div className="page-section">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>About the author</h2>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                <img src={"data:image/jpeg;base64,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"} alt="Elliott Fisher" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 2 }}><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "none", borderBottom: "1px solid #2c5f8a33" }}>Elliott Fisher</a></div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888" }}>2x Chief of Staff</div>
                </div>
              </div>
              <p>The CoS role is one of the most unique and dynamic in any organization — what works at one company rarely translates directly to another. This assessment helps founders and executive teams answer two critical questions: <em>"Is this role right for us?"</em> and <em>"Who is the right person for what we need?"</em> and prioritizes specificity over generic advice.</p>
            </div>

            <div className="page-section">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>How this assessment was built</h2>
              <p>This assessment was developed from my direct experience advising and operating as a Chief of Staff across several company stages, combined with patterns observed across the greater ecosystem.</p>
              <p>The scoring model evaluates organizational complexity across seven dimensions: span of control, decision bottlenecks, strategic time allocation, meeting load, cross-functional health, delegation capacity, and company stage. These produce a composite complexity score (7–28) that determines whether a CoS is warranted.</p>
              <p>Budget and duration inputs drive the fractional vs. full-time recommendation. Each factor produces weighted signals — the model with more signals wins the recommendation, with a confidence threshold that distinguishes a "strong" recommendation from a "likely" one.</p>
              <p>The archetype system identifies four distinct CoS profiles — Strategic, Operational, External-Facing, and Transformation — based on where organizational pain is concentrated. Most leaders need a blend, which is why we surface a secondary archetype when the signal is strong enough.</p>
            </div>
          </div>
        )}

        {/* ═══ ARCHETYPES PAGE ═══ */}
        {phase === "archetypes" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            <button className="back-btn" onClick={goBackFromPage} style={{ marginBottom: 24 }}>&larr; Back</button>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>The Four Chief of Staff Archetypes</h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#666", fontWeight: 300, marginBottom: 40 }}>
              Not all Chiefs of Staff are the same. The right hire depends on where your organization's pain is concentrated. Here are the four primary archetypes.
            </p>

            {Object.entries(COS_TYPES).map(([key, type]) => (
              <div key={key} className="archetype-card" style={{ borderLeftColor: type.color, borderLeftWidth: 3, cursor: "pointer" }} onClick={() => setExpandedArchetypes(prev => ({ ...prev, [key]: !prev[key] }))}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{type.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 2 }}>{type.title.replace(" Chief of Staff", "")}</h3>
                      <p style={{ fontSize: 14, color: "#888", fontStyle: "italic", fontWeight: 300 }}>{type.tagline}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#999", transition: "transform 0.2s", transform: expandedArchetypes[key] ? "rotate(180deg)" : "rotate(0)" }}>{"\u25BE"}</span>
                </div>
                {expandedArchetypes[key] && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#555", fontWeight: 300, marginBottom: 16 }}>{type.description}</p>

                    <div className="section-label">Best for</div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#666", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>{type.bestFor}</p>

                    <div className="section-label">What they do</div>
                    {type.whatTheyDo.map((item, i) => <div key={i} className="trait-item"><span style={{ color: type.color, fontSize: 14 }}>{"\u25C6"}</span> {item}</div>)}

                    <div className="section-label" style={{ marginTop: 20 }}>What to look for</div>
                    {type.whatToLookFor.map((item, i) => <div key={i} className="trait-item"><span style={{ color: type.color, fontSize: 16 }}>{"\u2192"}</span> {item}</div>)}

                    <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 140, padding: 14, background: "#f7f5f2", borderRadius: 4 }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Full-Time</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500 }}>{type.compRange.ft}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 140, padding: 14, background: "#f7f5f2", borderRadius: 4 }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Fractional</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500 }}>{type.compRange.frac}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══ PHASE 1 QUESTIONS ═══ */}
        {phase === "phase1" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh" }}>
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
            {step > 0 && <div style={{ marginTop: 32 }}><button className="back-btn" onClick={goBack}>&larr; Back</button></div>}
          </div>
        )}

        {/* ═══ PHASE 1 RESULT ═══ */}
        {phase === "phase1result" && p1Result && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            {p1Result.need === "none" ? (
              <>
                <div style={{ marginBottom: 24 }}><span className="result-tag" style={{ background: "#4a7c6f" }}>Your Result</span></div>
                <h2 style={{ fontSize: "clamp(28px, 4.5vw, 40px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>You Probably Don't Need One Yet</h2>
                <p style={{ fontSize: 18, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 32 }}>But keep this bookmarked.</p>
                <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 40, fontWeight: 300 }}>Based on your answers, your current operating model can handle the complexity you're facing. A Chief of Staff makes sense when organizational friction significantly outpaces your ability to manage it yourself.</p>
                <div style={{ marginBottom: 40 }}>
                  <div className="section-label">Why we think this</div>
                  {["Your direct report count is manageable","You still have strategic thinking time","Cross-functional work is mostly on track","You're not yet the primary bottleneck"].map((s, i) => (
                    <div key={i} className="trait-item"><span style={{ color: "#4a7c6f", fontSize: 16 }}>&rarr;</span> {s}</div>
                  ))}
                </div>
                <div style={{ padding: 20, background: "#f0ede8", borderRadius: 4, marginBottom: 40 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Consider instead</div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#555", lineHeight: 1.6 }}>A strong Executive Assistant or senior Program Manager might be a better fit right now. If things shift in 6 months, come back and retake this.</p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="secondary-btn" onClick={restart}>Retake Assessment</button>
                  <button className="primary-btn" onClick={startPhase2} style={{ fontSize: 12 }}>I still want to explore types &rarr;</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}><span className="result-tag" style={{ background: "#1a1a1a" }}>Your Result</span></div>
                <h2 style={{ fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>Yes, you need a Chief of Staff.</h2>
                <p style={{ fontSize: 17, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 32, lineHeight: 1.5 }}>Your complexity score is {p1Result.totalScore}/28. That's well above the threshold.</p>
                {(() => {
                  const meetings = p1Answers.meetings || 0, bottleneck = p1Answers.bottleneck || 0, strategic = p1Answers.strategic || 0;
                  const meetingHrs = meetings === 1 ? 12 : meetings === 2 ? 20 : meetings === 3 ? 30 : 38;
                  const bottleneckHrs = bottleneck === 1 ? 2 : bottleneck === 2 ? 5 : bottleneck === 3 ? 10 : 16;
                  const strategicPct = strategic === 1 ? 65 : strategic === 2 ? 50 : strategic === 3 ? 30 : 15;
                  const lostHrsWeek = Math.round(bottleneckHrs + (meetingHrs * 0.3));
                  const lostHrsYear = lostHrsWeek * 48;
                  const recoveredStrategic = Math.min(40, strategicPct + 25);
                  return (
                    <div style={{ marginBottom: 32 }}>
                      <div className="section-label">Estimated impact without a Chief of Staff</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                        <div className="impact-stat"><div className="impact-num">~{lostHrsWeek}h</div><div className="impact-label">Hours lost / week</div><div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>to bottlenecks &amp; low-leverage meetings</div></div>
                        <div className="impact-stat"><div className="impact-num">~{lostHrsYear}h</div><div className="impact-label">Hours lost / year</div><div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>that a CoS could recover for you</div></div>
                        <div className="impact-stat"><div className="impact-num">{strategicPct}%&rarr;{recoveredStrategic}%</div><div className="impact-label">Strategic time</div><div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>estimated recovery with a CoS</div></div>
                      </div>
                      <p style={{ fontSize: 13, color: "#999", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>These estimates are based on your answers about meeting load, bottleneck frequency, and strategic time allocation. A well-matched Chief of Staff typically recovers 15&ndash;25% of a leader's week within the first 90 days.</p>
                    </div>
                  );
                })()}
                <div className="model-card" style={{ borderColor: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f", background: p1Result.model === "fractional" ? "linear-gradient(135deg, #f7f9fb 0%, #faf8f5 100%)" : "linear-gradient(135deg, #f5faf7 0%, #faf8f5 100%)", marginBottom: 32 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f" }} />
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f", marginBottom: 12, fontWeight: 500 }}>Type of Engagement</div>
                  <h3 style={{ fontSize: 24, fontWeight: 400, marginBottom: 6 }}>{p1Result.model === "fractional" ? "Fractional" : "Full-Time"}</h3>
                  <p style={{ fontSize: 15, color: "#666", fontWeight: 300, fontStyle: "italic", marginBottom: 20, lineHeight: 1.5, whiteSpace: "nowrap" }}>{p1Result.modelSubtitle}</p>
                  <div className="section-label" style={{ marginBottom: 10 }}>Why this model</div>
                  {p1Result.signals.map((s, i) => <div key={i} className="signal-row"><span style={{ color: p1Result.model === "fractional" ? "#2c5f8a" : "#4a7c6f" }}>{"\u2713"}</span> {s}</div>)}
                  {p1Result.counterSignals.length > 0 && (<>
                    <div className="section-label" style={{ marginBottom: 10, marginTop: 20 }}>{p1Result.model === "fractional" ? "Signals that could shift to full-time" : "Signals that could work fractional"}</div>
                    {p1Result.counterSignals.map((s, i) => <div key={i} className="signal-row" style={{ color: "#999" }}><span>{"\u25CB"}</span> {s}</div>)}
                  </>)}
                </div>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 16, color: "#666", marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>Now let's figure out exactly <em>what kind</em> of Chief of Staff you need.</p>
                  <button className="primary-btn" onClick={startPhase2}>Continue to Part 2 &rarr;</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ PHASE 2 INTRO ═══ */}
        {phase === "phase2intro" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh" }}>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20 }}>What Kind of<br /><em style={{ fontWeight: 500 }}>Chief of Staff?</em></h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#666", maxWidth: 420, margin: "0 auto 48px", fontWeight: 300 }}>Seven questions to identify your ideal archetype.</p>
            <button className="primary-btn" onClick={beginPhase2}>Let's Go</button>
          </div>
        )}

        {/* ═══ PHASE 2 MC ═══ */}
        {phase === "phase2mc" && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh" }}>
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
              {PHASE2_MC_QUESTIONS[step].otherPrompt && (<>
                <button className={`option-btn ${showOtherInput ? "other-active" : ""}`} onClick={handleOtherClick}>
                  <span style={{ opacity: 0.4, fontSize: 12, minWidth: 48 }}>{"\u270E"}</span>{PHASE2_MC_QUESTIONS[step].otherPrompt}
                </button>
                {showOtherInput && (
                  <div style={{ marginTop: 4 }}>
                    <input className="other-input" type="text" placeholder="Tell us more..." value={otherValue} onChange={(e) => setOtherValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id); }} autoFocus maxLength={200} />
                    <button className="other-submit" onClick={() => handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id)} disabled={!otherValue.trim()}>Submit &rarr;</button>
                  </div>
                )}
              </>)}
            </div>
            {step > 0 && <div style={{ marginTop: 32 }}><button className="back-btn" onClick={goBack}>&larr; Back</button></div>}
          </div>
        )}

        {/* ═══ PHASE 2 WRITE-INS ═══ */}
        {phase === "phase2writein" && currentWriteIn && (
          <div className={fadeIn ? "fade-active" : "fade-enter"} style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "75vh" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 48 }}>
              {Array.from({ length: totalP2Steps }).map((_, i) => <div key={i} className={`progress-segment ${i <= currentP2Step ? "filled" : ""}`} />)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 12 }}>Question {currentP2Step + 1} of {totalP2Steps}</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{currentWriteIn.question}</h2>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 28, fontWeight: 300, fontStyle: "italic" }}>{currentWriteIn.subtext}</p>
            <textarea className="writein-textarea" placeholder={currentWriteIn.placeholder} value={writeInValue} onChange={(e) => setWriteInValue(e.target.value)} maxLength={500} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {step > 0 && <button className="back-btn" onClick={goBack}>&larr; Back</button>}
                <button className="skip-btn" onClick={handleWriteInSkip}>Skip this question &rarr;</button>
              </div>
              <button className="primary-btn" style={{ padding: "12px 32px", fontSize: 12 }} onClick={handleWriteInNext} disabled={!writeInValue.trim()}>
                {step + 1 < PHASE2_WRITEIN_QUESTIONS.length ? "Next \u2192" : "See Results \u2192"}
              </button>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#ccc", marginTop: 12, textAlign: "right" }}>{writeInValue.length}/500</div>
          </div>
        )}

        {/* ═══ FINAL RESULT ═══ */}
        {phase === "final" && finalType && (
          <div className={fadeIn ? "fade-active" : "fade-enter"}>
            <div style={{ marginBottom: 8 }}><span className="result-tag" style={{ background: finalType.color }}>{finalType.icon} Your Archetype</span></div>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}>{finalType.title}</h2>
            <p style={{ fontSize: 19, color: "#888", fontStyle: "italic", fontWeight: 300, marginBottom: 20 }}>{finalType.tagline}</p>

            {p1Result?.need === "yes" && (
              <div style={{ padding: 16, background: "#f7f5f2", borderRadius: 4, marginBottom: 32, borderLeft: `3px solid ${finalType.color}` }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0 }}>
                  Our recommendation: You need a <strong>{p1Result.model === "fractional" ? "fractional" : "full-time"} {finalType.title}</strong>.
                  {p1Result.model === "fractional" ? " That means the right person 2\u20133 days a week \u2014 not a full-time hire." : " This person should be fully embedded in your team."}
                </p>
              </div>
            )}

            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#444", marginBottom: 40, fontWeight: 300 }}>{finalType.description}</p>

            <div style={{ marginBottom: 40 }}>
              <div className="section-label">What this person does</div>
              {finalType.whatTheyDo.map((item, i) => <div key={i} className="trait-item"><span style={{ color: finalType.color, fontSize: 14 }}>&diams;</span> {item}</div>)}
            </div>
            <div style={{ marginBottom: 40 }}>
              <div className="section-label">What to look for</div>
              {finalType.whatToLookFor.map((item, i) => <div key={i} className="trait-item"><span style={{ color: finalType.color, fontSize: 16 }}>&rarr;</span> {item}</div>)}
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
              <div style={{ padding: 20, background: secondaryType.accent, borderRadius: 4, borderLeft: `3px solid ${secondaryType.color}`, marginBottom: 20 }}>
                <div className="section-label" style={{ color: secondaryType.color, marginBottom: 8 }}>Secondary signal: {secondaryType.title}</div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                  Your answers also showed strong signals for a {secondaryType.title.toLowerCase()}. The ideal candidate might blend both &mdash; someone who leads with {p2Result.primary} skills but can flex into {p2Result.secondary} work when needed.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <button className="secondary-btn" onClick={() => navigateTo("archetypes")} style={{ width: "100%" }}>
                Learn more about other Chief of Staff archetypes &rarr;
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <button className="secondary-btn" onClick={downloadResults} style={{ width: "100%" }}>
                Download your results as PDF &darr;
              </button>
            </div>

            

            <div className="divider">Stay Connected</div>
            {!leadSubmitted ? (
              <div style={{ border: "1.5px solid #d4d0ca", borderRadius: 6, padding: 32, marginBottom: 40, background: "linear-gradient(135deg, #fdfcfa 0%, #f7f5f2 100%)" }}>
                <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>Want help finding your {finalType.title.split(" ").slice(0, -1).join(" ").toLowerCase()} CoS?</h3>
                <p style={{ fontSize: 14, color: "#888", fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>Leave your info and we'll send you a tailored job description template and &mdash; if you're going fractional &mdash; connect you with vetted candidates who match your profile.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <input className="lead-input" type="text" placeholder="Your name" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
                  <input className="lead-input" type="email" placeholder="Email address *" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
                  <input className="lead-input" type="tel" placeholder="Phone (optional)" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
                </div>
                <button className="primary-btn" style={{ width: "100%" }} onClick={handleLeadSubmit} disabled={!leadEmail.trim() || leadSubmitting}>
                  {leadSubmitting ? "Sending\u2026" : "Get Connected \u2192"}
                </button>
                <p style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Mono', monospace", marginTop: 12, textAlign: "center" }}>No spam. Just your results and a personalized follow-up.</p>
              </div>
            ) : (
              <div className="success-card" style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{"\u2713"}</div>
                <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>You're in.</h3>
                <p style={{ fontSize: 14, color: "#666", fontWeight: 300, lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
                  We'll send your tailored {finalType.title.toLowerCase()} blueprint to <strong>{leadEmail}</strong> shortly.
                  {p1Result?.model === "fractional" && " We'll also reach out about fractional matches."}
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
    </div>
  );
}
