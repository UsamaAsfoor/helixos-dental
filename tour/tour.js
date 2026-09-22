(function () {
  "use strict";

  const LOGO = "/images/development-agency-logo.png";
  const STEP_LABELS = [
    "Start",
    "Hire",
    "Sprint",
    "Stack",
    "Board",
    "A build",
    "Bench",
    "Own",
    "Stay",
    "Trust",
    "Return",
    "Call",
  ];

  const NARRATION = {
    1: "HelixOS is our name for how we work with you — not a product you buy off a shelf. You hire us as your engineering team. We design, build, and stay. This walkthrough is one engagement, from first sprint to the work that keeps running. Press play when you're ready.",
    2: "Most companies try one of three things. They post a job and wait months for one person to ramp. They buy another platform and ask the front desk to learn it. Or they hire a partner. HelixOS is that third path — a bench of engineers who already know how to ship, sitting inside your operation.",
    3: "A typical first sprint looks like this. Discovery call, then we map the stack. Week one we pick one painful workflow and make it real. Not a 90-day roadmap. Not a demo environment. Working software on your tools, in your week.",
    4: "We don't rip out what you already pay for. Dentrix, Eaglesoft, Weave, your payer portal, your calendar — HelixOS sits on top and ties them together. The layer is yours. The tools stay where they are until you decide otherwise.",
    5: "Here's a week on the board for a four-location group. Tickets, owners, status. This is what it looks like when you have a team instead of a ticket in a vendor's queue. Click around. Yours will be a different set of tickets — that's the point.",
    6: "One build, walked. Patient books. We hit the payer. Chart updates. Front desk sees verified coverage before the huddle. That's not a zap. That's a system we designed with you, then shipped. The next build is whatever is costing you the most hours.",
    7: "Who actually shows up. A lead engineer. Someone who lives in your integrations. Someone who sits with your operators so the work matches the floor, not a slide. You don't manage this bench. You tell us the outcome.",
    8: "You own what we make. Repo, credentials, runbooks. If the retainer ever ends, the system stays. That's the opposite of renting five tools and hoping they still talk to each other next year.",
    9: "Then we stay. Monthly retainer means the next workflow, the next integration, the thing that broke on Tuesday. HelixOS is the relationship — not a handoff PDF.",
    10: "Everything we ship inherits your rules. Access, logs, encryption. For regulated work we can run models in your cloud so patient data doesn't wander. We don't need a lecture to take that seriously.",
    11: "What this tends to return: hours back at the desk, chairs filled that used to sit empty, verification that doesn't eat a morning, software you stop renting. Your numbers will be different. The pattern is the same.",
    12: "Come to the call with one thing you'd hire engineers to take off your plate. We'll start there. Confirm you're coming so we can be ready.",
  };

  const COMPARE = [
    {
      kind: "job",
      kicker: "Post a role",
      title: "One hire, long ramp",
      points: ["Salary, benefits, recruiting", "One person's stack — they leave with it", "You still run standups and reviews", "Six months before anything ships"],
    },
    {
      kind: "saas",
      kicker: "Buy a platform",
      title: "Another login to learn",
      points: ["Per-seat pricing that never ends", "Your team has to operate it", "Fits their workflow, not yours", "Leaves when you stop paying"],
    },
    {
      kind: "helix",
      kicker: "HelixOS",
      title: "Hire the bench",
      points: ["Engineers who already ship", "Custom systems on the tools you have", "You own the work", "We stay as your tech partner"],
    },
  ];

  const SPRINT = [
    { day: "Mon", label: "Map", detail: "Stack, access, the one workflow that hurts most" },
    { day: "Tue", label: "Wire", detail: "Connect PMS, comms, payer — no rip-and-replace" },
    { day: "Wed", label: "Build", detail: "First working slice on your data" },
    { day: "Thu", label: "Tighten", detail: "Desk sits with it. We fix what doesn't match the floor" },
    { day: "Fri", label: "Live", detail: "Handoff. It's running. Next ticket is already queued" },
  ];

  const STACK = [
    { name: "PMS", examples: "Dentrix · Eaglesoft · Open Dental" },
    { name: "Comms", examples: "Weave · Lighthouse · RevenueWell" },
    { name: "Payers", examples: "Delta · Aetna · clearinghouse" },
    { name: "Calendar", examples: "Huddle board · operator schedule" },
    { name: "Finance", examples: "Production · A/R · collections" },
  ];

  const COLUMNS = [
    {
      id: "now",
      title: "This week",
      tickets: [
        { id: "t1", title: "Eligibility before huddle", owner: "Amina", tag: "Payers" },
        { id: "t2", title: "Recall list that actually sends", owner: "Luis", tag: "Comms" },
      ],
    },
    {
      id: "build",
      title: "In build",
      tickets: [
        { id: "t3", title: "Four-office production rollup", owner: "Amina", tag: "PMS" },
        { id: "t4", title: "No-show text with chair fill", owner: "Priya", tag: "Ops" },
      ],
    },
    {
      id: "live",
      title: "Live",
      tickets: [
        { id: "t5", title: "Front-desk morning brief", owner: "Luis", tag: "Desk" },
        { id: "t6", title: "Referring-doc portal v1", owner: "Priya", tag: "Custom" },
      ],
    },
  ];

  const TICKET_DETAIL = {
    t1: "Hit the payer on book, write coverage back to the chart, surface exceptions before 8:30.",
    t2: "Lapsed hygiene, 90+ days, sequenced outreach — not a blast from a tool nobody checks.",
    t3: "One view across four locations. Same Dentrix. No spreadsheet merge on Sunday night.",
    t4: "Risk score on the appointment. Text that actually gets a same-day fill.",
    t5: "Three numbers and one action. On the phone they already use.",
    t6: "Referring offices send, your coordinators see it, nobody re-types.",
  };

  const BUILD_STEPS = [
    { n: "01", title: "Patient books", detail: "Open Dental (or yours) fires the event. We don't ask anyone to export a CSV." },
    { n: "02", title: "Payer check", detail: "Eligibility against the card on file. Exceptions only — not a wall of PDFs." },
    { n: "03", title: "Chart writes back", detail: "Coverage lands where the assistant already looks. No second system." },
    { n: "04", title: "Desk sees it", detail: "Huddle list: verified, pending, call these three. That's the build." },
  ];

  const BENCH = [
    { role: "Lead engineer", name: "Owns the repo", detail: "Architecture, the hard integrations, code you can keep." },
    { role: "Integrations", name: "Lives in your stack", detail: "PMS, payers, comms. The unglamorous work that makes it real." },
    { role: "Operator partner", name: "Sits with your floor", detail: "Makes sure it matches how Tuesday actually feels — not a demo." },
  ];

  const OWN_LEFT = [
    { name: "Another dashboard login", cost: "Every month" },
    { name: "A VA doing the same clicks", cost: "Every week" },
    { name: "A freelancer who shipped and left", cost: "And took the context" },
  ];
  const OWN_RIGHT = [
    { name: "Code in a repo with your name on it", cost: "Yours" },
    { name: "Runbooks your team can open", cost: "Yours" },
    { name: "The next ticket on the same bench", cost: "HelixOS" },
  ];

  const STAY = [
    { title: "Ship", detail: "The next workflow, not a feature request form" },
    { title: "Review", detail: "Weekly. What landed, what's noisy, what to cut" },
    { title: "Queue", detail: "You point. We sequence. No job post required" },
  ];

  const TRUST = [
    { title: "Least privilege", detail: "People see what their role needs. Nothing extra." },
    { title: "Logged", detail: "Who touched what, when. Exportable if an auditor asks." },
    { title: "Encrypted", detail: "In transit and at rest. Boring on purpose." },
    { title: "Your cloud if needed", detail: "Regulated work can stay in your VPC. We don't argue with HIPAA." },
  ];

  const RETURNS = [
    { value: "14 hrs", label: "desk time back", detail: "Verification that used to be a phone morning." },
    { value: "11%", label: "fewer empty chairs", detail: "Recall and no-show work that actually runs." },
    { value: "1 system", label: "instead of four logins", detail: "The layer sits on what you already bought." },
    { value: "You", label: "own the build", detail: "If we ever unplug, the work stays." },
  ];

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    openTicket: "t3",
  };

  const timers = [];
  function clearTimers() {
    while (timers.length) {
      const id = timers.pop();
      clearTimeout(id);
      clearInterval(id);
    }
  }

  const headerEl = document.getElementById("tour-header");
  const mainEl = document.getElementById("tour-main");
  const narrationSlot = document.getElementById("tour-narration-slot");
  const completeSlot = document.getElementById("tour-complete-slot");
  const narrationAudio = document.getElementById("narration-audio");
  const bgAudio = document.getElementById("bg-audio");
  const BASELINE = 0.28;

  function renderHeader() {
    const segs = STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const cls = n < state.stepIndex ? "done" : n === state.stepIndex ? "active" : n <= state.maxStepReached ? "seen" : "upcoming";
      const disabled = !state.audioUnlocked || n === state.stepIndex;
      return `<button type="button" class="tour-progress-segment tour-progress-${cls}" data-jump="${n}" ${disabled ? "disabled" : ""} title="${state.audioUnlocked ? "Jump to: " + esc(label) : "Start the walkthrough to move between steps"}" aria-label="Step ${n}: ${esc(label)}" ${n === state.stepIndex ? 'aria-current="step"' : ""}><div class="tour-progress-bar"></div><div class="tour-progress-label">${esc(label)}</div></button>`;
    }).join("");
    headerEl.innerHTML = `
      <div class="tour-header-top">
        <div class="tour-brand"><img alt="a. Development Agency" width="140" height="32" class="tour-brand-logo" src="${LOGO}"/></div>
        <div class="hx-ribbon" aria-label="HelixOS">HelixOS · how we embed as your engineering team</div>
        <div class="tour-progress-counter" aria-live="polite">Step ${state.stepIndex} <span class="tour-progress-of">of 12</span></div>
      </div>
      <div class="tour-progress-rail" aria-label="Tour progress">${segs}</div>`;
    headerEl.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => goTo(Number(btn.getAttribute("data-jump"))));
    });
  }

  function renderNarration() {
    if (state.stepIndex <= 1) {
      narrationSlot.innerHTML = "";
      return;
    }
    const text = NARRATION[state.stepIndex] || "";
    const isFinal = state.stepIndex === 12;
    narrationSlot.innerHTML = `
      <div class="tour-narration-card">
        <div class="tour-narration-text">${esc(text)}</div>
        <div class="tour-narration-actions">
          ${state.audioUnlocked ? `<button type="button" class="tour-narration-icon-btn" id="btn-mute" aria-label="${state.muted ? "Unmute audio" : "Mute audio"}" title="${state.muted ? "Unmute" : "Mute"}">${state.muted ? iconMute() : iconSound()}</button>` : ""}
          ${state.stepIndex > 1 && !state.completed ? `<button type="button" class="tour-narration-back" id="btn-back" aria-label="Previous step"><span class="tour-narration-back-arrow">←</span>Back</button>` : ""}
          ${!state.completed ? `<button type="button" class="tour-narration-next" id="btn-next">${isFinal ? "Finish" : "Next"}<span class="tour-narration-next-arrow">→</span></button>` : ""}
        </div>
      </div>`;
    const mute = document.getElementById("btn-mute");
    const back = document.getElementById("btn-back");
    const next = document.getElementById("btn-next");
    if (mute) mute.addEventListener("click", toggleMute);
    if (back) back.addEventListener("click", goBack);
    if (next) next.addEventListener("click", advance);
  }

  function iconSound() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  }
  function iconMute() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
  }

  function renderComplete() {
    completeSlot.innerHTML = state.completed
      ? `<div class="tour-complete-overlay"><div class="tour-complete-card"><div class="tour-eyebrow">Walkthrough complete</div><h3 class="tour-complete-headline">Bring one thing you'd hire for.</h3><p class="tour-complete-sub">We'll map whether HelixOS is the right bench. Looking forward to the call.</p></div></div>`
      : "";
  }

  function fadeBg(target) {
    const start = bgAudio.volume;
    const delta = target - start;
    const t0 = performance.now();
    function tick(now) {
      const e = Math.min(1, (now - t0) / 600);
      bgAudio.volume = Math.max(0, Math.min(1, start + delta * e));
      if (e < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function applyMute() {
    bgAudio.muted = state.muted;
    narrationAudio.muted = true;
  }

  function playNarration() {
    narrationAudio.pause();
    applyMute();
  }

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

  function toggleMute() {
    state.muted = !state.muted;
    applyMute();
    renderNarration();
  }

  function paint() {
    clearTimers();
    renderHeader();
    renderStep();
    renderNarration();
    renderComplete();
    playNarration();
  }

  function renderStep() {
    const fn = [null, landing, hire, sprint, stack, board, build, bench, own, stay, trust, results, close][state.stepIndex];
    mainEl.innerHTML = fn();
    bindStep(state.stepIndex);
  }

  function landing() {
    return `<div class="tour-step hx-landing">
      <p class="tour-eyebrow">A short walkthrough before the call</p>
      <p class="hx-kicker">HelixOS</p>
      <h1 class="hx-hero-title">The engineering team<br/>you don't have to hire.</h1>
      <p class="hx-hero-sub">We embed. We build the systems your practice actually runs on. We stay. This is one engagement — not a product demo of someone else's dashboard.</p>
      <button type="button" class="tour-play-gate" id="play-gate" aria-label="Start the walkthrough">
        <span class="tour-play-gate-icon" aria-hidden="true">▶</span>
        <span class="tour-play-gate-text">Start the walkthrough</span>
        <span class="tour-play-gate-sub">About six minutes · captions on every step</span>
      </button>
    </div>`;
  }

  function hire() {
    const cols = COMPARE.map(
      (c) => `<article class="hx-compare hx-compare-${c.kind}">
        <div class="hx-compare-kicker">${esc(c.kicker)}</div>
        <h3>${esc(c.title)}</h3>
        <ul>${c.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </article>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">The choice in front of you</p>
      <h2 class="tour-step-title">Three ways to get engineers.<br/><span class="tour-accent">Only one is HelixOS.</span></h2>
      <p class="tour-step-sub">You're not shopping for another login. You're deciding how work gets built — and who still owns it in a year.</p>
      <div class="hx-compare-grid">${cols}</div>
    </div>`;
  }

  function sprint() {
    const days = SPRINT.map(
      (d, i) => `<li class="hx-day" style="animation-delay:${80 * i}ms">
        <div class="hx-day-name">${esc(d.day)}</div>
        <div class="hx-day-label">${esc(d.label)}</div>
        <p>${esc(d.detail)}</p>
      </li>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">First week, not first quarter</p>
      <h2 class="tour-step-title">A sprint that ends in <span class="tour-accent">working software</span>.</h2>
      <p class="tour-step-sub">After the 15-minute call and agreement, we start like an embedded team. One painful workflow. Live by Friday. Then the retainer is how the next ones land.</p>
      <ol class="hx-week">${days}</ol>
    </div>`;
  }

  function stack() {
    const rows = STACK.map(
      (s, i) => `<li class="hx-stack-row" style="animation-delay:${70 * i}ms">
        <span class="hx-stack-name">${esc(s.name)}</span>
        <span class="hx-stack-ex">${esc(s.examples)}</span>
      </li>`
    ).join("");
    return `<div class="tour-step hx-wrap hx-stack-step">
      <div>
        <p class="tour-eyebrow">We sit where you already are</p>
        <h2 class="tour-step-title">HelixOS is a <span class="tour-accent">layer</span>, not a replacement.</h2>
        <p class="tour-step-sub">The PMS stays. The phones stay. We wire them, then build the pieces they never grew — briefs, eligibility, recall, the portal your referring docs will actually use.</p>
      </div>
      <div class="hx-stack-card">
        <div class="hx-stack-card-label">Your stack</div>
        <ul class="hx-stack-list">${rows}</ul>
        <div class="hx-stack-join">↓</div>
        <div class="hx-stack-layer">HelixOS · custom layer you own</div>
      </div>
    </div>`;
  }

  function boardHtml() {
    const cols = COLUMNS.map((col) => {
      const cards = col.tickets
        .map((t) => {
          const open = state.openTicket === t.id;
          return `<button type="button" class="hx-ticket${open ? " hx-ticket-open" : ""}" data-ticket="${t.id}">
            <span class="hx-ticket-tag">${esc(t.tag)}</span>
            <span class="hx-ticket-title">${esc(t.title)}</span>
            <span class="hx-ticket-owner">${esc(t.owner)}</span>
          </button>`;
        })
        .join("");
      return `<div class="hx-col"><div class="hx-col-title">${esc(col.title)}</div>${cards}</div>`;
    }).join("");
    const detail = TICKET_DETAIL[state.openTicket] || "";
    return `<div class="hx-board">${cols}</div>
      <p class="hx-ticket-detail" id="ticket-detail">${esc(detail)}</p>`;
  }

  function board() {
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">Meridian Practice Group · four locations</p>
      <h2 class="tour-step-title">A week on the <span class="tour-accent">board</span>.</h2>
      <p class="tour-step-sub">This is what an embedded bench looks like. Different tickets than yours — same idea. Click a card.</p>
      <div id="board-root">${boardHtml()}</div>
    </div>`;
  }

  function build() {
    const steps = BUILD_STEPS.map(
      (s, i) => `<li class="hx-flow-step" style="animation-delay:${90 * i}ms">
        <div class="hx-flow-n">${esc(s.n)}</div>
        <div>
          <div class="hx-flow-title">${esc(s.title)}</div>
          <p>${esc(s.detail)}</p>
        </div>
      </li>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">One ticket, walked</p>
      <h2 class="tour-step-title">Eligibility that <span class="tour-accent">finishes before huddle</span>.</h2>
      <p class="tour-step-sub">Not a zap. A system designed with the desk, shipped by engineers, running on the PMS you already have.</p>
      <ol class="hx-flow">${steps}</ol>
    </div>`;
  }

  function bench() {
    const cards = BENCH.map(
      (b, i) => `<article class="hx-person" style="animation-delay:${80 * i}ms">
        <div class="hx-person-role">${esc(b.role)}</div>
        <h3>${esc(b.name)}</h3>
        <p>${esc(b.detail)}</p>
      </article>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">Who actually shows up</p>
      <h2 class="tour-step-title">A bench. <span class="tour-accent">Not a chatbot.</span></h2>
      <p class="tour-step-sub">You don't recruit them. You don't write the job post. You tell us the outcome — HelixOS is how that team sits with you.</p>
      <div class="hx-bench">${cards}</div>
    </div>`;
  }

  function own() {
    const left = OWN_LEFT.map((r) => `<li><span>${esc(r.name)}</span><em>${esc(r.cost)}</em></li>`).join("");
    const right = OWN_RIGHT.map((r) => `<li><span>${esc(r.name)}</span><em>${esc(r.cost)}</em></li>`).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">When the invoice stops</p>
      <h2 class="tour-step-title">If we unplug, <span class="tour-accent">the work stays</span>.</h2>
      <p class="tour-step-sub">That's the test. Rent doesn't pass it. A hire who leaves with the laptop doesn't either.</p>
      <div class="hx-own">
        <div class="hx-own-col hx-own-out">
          <h3>What you're done paying for</h3>
          <ul>${left}</ul>
        </div>
        <div class="hx-own-col hx-own-in">
          <h3>What you keep</h3>
          <ul>${right}</ul>
        </div>
      </div>
    </div>`;
  }

  function stay() {
    const items = STAY.map((s, i) => `<li class="hx-loop-item" style="animation-delay:${80 * i}ms"><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></li>`).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">After Friday</p>
      <h2 class="tour-step-title">The retainer is the <span class="tour-accent">relationship</span>.</h2>
      <p class="tour-step-sub">HelixOS isn't a handoff PDF. It's the next workflow, the thing that broke on Tuesday, someone who already knows your stack.</p>
      <ol class="hx-loop">${items}</ol>
    </div>`;
  }

  function trust() {
    const cards = TRUST.map(
      (t, i) => `<article class="hx-trust-card" style="animation-delay:${70 * i}ms">
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.detail)}</p>
      </article>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">Guardrails, not a brochure</p>
      <h2 class="tour-step-title">Your rules. <span class="tour-accent">Your data.</span></h2>
      <p class="tour-step-sub">We build like an internal team would — because that's the job. For HIPAA-heavy work we can keep inference in your cloud.</p>
      <div class="hx-trust">${cards}</div>
    </div>`;
  }

  function results() {
    const cards = RETURNS.map(
      (r, i) => `<article class="hx-return" style="animation-delay:${80 * i}ms">
        <div class="hx-return-value">${esc(r.value)}</div>
        <div class="hx-return-label">${esc(r.label)}</div>
        <p>${esc(r.detail)}</p>
      </article>`
    ).join("");
    return `<div class="tour-step hx-wrap">
      <p class="tour-eyebrow">What it tends to return</p>
      <h2 class="tour-step-title">Hours, chairs, and <span class="tour-accent">a system you own</span>.</h2>
      <p class="tour-step-sub">These are the kinds of outcomes we see. Yours will be a different mix. That's why the call is a scoping conversation, not a pitch deck.</p>
      <div class="hx-returns">${cards}</div>
    </div>`;
  }

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
      <p class="tour-eyebrow">Looking forward to meeting you</p>
      <h2 class="tour-step-close-headline">Bring one thing<br/><span class="tour-accent">you'd hire engineers for</span>.</h2>
      <p class="tour-step-close-sub">We'll tell you if HelixOS is the right bench — or if it isn't.</p>
      ${extra}
      <div class="tour-close-brand"><img src="${LOGO}" alt="a. Development Agency" width="160" height="32" class="tour-close-brand-logo"/></div>
    </div>`;
  }

  function bindStep(n) {
    if (n === 1) {
      const gate = document.getElementById("play-gate");
      if (gate) gate.addEventListener("click", startFromGate);
    }
    if (n === 5) bindBoard();
    if (n === 12) bindConfirmEmail();
  }

  function bindBoard() {
    const root = document.getElementById("board-root");
    if (!root) return;
    root.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-ticket]");
      if (!btn) return;
      state.openTicket = btn.getAttribute("data-ticket");
      root.innerHTML = boardHtml();
    });
  }

  const CONFIRM_TO = "usama@adevagency.com";
  let callConfirmed = false;
  try {
    callConfirmed = sessionStorage.getItem("helixos_call_confirmed") === "1";
  } catch (e) {}

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
        name: "HelixOS walkthrough",
        email: CONFIRM_TO,
        _subject: meetingWhen ? `Discovery call confirmed — ${meetingWhen}` : "Discovery call confirmed",
        _template: "table",
        _captcha: "false",
        When: meetingWhen || "Not specified",
        Confirmation: meetingWhen
          ? `Someone confirmed they will attend the discovery call on ${meetingWhen}.`
          : "Someone confirmed they will attend the discovery call.",
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
          try {
            if (window.metaCapi && window.metaCapi.trackLead) window.metaCapi.trackLead({});
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

  paint();
})();
