(function () {
  "use strict";

  const LOGO = "../images/development-agency-logo.png";
  const CLAUDE = "../images/fluentOS-tour/claude-code-logo.png";
  const INDUSTRIES = ["Law", "Medical", "Real Estate", "Finance", "Agencies", "Ops", "Consulting"];
  const STEP_LABELS = [
    "Welcome",
    "HelixOS",
    "Daily Brief",
    "Dashboard",
    "Anomaly",
    "Chat",
    "Installation",
    "Automations",
    "Custom Software",
    "Security",
    "Results",
    "Handoff",
  ];

  const NARRATION = {
    1: "Think of Helix OS as an operating system — not software. An OS runs whatever you install on it. This tour shows you what one company installed on theirs. Yours will run something different — because you're different. Press play when you're ready.",
    2: "Before we walk through it — what is Helix OS? At the core is Claude Code. The agentic AI engine from Anthropic. But Claude by itself doesn't know your business. It doesn't know your customers, your tools, your workflows, your data. That's where most people get stuck. They start on their own, and within a week realize — the software is the easy part. Making it understand your world is the hard part. Helix OS is the infrastructure that wraps around it. The context. The integrations. The memory. The governance. Regardless of your industry.",
    3: "Monday. Eight-thirty AM. While you poured coffee, Helix OS read your pipeline, your calendar, your revenue, your ads. A brief is waiting. Watch.",
    4: "Your dashboard. One screen. Whatever your business is — this is what it looks like when it's working. And notice — it's not just metrics. Each panel has insights, written like a human analyst read your data at 8 AM and left you the takeaways. What changed. What to do about it. Three thousand dollars behind target, with a reason and a fix. That's the difference.",
    5: "Three leads went silent last week. Watch what happens when we ask. Names. Reasons. Next actions. The same engine finds whatever 'going silent' means in your business.",
    6: "Ask anything. Plain English in. Plain English out. Not a chatbot reading a manual — this is reading your data and answering in real time. What would you ask if every answer came in three seconds?",
    7: "Here's how it actually works. Once the contract is signed, we book an onboarding call. That's where we set up your team communication channel, walk through your current tools, and collect what we need — software list, API keys, workflows. Once we have it all, the three-day build begins. Three working days. Foundation installed. Systems deployed. Handoff walkthrough at the end. Then — this part matters most — we stay. Monthly retainer, as your consultant. We don't ship software and disappear. We're in your corner every month, as your business evolves.",
    8: "Once the foundation is live, you build automations on top. Thousands of them. Triggered by events in your business — a lead books, a matter opens, a payment clears, a listing goes live. The automation handles the chain of steps that used to eat hours of your week. Watch one flow.",
    9: "This is where it gets real. Over time, we build custom software on top. A CRM for your workflow. A client portal that feels like yours. Reports that answer your questions. Anything you currently rent — HubSpot, GoHighLevel, Calendly, ActiveCampaign — we can rebuild. Tailored to you. Owned by you. It takes time. But you stop renting software for good.",
    10: "All of this runs on your rules. Encryption at rest and in transit. Every access logged. Role-based permissions. For regulated industries, we go further. The LLMs that power Helix OS deploy on AWS Bedrock, inside your own Amazon account. Your data never leaves your VPC. Model providers never see it. Every prompt, logged to your own CloudTrail. HIPAA, FINRA, GDPR, SOC 2 — your compliance, intact.",
    11: "So what does all this actually return? One overdue invoice caught before it aged another thirty days — nine thousand dollars saved. One hidden B2B opportunity flagged — a small lead worth fifteen thousand. One ad set paused six days early before it burned more budget. Three cold leads reactivated before they chose someone else. Software rent eliminated. Six hours a week of manual reporting, gone. These moments compound. Small catches. Big returns. Every decision, backed by your data.",
    12: "What you just saw is one example of Helix OS. Yours will take shape around your business and the way you work. Come to the call with one question — one thing you wish your data could answer every morning. We'll start there. One last thing — please confirm your meeting with us, so we know you'll be there. Looking forward to meeting you.",
  };

  const SIGNALS = [
    { type: "fire", text: "Michael Brennan booked — possible $15K engagement (individual intake)" },
    { type: "warn", text: "3 leads went silent 5+ days: Kellner, Shah, Moore" },
    { type: "warn", text: 'Meta ad set "Ops Leaders v3" burning $47/day at 0.4% CTR — recommend pause' },
    { type: "win", text: "$2,847 collected over weekend — 71% above 7-day avg" },
    { type: "info", text: "Two deals in CLOSING need a nudge by Friday to hit $20K month" },
  ];
  const SIGNAL_ICON = { fire: "🔥", warn: "⚠️", win: "✅", info: "📌" };

  const LEADS = [
    { name: "Marcus Kellner", role: "Director of Ops", lastTouch: "4 days ago", score: 82, reason: "No reply after demo scheduled" },
    { name: "Priya Shah", role: "Head of Finance", lastTouch: "6 days ago", score: 71, reason: "Replied twice, then silence" },
    { name: "Danton Moore", role: "Sales Manager", lastTouch: "5 days ago", score: 67, reason: "Booked but never confirmed" },
  ];

  const CHATS = [
    {
      q: "Which matters are aging past SLA?",
      source: "Case Management",
      industryContext: "Law firm example",
      a: {
        headline: "4 matters — aging > 14 days since last client touch",
        body: "Rodriguez v. Apex (22 days) · Sterling Estate (17 days) · Chen LLC (16 days) · Merriweather trust (14 days).",
        action: "Flag to partner-in-charge. Draft status updates for associate to send today.",
      },
    },
    {
      q: "Who's my highest-value lead that hasn't heard from us in seven days?",
      source: "CRM",
      industryContext: "Ops / agency example",
      a: {
        headline: "Marcus Kellner — Director of Ops",
        body: "Est. $12,847 lifetime value · last touch 7 days ago · booked a demo, never followed up.",
        action: "Call today, reference his Q3 ops roadmap comment from the intake form.",
      },
    },
    {
      q: "Which patients are overdue for a follow-up appointment?",
      source: "EMR",
      industryContext: "Medical practice example",
      a: {
        headline: "31 patients — overdue 90+ days since last visit",
        body: "12 on active treatment plans · 8 flagged as high-risk · 11 routine check-ins.",
        action: "Auto-queue outreach. Recall letter for 11 routine. Nurse-to-patient call for the 8 high-risk.",
      },
    },
    {
      q: "Which listings are underpriced relative to this week's comps?",
      source: "MLS + Market Data",
      industryContext: "Real estate example",
      a: {
        headline: "3 active listings — likely undervalued by $15K–$42K",
        body: "42 Cedar Lane · 1807 Highpoint · 219 Ashbury. Comps moved 4.8% this week.",
        action: "Schedule pricing review with listing agents today. Consider a midweek price adjustment.",
      },
    },
  ];

  const AUTOMATIONS = [
    { industry: "Law Firm", accent: "#1e40af", trigger: "New matter opens", steps: ["Run conflict check", "Pull prior client history", "Draft engagement letter", "Route to partner for sign-off"], outcome: "30 min of associate time → 90 seconds" },
    { industry: "Medical Practice", accent: "#2563eb", trigger: "Patient books appointment", steps: ["Pull insurance eligibility", "Flag any prior balance", "Pre-populate intake form", "Send pre-visit instructions"], outcome: "Zero manual verification calls" },
    { industry: "Real Estate", accent: "#3b82f6", trigger: "Listing goes live", steps: ["Auto price-check vs. comps", "Post to MLS + Zillow", "Alert matching buyer list", "Schedule open-house sequence"], outcome: "6 hours of admin → fully automated" },
    { industry: "Investment Firm", accent: "#60a5fa", trigger: "Allocation drifts off-target", steps: ["Auto-flag on dashboard", "Draft rebalance proposal", "Route to compliance", "Send client notification"], outcome: "Same-day rebalance, fully logged" },
  ];

  const REPLACED = [
    { name: "HubSpot", replacedBy: "Custom CRM + pipeline", savings: "$1,200/mo" },
    { name: "GoHighLevel", replacedBy: "Lead engagement automations", savings: "$297/mo" },
    { name: "Calendly Pro", replacedBy: "Calendar routing automation", savings: "$15/user/mo" },
    { name: "ActiveCampaign", replacedBy: "Email sequence automations", savings: "$229/mo" },
  ];

  const SOURCES = [
    { label: "CRM", icon: "👥" },
    { label: "Sales", icon: "🎯" },
    { label: "Inventory", icon: "📦" },
    { label: "Finance", icon: "💵" },
    { label: "Marketing", icon: "📣" },
    { label: "Email", icon: "📧" },
    { label: "Website", icon: "🌐" },
  ];

  const MODULES = [
    {
      id: "sales-pipeline",
      label: "Sales Pipeline",
      icon: "🎯",
      summary: "Active deals, booked calls, and conversion trends across the last 30 days.",
      sources: ["CRM", "Sales", "Email"],
      metrics: [
        { value: "$16,600", label: "MTD Revenue", change: "+18% vs last month", change_type: "up", color: "green", insight: "You're 83% of target with 6 business days remaining. Two deals in CLOSING will carry you across." },
        { value: "14", label: "Booked (today)", change: "-31.6 vs 7d avg", change_type: "down", color: "red", insight: 'Booking volume dipped today. Ad set "Ops Leaders v3" fatigue is the likely cause — see Marketing insights.' },
        { value: "5.3%", label: "Call → Close", change: "+2.1pt vs 30d", change_type: "up", color: "yellow", insight: "Close rate climbing after the new discovery-call framework rolled out March 7. Target: 15–25%." },
        { value: "3", label: "In Closing", change: "$9,400 potential", change_type: "neutral", color: "white", insight: "Kellner ($5,200), Shah ($2,800), Brennan ($1,400 + possible B2B upsell to $15K)." },
      ],
      chart: { type: "bar", title: "Revenue · last 7 days", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [1420, 1680, 1590, 1980, 2220, 1950, 2847] },
      table: {
        headers: ["Lead", "Stage", "Value", "Last Touch", "Status"],
        rows: [
          { cells: ["Marcus Kellner", "Closing", "$5,200", "7 days ago", "Cold — revive"], status: "red" },
          { cells: ["Michael Brennan", "Discovery", "$2,500", "1 hour ago", "🔥 B2B signal"], status: "green" },
          { cells: ["Priya Shah", "Closing", "$2,800", "6 days ago", "Cold — revive"], status: "yellow" },
          { cells: ["Danton Moore", "Booked", "$1,800", "5 days ago", "Needs confirm"], status: "yellow" },
          { cells: ["Rachel Ito", "Qualified", "$3,500", "1 day ago", "On track"], status: "green" },
        ],
      },
    },
    {
      id: "marketing",
      label: "Marketing",
      icon: "📣",
      summary: "Ad spend, lead flow, and campaign attribution across every channel.",
      sources: ["Marketing", "Email", "Website", "CRM"],
      metrics: [
        { value: "$47", label: "Daily Ad Spend", change: "Burning at 0.4% CTR", change_type: "down", color: "red", insight: '"Ops Leaders v3" has generated 0 conversions in 6 days. Shift to v1 which converts at $18 CPL.' },
        { value: "178", label: "Leads Today", change: "-64 vs 7d avg", change_type: "down", color: "yellow", insight: "Meta lead volume dipped. Correlates with creative fatigue on 2 of 4 active ad sets." },
        { value: "$5.05", label: "CPL · 30d", change: "Industry avg $15–50", change_type: "up", color: "green", insight: "You're acquiring leads at 1/10th of industry benchmark. The funnel problem is conversion, not cost." },
        { value: "187%", label: "LinkedIn Lift", change: "Carousel vs text", change_type: "up", color: "green", insight: "Carousels are the dominant format this week. Route Thursday's approved post to carousel." },
      ],
      chart: { type: "line", title: "Leads · last 14 days", labels: ["D-14", "D-13", "D-12", "D-11", "D-10", "D-9", "D-8", "D-7", "D-6", "D-5", "D-4", "D-3", "D-2", "D-1"], values: [218, 241, 233, 260, 248, 255, 242, 260, 238, 222, 208, 195, 190, 178] },
      table: {
        headers: ["Campaign", "Spend", "Leads", "CPL", "Status"],
        rows: [
          { cells: ["Ops Leaders v1", "$28/day", "12", "$18.00", "Healthy"], status: "green" },
          { cells: ["Ops Leaders v3", "$47/day", "0", "—", "Pause now"], status: "red" },
          { cells: ["Retarget · Site", "$12/day", "4", "$21.00", "Watch"], status: "yellow" },
          { cells: ["Lookalike v2", "$18/day", "7", "$15.43", "Healthy"], status: "green" },
        ],
      },
    },
    {
      id: "finance",
      label: "Finance",
      icon: "💵",
      summary: "Revenue, receivables, subscriptions, and cash position by day.",
      sources: ["Finance", "Sales", "CRM"],
      metrics: [
        { value: "$16,600", label: "MTD Revenue", change: "83% of $20K target", change_type: "up", color: "green", insight: "On track for target if 2 of 3 CLOSING deals land by Friday. Probability-weighted to $21,100." },
        { value: "$2,847", label: "Collected Today", change: "+71% vs 7d avg", change_type: "up", color: "green", insight: "Single payment from Northwind LLC pushed the day into the top quartile for the month." },
        { value: "$3,400", label: "Behind Pace", change: "As of 8:30 AM", change_type: "down", color: "yellow", insight: "Two stalled deals in CLOSING are the entire gap. Unblock Kellner and Shah by Friday." },
        { value: "$1,741", label: "Monthly SaaS Burn", change: "Replaceable", change_type: "neutral", color: "white", insight: "HubSpot + GoHighLevel + Calendly + ActiveCampaign. All rebuildable on your foundation." },
      ],
      chart: { type: "bar", title: "Daily collections · last 7 days", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [1420, 1680, 1590, 1980, 2220, 1950, 2847] },
      table: {
        headers: ["Account", "Amount", "Status", "Action", ""],
        rows: [
          { cells: ["Northwind LLC", "$2,847", "Paid", "None", "Closed"], status: "green" },
          { cells: ["Sterling Estate", "$4,800", "Outstanding", "14 days past due", "Reminder"], status: "yellow" },
          { cells: ["Chen LLC", "$1,250", "Outstanding", "5 days past due", "Reminder"], status: "yellow" },
          { cells: ["Apex Industrial", "$9,400", "Outstanding", "28 days · escalate", "Collections"], status: "red" },
        ],
      },
    },
  ];

  const INSIGHTS = [
    { title: "Credit risk detected: Apex Industrial", detail: "Apex Industrial has a $9,400 outstanding invoice (28 days overdue) but also a $12K deal in your pipeline. AI recommends collecting on the open invoice before extending additional credit.", modules: ["Sales Pipeline", "Finance"], impact: "Protect $9,400 in receivables", type: "risk" },
    { title: "Marketing-to-pipeline attribution", detail: "Your last 14 days of campaigns generated 3,248 new leads. $16,600 in collected revenue is fed by these campaigns. AI tracks every lead from first touch to closed deal — no attribution gaps.", modules: ["Marketing", "Sales Pipeline"], impact: "Full-funnel visibility", type: "connection" },
    { title: "Burning ad spend on fatigued creative", detail: '"Ops Leaders v3" has spent $282 over 6 days with zero conversions. Meanwhile "Ops Leaders v1" is converting at $18 CPL. Budget reallocation recommended.', modules: ["Marketing", "Finance"], impact: "Recover $47/day in waste", type: "risk" },
    { title: "3 reorder opportunities flagged", detail: "AI cross-referenced purchase history with client engagement data to predict reorder windows. Pre-drafted outreach with updated pricing is ready for Rodriguez, Sterling, and Merriweather.", modules: ["Client Management", "Finance"], impact: "~$8,400 in repeat revenue", type: "opportunity" },
  ];

  const PHASES = [
    { phase: 1, label: "Kickoff", timing: "After contract signed", headline: "Onboarding call + info gathering", kind: "kickoff", items: ["Book onboarding call with your team", "Set up shared communication channel", "Walk through your current tools + workflows", "Collect software list, API keys, and access"] },
    { phase: 2, label: "Build", timing: "3 working days", headline: "Foundation installed + deployed", kind: "build", items: ["Day 1 — provision your HelixOS instance", "Day 2 — connect integrations and seed data", "Day 3 — final testing + handoff walkthrough", "Your first brief lands in Telegram"] },
    { phase: 3, label: "Ongoing", timing: "Monthly retainer", headline: "We stay in your corner.", kind: "ongoing", items: ["Consultant-level support every month", "Automations built on top as you need them", "Custom software and modules layer in over time", "Strategic calls as your business evolves"] },
  ];

  const INSTALL_NOTES = [
    { title: "We don't disappear after install", detail: "Most vendors ship the software and leave. We stay on — monthly retainer — as your consultant. Your business changes; the system changes with it." },
    { title: "Build timeline depends on you", detail: "The three-day clock starts when we have everything we need. Fast info-sharing means a fast launch." },
    { title: "No cap on what comes next", detail: "Package determines what automations ship with install. Additional work is scoped on retainer — no ceiling on where this can go." },
  ];

  const STACK = [
    { label: "Foundation", timeline: "Month 1–3", examples: ["Unified data layer", "Daily brief", "Dashboard", "Chat-your-data"], accent: "#60a5fa" },
    { label: "Automations", timeline: "Month 3–6", examples: ["Lead engagement", "Revenue tracking", "Content pipelines", "Insurance checks"], accent: "#2563eb" },
    { label: "Custom Software", timeline: "Month 6–12+", examples: ["Custom CRM", "Client portal", "Tailored reports", "Internal tools"], accent: "#1e40af" },
  ];

  const SECURITY_STAGES = [
    { label: "Ingest", description: "Data flows in from your systems", icon: "inbox" },
    { label: "Classify", description: "Public · internal · confidential · restricted", icon: "tag" },
    { label: "Encrypt", description: "At rest and in transit", icon: "lock" },
    { label: "Access", description: "Role-based permissions", icon: "shield" },
    { label: "Audit", description: "Every access logged, reviewable", icon: "clipboard" },
  ];

  const BEDROCK_INDUSTRIES = [
    { industry: "Medical Practices", reason: "HIPAA BAA in place · patient data never leaves your VPC · no model-provider retention" },
    { industry: "Investment Firms", reason: "FINRA-auditable prompts and responses · logged in your own CloudTrail" },
    { industry: "Law Firms", reason: "Attorney-client privilege preserved · private inference over encrypted tunnels" },
    { industry: "Enterprise + Gov", reason: "SOC 2 + FedRAMP-ready region options · PrivateLink access, no public internet" },
  ];

  const BEDROCK_CARDS = [
    { label: "Encrypted end-to-end", detail: "API calls travel over TLS 1.3 · payloads encrypted at rest with KMS" },
    { label: "No training on your data", detail: "Model providers never see or retain your inputs or outputs" },
    { label: "Your VPC, your rules", detail: "Inference runs inside your Amazon account — private subnets, your security groups" },
    { label: "Full audit trail", detail: "Every inference logged to CloudTrail · exportable for auditors and regulators" },
    { label: "Model choice", detail: "Claude, Llama, Mistral, Titan — swap by use case without moving your data" },
    { label: "No data egress", detail: "Nothing crosses a region boundary unless you configure it to" },
  ];

  const COMPLIANCE = [
    { code: "HIPAA", name: "Health Insurance Portability & Accountability Act", for: "Medical practices · health tech", accent: "#2563eb" },
    { code: "FINRA", name: "Financial Industry Regulatory Authority", for: "Investment firms · wealth advisors", accent: "#3b82f6" },
    { code: "GDPR", name: "General Data Protection Regulation", for: "Any business serving EU customers", accent: "#60a5fa" },
    { code: "SOC 2", name: "Service Organization Control 2", for: "SaaS · B2B · public-company clients", accent: "#1e40af" },
  ];

  const RESULTS = [
    { value: "$9,400", sublabel: "credit risk caught", headline: "Overdue invoice flagged before aging 30 more days", detail: "Cross-referenced open pipeline with unpaid invoices — stopped extending credit to a client already behind.", kind: "caught" },
    { value: "$15,000", sublabel: "hidden B2B opportunity", headline: "Small lead, big company — surfaced before the call", detail: "LinkedIn + company data told us a $2,500 individual lead was actually a $15K B2B buyer.", kind: "earned" },
    { value: "$282", sublabel: "ad spend rescued", headline: "Fatigued ad set paused 6 days earlier", detail: "The system spotted the zero-conversion pattern and recommended pause before another week burned.", kind: "saved" },
    { value: "3 leads", sublabel: "reactivated", headline: "Cold leads revived before they chose someone else", detail: "Automated re-engagement when 7-day silence threshold hit — Marcus, Priya, and Danton all responded.", kind: "recovered" },
    { value: "$1,741/mo", sublabel: "software rent eliminated", headline: "HubSpot + GoHighLevel + Calendly + ActiveCampaign — retired", detail: "Custom modules built over 12 months replaced the SaaS stack. Ongoing licensing dropped to zero.", kind: "saved" },
    { value: "6+ hrs/wk", sublabel: "manual reporting gone", headline: "Monday metrics no longer a 90-minute spreadsheet job", detail: "Daily brief, dashboard, and chat-your-data replaced every manual pivot table.", kind: "time" },
  ];
  const RESULT_KIND = { saved: "Saved", recovered: "Recovered", caught: "Caught", earned: "Earned", time: "Time back" };

  const WHATIS_LAYERS = [
    { label: "Your data", detail: "CRM, calendar, Stripe, ads, docs" },
    { label: "Your workflows", detail: "The steps you actually run every day" },
    { label: "Your clients", detail: "History, preferences, relationships" },
    { label: "Your governance", detail: "Compliance, access, audit trail" },
    { label: "Your memory", detail: "Context that never gets lost" },
    { label: "Your integrations", detail: "Every tool your business already uses" },
  ];

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function svg(name) {
    const t = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const map = {
      inbox: `<svg ${t}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
      tag: `<svg ${t}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      lock: `<svg ${t}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      shield: `<svg ${t}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      clipboard: `<svg ${t}><path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
    };
    return map[name] || "";
  }

  const params = new URLSearchParams(location.search);
  const confirmUrl = (params.get("confirm") || "").trim();
  const meetingWhen = (params.get("when") || "").trim();
  const safeConfirm = /^https?:\/\//i.test(confirmUrl) ? confirmUrl : "";

  const state = {
    stepIndex: 1,
    maxStepReached: 1,
    audioUnlocked: false,
    completed: false,
    muted: false,
    narrationPlaying: false,
  };

  const timers = [];
  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }
  function every(fn, ms) {
    const id = setInterval(fn, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() {
    while (timers.length) {
      const id = timers.pop();
      clearTimeout(id);
      clearInterval(id);
    }
  }

  let typewriterId = null;
  function typeInto(el, text, delay, onDone) {
    if (typewriterId) clearInterval(typewriterId);
    el.textContent = "";
    let i = 0;
    const cursor = document.createElement("span");
    cursor.className = "tour-typewriter-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "|";
    el.appendChild(cursor);
    typewriterId = setInterval(() => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) el.appendChild(cursor);
      if (i >= text.length) {
        clearInterval(typewriterId);
        typewriterId = null;
        if (onDone) onDone();
      }
    }, delay);
    timers.push(typewriterId);
  }

  const headerEl = document.getElementById("tour-header");
  const mainEl = document.getElementById("tour-main");
  const narrationSlot = document.getElementById("tour-narration-slot");
  const completeSlot = document.getElementById("tour-complete-slot");
  const narrationAudio = document.getElementById("narration-audio");
  const bgAudio = document.getElementById("bg-audio");
  const BASELINE = 0.28;
  const DUCKED = 0.09;

  function renderHeader() {
    const chips = INDUSTRIES.map((x) => `<span class="tour-industry-chip">${esc(x)}</span>`).join("");
    const segs = STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const cls = n < state.stepIndex ? "done" : n === state.stepIndex ? "active" : n <= state.maxStepReached ? "seen" : "upcoming";
      const disabled = !state.audioUnlocked || n === state.stepIndex;
      return `<button type="button" class="tour-progress-segment tour-progress-${cls}" data-jump="${n}" ${disabled ? "disabled" : ""} title="${state.audioUnlocked ? "Jump to: " + esc(label) : "Click play on step 1 to enable navigation"}" aria-label="Step ${n}: ${esc(label)}" ${n === state.stepIndex ? 'aria-current="step"' : ""}><div class="tour-progress-bar"></div><div class="tour-progress-label">${esc(label)}</div></button>`;
    }).join("");
    headerEl.innerHTML = `
      <div class="tour-header-top">
        <div class="tour-brand"><img alt="a. Development Agency" width="140" height="32" class="tour-brand-logo" src="${LOGO}"/></div>
        <div class="tour-industry-ribbon" aria-label="Industries supported">
          <span class="tour-industry-ribbon-label">One foundation · any industry</span>
          <span class="tour-industry-ribbon-sep">·</span>
          ${chips}
        </div>
        <div class="tour-progress-counter" aria-live="polite">Step ${state.stepIndex} <span class="tour-progress-of">of 12</span></div>
      </div>
      <div class="tour-progress-rail" aria-label="Tour progress — click any step to jump">${segs}</div>`;
    headerEl.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => goTo(Number(btn.getAttribute("data-jump"))));
    });
  }

  function renderNarration() {
    if (state.stepIndex <= 1) {
      narrationSlot.innerHTML = "";
      return;
    }
    const text = (NARRATION[state.stepIndex] || "").replace(/Helix OS/g, "HelixOS");
    const isFinal = state.stepIndex === 12;
    narrationSlot.innerHTML = `
      <div class="tour-narration-card">
        <div class="tour-narration-text">${esc(text)}</div>
        <div class="tour-narration-actions">
          ${state.audioUnlocked ? `<button type="button" class="tour-narration-icon-btn" id="btn-mute" aria-label="${state.muted ? "Unmute audio" : "Mute audio"}" title="${state.muted ? "Unmute" : "Mute"}">${state.muted ? iconMute() : iconSound()}</button>
          <button type="button" class="tour-narration-icon-btn" id="btn-replay" aria-label="Replay narration" title="Replay">${iconReplay()}</button>` : ""}
          ${state.stepIndex > 1 && !state.completed ? `<button type="button" class="tour-narration-back" id="btn-back" aria-label="Previous step"><span class="tour-narration-back-arrow">←</span>Back</button>` : ""}
          ${!state.completed ? `<button type="button" class="tour-narration-next" id="btn-next">${isFinal ? "Finish" : "Next"}<span class="tour-narration-next-arrow">→</span></button>` : ""}
        </div>
      </div>`;
    const mute = document.getElementById("btn-mute");
    const replay = document.getElementById("btn-replay");
    const back = document.getElementById("btn-back");
    const next = document.getElementById("btn-next");
    if (mute) mute.addEventListener("click", toggleMute);
    if (replay) replay.addEventListener("click", replayAudio);
    if (back) back.addEventListener("click", goBack);
    if (next) next.addEventListener("click", advance);
  }

  function iconReplay() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`;
  }
  function iconSound() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }
  function iconMute() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
  }

  function renderComplete() {
    completeSlot.innerHTML = state.completed
      ? `<div class="tour-complete-overlay"><div class="tour-complete-card"><div class="tour-eyebrow">Tour complete</div><h3 class="tour-complete-headline">We look forward to meeting you.</h3><p class="tour-complete-sub">Come to the call with one question you want your data to answer every morning. We'll start there.</p></div></div>`
      : "";
  }

  function fadeBg(target) {
    const start = bgAudio.volume;
    const delta = target - start;
    const t0 = performance.now();
    const dur = 600;
    function tick(now) {
      const e = Math.min(1, (now - t0) / dur);
      bgAudio.volume = Math.max(0, Math.min(1, start + delta * e));
      if (e < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function applyMute() {
    bgAudio.muted = state.muted;
    narrationAudio.muted = state.muted;
  }

  function playNarration() {
    const src = `audio/step-${state.stepIndex}.mp3?v=3`;
    if (!narrationAudio.src.endsWith(src)) narrationAudio.src = src;
    else narrationAudio.currentTime = 0;
    applyMute();
    if (state.audioUnlocked) narrationAudio.play().catch(() => {});
  }

  narrationAudio.addEventListener("play", () => {
    state.narrationPlaying = true;
    fadeBg(DUCKED);
  });
  narrationAudio.addEventListener("pause", () => {
    state.narrationPlaying = false;
    fadeBg(BASELINE);
  });
  narrationAudio.addEventListener("ended", () => {
    state.narrationPlaying = false;
    fadeBg(BASELINE);
  });

  function startFromGate() {
    state.audioUnlocked = true;
    bgAudio.volume = BASELINE;
    applyMute();
    bgAudio.play().catch(() => {});
    advance();
  }

  function advance() {
    if (state.completed) return;
    if (state.stepIndex >= 12) {
      state.completed = true;
      renderComplete();
      renderNarration();
      return;
    }
    goTo(state.stepIndex + 1);
  }

  function goBack() {
    if (state.stepIndex <= 1) return;
    state.completed = false;
    goTo(state.stepIndex - 1);
  }

  function goTo(n) {
    if (n < 1 || n > 12) return;
    state.stepIndex = n;
    state.maxStepReached = Math.max(state.maxStepReached, n);
    state.completed = false;
    paint();
  }

  function replayAudio() {
    playNarration();
  }

  function toggleMute() {
    state.muted = !state.muted;
    applyMute();
    renderNarration();
  }

  function paint() {
    clearTimers();
    if (typewriterId) {
      clearInterval(typewriterId);
      typewriterId = null;
    }
    renderHeader();
    renderStep();
    renderNarration();
    renderComplete();
    playNarration();
  }

  function renderStep() {
    const n = state.stepIndex;
    const fn = [null, landing, whatis, brief, dashboard, anomaly, chat, install, automations, custom, security, results, close][n];
    mainEl.innerHTML = fn();
    bindStep(n);
  }

  function landing() {
    const chips = INDUSTRIES.map((x) => `<span class="tour-industry-mini-chip">${esc(x)}</span>`).join("");
    return `<div class="tour-step tour-step-landing"><div class="tour-step-landing-inner">
      <div class="tour-eyebrow">HelixOS · A guided walkthrough</div>
      <h1 class="tour-step-landing-title">One foundation.<br/><span class="tour-accent">Any industry.</span></h1>
      <p class="tour-step-landing-sub">What you're about to see is <em>one</em> example — one industry, one company shape. Yours will look different. The metrics, the dashboards, the automations — all of it bends to the world you work in.</p>
      <div class="tour-industry-mini-chips">${chips}</div>
      <button type="button" class="tour-play-gate" id="play-gate" aria-label="Start the tour with narration">
        <span class="tour-play-gate-icon" aria-hidden="true">▶</span>
        <span class="tour-play-gate-text">Start the tour</span>
        <span class="tour-play-gate-sub">6 minutes · audio + captions</span>
      </button>
    </div></div>`;
  }

  function whatis() {
    const layers = WHATIS_LAYERS.map(
      (e, t) => `<div class="tour-whatis-layer" style="animation-delay:${120 * t}ms"><div class="tour-whatis-layer-label">${esc(e.label)}</div><div class="tour-whatis-layer-detail">${esc(e.detail)}</div></div>`
    ).join("");
    return `<div class="tour-step tour-step-whatis">
      <div class="tour-eyebrow">Before we walk through it…</div>
      <h2 class="tour-step-title">What is <span class="tour-accent">HelixOS</span>?</h2>
      <p class="tour-step-sub">At the core is <strong>Claude Code</strong>— the agentic AI engine from Anthropic. But Claude on its own doesn't know your business. It doesn't know your customers, your tools, your workflows, or your data. HelixOS is the infrastructure that wraps around it — so the AI becomes yours.</p>
      <div class="tour-whatis-diagram">
        <div class="tour-whatis-core-wrap" aria-label="Claude Code wrapped by HelixOS">
          <div class="tour-whatis-fluentos-ring">
            <div class="tour-whatis-fluentos-label" aria-hidden="true"><img src="${LOGO}" alt="" width="120" height="24" class="tour-whatis-fluentos-logo"/></div>
            <div class="tour-whatis-orange-halo" aria-hidden="true">
              <div class="tour-whatis-claude-disc">
                <img src="${CLAUDE}" alt="Claude Code — Anthropic's agentic AI engine" width="120" height="120" class="tour-whatis-claude-logo"/>
                <div class="tour-whatis-claude-name">Claude Code</div>
                <div class="tour-whatis-claude-sub">Anthropic's agentic AI engine</div>
              </div>
            </div>
          </div>
        </div>
        <div class="tour-whatis-layers">${layers}</div>
      </div>
      <div class="tour-whatis-split">
        <div class="tour-whatis-split-col tour-whatis-split-stuck">
          <div class="tour-eyebrow-alt tour-eyebrow-muted">Most people, on their own</div>
          <h3 class="tour-whatis-split-headline">They hit the wall in a week.</h3>
          <ul class="tour-whatis-split-list">
            <li>Download Claude · get generic answers</li>
            <li>No context — re-explain every session</li>
            <li>No memory, no integrations, no data</li>
            <li>The software is the easy part. The wrapper is the hard part.</li>
          </ul>
        </div>
        <div class="tour-whatis-split-col tour-whatis-split-with">
          <div class="tour-eyebrow-alt">With HelixOS</div>
          <h3 class="tour-whatis-split-headline">The AI becomes your operating system.</h3>
          <ul class="tour-whatis-split-list">
            <li>Connected to your data, your tools, your people</li>
            <li>Persistent memory across every conversation</li>
            <li>Governed, secure, auditable by design</li>
            <li>Shaped to your business — whatever industry you're in</li>
          </ul>
        </div>
      </div>
      <div class="tour-whatis-bottom">Regardless of your industry — law, medical, real estate, finance, agencies, operations — HelixOS shapes itself around <strong>you</strong>. The next ten slides are one example of what that looks like in practice.</div>
    </div>`;
  }

  function brief() {
    const signals = SIGNALS.map((e) => `<li class="tour-phone-signal tour-phone-signal-${e.type}"><span aria-hidden="true">${SIGNAL_ICON[e.type]}</span><span>${esc(e.text)}</span></li>`).join("");
    return `<div class="tour-step tour-step-brief">
      <div class="tour-step-brief-context">
        <div class="tour-eyebrow">Monday · 8:30 AM</div>
        <h2 class="tour-step-title">Your daily brief just arrived.</h2>
        <p class="tour-step-sub">While you poured coffee, HelixOS read your pipeline, calendar, revenue, and ads — then delivered the one signal that matters most today.</p>
        <div class="tour-step-callout"><div class="tour-step-callout-label">Delivery</div><div class="tour-step-callout-value">Telegram · every weekday 8:30 AM</div></div>
        <div class="tour-step-callout"><div class="tour-step-callout-label">Customizable</div><div class="tour-step-callout-value">Rough templates, tuned to you during onboarding</div></div>
      </div>
      <div class="tour-phone-frame">
        <div class="tour-phone-notch"></div>
        <div class="tour-phone-screen">
          <div class="tour-phone-header">
            <div class="tour-phone-avatar">A</div>
            <div>
              <div class="tour-phone-sender">HelixOS · Daily Brief</div>
              <div class="tour-phone-meta">Monday, April 20 · 8:30 AM</div>
            </div>
          </div>
          <div class="tour-phone-bubble">
            <div class="tour-phone-label">Today at a glance — Northwind Operations</div>
            <div class="tour-phone-body" id="brief-type"></div>
            <div class="tour-phone-divider"></div>
            <div class="tour-phone-label">Key Signals</div>
            <ul class="tour-phone-signals">${signals}</ul>
          </div>
        </div>
      </div>
    </div>`;
  }

  function barChart(chart) {
    const t = Math.max(...chart.values, 1);
    const a = 38 * chart.values.length - 10;
    const bars = chart.values
      .map((val, r) => {
        const n = 38 * r;
        const l = (val / t) * 100;
        const i = 100 - l;
        const label = val >= 1e3 ? `${(val / 1e3).toFixed(1)}k` : String(val);
        return `<g><rect x="${n}" y="${i}" width="28" height="${l}" rx="4" fill="url(#td-bar-grad)"/>${l > 14 ? `<text x="${n + 14}" y="${i - 5}" text-anchor="middle" fill="#475569" font-size="8" font-weight="600">${label}</text>` : ""}<text x="${n + 14}" y="114" text-anchor="middle" fill="#94a3b8" font-size="7.5">${esc(chart.labels[r] || "")}</text></g>`;
      })
      .join("");
    const grid = [0, 0.25, 0.5, 0.75, 1].map((e) => `<line x1="0" y1="${100 * (1 - e)}" x2="${a}" y2="${100 * (1 - e)}" stroke="#e2e8f0" stroke-width=".5"/>`).join("");
    return `<div class="td-chart"><div class="td-chart-title">${esc(chart.title)}</div><svg viewBox="0 0 ${a} 128" class="td-chart-svg"><defs><linearGradient id="td-bar-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.9"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0.6"/></linearGradient></defs>${grid}${bars}</svg></div>`;
  }

  function lineChart(chart) {
    const t = Math.max(...chart.values, 1);
    const a = Math.min(...chart.values);
    const r = t - a || 1;
    const n = 284 / Math.max(chart.values.length - 1, 1);
    const pts = chart.values.map((v, s) => ({ x: 8 + s * n, y: 100 - ((v - a) / r) * 85 - 8 }));
    const i = pts.map((e) => `${e.x.toFixed(1)},${e.y.toFixed(1)}`).join(" ");
    const o = `M${pts[0].x.toFixed(1)},100 ` + pts.map((e) => `L${e.x.toFixed(1)},${e.y.toFixed(1)}`).join(" ") + ` L${pts[pts.length - 1].x.toFixed(1)},100 Z`;
    const grid = [0, 0.25, 0.5, 0.75, 1].map((e, idx) => `<line x1="8" y1="${100 * (1 - e)}" x2="292" y2="${100 * (1 - e)}" stroke="#e2e8f0" stroke-width=".5"/>`).join("");
    const dots = pts.map((e) => `<circle cx="${e.x}" cy="${e.y}" r="2.5" fill="#2563eb"/>`).join("");
    const labels = chart.labels.map((e, idx) => `<text x="${8 + idx * n}" y="114" text-anchor="middle" fill="#94a3b8" font-size="7">${esc(e)}</text>`).join("");
    return `<div class="td-chart"><div class="td-chart-title">${esc(chart.title)}</div><svg viewBox="0 0 300 128" class="td-chart-svg"><defs><linearGradient id="td-area-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${o}" fill="url(#td-area-grad)"/><polyline points="${i}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}</svg></div>`;
  }

  function moduleHtml(mod, openMetric) {
    const metrics = mod.metrics
      .map((e, t) => {
        const open = openMetric === t;
        return `<button type="button" data-metric="${t}" class="td-metric td-metric-${e.color}${open ? " td-metric-open" : ""}">
          <div class="td-metric-label">${esc(e.label)}</div>
          <div class="td-metric-value">${esc(e.value)}</div>
          <div class="td-metric-change td-metric-change-${e.change_type}">${esc(e.change)}</div>
          ${open ? `<div class="td-metric-insight"><span class="td-metric-insight-icon" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>${esc(e.insight)}</span></div>` : `<div class="td-metric-hint">Click for AI insight</div>`}
        </button>`;
      })
      .join("");
    const rows = mod.table.rows
      .map(
        (e) =>
          `<tr>${e.cells
            .map((t, a) => {
              if (a === 0 && e.status) return `<td><span class="td-table-name"><span class="td-table-dot td-table-dot-${e.status}"></span><span class="td-table-name-text">${esc(t)}</span></span></td>`;
              if (e.status && a === e.cells.length - 1) return `<td><span class="td-table-status td-table-status-${e.status}">${esc(t)}</span></td>`;
              return `<td>${esc(t)}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");
    const src = mod.sources
      .map((e) => {
        const t = SOURCES.find((s) => s.label === e);
        return t ? `<span class="td-module-source-dot" title="${esc(t.label)}">${t.icon}</span>` : "";
      })
      .join("");
    const chart = mod.chart.type === "bar" ? barChart(mod.chart) : lineChart(mod.chart);
    return `<section class="td-module">
      <div class="td-module-header">
        <p class="td-module-summary">${esc(mod.summary)}</p>
        <div class="td-module-sources"><span class="td-module-sources-label">Sources:</span>${src}</div>
      </div>
      <div class="td-metrics">${metrics}</div>
      <div class="td-chart-table">
        <div class="td-panel">${chart}</div>
        <div class="td-panel td-panel-table"><table class="td-table"><thead><tr>${mod.table.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      </div>
    </section>`;
  }

  let dashModule = 0;
  let dashMetric = null;

  function dashboardInner() {
    const n = MODULES.reduce((e, s) => e + s.metrics.length + s.table.rows.length, 0);
    const sources = SOURCES.map(
      (e, t) =>
        `<div class="td-source-wrap"><div class="td-source"><span class="td-source-icon" aria-hidden="true">${e.icon}</span><span class="td-source-label">${esc(e.label)}</span><span class="td-source-pulse" aria-hidden="true"></span></div>${t < SOURCES.length - 1 ? `<svg class="td-source-arrow" viewBox="0 0 24 12" aria-hidden="true"><line x1="0" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/><polygon points="18,3 24,6 18,9" fill="currentColor"/></svg>` : ""}</div>`
    ).join("");
    const cards = INSIGHTS.map((e) => {
      const badge = e.type === "opportunity" ? "Opportunity" : e.type === "risk" ? "Risk Alert" : "Connected Insight";
      return `<div class="td-cross-card td-cross-card-${e.type}">
        <div class="td-cross-card-header">
          <span class="td-cross-card-badge td-cross-card-badge-${e.type}">${badge}</span>
          <span class="td-cross-card-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" stroke-linecap="round"/><path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" stroke-linecap="round"/></svg>Centralized Data</span>
        </div>
        <div class="td-cross-card-title">${esc(e.title)}</div>
        <div class="td-cross-card-detail">${esc(e.detail)}</div>
        <div class="td-cross-card-footer">
          <div class="td-cross-card-modules">${e.modules.map((m) => `<span class="td-cross-card-module">${esc(m)}</span>`).join("")}</div>
          <span class="td-cross-card-impact">${esc(e.impact)}</span>
        </div>
      </div>`;
    }).join("");
    const tabs = MODULES.map(
      (t, r) => `<button class="td-module-tab${r === dashModule ? " td-module-tab-active" : ""}" data-mod="${r}" type="button"><span class="td-module-tab-icon">${t.icon}</span><span>${esc(t.label)}</span></button>`
    ).join("");
    return `<div class="td-root">
      <section class="td-hub">
        <div class="td-hub-top">
          <div class="td-hub-title">
            <div class="td-hub-icon" aria-hidden="true">🧠</div>
            <div>
              <h2 class="td-hub-greeting">Good morning, Northwind</h2>
              <p class="td-hub-sub">Your centralized intelligence dashboard</p>
            </div>
          </div>
          <div class="td-hub-stats">
            <div class="td-stat"><div class="td-stat-value">${MODULES.length}</div><div class="td-stat-label">Data Modules</div></div>
            <div class="td-hub-stats-sep"></div>
            <div class="td-stat"><div class="td-stat-value">${SOURCES.length}</div><div class="td-stat-label">Sources Connected</div></div>
            <div class="td-hub-stats-sep"></div>
            <div class="td-stat"><div class="td-stat-value td-stat-value-accent">${n}</div><div class="td-stat-label">Data Points</div></div>
          </div>
        </div>
        <div class="td-sources-label">Connected Data Sources</div>
        <div class="td-sources">${sources}<div class="td-source-hub-wrap"><svg class="td-source-arrow td-source-arrow-hub" viewBox="0 0 24 12" aria-hidden="true"><line x1="0" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="1.5"/><polygon points="18,3 24,6 18,9" fill="currentColor"/></svg><div class="td-source-hub"><span>🧠</span><span>HelixOS Hub</span></div></div></div>
        <div class="td-ai-alert">
          <div class="td-ai-alert-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div>
            <div class="td-ai-alert-label">AI Priority Alert<span class="td-ai-alert-dot" aria-hidden="true"></span></div>
            <div class="td-ai-alert-title">$9,400 in CLOSING that could land this week</div>
            <div class="td-ai-alert-desc">Three deals are stage-ready. Probability-weighted to $21,100 by Friday if nudged today.</div>
          </div>
        </div>
      </section>
      <section class="td-cross">
        <header class="td-cross-header">
          <h3>Cross-Module Intelligence</h3>
          <span class="td-cross-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" stroke-linecap="round"/><path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" stroke-linecap="round"/></svg>Only with centralized data</span>
        </header>
        <div class="td-cross-grid">${cards}</div>
      </section>
      <section class="td-modules-nav-wrap">
        <div class="td-modules-nav-header"><span>Module Deep Dives</span><span>${MODULES.length} modules · click to explore</span></div>
        <div class="td-modules-nav">${tabs}</div>
      </section>
      <div id="td-module-slot">${moduleHtml(MODULES[dashModule], dashMetric)}</div>
    </div>`;
  }

  function dashboard() {
    return `<div class="tour-step tour-step-dashboard-rich">
      <div class="tour-eyebrow">Your intelligence dashboard</div>
      <h2 class="tour-step-title">One screen. Your whole business.</h2>
      <p class="tour-step-sub">Every source connected. Every metric cross-referenced. AI insights surfaced automatically. This is what it looks like when your data is finally in one place.</p>
      ${dashboardInner()}
    </div>`;
  }

  function anomaly() {
    return `<div class="tour-step tour-step-anomaly">
      <div class="tour-eyebrow">Pattern match · 8:34 AM</div>
      <h2 class="tour-step-title">Three leads went quiet. Let's ask why.</h2>
      <div class="tour-chat-frame">
        <div class="tour-chat-source">Ask your CRM</div>
        <div class="tour-chat-bubble tour-chat-bubble-q" id="anomaly-q"></div>
        <div id="anomaly-a"></div>
      </div>
      <div class="tour-mirror-question">Same engine finds whatever "going silent" means in <em>your</em> business.</div>
    </div>`;
  }

  function chat() {
    return `<div class="tour-step tour-step-chat">
      <div class="tour-eyebrow">Chat your data · plain English, live answers</div>
      <h2 class="tour-step-title">Ask your business anything.</h2>
      <div class="tour-chat-scroll" id="chat-scroll"></div>
      <div class="tour-chat-prompt">What would <em>you</em> ask if every answer came in three seconds?</div>
    </div>`;
  }

  function install() {
    const check = `<span class="tour-install-check" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`;
    const phases = PHASES.map((e, t) => {
      const items = e.items.map((x) => `<li>${check}${esc(x)}</li>`).join("");
      const conn =
        t < PHASES.length - 1
          ? `<div class="tour-install-connector" aria-hidden="true"><div class="tour-install-connector-line"></div><div class="tour-install-connector-dot" style="animation-delay:${800 * t}ms"></div></div>`
          : "";
      return `<div class="tour-install-phase tour-install-phase-${e.kind}" style="animation-delay:${220 * t}ms">
        <div class="tour-install-phase-marker"><div class="tour-install-phase-number">${e.phase}</div><div class="tour-install-phase-label">${esc(e.label)}</div><div class="tour-install-phase-timing">${esc(e.timing)}</div></div>
        <div class="tour-install-phase-body"><div class="tour-install-phase-headline">${esc(e.headline)}</div><ul>${items}</ul></div>
        ${conn}
      </div>`;
    }).join("");
    const notes = INSTALL_NOTES.map((e) => `<div class="tour-install-note-card"><div class="tour-install-note-title">${esc(e.title)}</div><div class="tour-install-note-detail">${esc(e.detail)}</div></div>`).join("");
    return `<div class="tour-step tour-step-install">
      <div class="tour-eyebrow">How we actually work together</div>
      <h2 class="tour-step-title">From signed contract to <span class="tour-accent">ongoing consultant</span>.</h2>
      <p class="tour-step-sub">Most vendors ship software and disappear. That's not us. The three-day build is where the foundation goes in. Then we stay — monthly retainer — as the consultant your team can actually call.</p>
      <div class="tour-install-timeline">${phases}</div>
      <div class="tour-install-notes-grid">${notes}</div>
      <div class="tour-install-retainer-hero">
        <div class="tour-install-retainer-hero-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div>
          <div class="tour-install-retainer-hero-title">Monthly retainer = your consultant</div>
          <div class="tour-install-retainer-hero-detail">Weekly check-ins. New automations scoped and shipped. Strategy calls when your priorities shift. We know your stack, your data, and your business — and we're one message away when something changes.</div>
        </div>
      </div>
    </div>`;
  }

  let autoIdx = 0;
  function flowHtml(e) {
    const nodes = e.steps.map((t, a) => `<div class="tour-flow-node" style="animation-delay:${280 * a}ms"><div class="tour-flow-node-index">${a + 1}</div><div class="tour-flow-node-body">${esc(t)}</div></div>`).join("");
    return `<div class="tour-flow" style="--auto-accent:${e.accent}">
      <div class="tour-flow-trigger"><div class="tour-flow-label">Trigger</div><div class="tour-flow-trigger-body">${esc(e.trigger)}</div></div>
      <div class="tour-flow-arrow" aria-hidden="true"><div class="tour-flow-arrow-line"></div><div class="tour-flow-arrow-dot" style="animation-delay:0ms"></div></div>
      <div class="tour-flow-chain">${nodes}</div>
      <div class="tour-flow-arrow" aria-hidden="true"><div class="tour-flow-arrow-line"></div><div class="tour-flow-arrow-dot" style="animation-delay:${280 * e.steps.length}ms"></div></div>
      <div class="tour-flow-outcome"><div class="tour-flow-label">Outcome</div><div class="tour-flow-outcome-body">${esc(e.outcome)}</div></div>
    </div>`;
  }

  function automations() {
    const cards = AUTOMATIONS.map(
      (t, r) =>
        `<button type="button" class="tour-auto-card ${autoIdx === r ? "tour-auto-card-active" : ""}" data-auto="${r}" style="--auto-accent:${t.accent}"><div class="tour-auto-industry">${esc(t.industry)}</div><div class="tour-auto-trigger">${esc(t.trigger)}</div></button>`
    ).join("");
    return `<div class="tour-step tour-step-automations">
      <div class="tour-eyebrow">The foundation, activated</div>
      <h2 class="tour-step-title">Automations, built on top of your data.<br/><span class="tour-accent">Triggered by the events that matter to you.</span></h2>
      <div class="tour-autos-grid">${cards}</div>
      <div id="auto-flow">${flowHtml(AUTOMATIONS[autoIdx])}</div>
      <div class="tour-autos-footnote">Thousands of these. Triggered by events in your business. Chained together to replace hours of manual work every week.</div>
    </div>`;
  }

  function custom() {
    const burn = REPLACED.map((e) => parseInt(e.savings.replace(/[^\d]/g, ""), 10) || 0).reduce((a, b) => a + b, 0);
    const layers = STACK.map(
      (e, t) =>
        `<div class="tour-stack-layer" style="--layer-accent:${e.accent};animation-delay:${250 * t}ms">
          <div class="tour-stack-layer-header">
            <div><div class="tour-stack-layer-label">${esc(e.label)}</div><div class="tour-stack-layer-timeline">${esc(e.timeline)}</div></div>
            <div class="tour-stack-layer-marker">${STACK.length - t}</div>
          </div>
          <div class="tour-stack-layer-examples">${e.examples.map((x) => `<span class="tour-stack-example">${esc(x)}</span>`).join("")}</div>
        </div>`
    ).join("");
    const rent = REPLACED.map((e) => `<div class="tour-replaced-row"><div class="tour-replaced-name"><span class="tour-replaced-strike">${esc(e.name)}</span></div><div class="tour-replaced-savings-red">−${esc(e.savings)}</div></div>`).join("");
    const own = REPLACED.map((e) => `<div class="tour-replaced-row tour-replaced-row-own"><div class="tour-replaced-name"><span class="tour-replaced-dot" aria-hidden="true">●</span>${esc(e.replacedBy)}</div></div>`).join("");
    return `<div class="tour-step tour-step-custom">
      <div class="tour-eyebrow">Year 1 and beyond</div>
      <h2 class="tour-step-title">Own the software your business runs on.<br/><span class="tour-accent">Stop renting. Start owning.</span></h2>
      <div class="tour-stack">${layers}</div>
      <div class="tour-rent-own">
        <div class="tour-rent-own-col tour-rent-own-rent">
          <div class="tour-eyebrow-alt">What you rent today</div>
          <h3 class="tour-rent-own-title">Per-seat fees. Rising prices. Limited control.</h3>
          <div class="tour-replaced-list">${rent}<div class="tour-replaced-total"><span>Estimated monthly burn</span><strong>~$${burn.toLocaleString()}+ / mo</strong></div></div>
        </div>
        <div class="tour-rent-own-divider" aria-hidden="true"><div class="tour-rent-own-arrow">→</div></div>
        <div class="tour-rent-own-col tour-rent-own-own">
          <div class="tour-eyebrow-alt">What you own in 12–18 months</div>
          <h3 class="tour-rent-own-title">Custom systems tailored to your workflow.</h3>
          <div class="tour-replaced-list">${own}<div class="tour-replaced-total tour-replaced-total-win"><span>Ongoing cost</span><strong>$0 licensing</strong></div></div>
        </div>
      </div>
      <div class="tour-custom-bottom"><strong>It takes time.</strong> The foundation comes first. Automations layer in. Custom modules start shipping around month six. But every dollar you've been handing to HubSpot, GoHighLevel, and the rest — comes back to you, permanently.</div>
    </div>`;
  }

  function security() {
    const stages = SECURITY_STAGES.map((e, t) => {
      const conn =
        t < SECURITY_STAGES.length - 1
          ? `<div class="tour-security-connector" aria-hidden="true"><div class="tour-security-connector-line"></div><div class="tour-security-connector-dot" style="animation-delay:${400 * t}ms"></div></div>`
          : "";
      return `<div class="tour-security-stage-wrap"><div class="tour-security-stage" style="animation-delay:${180 * t}ms"><div class="tour-security-stage-icon" aria-hidden="true">${svg(e.icon)}</div><div class="tour-security-stage-label">${esc(e.label)}</div><div class="tour-security-stage-desc">${esc(e.description)}</div></div>${conn}</div>`;
    }).join("");
    const comp = COMPLIANCE.map((e) => `<div class="tour-compliance-card" style="--compliance-accent:${e.accent}"><div class="tour-compliance-code">${esc(e.code)}</div><div class="tour-compliance-name">${esc(e.name)}</div><div class="tour-compliance-for">${esc(e.for)}</div></div>`).join("");
    const cards = BEDROCK_CARDS.map(
      (e, t) =>
        `<div class="tour-bedrock-card" style="animation-delay:${100 * t}ms"><div class="tour-bedrock-card-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4.9v10.2L12 22l-9-4.9V6.9L12 2z"/><path d="M12 22V12"/><path d="M12 12L3 6.9"/><path d="M12 12l9-5.1"/></svg></div><div><div class="tour-bedrock-card-label">${esc(e.label)}</div><div class="tour-bedrock-card-detail">${esc(e.detail)}</div></div></div>`
    ).join("");
    const inds = BEDROCK_INDUSTRIES.map((e) => `<li class="tour-bedrock-industry-row"><span class="tour-bedrock-industry-name">${esc(e.industry)}</span><span class="tour-bedrock-industry-reason">${esc(e.reason)}</span></li>`).join("");
    return `<div class="tour-step tour-step-security">
      <div class="tour-eyebrow">Security + governance · baked in</div>
      <h2 class="tour-step-title">Your data. Your rules.<br/><span class="tour-accent">Your compliance, intact.</span></h2>
      <p class="tour-step-sub">Every integration, every automation, every piece of custom software we build — inherits your governance policies from day one.</p>
      <div class="tour-security-pipeline">${stages}</div>
      <div class="tour-compliance-header"><div class="tour-eyebrow-alt">Compliance frameworks</div><h3 class="tour-compliance-title">Built to meet the rules your industry lives by.</h3></div>
      <div class="tour-compliance-grid">${comp}</div>
      <div class="tour-security-promise">
        <div class="tour-security-promise-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></div>
        <div><strong>Your auditors stay happy.</strong> Encryption at rest and in transit. Role-based access. Every access logged. Every policy enforceable, reviewable, exportable.</div>
      </div>
      <div class="tour-bedrock">
        <div class="tour-bedrock-header">
          <div class="tour-eyebrow-alt">AI hosting for regulated industries</div>
          <h3 class="tour-bedrock-title">Your AI runs in <span class="tour-accent">your</span> cloud.<br/>Not someone else's.</h3>
          <p class="tour-bedrock-sub">For industries where data residency and audit trails matter, we deploy the LLMs that power HelixOS on <strong>AWS Bedrock</strong>— inside your own Amazon account. Every inference is encrypted. Nothing crosses a boundary you didn't approve.</p>
        </div>
        <div class="tour-bedrock-grid">${cards}</div>
        <div class="tour-bedrock-industries">
          <div class="tour-bedrock-industries-label">Why it matters for your industry</div>
          <ul>${inds}</ul>
        </div>
      </div>
    </div>`;
  }

  function results() {
    const cards = RESULTS.map(
      (e, t) =>
        `<div class="tour-results-card tour-results-card-${e.kind}" style="animation-delay:${100 * t}ms">
          <div class="tour-results-card-kind">${RESULT_KIND[e.kind] || e.kind}</div>
          <div class="tour-results-card-value">${esc(e.value)}</div>
          <div class="tour-results-card-sublabel">${esc(e.sublabel)}</div>
          <div class="tour-results-card-headline">${esc(e.headline)}</div>
          <div class="tour-results-card-detail">${esc(e.detail)}</div>
        </div>`
    ).join("");
    return `<div class="tour-step tour-step-results">
      <div class="tour-eyebrow">Return on investment</div>
      <h2 class="tour-step-title">What this actually returns.<br/><span class="tour-accent">Moments, compounded over a year.</span></h2>
      <p class="tour-step-sub">The dashboards and automations are the mechanism. The return shows up in moments — problems caught before they become expensive, opportunities spotted before they slip by, hours clawed back from manual work.</p>
      <div class="tour-results-hero">
        <div class="tour-results-hero-value">$67,000+</div>
        <div class="tour-results-hero-label">estimated value in year one</div>
        <div class="tour-results-hero-caveat">Your numbers will differ — but these are the kinds of moments HelixOS creates every week.</div>
      </div>
      <div class="tour-results-grid">${cards}</div>
      <div class="tour-results-bottom"><strong>This isn't software.</strong> It's every decision, backed by your data. Small catches add up fast. One $9,400 invoice rescued. One $15,000 lead found. One fatigued ad killed a week earlier. Compounded across a year — this is the return.</div>
    </div>`;
  }

  const CONFIRM_TO = "usama@adevagency.com";
  let callConfirmed = false;
  try {
    callConfirmed = sessionStorage.getItem("helixos_call_confirmed") === "1";
  } catch (e) {}

  function close() {
    const extra = callConfirmed
      ? `<div class="tour-close-confirmed" role="status">
          <div class="tour-close-confirmed-icon" aria-hidden="true">✓</div>
          <div class="tour-close-confirmed-title">You're confirmed.</div>
          <div class="tour-close-confirmed-sub">${meetingWhen ? `See you ${esc(meetingWhen)}.` : "We'll see you on the call."}</div>
        </div>`
      : `<button type="button" class="tour-close-confirm-btn" id="btn-confirm-call" aria-label="Confirm your meeting">
            <div class="tour-close-confirm-btn-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg></div>
            <div class="tour-close-confirm-btn-body">
              <div class="tour-close-confirm-btn-title">Confirm your meeting</div>
              <div class="tour-close-confirm-btn-sub">${meetingWhen ? esc(meetingWhen) : "We'll email the team that you'll be there"}</div>
            </div>
            <div class="tour-close-confirm-btn-arrow" aria-hidden="true">→</div>
          </button>
          <p class="tour-close-email-error" id="confirm-email-error" hidden>Couldn't send just now. Try again.</p>`;
    return `<div class="tour-step tour-step-close">
      <div class="tour-eyebrow">Looking forward to meeting you</div>
      <h2 class="tour-step-close-headline">Come to the call with<br/><span class="tour-accent">one question</span><br/>you wish your data could answer every morning.</h2>
      <p class="tour-step-close-sub">We'll build the answer together.</p>
      <div class="tour-close-panel" aria-label="See you on the call">
        <div class="tour-close-panel-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="tour-close-panel-body">
          <div class="tour-close-panel-title">We look forward to your appointment.</div>
          <div class="tour-close-panel-sub">Bring the one question. We'll take it from there.</div>
        </div>
      </div>
      ${extra}
      <div class="tour-close-brand"><img src="${LOGO}" alt="a. Development Agency" width="160" height="32" class="tour-close-brand-logo"/></div>
    </div>`;
  }

  function bindStep(n) {
    if (n === 1) {
      const gate = document.getElementById("play-gate");
      if (gate) gate.addEventListener("click", startFromGate);
    }
    if (n === 3) {
      const el = document.getElementById("brief-type");
      if (el) typeInto(el, "Your week is starting $3,400 behind pace — driven by three cold leads and a stalled ad set. One opportunity worth watching: Michael Brennan booked an individual call but runs a 40-person ops team.", 16);
    }
    if (n === 4) bindDashboard();
    if (n === 5) {
      const q = document.getElementById("anomaly-q");
      if (q)
        typeInto(q, "Which of last week's leads are slipping away?", 35, () => {
          const a = document.getElementById("anomaly-a");
          if (!a) return;
          a.innerHTML = `<div class="tour-chat-bubble tour-chat-bubble-a tour-chat-bubble-fade">
            <div class="tour-chat-answer-headline">3 leads — last touch > 4 days</div>
            <ul class="tour-chat-lead-list">${LEADS.map(
              (e, t) =>
                `<li class="tour-chat-lead-row" style="animation-delay:${180 * t}ms"><div class="tour-chat-lead-name">${esc(e.name)}</div><div class="tour-chat-lead-role">${esc(e.role)}</div><div class="tour-chat-lead-meta"><span class="tour-chip">Score ${e.score}</span><span class="tour-chip tour-chip-warn">${esc(e.lastTouch)}</span></div><div class="tour-chat-lead-reason">${esc(e.reason)}</div></li>`
            ).join("")}</ul>
          </div>`;
        });
    }
    if (n === 6) bindChat();
    if (n === 8) bindAutos();
    if (n === 12) bindConfirmEmail();
  }

  function bindConfirmEmail() {
    const btn = document.getElementById("btn-confirm-call");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const errEl = document.getElementById("confirm-email-error");
      if (errEl) errEl.hidden = true;
      btn.disabled = true;
      const title = btn.querySelector(".tour-close-confirm-btn-title");
      if (title) title.textContent = "Sending…";
      const payload = {
        name: "HelixOS tour",
        email: CONFIRM_TO,
        _subject: meetingWhen ? `HelixOS call confirmed — ${meetingWhen}` : "HelixOS discovery call confirmed",
        _template: "table",
        _captcha: "false",
        When: meetingWhen || "Not specified",
        Confirmation: meetingWhen
          ? `Someone confirmed they will attend the HelixOS discovery call on ${meetingWhen}.`
          : "Someone confirmed they will attend the HelixOS discovery call.",
        Page: location.href,
      };
      if (safeConfirm) payload["Meeting link (internal)"] = safeConfirm;

      fetch("https://formsubmit.co/ajax/" + CONFIRM_TO, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok || String(data && data.success) === "false") throw new Error("send failed");
          callConfirmed = true;
          try {
            sessionStorage.setItem("helixos_call_confirmed", "1");
          } catch (e) {}
          paint();
        })
        .catch(() => {
          btn.disabled = false;
          if (title) title.textContent = "Confirm your meeting";
          if (errEl) errEl.hidden = false;
        });
    });
  }

  function bindDashboard() {
    const root = mainEl.querySelector(".td-root");
    if (!root) return;
    root.addEventListener("click", (ev) => {
      const tab = ev.target.closest("[data-mod]");
      const metric = ev.target.closest("[data-metric]");
      if (tab) {
        dashModule = Number(tab.getAttribute("data-mod"));
        dashMetric = null;
        const slot = document.getElementById("td-module-slot");
        if (slot) slot.innerHTML = moduleHtml(MODULES[dashModule], dashMetric);
        root.querySelectorAll("[data-mod]").forEach((b, i) => b.classList.toggle("td-module-tab-active", i === dashModule));
      } else if (metric) {
        const t = Number(metric.getAttribute("data-metric"));
        dashMetric = dashMetric === t ? null : t;
        const slot = document.getElementById("td-module-slot");
        if (slot) slot.innerHTML = moduleHtml(MODULES[dashModule], dashMetric);
      }
    });
  }

  function bindChat() {
    const scroll = document.getElementById("chat-scroll");
    if (!scroll) return;
    let i = 0;
    const shown = [];
    const answered = [];
    function addQ() {
      const t = CHATS[i];
      const wrap = document.createElement("div");
      wrap.className = "tour-chat-exchange";
      wrap.innerHTML = `${t.industryContext ? `<div class="tour-chat-industry-context">${esc(t.industryContext)}</div>` : ""}<div class="tour-chat-source">Ask your ${esc(t.source)}</div><div class="tour-chat-bubble tour-chat-bubble-q" id="chat-q-${i}"></div><div id="chat-a-${i}"></div>`;
      scroll.appendChild(wrap);
      shown.push(i);
      const qel = document.getElementById(`chat-q-${i}`);
      typeInto(qel, t.q, 28, () => {
        later(() => {
          const ael = document.getElementById(`chat-a-${i}`);
          if (!ael) return;
          ael.innerHTML = `<div class="tour-chat-bubble tour-chat-bubble-a tour-chat-bubble-fade"><div class="tour-chat-answer-headline">${esc(t.a.headline)}</div><div class="tour-chat-answer-body">${esc(t.a.body)}</div><div class="tour-chat-answer-action"><span class="tour-chat-answer-action-label">Suggested action</span><div>${esc(t.a.action)}</div></div></div>`;
          answered.push(i);
          scroll.scrollTo({ top: scroll.scrollHeight, behavior: "smooth" });
          later(() => {
            if (i + 1 < CHATS.length) {
              i += 1;
              addQ();
              scroll.scrollTo({ top: scroll.scrollHeight, behavior: "smooth" });
            }
          }, 3600);
        }, 350);
      });
    }
    addQ();
  }

  function bindAutos() {
    every(() => {
      autoIdx = (autoIdx + 1) % AUTOMATIONS.length;
      refreshAutos();
    }, 4200);
    mainEl.querySelectorAll("[data-auto]").forEach((btn) => {
      btn.addEventListener("click", () => {
        autoIdx = Number(btn.getAttribute("data-auto"));
        refreshAutos();
      });
    });
  }

  function refreshAutos() {
    const flow = document.getElementById("auto-flow");
    if (flow) flow.innerHTML = flowHtml(AUTOMATIONS[autoIdx]);
    mainEl.querySelectorAll("[data-auto]").forEach((b, i) => b.classList.toggle("tour-auto-card-active", i === autoIdx));
  }

  paint();
})();
