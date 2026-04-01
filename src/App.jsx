import { useState, useEffect } from "react";

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
    placeholder: 'e.g. "I need someone to take over our quarterly planning process — it\'s a mess and the exec team is losing confidence in our ability to ship on time."',
  },
  {
    id: "day_thirty",
    question: "What about 30 days from now — what should they own by then?",
    subtext: "Think about what 'settled in and delivering' looks like after a month",
    placeholder: 'e.g. "By day 30 I\'d want them running the weekly leadership sync, owning the OKR dashboard, and preparing a board deck draft without my input."',
  },
];

/* ─────────────────────────── RESULT DATA ─────────────────────────── */
const COS_TYPES = {
  strategic: {
    title: "Strategic Chief of Staff",
    tagline: "Your thinking partner. Your second brain.",
    color: "#000080",
    accent: "#d0d0e8",
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
    color: "#006400",
    accent: "#d0e8d0",
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
    color: "#800080",
    accent: "#e8d0e8",
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
    color: "#8B4513",
    accent: "#f0dcc8",
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
    img.crossOrigin = "anonymous";
    img.src = url;
    return true;
  } catch (err) {
    console.error("Sheet error:", err);
    return false;
  }
}

/* ─────────────────────────── WIN2K PRIMITIVES ─────────────────────────── */
const W2K_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Tahoma:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background-color: #008080;
    background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23007070' x='0' y='0'/%3E%3Crect width='1' height='1' fill='%23009090' x='2' y='2'/%3E%3C/svg%3E");
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    color: #000;
    min-height: 100vh;
    padding: 16px;
  }

  /* ── Window chrome ── */
  .win2k-window {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    box-shadow: 2px 2px 0 #000000, inset 1px 1px 0 #dfdfdf;
  }

  .win2k-titlebar {
    background: linear-gradient(to right, #000080, #1084d0);
    color: #ffffff;
    font-weight: bold;
    font-size: 11px;
    padding: 3px 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    height: 20px;
  }

  .win2k-titlebar-btns {
    display: flex;
    gap: 2px;
  }

  .win2k-titlebar-btn {
    width: 16px;
    height: 14px;
    background: #d4d0c8;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
    font-size: 9px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    color: #000;
    line-height: 1;
  }

  .win2k-content {
    padding: 12px;
  }

  /* ── Raised/sunken panel ── */
  .win2k-raised {
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
  }
  .win2k-sunken {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
  }
  .win2k-groove {
    border: 2px groove #808080;
  }

  /* ── Buttons ── */
  .win2k-btn {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    padding: 4px 16px;
    cursor: pointer;
    min-width: 75px;
    height: 23px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #000;
    white-space: nowrap;
  }
  .win2k-btn:hover { background: #e0ddd4; }
  .win2k-btn:active, .win2k-btn.pressed {
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    padding: 5px 15px 3px 17px;
  }
  .win2k-btn:disabled {
    color: #888;
    cursor: default;
  }
  .win2k-btn:disabled:hover { background: #d4d0c8; }

  .win2k-btn-default {
    border: 2px solid #000;
    outline: 2px solid #d4d0c8;
  }

  /* ── Radio / option buttons ── */
  .win2k-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 11px;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    color: #000;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
  }
  .win2k-option:hover { background: #000080; color: #fff; }
  .win2k-option:hover .win2k-option-radio { border-color: #fff; background: #fff; }
  .win2k-option.selected { background: #000080; color: #fff; }

  .win2k-option-radio {
    width: 12px;
    height: 12px;
    border: 2px solid #808080;
    border-radius: 50%;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 1px 1px 0 #404040;
  }
  .win2k-option.selected .win2k-option-radio::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #000080;
  }

  /* ── Text inputs ── */
  .win2k-input {
    width: 100%;
    padding: 2px 4px;
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    background: #ffffff;
    color: #000;
    outline: none;
    height: 21px;
  }
  .win2k-input:focus {
    outline: 1px dotted #000;
    outline-offset: -2px;
  }
  .win2k-textarea {
    width: 100%;
    padding: 4px;
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    background: #ffffff;
    color: #000;
    outline: none;
    resize: vertical;
    min-height: 100px;
  }
  .win2k-textarea:focus {
    outline: 1px dotted #000;
    outline-offset: -2px;
  }

  /* ── Progress bar ── */
  .win2k-progressbar {
    background: #ffffff;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    height: 16px;
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  .win2k-progressbar-fill {
    height: 100%;
    background: repeating-linear-gradient(
      90deg,
      #000080 0px,
      #000080 8px,
      #1c74c4 8px,
      #1c74c4 10px
    );
    transition: width 0.3s ease;
  }

  /* ── Status bar ── */
  .win2k-statusbar {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    padding: 2px 8px;
    font-size: 10px;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .win2k-statusbar-panel {
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    padding: 1px 8px;
    min-width: 80px;
  }

  /* ── Separator ── */
  .win2k-sep {
    border: none;
    border-top: 1px solid #808080;
    border-bottom: 1px solid #ffffff;
    margin: 8px 0;
  }

  /* ── Groupbox / fieldset ── */
  .win2k-groupbox {
    border: 1px solid #808080;
    border-top: 2px groove #808080;
    padding: 12px 8px 8px;
    margin-top: 8px;
    position: relative;
  }
  .win2k-groupbox-legend {
    position: absolute;
    top: -8px;
    left: 8px;
    background: #d4d0c8;
    padding: 0 4px;
    font-weight: bold;
    font-size: 11px;
  }

  /* ── List items ── */
  .win2k-list-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 4px;
    font-size: 11px;
    border-bottom: 1px solid #e8e4dc;
    line-height: 1.4;
  }
  .win2k-list-item::before {
    content: '►';
    color: #000080;
    flex-shrink: 0;
    font-size: 9px;
    margin-top: 2px;
  }

  /* ── Note box ── */
  .win2k-note {
    background: #ffffcc;
    border: 1px solid #c0b000;
    padding: 6px 8px;
    font-size: 11px;
    line-height: 1.5;
    display: flex;
    gap: 8px;
  }
  .win2k-note::before {
    content: 'ℹ';
    font-size: 14px;
    color: #000080;
    flex-shrink: 0;
  }

  /* ── Taskbar ── */
  .win2k-taskbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 28px;
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    display: flex;
    align-items: center;
    padding: 0 4px;
    gap: 4px;
    z-index: 100;
  }
  .win2k-start-btn {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 8px;
    cursor: default;
    height: 22px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .win2k-clock {
    margin-left: auto;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    padding: 2px 8px;
    font-size: 10px;
  }
  .win2k-taskbar-task {
    background: #d4d0c8;
    border-top: 1px solid #808080;
    border-left: 1px solid #808080;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
    font-size: 11px;
    padding: 2px 8px;
    min-width: 120px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: default;
    height: 22px;
    font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
  }

  /* ── Tooltip icon ── */
  .win2k-icon-sm {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  /* ── Comp table ── */
  .win2k-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .win2k-table th {
    background: #000080;
    color: #fff;
    padding: 3px 8px;
    text-align: left;
    font-weight: bold;
  }
  .win2k-table td {
    padding: 3px 8px;
    border-bottom: 1px solid #e0ddd4;
  }
  .win2k-table tr:nth-child(even) td {
    background: #eae8e0;
  }

  /* ── Scrollable area ── */
  .win2k-scrollable {
    overflow-y: auto;
    max-height: calc(100vh - 160px);
    padding-right: 4px;
  }
  .win2k-scrollable::-webkit-scrollbar {
    width: 16px;
  }
  .win2k-scrollable::-webkit-scrollbar-track {
    background: #d4d0c8;
    border-left: 1px solid #808080;
  }
  .win2k-scrollable::-webkit-scrollbar-thumb {
    background: #d4d0c8;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
    min-height: 20px;
  }
  .win2k-scrollable::-webkit-scrollbar-button {
    background: #d4d0c8;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
  }
`;

function Win2KClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return <div className="win2k-clock">{time}</div>;
}

function Win2KWindow({ title, icon = "🖥️", children, style }) {
  return (
    <div className="win2k-window" style={{ ...style }}>
      <div className="win2k-titlebar">
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12 }}>{icon}</span>
          {title}
        </span>
        <div className="win2k-titlebar-btns">
          <div className="win2k-titlebar-btn">_</div>
          <div className="win2k-titlebar-btn">□</div>
          <div className="win2k-titlebar-btn" style={{ color: "red", fontWeight: 900 }}>✕</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10 }}>
        <span>Progress</span>
        <span>{value} of {max} ({pct}%)</span>
      </div>
      <div className="win2k-progressbar">
        <div className="win2k-progressbar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function ChiefOfStaffAssessment() {
  const [phase, setPhase] = useState("intro");
  const [step, setStep] = useState(0);
  const [p1Answers, setP1Answers] = useState({});
  const [p2Answers, setP2Answers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [writeInAnswers, setWriteInAnswers] = useState({});
  const [selected, setSelected] = useState(null);
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

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [phase]);

  const handleP1Select = (qId, value) => {
    setSelected(value);
    const na = { ...p1Answers, [qId]: value };
    setP1Answers(na);
    setTimeout(() => {
      setSelected(null);
      if (step + 1 < PHASE1_QUESTIONS.length) setStep(step + 1);
      else { setP1Result(getPhase1Result(na)); setPhase("phase1result"); }
    }, 300);
  };

  const handleP2MCSelect = (qId, value) => {
    setSelected(value);
    setShowOtherInput(false);
    setOtherValue("");
    const na = { ...p2Answers, [qId]: value };
    setP2Answers(na);
    setTimeout(() => {
      setSelected(null);
      if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1);
      else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); }
    }, 300);
  };

  const handleOtherClick = () => { setShowOtherInput(true); setOtherValue(""); };
  const handleOtherSubmit = (qId) => {
    if (!otherValue.trim()) return;
    setOtherTexts((p) => ({ ...p, [qId]: otherValue.trim() }));
    const na = { ...p2Answers, [qId]: "other" };
    setP2Answers(na);
    setShowOtherInput(false);
    setOtherValue("");
    setTimeout(() => {
      if (step + 1 < PHASE2_MC_QUESTIONS.length) setStep(step + 1);
      else { setStep(0); setWriteInValue(""); setPhase("phase2writein"); }
    }, 300);
  };

  const currentWriteIn = phase === "phase2writein" ? PHASE2_WRITEIN_QUESTIONS[step] : null;

  const handleWriteInNext = () => {
    if (writeInValue.trim()) {
      setWriteInAnswers((p) => ({ ...p, [currentWriteIn.id]: writeInValue.trim() }));
    }
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) {
      setStep(step + 1);
      setWriteInValue("");
    } else {
      setP2Result(getPhase2Result(p2Answers));
      setPhase("final");
    }
  };

  const handleWriteInSkip = () => {
    if (step + 1 < PHASE2_WRITEIN_QUESTIONS.length) {
      setStep(step + 1);
      setWriteInValue("");
    } else {
      setP2Result(getPhase2Result(p2Answers));
      setPhase("final");
    }
  };

  const goBack = () => {
    if (step > 0) {
      setSelected(null);
      setShowOtherInput(false);
      setOtherValue("");
      setWriteInValue("");
      setStep(step - 1);
    }
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
    setLeadSubmitted(true);
    setLeadSubmitting(false);
  };

  const finalType = p2Result ? COS_TYPES[p2Result.primary] : null;
  const secondaryType = p2Result?.secondary ? COS_TYPES[p2Result.secondary] : null;
  const totalP2Steps = PHASE2_MC_QUESTIONS.length + PHASE2_WRITEIN_QUESTIONS.length;
  const currentP2Step = phase === "phase2mc" ? step : phase === "phase2writein" ? PHASE2_MC_QUESTIONS.length + step : 0;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 40 }}>
      <style>{W2K_STYLES}</style>

      {/* ═══════ INTRO ═══════ */}
      {phase === "intro" && (
        <div style={{ maxWidth: 520, margin: "32px auto" }}>
          <Win2KWindow title="Chief of Staff Assessment — Welcome" icon="📋">
            <div className="win2k-content">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Big icon area */}
                <div style={{ width: 48, height: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                  📋
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>Do You Need a Chief of Staff?</div>
                  <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5, marginBottom: 12 }}>
                    A two-part diagnostic assessment to determine whether you need a Chief of Staff, what engagement model fits, and which archetype to hire.
                  </div>
                  <div className="win2k-note" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, lineHeight: 1.5 }}>
                      <strong>Part 1:</strong> Need Assessment + Engagement Model<br />
                      <strong>Part 2:</strong> Archetype Identification + Hiring Blueprint<br />
                      Estimated time: ~4 minutes
                    </span>
                  </div>
                </div>
              </div>
              <hr className="win2k-sep" />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
                <button className="win2k-btn win2k-btn-default" onClick={() => { setStep(0); setPhase("phase1"); }}>
                  Next &gt;
                </button>
                <button className="win2k-btn" onClick={restart}>Cancel</button>
              </div>
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ PHASE 1 QUESTIONS ═══════ */}
      {phase === "phase1" && (
        <div style={{ maxWidth: 540, margin: "24px auto" }}>
          <Win2KWindow title={`CoS Assessment — Part 1: Question ${step + 1} of ${PHASE1_QUESTIONS.length}`} icon="❓">
            <div className="win2k-content">
              <ProgressBar value={step + 1} max={PHASE1_QUESTIONS.length} />
              <hr className="win2k-sep" />
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{PHASE1_QUESTIONS[step].question}</div>
                <div style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginBottom: 8 }}>{PHASE1_QUESTIONS[step].subtext}</div>
              </div>
              <div className="win2k-groupbox" style={{ marginBottom: 8 }}>
                <div className="win2k-groupbox-legend">Select one option:</div>
                {PHASE1_QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.label}
                    className={`win2k-option ${selected === opt.value ? "selected" : ""}`}
                    onClick={() => handleP1Select(PHASE1_QUESTIONS[step].id, opt.value)}
                  >
                    <div className={`win2k-option-radio ${selected === opt.value ? "" : ""}`}>
                      {selected === opt.value && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 10, opacity: 0.6, minWidth: 32, fontFamily: "monospace" }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
              <hr className="win2k-sep" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                <div className="win2k-statusbar-panel" style={{ fontSize: 10, color: "#666" }}>
                  Part 1 of 2 — Complexity Assessment
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {step > 0 && (
                    <button className="win2k-btn" onClick={goBack}>&lt; Back</button>
                  )}
                </div>
              </div>
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ PHASE 1 RESULT ═══════ */}
      {phase === "phase1result" && p1Result && (
        <div style={{ maxWidth: 560, margin: "24px auto" }}>
          <Win2KWindow
            title={p1Result.need === "none" ? "Part 1 Result — No CoS Needed" : "Part 1 Result — Chief of Staff Needed"}
            icon={p1Result.need === "none" ? "ℹ️" : "✅"}
          >
            <div className="win2k-content win2k-scrollable">
              {p1Result.need === "none" ? (
                <>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>ℹ️</div>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>You Probably Don&apos;t Need One Yet</div>
                      <div style={{ fontSize: 11, color: "#555", fontStyle: "italic" }}>But keep this bookmarked.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.6, color: "#222", marginBottom: 12 }}>
                    Based on your answers, your current operating model can handle the complexity you&apos;re facing. A Chief of Staff makes sense when organizational friction significantly outpaces your ability to manage it yourself.
                  </div>
                  <div className="win2k-groupbox" style={{ marginBottom: 12 }}>
                    <div className="win2k-groupbox-legend">Why we think this</div>
                    {["Your direct report count is manageable", "You still have strategic thinking time", "Cross-functional work is mostly on track", "You're not yet the primary bottleneck"].map((s, i) => (
                      <div key={i} className="win2k-list-item">{s}</div>
                    ))}
                  </div>
                  <div className="win2k-note" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, lineHeight: 1.5 }}>
                      <strong>Consider instead:</strong> A strong Executive Assistant or senior Program Manager might be a better fit right now. If things shift in 6 months, come back and retake this.
                    </span>
                  </div>
                  <hr className="win2k-sep" />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                    <button className="win2k-btn win2k-btn-default" onClick={startPhase2} style={{ fontSize: 10 }}>Explore CoS Types</button>
                    <button className="win2k-btn" onClick={restart}>Start Over</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>✅</div>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>Yes, you need a Chief of Staff.</div>
                      <div style={{ fontSize: 11, color: "#555" }}>
                        Complexity score: <strong>{p1Result.totalScore}/28</strong> — well above the threshold.
                      </div>
                    </div>
                  </div>

                  <div className="win2k-groupbox" style={{ marginBottom: 12 }}>
                    <div className="win2k-groupbox-legend" style={{ color: p1Result.model === "fractional" ? "#000080" : "#006400" }}>
                      Recommended Engagement Model: {p1Result.modelTitle}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
                      {p1Result.modelSubtitle}
                    </div>
                    <div style={{ marginBottom: 4, fontWeight: "bold", fontSize: 10, textTransform: "uppercase", color: "#666" }}>Supporting signals:</div>
                    {p1Result.signals.map((s, i) => (
                      <div key={i} className="win2k-list-item">{s}</div>
                    ))}
                    {p1Result.counterSignals.length > 0 && (
                      <>
                        <div style={{ marginTop: 8, marginBottom: 4, fontWeight: "bold", fontSize: 10, textTransform: "uppercase", color: "#999" }}>
                          {p1Result.model === "fractional" ? "Counter-signals (could shift to full-time):" : "Counter-signals (could work fractional):"}
                        </div>
                        {p1Result.counterSignals.map((s, i) => (
                          <div key={i} className="win2k-list-item" style={{ color: "#888" }}>{s}</div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="win2k-note" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11 }}>
                      Now let&apos;s figure out exactly <strong>what kind</strong> of Chief of Staff you need.
                    </span>
                  </div>
                  <hr className="win2k-sep" />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                    <button className="win2k-btn win2k-btn-default" onClick={startPhase2}>Continue to Part 2 &gt;</button>
                    <button className="win2k-btn" onClick={restart}>Start Over</button>
                  </div>
                </>
              )}
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ PHASE 2 INTRO ═══════ */}
      {phase === "phase2intro" && (
        <div style={{ maxWidth: 480, margin: "24px auto" }}>
          <Win2KWindow title="CoS Assessment — Part 2: Archetype Finder" icon="🔍">
            <div className="win2k-content">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>🔍</div>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>What Kind of Chief of Staff?</div>
                  <div style={{ fontSize: 11, lineHeight: 1.6, color: "#333", marginBottom: 10 }}>
                    Seven questions — five quick picks and two short write-ins — to identify your ideal archetype and build a detailed hiring blueprint.
                  </div>
                  <div className="win2k-note">
                    <span style={{ fontSize: 11 }}>This section takes approximately 2 minutes to complete.</span>
                  </div>
                </div>
              </div>
              <hr className="win2k-sep" />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                <button className="win2k-btn win2k-btn-default" onClick={beginPhase2}>Start Part 2 &gt;</button>
                <button className="win2k-btn" onClick={restart}>Cancel</button>
              </div>
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ PHASE 2 MC QUESTIONS ═══════ */}
      {phase === "phase2mc" && (
        <div style={{ maxWidth: 540, margin: "24px auto" }}>
          <Win2KWindow title={`Part 2 — Question ${currentP2Step + 1} of ${totalP2Steps}`} icon="❓">
            <div className="win2k-content">
              <ProgressBar value={currentP2Step + 1} max={totalP2Steps} />
              <hr className="win2k-sep" />
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{PHASE2_MC_QUESTIONS[step].question}</div>
                <div style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginBottom: 8 }}>{PHASE2_MC_QUESTIONS[step].subtext}</div>
              </div>
              <div className="win2k-groupbox" style={{ marginBottom: 8 }}>
                <div className="win2k-groupbox-legend">Select one option:</div>
                {PHASE2_MC_QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.label}
                    className={`win2k-option ${selected === opt.value ? "selected" : ""}`}
                    onClick={() => handleP2MCSelect(PHASE2_MC_QUESTIONS[step].id, opt.value)}
                  >
                    <div className="win2k-option-radio">
                      {selected === opt.value && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 14, minWidth: 24 }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
                {PHASE2_MC_QUESTIONS[step].otherPrompt && (
                  <>
                    <button
                      className={`win2k-option ${showOtherInput ? "selected" : ""}`}
                      onClick={handleOtherClick}
                    >
                      <div className="win2k-option-radio" />
                      <span style={{ fontSize: 11, minWidth: 24 }}>✎</span>
                      {PHASE2_MC_QUESTIONS[step].otherPrompt}
                    </button>
                    {showOtherInput && (
                      <div style={{ padding: "6px 8px", background: "#f0ede8" }}>
                        <input
                          className="win2k-input"
                          type="text"
                          placeholder="Type your answer..."
                          value={otherValue}
                          onChange={(e) => setOtherValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id); }}
                          autoFocus
                          maxLength={200}
                        />
                        <div style={{ marginTop: 4, display: "flex", justifyContent: "flex-end" }}>
                          <button
                            className="win2k-btn win2k-btn-default"
                            onClick={() => handleOtherSubmit(PHASE2_MC_QUESTIONS[step].id)}
                            disabled={!otherValue.trim()}
                            style={{ fontSize: 10 }}
                          >
                            Submit →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <hr className="win2k-sep" />
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
                <div className="win2k-statusbar-panel" style={{ fontSize: 10, color: "#666" }}>Part 2 of 2</div>
                {step > 0 && <button className="win2k-btn" onClick={goBack}>&lt; Back</button>}
              </div>
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ PHASE 2 WRITE-IN QUESTIONS ═══════ */}
      {phase === "phase2writein" && currentWriteIn && (
        <div style={{ maxWidth: 540, margin: "24px auto" }}>
          <Win2KWindow title={`Part 2 — Write-In ${step + 1} of ${PHASE2_WRITEIN_QUESTIONS.length}`} icon="✏️">
            <div className="win2k-content">
              <ProgressBar value={currentP2Step + 1} max={totalP2Steps} />
              <hr className="win2k-sep" />
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>{currentWriteIn.question}</div>
                <div style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginBottom: 8 }}>{currentWriteIn.subtext}</div>
              </div>
              <textarea
                className="win2k-textarea"
                placeholder={currentWriteIn.placeholder}
                value={writeInValue}
                onChange={(e) => setWriteInValue(e.target.value)}
                maxLength={500}
                rows={5}
              />
              <div style={{ fontSize: 10, color: "#888", textAlign: "right", marginTop: 2 }}>{writeInValue.length}/500 characters</div>
              <hr className="win2k-sep" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {step > 0 && <button className="win2k-btn" onClick={goBack}>&lt; Back</button>}
                  <button className="win2k-btn" onClick={handleWriteInSkip} style={{ fontSize: 10 }}>Skip</button>
                </div>
                <button
                  className="win2k-btn win2k-btn-default"
                  onClick={handleWriteInNext}
                  disabled={!writeInValue.trim()}
                >
                  {step + 1 < PHASE2_WRITEIN_QUESTIONS.length ? "Next >" : "See Results >"}
                </button>
              </div>
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ FINAL RESULT ═══════ */}
      {phase === "final" && finalType && (
        <div style={{ maxWidth: 600, margin: "24px auto", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Main result window */}
          <Win2KWindow title={`Assessment Complete — Your CoS Archetype`} icon={finalType.icon}>
            <div className="win2k-content win2k-scrollable" style={{ maxHeight: "none" }}>

              {/* Header */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 40, flexShrink: 0 }}>{finalType.icon}</div>
                <div>
                  <div style={{
                    background: finalType.color,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "bold",
                    padding: "1px 6px",
                    display: "inline-block",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Your Archetype
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: 16 }}>{finalType.title}</div>
                  <div style={{ fontSize: 11, color: "#555", fontStyle: "italic" }}>{finalType.tagline}</div>
                </div>
              </div>

              <div style={{ fontSize: 11, lineHeight: 1.7, color: "#222", marginBottom: 12 }}>
                {finalType.description}
              </div>

              {/* What they do */}
              <div className="win2k-groupbox" style={{ marginBottom: 10 }}>
                <div className="win2k-groupbox-legend" style={{ color: finalType.color }}>What this person does</div>
                {finalType.whatTheyDo.map((item, i) => (
                  <div key={i} className="win2k-list-item">{item}</div>
                ))}
              </div>

              {/* What to look for */}
              <div className="win2k-groupbox" style={{ marginBottom: 10 }}>
                <div className="win2k-groupbox-legend" style={{ color: finalType.color }}>What to look for</div>
                {finalType.whatToLookFor.map((item, i) => (
                  <div key={i} className="win2k-list-item">{item}</div>
                ))}
              </div>

              {/* Interview Qs */}
              <div className="win2k-groupbox" style={{ marginBottom: 10 }}>
                <div className="win2k-groupbox-legend" style={{ color: finalType.color }}>Interview questions to ask</div>
                {finalType.interviewQs.map((q, i) => (
                  <div key={i} style={{ padding: "6px 8px", borderLeft: `3px solid ${finalType.color}`, background: "#f7f5f0", marginBottom: 4, fontSize: 11, lineHeight: 1.5, fontStyle: "italic" }}>
                    {q}
                  </div>
                ))}
              </div>

              {/* Compensation */}
              <div className="win2k-groupbox" style={{ marginBottom: 10 }}>
                <div className="win2k-groupbox-legend" style={{ color: finalType.color }}>Typical compensation range</div>
                <table className="win2k-table" style={{ marginTop: 8 }}>
                  <thead>
                    <tr>
                      <th style={{ background: finalType.color }}>Engagement Type</th>
                      <th style={{ background: finalType.color }}>Compensation Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Full-Time</td>
                      <td><strong>{finalType.compRange.ft}</strong></td>
                    </tr>
                    <tr>
                      <td>Fractional</td>
                      <td><strong>{finalType.compRange.frac}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Secondary signal */}
              {secondaryType && (
                <div className="win2k-note" style={{ marginBottom: 10, borderColor: secondaryType.color }}>
                  <span style={{ fontSize: 11, lineHeight: 1.5 }}>
                    <strong>Secondary signal: {secondaryType.title}</strong><br />
                    Your answers also showed strong signals for a {secondaryType.title.toLowerCase()}. The ideal candidate might blend both — leading with {p2Result.primary} skills but able to flex into {p2Result.secondary} work.
                  </span>
                </div>
              )}

              {p1Result?.need === "yes" && (
                <div style={{ textAlign: "center", padding: "8px", background: "#d4d0c8", border: "1px solid #808080", marginBottom: 10, fontSize: 11, fontWeight: "bold" }}>
                  ── {p1Result.modelTitle} ──
                </div>
              )}

              <hr className="win2k-sep" />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
                <button className="win2k-btn" onClick={restart}>Start Over</button>
                <button className="win2k-btn" onClick={() => { setStep(0); setP2Answers({}); setOtherTexts({}); setWriteInAnswers({}); setP2Result(null); setWriteInValue(""); setPhase("phase2intro"); }}>
                  Retake Part 2
                </button>
              </div>
            </div>
          </Win2KWindow>

          {/* Lead Capture Window */}
          <Win2KWindow title="Stay Connected — Get Your Blueprint" icon="📧">
            <div className="win2k-content">
              {!leadSubmitted ? (
                <>
                  <div style={{ fontSize: 11, lineHeight: 1.6, color: "#333", marginBottom: 10 }}>
                    <strong>Want help finding your {finalType.title.split(" ").slice(0, -1).join(" ").toLowerCase()} CoS?</strong>
                    <br />
                    Leave your info and I&apos;ll send you a tailored job description template and — if you&apos;re going fractional — connect you with vetted candidates who match your profile.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ width: 80, fontSize: 11, textAlign: "right", flexShrink: 0 }}>Name:</label>
                      <input className="win2k-input" style={{ flex: 1 }} type="text" placeholder="Your name" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ width: 80, fontSize: 11, textAlign: "right", flexShrink: 0 }}>Email <span style={{ color: "red" }}>*</span>:</label>
                      <input className="win2k-input" style={{ flex: 1 }} type="email" placeholder="your@email.com" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ width: 80, fontSize: 11, textAlign: "right", flexShrink: 0 }}>Phone:</label>
                      <input className="win2k-input" style={{ flex: 1 }} type="tel" placeholder="Optional" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>* Required field. No spam — just your results and a personalized follow-up.</div>
                  <hr className="win2k-sep" />
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                    <button
                      className="win2k-btn win2k-btn-default"
                      onClick={handleLeadSubmit}
                      disabled={!leadEmail.trim() || leadSubmitting}
                    >
                      {leadSubmitting ? "Sending…" : "Get My Blueprint →"}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 8px" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>You&apos;re in the system.</div>
                  <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>
                    I&apos;ll send your tailored {finalType.title.toLowerCase()} blueprint to{" "}
                    <strong>{leadEmail}</strong> shortly.
                    {p1Result?.model === "fractional" && " I'll also reach out about fractional matches."}
                  </div>
                </div>
              )}
            </div>
          </Win2KWindow>
        </div>
      )}

      {/* ═══════ TASKBAR ═══════ */}
      <div className="win2k-taskbar">
        <div className="win2k-start-btn">
          <span style={{ fontSize: 14 }}>🪟</span>
          <span>Start</span>
        </div>
        <div style={{ width: 1, height: 20, background: "#808080", margin: "0 2px" }} />
        <div className="win2k-taskbar-task">
          <span style={{ fontSize: 12 }}>📋</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {phase === "intro" && "Chief of Staff Assessment"}
            {phase === "phase1" && `Part 1 — Q${step + 1}`}
            {phase === "phase1result" && "Part 1 Result"}
            {phase === "phase2intro" && "Part 2 — Intro"}
            {phase === "phase2mc" && `Part 2 — Q${step + 1}`}
            {phase === "phase2writein" && `Part 2 — Write-In ${step + 1}`}
            {phase === "final" && "Results — Your Blueprint"}
          </span>
        </div>
        <Win2KClock />
      </div>
    </div>
  );
}
