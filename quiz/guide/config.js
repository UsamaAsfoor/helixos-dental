/**
 * /quiz/guide/ — landing page promoting the guide, "Send My Guide" CTAs.
 */
window.QUIZ_CONFIG = Object.assign({}, window.QUIZ_BASE, {
  funnel: "workflow-guide-quiz",
  storageKey: "helix_quiz_guide_v1",
  skipIntro: false,
  intro: {
    headline: "Get your personalized",
    headlineEm: "workflow automation guide",
    headlineEnd: "for your dental practice",
    cta: "Send My Guide",
  },
  capture: {
    headline: "Almost done",
    subhead: "Enter your details and we'll send your personalized guide.",
    cta: "Send My Guide",
  },
  done: {
    headline: "Your guide is ready.",
    subhead: "Check your inbox — or read the highlights below.",
    secondaryCta: "Book a Strategy Call",
    secondaryHref: "/#book-form",
  },
});
