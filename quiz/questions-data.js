/**
 * Shared quiz questions, guides, and routing — used by all funnel variants.
 */
window.QUIZ_BASE = {
  version: "2.2",
  estimatedMinutes: 2,
  questions: [
    {
      id: "workflow_pain",
      title: "What's the biggest workflow bottleneck in your practice right now?",
      type: "single",
      options: [
        { id: "staff_knowledge", label: "Processes live in staff's heads — not in software" },
        { id: "fragmented", label: "Too many tools that don't connect" },
        { id: "insurance", label: "Insurance & revenue cycle (eligibility → claim → payment)" },
        { id: "point_solutions", label: "Vendors only automate one task — nothing connects end-to-end" },
      ],
    },
    {
      id: "staff_dependency",
      title: "How dependent is your admin operation on specific people?",
      type: "single",
      options: [
        { id: "critical", label: "Critical — if they left, we'd be in serious trouble" },
        { id: "somewhat", label: "Somewhat — key processes aren't documented" },
        { id: "moderate", label: "Moderate — some SOPs, but big gaps remain" },
        { id: "low", label: "Low — most workflows are already in software" },
      ],
    },
    {
      id: "pms_software",
      title: "What practice management software do you currently use?",
      type: "single",
      options: [
        { id: "open_dental", label: "Open Dental" },
        { id: "dentrix", label: "Dentrix" },
        { id: "eaglesoft", label: "Eaglesoft" },
        { id: "other", label: "Other" },
      ],
    },
    {
      id: "pms_integration",
      title: "How important is it that automation writes directly into your PMS?",
      type: "single",
      options: [
        { id: "dealbreaker", label: "Deal-breaker — no copy/paste between systems" },
        { id: "very", label: "Very important — manual steps only for exceptions" },
        { id: "nice", label: "Nice to have" },
        { id: "unsure", label: "Still evaluating our stack" },
      ],
    },
    {
      id: "dev_team_interest",
      title: "Would you be interested in hiring a development team to handle the technical side for you?",
      type: "single",
      options: [
        { id: "yes", label: "Yes" },
        { id: "maybe", label: "Maybe" },
        { id: "exploring", label: "Exploring options" },
        { id: "no", label: "No" },
      ],
    },
  ],
  guides: {
    revenue_cycle: {
      id: "revenue_cycle",
      title: "Revenue cycle: connect eligibility through payment",
      focus: [
        "Eligibility into the chart before the visit",
        "Notes ↔ codes ↔ claim requirements",
        "Claims dashboard — submitted, stuck, paid, action needed",
      ],
      sections: [
        {
          heading: "The pattern we hear",
          body: "Vendors automate eligibility — or claims — or reminders. Nothing moves data through your PMS, treatment planning, coding, submission, and denial follow-up as one workflow. Staff become the integration layer.",
        },
        {
          heading: "What a connected layer looks like",
          body: "Pull eligibility into the chart. After the visit, validate codes against the doctor's note. Prep the claim per payer rules. Submit, track status, and surface exceptions in a command center — blue submitted, red needs action, green paid. Humans handle edge cases; software runs the repetitive chain.",
        },
        {
          heading: "Where to start",
          body: "Pick the break that costs the most each week — usually eligibility before huddle or claim prep after close. Wire that step into your PMS first. Layer the rest once data is flowing without copy/paste.",
        },
      ],
    },
    workflow: {
      id: "workflow",
      title: "Integration: stop being the glue between your tools",
      focus: [
        "PMS as the system of record",
        "Insurance portals & clearinghouse in the loop",
        "One workflow — not five tabs and a spreadsheet",
      ],
      sections: [
        {
          heading: "Why point solutions fail",
          body: "Every dental office runs differently. A tool that only checks eligibility — or only sends texts — leaves your team moving information between websites, logins, and the practice management system. That's where time disappears.",
        },
        {
          heading: "What owners actually need",
          body: "An automation layer that reads and writes where your team already works. Not a dashboard on the side. When the PMS, insurance systems, and rules engine talk to each other, you stop paying people to be human APIs.",
        },
        {
          heading: "Build order",
          body: "Map one critical path (e.g. morning eligibility or post-visit close). Document inputs, outputs, and who touches it today. Automate that path end-to-end before buying the next single-purpose vendor.",
        },
      ],
    },
    staff: {
      id: "staff",
      title: "Staff dependency: put the process in software",
      focus: [
        "SOPs that run — not binders nobody opens",
        "Office manager oversees the system",
        "Survive turnover without losing how things work",
      ],
      sections: [
        {
          heading: "The real risk",
          body: "When billing rules, verification steps, and follow-up live in one person's head, the owner is employed by their staff. COVID made hiring harder; training new people on undocumented workflows makes it worse.",
        },
        {
          heading: "The shift",
          body: "Software holds the workflow. Staff approve exceptions and improve the rules — they don't manually execute every step. One strong operator plus automation beats a room of people doing repetitive admin.",
        },
        {
          heading: "First move",
          body: "Pick the process your office manager explains most often. Write it as steps. Build or automate the boring middle. Review weekly until the system is the source of truth.",
        },
      ],
    },
    general: {
      id: "general",
      title: "Custom workflow automation for dental practices",
      focus: [
        "Built around your PMS & payers",
        "End-to-end paths — not one-off tasks",
        "Human review on exceptions only",
      ],
      sections: [
        {
          heading: "Why generic SaaS misses",
          body: "Every office runs differently. Off-the-shelf products force your workflow into their mold. Point vendors solve one slice and leave your team integrating the rest.",
        },
        {
          heading: "The alternative",
          body: "A technology partner maps how your practice actually runs — eligibility, close-out, claims, staff handoffs — and builds an automation layer on top of Open Dental, Dentrix, Eaglesoft, or whatever you use.",
        },
        {
          heading: "How to use this guide",
          body: "Start with the workflow that breaks most often when someone is out sick. That's the first system to get out of people's heads and into software.",
        },
      ],
    },
  },
  guideMap: {
    workflow_pain: {
      staff_knowledge: "staff",
      fragmented: "workflow",
      insurance: "revenue_cycle",
      point_solutions: "workflow",
    },
    staff_dependency: {
      critical: "staff",
      somewhat: "staff",
      moderate: "staff",
      low: "workflow",
    },
    pms_integration: {
      dealbreaker: "workflow",
      very: "workflow",
      nice: "general",
      unsure: "general",
    },
  },
};
