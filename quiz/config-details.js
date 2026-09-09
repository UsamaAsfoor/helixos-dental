/**
 * /quiz/ — direct to questions, "Get more details" on lead form.
 */
window.QUIZ_CONFIG = Object.assign({}, window.QUIZ_BASE, {
  funnel: "workflow-assessment",
  storageKey: "helix_quiz_details_v1",
  skipIntro: true,
  capture: {
    headline: "Almost done",
    subhead: "Enter your details and we'll follow up with next steps.",
    cta: "Get more details",
  },
  done: {
    headline: "Thanks — we'll be in touch.",
    subhead: "Read the highlights from your assessment below.",
    secondaryCta: "Book a Strategy Call",
    secondaryHref: "/#book-form",
  },
});
