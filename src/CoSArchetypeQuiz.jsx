import { useState } from "react";

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const questions = [
  {
    q: "What energizes you most at work?",
    options: [
      { text: "Thinking through a hard problem with a senior leader", type: "S" },
      { text: "Watching a system you built actually work", type: "O" },
      { text: "Building a relationship that opens a door", type: "E" },
      { text: "Redesigning something that's been broken for years", type: "T" },
    ],
  },
  {
    q: "A key meeting goes off the rails. Your instinct is to...",
    options: [
      { text: "Step back and identify the real issue underneath the surface", type: "S" },
      { text: "Restructure the agenda and get everyone back on track", type: "O" },
      { text: "Read the room and manage the dynamics in real time", type: "E" },
      { text: "Flag it as a symptom of a bigger structural problem", type: "T" },
    ],
  },
  {
    q: "Your CEO hands you a blank week. You prioritize...",
    options: [
      { text: "Building out the strategic planning framework for next year", type: "S" },
      { text: "Auditing the operating cadences and fixing what's broken", type: "O" },
      { text: "Deepening relationships with the board and key partners", type: "E" },
      { text: "Mapping the org's biggest structural tension and proposing a fix", type: "T" },
    ],
  },
  {
    q: "A teammate says you're at your best when...",
    options: [
      { text: '"You help me see the forest for the trees"', type: "S" },
      { text: '"Things just don\'t fall through the cracks when you\'re involved"', type: "O" },
      { text: '"You represent us perfectly in every room"', type: "E" },
      { text: '"You\'re not afraid to say what actually needs to change"', type: "T" },
    ],
  },
  {
    q: "You're handed a project with no clear brief. First move?",
    options: [
      { text: "Frame the question — what are we actually solving for?", type: "S" },
      { text: "Build a tracker, identify owners, map dependencies", type: "O" },
      { text: "Figure out who the key stakeholders are and get aligned", type: "E" },
      { text: "Look for the underlying structural issue driving the need", type: "T" },
    ],
  },
  {
    q: "If you had to name your professional superpower, it would be...",
    options: [
      { text: "Synthesizing complexity into clear, actionable recommendations", type: "S" },
      { text: "Making sure decisions actually become outcomes", type: "O" },
      { text: "Representing leadership's voice with credibility and nuance", type: "E" },
      { text: "Building new systems while the old ones are still running", type: "T" },
    ],
  },
  {
    q: "What would frustrate you most in a CoS role?",
    options: [
      { text: "Being kept out of the real strategic conversations", type: "S" },
      { text: "Decisions made with zero follow-through or accountability", type: "O" },
      { text: "Poor stakeholder management damaging key relationships", type: "E" },
      { text: "An org that resists change even when it's clearly broken", type: "T" },
    ],
  },
  {
    q: "In a fast-growing company, the biggest risk is...",
    options: [
      { text: "Losing sight of long-term strategy amid short-term noise", type: "S" },
      { text: "Execution breaking down as complexity compounds", type: "O" },
      { text: "Stakeholder relationships fraying as the org scales", type: "E" },
      { text: "The org structure not keeping pace with growth", type: "T" },
    ],
  },
  {
    q: "Your CEO describes you to a new board member as...",
    options: [
      { text: '"My thinking partner — helps me make better decisions"', type: "S" },
      { text: '"The reason our leadership team actually executes"', type: "O" },
      { text: '"The person I trust to represent us externally"', type: "E" },
      { text: '"The one leading us through this transformation"', type: "T" },
    ],
  },
];

const archetypes = {
  S: {
    label: "Strategic Chief of Staff",
    short: "Strategic",
    tagline: "The Thinking Partner",
    color: "#C9A96E",
    description:
      "You operate at altitude. Your value is in synthesizing complexity, shaping decisions before they're made, and serving as a genuine intellectual partner to leadership. You're drawn to the hard questions — not just what to do, but why it matters and what comes next. Strategic CoS profiles thrive in environments where the CEO needs a trusted thought partner who can hold the big picture without losing the thread.",
    traits: ["Conceptual thinker", "Clear communicator", "Trusted advisor", "Comfortable with ambiguity"],
    blind_spot: "Watch out for getting too high-altitude — execution still matters.",
    ideal_company: "You thrive at companies where strategy is genuinely unsettled — Series B through pre-IPO startups navigating their first real inflection point, or established organizations entering new markets. The best fit is a company where the CEO is smart but stretched thin intellectually, and where having a clear strategic framework would meaningfully change the quality of decisions being made.",
    ideal_exec: "Your ideal executive is a visionary who runs fast but thinks out loud — someone who needs a trusted partner to pressure-test ideas, synthesize inputs from across the org, and turn scattered thinking into clear direction. They should be secure enough to be challenged and curious enough to want a real thought partner, not just an executor. CEOs who want a 'yes person' will frustrate you.",
    cos_pairing: {
      best: "O",
      headline: "Strategic + Operational is the classic CoS dream team",
      why: "You set direction; they make sure it actually happens. You think in frameworks; they think in systems. Together you cover the full leadership support stack with almost no overlap — and the CEO gets both altitude and execution in one partnership.",
      tension: "T",
      tension_note: "Two architects in the same org. Both want to redesign the future. Can produce brilliant clarity — or two people competing to be the smartest in the room. Works only with crystal-clear lane ownership.",
    },
    company_compat: [
      { stage: "Seed / Series A", fit: "medium", note: "Strategy matters but survival dominates. You can add value, but may find yourself pulled into execution you didn't sign up for." },
      { stage: "Series B–C", fit: "high", note: "Prime territory. The company has PMF and is now asking hard questions about how to scale. Strategic clarity is mission-critical." },
      { stage: "Series D+ / Pre-IPO", fit: "high", note: "Highest-stakes strategic decisions — M&A, market expansion, board management. This is where your archetype creates the most leverage." },
      { stage: "Enterprise / Public", fit: "medium", note: "Strong fit when there's a transformation agenda. Weaker fit in a stable, mature org where strategy is already institutionalized." },
      { stage: "Post-Acquisition", fit: "low", note: "Integration is primarily operational and cultural. You'll feel underutilized unless you're explicitly shaping the combined entity's long-term direction." },
    ],
    exec_compat: [
      { type: "Visionary Founder", fit: "high", note: "Your ideal match. They generate ideas faster than they can evaluate them. You synthesize, pressure-test, and turn scattered vision into direction." },
      { type: "Salesperson CEO", fit: "high", note: "They're externally focused and need someone to hold the internal strategic thread. You keep the company pointed in the right direction while they sell." },
      { type: "Consensus Builder", fit: "medium", note: "They value your synthesizing ability but slow you down with committee-style decisions. Works if you can influence without needing formal authority." },
      { type: "Turnaround CEO", fit: "medium", note: "They need strategic clarity fast. Can work well, but turnarounds have operational urgency that will pull you out of your zone." },
      { type: "Operator CEO", fit: "low", note: "They already have strong strategic instincts and may not want a thinking partner — they want execution. You'll feel underutilized within 90 days." },
    ],
  },
  O: {
    label: "Operational Chief of Staff",
    short: "Operational",
    tagline: "The Architect of Execution",
    color: "#7EB8A4",
    description:
      "You're the person who makes sure decisions actually happen. You build the systems, the cadences, and the accountability structures that turn good intentions into shipped outcomes. Where others see chaos, you see a missing operating rhythm. Operational CoS profiles are invaluable in organizations where complexity has outpaced process — and where the gap between decision and result is costing the company dearly.",
    traits: ["Systems thinker", "Detail-oriented", "Accountable", "Process-driven"],
    blind_spot: "Don't let perfect process slow down necessary speed.",
    ideal_company: "You're built for companies where growth has outpaced the operating model — typically 50 to 500 employees where the informal systems that worked at 20 people are visibly breaking down. High-growth SaaS, scaling marketplaces, and post-Series B companies adding headcount faster than they're adding structure are your natural habitat. If a company has more decisions than it has bandwidth to execute on, you belong there.",
    ideal_exec: "Your ideal executive is a big-picture thinker or strong salesperson who openly admits they don't love the operational details — and means it. They move fast, make decisions quickly, and trust you to own the follow-through completely. The best version of this pairing is an exec who sets clear priorities and then genuinely gets out of your way. Watch out for executives who say they want operational support but can't resist micromanaging the systems you build.",
    cos_pairing: {
      best: "S",
      headline: "Operational + Strategic is the full-stack leadership partnership",
      why: "You make strategy real. They set direction; you build the system that executes it. Your instinct for follow-through combined with their ability to think clearly about what matters most produces the highest-functioning CoS arrangement most CEOs have ever experienced.",
      tension: "E",
      tension_note: "Both are execution-oriented but in different directions — you own inside, they own outside. Creates confusion about accountability without very clear role delineation.",
    },
    company_compat: [
      { stage: "Seed / Series A", fit: "low", note: "Too early for heavy operational infrastructure. You'll build systems nobody is ready to use yet. Come back at Series B." },
      { stage: "Series B–C", fit: "high", note: "The classic Operational CoS moment. Growth is visibly breaking informal systems and someone needs to build the new ones." },
      { stage: "Series D+ / Pre-IPO", fit: "high", note: "Complexity is at peak. You own the operating model that lets a 400-person company move with the speed of a 50-person one." },
      { stage: "Enterprise / Public", fit: "medium", note: "Operating infrastructure already exists. You can improve and optimize it, but you won't get to build from scratch." },
      { stage: "Post-Acquisition", fit: "high", note: "Integration is fundamentally an operational challenge. Two companies, two operating models — you build the combined one." },
    ],
    exec_compat: [
      { type: "Visionary Founder", fit: "high", note: "Perfect foil. They generate chaos; you create order. As long as they genuinely trust you to own the operating rhythm, this is a high-performing partnership." },
      { type: "Salesperson CEO", fit: "high", note: "They're almost never in the building. You run the company when they're not there. Classic high-trust Operational CoS arrangement." },
      { type: "Turnaround CEO", fit: "high", note: "Turnarounds are operationally intense. They need someone who can rebuild the machine while they restore confidence externally." },
      { type: "Consensus Builder", fit: "medium", note: "Slow decisions frustrate your execution instincts. Works if you can get decisions made in writing and hold people to them." },
      { type: "Operator CEO", fit: "low", note: "They'll do your job better than you — or think they can. Expect unclear boundaries and constant second-guessing of the systems you build." },
    ],
  },
  E: {
    label: "External-Facing Chief of Staff",
    short: "External-Facing",
    tagline: "The Voice in the Room",
    color: "#A89BC9",
    description:
      "You're the person leadership trusts to represent them — with the board, with partners, with investors. You have rare executive presence and the ability to carry the CEO's voice with fidelity and credibility. External-facing CoS profiles are essential when a leader's relationships have become a bottleneck and key stakeholders need consistent, high-quality engagement that the CEO can't always deliver personally.",
    traits: ["Executive presence", "High-trust communicator", "Politically sharp", "Relationship builder"],
    blind_spot: "Don't neglect the internal audience — credibility starts inside.",
    ideal_company: "You're most valuable at companies where the external relationship landscape is genuinely complex — late-stage startups with active boards and multiple investor relationships, companies managing high-stakes partnerships or regulatory relationships, or public companies where consistent stakeholder communication is mission-critical. If the CEO's calendar is dominated by external demands and key relationships are suffering from lack of attention, that's your opening.",
    ideal_exec: "Your ideal executive is highly visible, in high demand externally, and deeply aware that their relationships are a strategic asset they can't fully manage alone. They need someone with the presence and judgment to step into rooms on their behalf — not just to schedule and summarize, but to actually represent them credibly. The key is trust: this role only works if the exec is willing to let you carry their voice. An exec who can't delegate relationship ownership will leave you underutilized.",
    cos_pairing: {
      best: "O",
      headline: "External-Facing + Operational is complete coverage",
      why: "You own the outside world; they own the inside. One of the most naturally complementary pairings because there is almost no overlap. The CEO gets both external relationship management and internal execution — nothing falls through the cracks.",
      tension: "S",
      tension_note: "Both operate at altitude and both want the CEO's ear. Can create competing 'inner circle' dynamics. Only works in large, complex orgs where the lanes are genuinely distinct.",
    },
    company_compat: [
      { stage: "Seed / Series A", fit: "low", note: "External relationships are founder-led at this stage — and that's usually right. Your mandate will be too narrow to be satisfying." },
      { stage: "Series B–C", fit: "medium", note: "Board dynamics are getting complex. Investor relations and partnerships are emerging. You can add value but it's not yet mission-critical." },
      { stage: "Series D+ / Pre-IPO", fit: "high", note: "Your moment. Board management, secondary transactions, IPO prep, institutional investor relationships — external complexity peaks here." },
      { stage: "Enterprise / Public", fit: "high", note: "Ongoing investor relations, analyst coverage, regulatory and government relationships — sustained, structural need for your archetype." },
      { stage: "Post-Acquisition", fit: "medium", note: "External stakeholder communication matters during integration, but internal operational needs tend to dominate the agenda." },
    ],
    exec_compat: [
      { type: "Operator CEO", fit: "high", note: "They're often uncomfortable in external forums — boards, investors, partners. You fill a genuine gap and they'll deeply appreciate it." },
      { type: "Turnaround CEO", fit: "high", note: "Turnarounds require intense external stakeholder management. They need someone credible in every room — creditors, investors, board, media." },
      { type: "Consensus Builder", fit: "high", note: "Strong relationship builders themselves, but spread thin. You extend their relationship reach without diluting the quality." },
      { type: "Visionary Founder", fit: "medium", note: "Often great at external relationships themselves. You manage the ones they don't have bandwidth for — but may find yourself competing for the best relationships." },
      { type: "Salesperson CEO", fit: "low", note: "They live for external relationships and are exceptional at them. You'll manage logistics more than relationships. Your ceiling here is low." },
    ],
  },
  T: {
    label: "Transformation Chief of Staff",
    short: "Transformation",
    tagline: "The Change Agent",
    color: "#E8876A",
    description:
      "You're drawn to the hard change — the kind that requires redesigning how the org works while it's still operating at full speed. You see structural tension clearly and you're not afraid to name it. Transformation CoS profiles are most valuable during inflection points: rapid scaling, post-acquisition integration, leadership transitions, or market pivots where the old operating model simply won't carry the company forward.",
    traits: ["Change management", "Org design instincts", "High tolerance for ambiguity", "Pattern recognition"],
    blind_spot: "Not everything needs to be reinvented — know when to stabilize.",
    ideal_company: "You belong at companies in genuine transition — not incremental improvement, but structural change. Post-acquisition integrations, companies doubling headcount in 12 months, organizations pivoting their core business model, or leadership transitions where a new CEO needs to reshape the org around their vision. If the company is the same shape it was 18 months ago, you'll get restless. You need a mandate, a burning platform, and a leadership team willing to actually change.",
    ideal_exec: "Your ideal executive is someone who has clearly diagnosed that the org needs to change and has the conviction to drive it — but needs a partner to design and execute the transformation while they continue running the business. They should be comfortable with ambiguity, receptive to hard feedback, and willing to give you real authority over the redesign. Avoid executives who want 'transformation' in name only — you'll spend your energy fighting resistance they're quietly fueling.",
    cos_pairing: {
      best: "O",
      headline: "Transformation + Operational makes change actually stick",
      why: "You redesign the org; they implement the new operating model. Transformation without operational rigor is reorganization theater. This pairing ensures that the new structure doesn't just look good on paper — it actually runs.",
      tension: "S",
      tension_note: "Two visionaries. Both want to redesign the future. High ceiling if roles are clear — but can easily become two people competing to be the architect. Requires a strong, explicit division of ownership.",
    },
    company_compat: [
      { stage: "Seed / Series A", fit: "low", note: "Nothing to transform yet. The org is too small and too early for structural redesign — you'll be solving problems that don't exist." },
      { stage: "Series B–C", fit: "medium", note: "Early structural strain is appearing. You can get ahead of problems before they become crises, though the urgency isn't there yet." },
      { stage: "Series D+ / Pre-IPO", fit: "high", note: "The org must transform to become a public company — governance, processes, structure. This is your natural operating environment." },
      { stage: "Enterprise / Public", fit: "high", note: "Legacy enterprises with transformation mandates — digital transformation, M&A integration, business model pivots — are your natural home." },
      { stage: "Post-Acquisition", fit: "high", note: "The highest-need environment for your archetype. Two orgs becoming one requires structural redesign at every level simultaneously." },
    ],
    exec_compat: [
      { type: "Operator CEO", fit: "high", note: "They understand structural change and will give you real authority. They want transformation done right, not just done fast." },
      { type: "Turnaround CEO", fit: "high", note: "A turnaround is transformation under extreme pressure. You're exactly who they need and they'll give you the mandate to match." },
      { type: "Visionary Founder", fit: "medium", note: "They see the need for change but may resist giving up control of how it happens. Works only if they can genuinely delegate the 'how' to you." },
      { type: "Salesperson CEO", fit: "low", note: "Focused on growth, not structure. Transformation requires attention and disruption that conflicts with their revenue orientation. You'll fight for airtime." },
      { type: "Consensus Builder", fit: "low", note: "Transformation requires hard decisions that upset people. A consensus builder will soften every change you try to make sharp. Deeply frustrating pairing." },
    ],
  },
};

const TOTAL = questions.length;
const KEYS = ["S", "O", "E", "T"];

export default function CoSQuiz() {
  const makeShuffled = () => questions.map((q) => ({ ...q, options: shuffle(q.options) }));

  // Parse shared result from URL hash on mount
  const parseSharedResult = () => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#result=")) {
        const encoded = hash.slice(8);
        const decoded = JSON.parse(atob(encoded));
        if (decoded.scores && decoded.result) return decoded;
      }
    } catch (e) {}
    return null;
  };

  const shared = parseSharedResult();

  const [step, setStep] = useState(shared ? "result" : "intro");
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState(shared ? shared.scores : { S: 0, O: 0, E: 0, T: 0 });
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState(shared ? shared.result : null);
  const [shuffledQuestions, setShuffledQuestions] = useState(makeShuffled);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 600);
  const [openSections, setOpenSections] = useState({
    profile: true,
    dominant: true,
    idealFit: false,
    companyCompat: false,
    execCompat: false,
    secondary: false,
    lowerSignals: false,
  });
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── RADAR CHART ──
  const RadarChart = ({ scores, dominant }) => {
    const cx = 160, cy = 160, maxR = 100, total = 9;
    const axes = [
      { key: "S", label: "Strategic",       angle: -90  },
      { key: "O", label: "Operational",     angle: 0    },
      { key: "E", label: "External-Facing", angle: 90   },
      { key: "T", label: "Transformation",  angle: 180  },
    ];
    const toXY = (angle, r) => ({
      x: cx + r * Math.cos((angle * Math.PI) / 180),
      y: cy + r * Math.sin((angle * Math.PI) / 180),
    });
    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const scoredPoints = axes.map(({ key, angle }) => toXY(angle, (scores[key] / total) * maxR));
    const polyPoints = scoredPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const domColor = dominant.length > 0 ? archetypes[dominant[0]].color : "#C9A96E";

    return (
      <svg width="100%" viewBox="0 0 320 320" style={{ background: "#F8F6F2", display: "block", maxWidth: 320, margin: "0 auto" }}>
        {/* Background */}
        <rect width="320" height="320" fill="#F8F6F2" />

        {/* Grid rings */}
        {gridLevels.map((lvl, i) => (
          <circle key={i} cx={cx} cy={cy} r={maxR * lvl} fill="none" stroke="#DDD9D2" strokeWidth={1} strokeDasharray={i < 3 ? "3 3" : "none"} />
        ))}

        {/* Grid % labels */}
        {gridLevels.map((lvl, i) => (
          <text key={i} x={cx + 4} y={cy - maxR * lvl + 3} fontSize={8} fill="#BBBBAA" fontFamily="Georgia, serif">{Math.round(lvl * 100)}%</text>
        ))}

        {/* Axis lines */}
        {axes.map(({ key, angle }) => {
          const end = toXY(angle, maxR);
          return <line key={key} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="#D0CCC6" strokeWidth={1} />;
        })}

        {/* Score polygon fill */}
        <polygon points={polyPoints} fill={domColor + "28"} stroke={domColor} strokeWidth={2} strokeLinejoin="round" />

        {/* Score dots */}
        {scoredPoints.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={5} fill={archetypes[axes[i].key].color} stroke="#F8F6F2" strokeWidth={1.5} />
        ))}

        {/* Axis labels */}
        {axes.map(({ key, label, angle }) => {
          const p = toXY(angle, maxR + 28);
          const scoreP = toXY(angle, maxR + 42);
          const isDom = dominant.includes(key);
          const a = archetypes[key];
          return (
            <g key={key}>
              <text x={p.x.toFixed(1)} y={p.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fontFamily="Georgia, serif"
                fill={isDom ? a.color : "#888078"} fontWeight={isDom ? "600" : "400"}>
                {label}
              </text>
              <text x={scoreP.x.toFixed(1)} y={scoreP.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontFamily="Georgia, serif" fill={isDom ? a.color + "CC" : "#AAAAAA"}>
                {scores[key]}/9
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={domColor + "88"} />
      </svg>
    );
  };

  const Accordion = ({ sectionKey, label, color, children, defaultDot }) => {
    const isOpen = openSections[sectionKey];
    return (
      <div style={{ marginBottom: 2 }}>
        <button
          onClick={() => toggleSection(sectionKey)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            width: "100%", padding: "14px 16px",
            background: isOpen ? "#181816" : "#131311",
            border: `1px solid ${isOpen ? "#2A2A26" : "#1E1E1C"}`,
            cursor: "pointer", marginBottom: isOpen ? 0 : 2,
            transition: "all 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {defaultDot && <div style={{ width: 6, height: 6, borderRadius: "50%", background: color || "#888", flexShrink: 0 }} />}
            <span style={{ fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: isOpen ? (color || "#D8D0C8") : "#A09890" }}>
              {label}
            </span>
          </div>
          {/* Chevron arrow */}
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ flexShrink: 0, transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M2 4.5L7 9.5L12 4.5" stroke={isOpen ? (color || "#C0B8B0") : "#686058"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isOpen && (
          <div style={{ padding: "16px", background: "#0F0F0E", border: "1px solid #1E1E1C", borderTop: "none", marginBottom: 8 }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const handleShare = (scoresObj, resultKey) => {
    try {
      const payload = btoa(JSON.stringify({ scores: scoresObj, result: resultKey }));
      const url = `${window.location.origin}${window.location.pathname}#result=${payload}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleSelect = (type) => {
    if (animating || revealed) return;
    setSelected(type);
    setRevealed(true);
  };

  const handleNext = () => {
    if (!selected || animating) return;
    const newScores = { ...scores, [selected]: scores[selected] + 1 };
    setScores(newScores);
    setAnimating(true);
    setTimeout(() => {
      if (current + 1 >= TOTAL) {
        const top = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(top);
        setStep("result");
      } else {
        setCurrent(current + 1);
        setSelected(null);
        setRevealed(false);
      }
      setAnimating(false);
    }, 280);
  };

  const handleRestart = () => {
    setStep("intro");
    setCurrent(0);
    setScores({ S: 0, O: 0, E: 0, T: 0 });
    setSelected(null);
    setRevealed(false);
    setResult(null);
    setShuffledQuestions(makeShuffled());
  };

  const progress = (current / TOTAL) * 100;
  const runningTotal = Object.values(scores).reduce((a, b) => a + b, 0);

  const base = {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "#0F0F0E",
    color: "#E8E4DC",
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: isMobile ? "24px 16px 48px" : "40px 24px 64px",
  };

  // ─── INTRO ───────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div style={base}>
        <div style={{ maxWidth: 620, width: "100%" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999990", marginBottom: 24 }}>
            Chief of Staff × Self-Assessment
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, lineHeight: 1.15, color: "#E8E4DC", margin: "0 0 20px 0" }}>
            What kind of Chief<br />of Staff would you be?
          </h1>
          <div style={{ width: 48, height: 1, background: "#333", margin: "0 0 28px 0" }} />
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.7, color: "#D0C8C0", margin: "0 0 28px 0" }}>
            There are four distinct archetypes of effective Chiefs of Staff.
            Nine questions to find yours — and what it says about how you lead.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            {KEYS.map((k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: archetypes[k].color }} />
                <span style={{ fontSize: 13, color: "#999990" }}>{archetypes[k].short}</span>
              </div>
            ))}
          </div>
          <button
            style={{ padding: "16px 36px", background: "#E8E4DC", color: "#0F0F0E", fontFamily: "Georgia, serif", fontSize: 16, border: "none", cursor: "pointer", letterSpacing: "0.05em", marginBottom: 8 }}
            onClick={() => setStep("quiz")}
          >
            Begin →
          </button>
          <p style={{ marginTop: 16, fontSize: 12, color: "#707068" }}>Takes about 3 minutes</p>
        </div>
      </div>
    );
  }

  // ─── QUIZ ────────────────────────────────────────────────
  if (step === "quiz") {
    const q = shuffledQuestions[current];
    return (
      <div style={base}>
        <div style={{ maxWidth: 620, width: "100%" }}>

          {/* Progress bar */}
          <div style={{ width: "100%", height: 2, background: "#1A1A18", marginBottom: 36 }}>
            <div style={{ height: "100%", background: "#C9A96E", width: `${progress}%`, transition: "width 0.4s ease" }} />
          </div>

          {/* Running tally — hidden until answer selected, snaps away on Next */}
          <div style={{
            marginBottom: revealed && !animating ? 28 : 0,
            padding: revealed && !animating ? "14px 16px" : "0 16px",
            background: "#111110",
            border: `1px solid ${revealed && !animating ? "#1A1A18" : "transparent"}`,
            maxHeight: revealed && !animating ? "200px" : "0px",
            overflow: "hidden",
            opacity: revealed && !animating ? 1 : 0,
            transition: animating ? "none" : "all 0.35s ease",
          }}>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#707068", marginBottom: 12 }}>
              Running tally
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {KEYS.map((k) => {
                // Include current selection in preview
                const previewScores = selected
                  ? { ...scores, [selected]: scores[selected] + 1 }
                  : scores;
                const previewTotal = Object.values(previewScores).reduce((a, b) => a + b, 0);
                const count = previewScores[k];
                const pct = previewTotal > 0 ? Math.round((count / previewTotal) * 100) : 0;
                const isJustSelected = k === selected;
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: count > 0 ? archetypes[k].color : "#2A2A28", width: 90, letterSpacing: "0.05em", flexShrink: 0 }}>
                      {archetypes[k].short}
                    </span>
                    <div style={{ flex: 1, height: 3, background: "#1A1A18" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: count > 0 ? archetypes[k].color : "#1A1A18", transition: "width 0.5s ease" }} />
                    </div>
                    <span style={{ fontSize: 11, color: count > 0 ? archetypes[k].color : "#2A2A28", width: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {isJustSelected ? <span style={{ color: archetypes[k].color }}>+1</span> : count > 0 ? `×${count}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#909088", marginBottom: 14 }}>
            Question {current + 1} of {TOTAL}
          </div>

          <p style={{ fontSize: "clamp(18px, 3vw, 23px)", fontWeight: 400, lineHeight: 1.4, color: "#E8E4DC", margin: "0 0 26px 0", opacity: animating ? 0 : 1, transition: "opacity 0.2s" }}>
            {q.q}
          </p>

          {/* Options */}
          <div style={{ opacity: animating ? 0 : 1, transition: "opacity 0.2s" }}>
            {q.options.map((opt, i) => {
              const arch = archetypes[opt.type];
              const isSelected = selected === opt.type;
              const isOther = revealed && !isSelected;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.type)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: isMobile ? "16px 14px" : "14px 16px", marginBottom: 10,
                    minHeight: 52,
                    background: isSelected ? "#161614" : "transparent",
                    border: isSelected ? `1px solid ${arch.color}` : "1px solid #1E1E1C",
                    color: isSelected ? "#E8E4DC" : isOther ? "#333" : "#C8C0B8",
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(13px, 2vw, 15px)", lineHeight: 1.5,
                    cursor: revealed ? "default" : "pointer",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    if (!revealed) {
                      e.currentTarget.style.borderColor = "#383836";
                      e.currentTarget.style.color = "#C0B8B0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!revealed) {
                      e.currentTarget.style.borderColor = "#1E1E1C";
                      e.currentTarget.style.color = "#C8C0B8";
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                    {/* Archetype badge — completely invisible until selection */}
                    <span style={{
                      flexShrink: 0, fontSize: 10,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      padding: "2px 8px", marginTop: 2,
                      color: isSelected ? arch.color : "#2A2A28",
                      border: `1px solid ${isSelected ? arch.color + "60" : "#222"}`,
                      background: isSelected ? arch.color + "12" : "transparent",
                      visibility: revealed ? "visible" : "hidden",
                      opacity: revealed ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}>
                      {arch.short}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Post-selection feedback */}
          {revealed && !animating && (
            <div style={{ marginTop: 6, paddingTop: 18 }}>
              <p style={{ fontSize: 13, color: "#909088", margin: "0 0 16px 0", fontStyle: "italic" }}>
                That answer signals{" "}
                <span style={{ color: archetypes[selected].color, fontStyle: "normal" }}>
                  {archetypes[selected].label}
                </span>.
              </p>
              <button
                onClick={handleNext}
                style={{
                  padding: "15px 32px", background: "#C9A96E", color: "#0F0F0E",
                  fontFamily: "Georgia, serif", fontSize: 15,
                  border: "none", cursor: "pointer", letterSpacing: "0.05em",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {current + 1 === TOTAL ? "See my result →" : "Next →"}
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }



  if (step === "result" && result) {
    const totalAnswered = Object.values(scores).reduce((a, b) => a + b, 0);
    const sortedKeys = [...KEYS].sort((a, b) => scores[b] - scores[a]);
    const topScore = scores[sortedKeys[0]];
    const dominant = sortedKeys.filter((k) => scores[k] === topScore);
    const rest = sortedKeys.filter((k) => scores[k] < topScore);
    const isTie = dominant.length > 1;

    const rankColor = (k) => {
      if (dominant.includes(k)) return archetypes[k].color;
      const i = rest.indexOf(k);
      if (i === 0) return archetypes[k].color + "AA";
      if (i === 1) return archetypes[k].color + "55";
      return archetypes[k].color + "2A";
    };

    const rankLabel = (k) => {
      if (dominant.includes(k)) return isTie ? "Co-dominant" : "Dominant";
      const i = rest.indexOf(k);
      if (i === 0) return "Secondary";
      if (i === 1) return "Tertiary";
      return "Least dominant";
    };

    const secondaryContext = {
      S: "A secondary Strategic signal means you're drawn to big-picture questions even in execution mode — you naturally zoom out.",
      O: "A secondary Operational signal means you have a strong instinct for follow-through — you don't just think, you make sure things happen.",
      E: "A secondary External-Facing signal means you're attuned to relationships and how the org is perceived — valuable in any CoS role.",
      T: "A secondary Transformation signal means you notice structural friction. When things are broken, you're already mentally redesigning them.",
    };

    const leastContext = {
      S: "Strategic is your least activated archetype — not an absence of strategic thinking, but a signal that you lead with doing over planning.",
      O: "Operational is your least activated archetype — you may thrive in ambiguity and big-picture work, but execution systems aren't your natural pull.",
      E: "External-Facing is your least activated archetype — your energy tends inward, toward the org itself rather than the stakeholder landscape.",
      T: "Transformation is your least activated archetype — you're likely more comfortable building on stable ground than redesigning the org mid-flight.",
    };

    const handleEmailSubmit = async () => {
      if (!emailInput || !emailInput.includes("@")) return;
      setEmailSubmitting(true);
      try {
        const dominantLabels = dominant.map((k) => archetypes[k].label).join(" & ");
        const secondaryLabel = rest.length > 0 ? archetypes[rest[0]].label : "";

        // Build HTML score bars for email
        const barRows = KEYS.map((k) => {
          const a = archetypes[k];
          const pct = Math.round((scores[k] / 9) * 100);
          const isDom = dominant.includes(k);
          return `<tr>
            <td style="padding:4px 8px 4px 0;font-family:Georgia,serif;font-size:13px;color:${isDom ? a.color : "#888"};width:110px">${a.short}</td>
            <td style="padding:4px 0">
              <div style="background:#F0EDE8;border-radius:2px;height:10px;width:200px">
                <div style="background:${a.color};height:10px;width:${pct * 2}px;border-radius:2px"></div>
              </div>
            </td>
            <td style="padding:4px 0 4px 8px;font-family:Georgia,serif;font-size:12px;color:${isDom ? a.color : "#AAA"}">${scores[k]}/9</td>
          </tr>`;
        }).join("");

        const params = new URLSearchParams({
          name: nameInput,
          email: emailInput,
          archetype: dominantLabels,
          secondaryArchetype: secondaryLabel,
          source: "quiz",
          scoreS: scores.S,
          scoreO: scores.O,
          scoreE: scores.E,
          scoreT: scores.T,
          barRows: encodeURIComponent(barRows),
        });
        new Image().src = `https://script.google.com/macros/s/AKfycbzo_2fc4r1dMBJp4EE-cgKPVAHvT9KgaawXEGGQ1MVrTT8DX1u3Hy0_eRYhUXyvXyENiQ/exec?${params}`;
        setTimeout(() => {
          setEmailSubmitted(true);
          setEmailSubmitting(false);
        }, 800);
      } catch (e) {
        setEmailSubmitting(false);
      }
    };

    return (
      <div style={base}>
        <div style={{ maxWidth: 620, width: "100%" }}>

          {/* Score bar summary — always visible */}
          <div style={{ marginBottom: 28, padding: "18px 20px", background: "#111110", border: "1px solid #1A1A18" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#707068", marginBottom: 16 }}>
              Your full profile — {totalAnswered} answers
            </div>
            {sortedKeys.map((k) => {
              const a = archetypes[k];
              const count = scores[k];
              const pct = Math.round((count / totalAnswered) * 100);
              const isDom = dominant.includes(k);
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: rankColor(k), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: isDom ? a.color : "#888880" }}>{a.short}</span>
                      <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: isDom ? a.color + "99" : "#252520", border: `1px solid ${isDom ? a.color + "33" : "#1E1E1C"}`, padding: "1px 6px" }}>
                        {rankLabel(k)}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: isDom ? a.color : "#333", fontVariantNumeric: "tabular-nums" }}>
                      {count}/{totalAnswered} · {pct}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 3, background: "#1A1A18" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: rankColor(k), transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── RADAR CHART ── */}
          <div style={{ marginBottom: 28, padding: "24px 20px", background: "#F8F6F2", border: "1px solid #E8E4DC" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A09890", marginBottom: 16, textAlign: "center" }}>
              Your Archetype Map
            </div>
            <RadarChart scores={scores} dominant={dominant} />
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
              {KEYS.map((k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: archetypes[k].color }} />
                  <span style={{ fontSize: 11, color: "#888078", fontFamily: "Georgia, serif" }}>{archetypes[k].short}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── EMAIL CAPTURE ── */}
          <div style={{ marginBottom: 28, padding: "20px", background: "#111110", border: `1px solid ${archetypes[dominant[0]].color}33` }}>
            {emailSubmitted ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: archetypes[dominant[0]].color, marginBottom: 8 }}>
                  Results sent ✓
                </div>
                <p style={{ fontSize: 13, color: "#A09890", margin: 0 }}>
                  Check your inbox — your full archetype results are on their way.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "#C8C0B8", margin: "0 0 4px 0", fontWeight: 400 }}>
                  Want a copy of your results?
                </p>
                <p style={{ fontSize: 12, color: "#706858", margin: "0 0 16px 0", lineHeight: 1.6 }}>
                  Enter your email and we'll send your full archetype breakdown — including ideal fit and compatibility scores.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{
                      padding: "12px 14px", background: "#0F0F0E",
                      border: "1px solid #2A2A28", color: "#E8E4DC",
                      fontFamily: "Georgia, serif", fontSize: 14,
                      outline: "none", width: "100%", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                    <input
                      type="email"
                      placeholder="Work email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                      style={{
                        padding: "12px 14px", background: "#0F0F0E",
                        border: "1px solid #2A2A28", color: "#E8E4DC",
                        fontFamily: "Georgia, serif", fontSize: 14,
                        outline: "none", flex: 1, boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleEmailSubmit}
                      disabled={emailSubmitting}
                      style={{
                        padding: "12px 24px",
                        background: emailInput.includes("@") ? archetypes[dominant[0]].color : "#1E1E1C",
                        color: emailInput.includes("@") ? "#0F0F0E" : "#404038",
                        fontFamily: "Georgia, serif", fontSize: 14,
                        border: "none", cursor: emailInput.includes("@") ? "pointer" : "default",
                        transition: "all 0.2s", whiteSpace: "nowrap",
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      {emailSubmitting ? "Sending..." : "Email my results →"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── DOMINANT ── */}
          {dominant.map((k) => {
            const a = archetypes[k];
            return (
              <div key={k} style={{ marginBottom: 20 }}>
                {/* Always-visible header */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ width: 40, height: 3, background: a.color, marginBottom: 14 }} />
                  <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: a.color, margin: "0 0 6px 0" }}>
                    {isTie ? "Co-Dominant · " : "Dominant · "}{a.tagline}
                  </p>
                  <h2 style={{ fontSize: "clamp(20px, 3.5vw, 30px)", fontWeight: 400, color: "#E8E4DC", margin: "0 0 14px 0", lineHeight: 1.2 }}>
                    {a.label}
                  </h2>
                  <p style={{ fontSize: "clamp(14px, 2vw, 16px)", lineHeight: 1.8, color: "#DDD5CC", margin: "0 0 14px 0" }}>
                    {a.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {a.traits.map((t) => (
                      <span key={t} style={{ padding: "5px 13px", border: `1px solid ${a.color}33`, color: a.color, fontSize: 12 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ padding: "12px 16px", background: "#111110", border: "1px solid #1A1A18", marginBottom: 16 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#808078" }}>Watch: </span>
                    <span style={{ fontSize: 13, color: "#AA9A90", lineHeight: 1.6 }}>{a.blind_spot}</span>
                  </div>
                </div>

                {/* Accordions for detail sections */}
                <Accordion sectionKey="idealFit" label="Ideal Fit" color={a.color} defaultDot>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: "14px", background: "#111110", border: `1px solid ${a.color}22` }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: a.color + "99", marginBottom: 8 }}>Company</div>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#B0A090", margin: 0 }}>{a.ideal_company}</p>
                    </div>
                    <div style={{ padding: "14px", background: "#111110", border: `1px solid ${a.color}22` }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: a.color + "99", marginBottom: 8 }}>Executive</div>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#B0A090", margin: 0 }}>{a.ideal_exec}</p>
                    </div>
                  </div>
                </Accordion>

                <Accordion sectionKey="companyCompat" label="Company Stage Compatibility" color={a.color} defaultDot>
                  {a.company_compat.map((c) => {
                    const fitColor = c.fit === "high" ? "#5A8A60" : c.fit === "medium" ? "#8A7A40" : "#6A3A30";
                    const fitBg = c.fit === "high" ? "#0A1A0C" : c.fit === "medium" ? "#1A1600" : "#1A0A08";
                    const fitBorder = c.fit === "high" ? "#1A3A1E" : c.fit === "medium" ? "#2A2200" : "#2A1210";
                    const fitLabel = c.fit === "high" ? "Strong fit" : c.fit === "medium" ? "Moderate fit" : "Weak fit";
                    return (
                      <div key={c.stage} style={{ display: "flex", gap: 14, marginBottom: 10, padding: "12px 14px", background: "#111110", border: "1px solid #181816" }}>
                        <div style={{ flexShrink: 0, width: isMobile ? 82 : 90 }}>
                          <div style={{ fontSize: 10, color: "#707068", marginBottom: 4 }}>{c.stage}</div>
                          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: fitColor, background: fitBg, border: `1px solid ${fitBorder}`, padding: "2px 6px", whiteSpace: "nowrap", display: "inline-block" }}>
                            {fitLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "#8A8070", lineHeight: 1.6, margin: 0 }}>{c.note}</p>
                      </div>
                    );
                  })}
                </Accordion>

                <Accordion sectionKey="execCompat" label="Executive Type Compatibility" color={a.color} defaultDot>
                  {a.exec_compat.map((e) => {
                    const fitColor = e.fit === "high" ? "#5A8A60" : e.fit === "medium" ? "#8A7A40" : "#6A3A30";
                    const fitBg = e.fit === "high" ? "#0A1A0C" : e.fit === "medium" ? "#1A1600" : "#1A0A08";
                    const fitBorder = e.fit === "high" ? "#1A3A1E" : e.fit === "medium" ? "#2A2200" : "#2A1210";
                    const fitLabel = e.fit === "high" ? "Strong" : e.fit === "medium" ? "Moderate" : "Weak";
                    return (
                      <div key={e.type} style={{ display: "flex", gap: 14, marginBottom: 10, padding: "12px 14px", background: "#111110", border: "1px solid #181816" }}>
                        <div style={{ flexShrink: 0, width: isMobile ? 82 : 90 }}>
                          <div style={{ fontSize: 10, color: "#707068", marginBottom: 4 }}>{e.type}</div>
                          <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: fitColor, background: fitBg, border: `1px solid ${fitBorder}`, padding: "2px 6px", whiteSpace: "nowrap", display: "inline-block" }}>
                            {fitLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "#8A8070", lineHeight: 1.6, margin: 0 }}>{e.note}</p>
                      </div>
                    );
                  })}
                </Accordion>

              </div>
            );
          })}

          {/* ── SECONDARY ── */}
          {rest.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Accordion sectionKey="secondary" label={`Secondary — ${archetypes[rest[0]].short}`} color={archetypes[rest[0]].color} defaultDot>
                {(() => {
                  const k = rest[0];
                  const a = archetypes[k];
                  return (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 17px)", color: "#D0C8C0", fontWeight: 400 }}>{a.label}</span>
                        <span style={{ fontSize: 9, color: a.color + "88", border: `1px solid ${a.color}2A`, padding: "2px 7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {scores[k]}/{totalAnswered}
                        </span>
                      </div>
                      <p style={{ fontSize: "clamp(13px, 2vw, 15px)", lineHeight: 1.75, color: "#AA9A90", margin: "0 0 12px 0" }}>
                        {secondaryContext[k]}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {a.traits.map((t) => (
                          <span key={t} style={{ padding: "4px 11px", border: `1px solid ${a.color}1A`, color: a.color + "88", fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </Accordion>
            </div>
          )}

          {/* ── LOWER SIGNALS ── */}
          {rest.length > 1 && (
            <div style={{ marginTop: 2 }}>
              <Accordion sectionKey="lowerSignals" label="Lower Signals" defaultDot={false}>
                {rest.slice(1).map((k, i) => {
                  const a = archetypes[k];
                  const isLeast = i === rest.slice(1).length - 1;
                  return (
                    <div key={k} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `2px solid ${a.color}22` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isLeast ? 6 : 0, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#707068" }}>{a.label}</span>
                        <span style={{ fontSize: 9, color: "#404038", border: "1px solid #1A1A18", padding: "1px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {rankLabel(k)} · {scores[k]}/{totalAnswered}
                        </span>
                      </div>
                      {isLeast && (
                        <p style={{ fontSize: 13, lineHeight: 1.65, color: "#606058", margin: 0 }}>
                          {leastContext[k]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </Accordion>
            </div>
          )}

          <div style={{ height: 1, background: "#1A1A18", margin: "28px 0 24px" }} />
          <p style={{ fontSize: 14, color: "#909088", marginBottom: 18, lineHeight: 1.6 }}>
            Curious whether your organization actually needs this archetype?
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", marginBottom: 20 }}>
            <a
              href="https://cos-assessment.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "16px 24px", background: "#E8E4DC", color: "#0F0F0E", fontFamily: "Georgia, serif", fontSize: 15, textDecoration: "none", letterSpacing: "0.04em", display: "block", textAlign: "center" }}
            >
              Take the full hiring assessment →
            </a>
            <button
              onClick={handleRestart}
              style={{ padding: "16px 24px", background: "transparent", color: "#909088", fontFamily: "Georgia, serif", fontSize: 15, border: "1px solid #1E1E1C", cursor: "pointer" }}
            >
              Retake
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#2A2A28", margin: 0, paddingTop: 16, borderTop: "1px solid #161614" }}>
            Full assessment at cos-assessment.vercel.app — determines engagement model, archetype, and provides a complete hiring blueprint.
          </p>

        </div>
      </div>
    );
  }

  return null;
}
