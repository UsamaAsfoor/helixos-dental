/**
 * Quiz engine. Variant config in QUIZ_CONFIG (see config-*.js).
 * Flow: [optional intro] → questions → lead capture → done.
 */
(function () {
  const cfg = window.QUIZ_CONFIG;
  if (!cfg) return;

  const QUESTIONS = cfg.questions;
  const LS_KEY = cfg.storageKey || "helix_quiz_state";
  const HAS_INTRO = !cfg.skipIntro && cfg.intro;

  const el = {
    progress: document.getElementById("progress-bar"),
    stepMeta: document.getElementById("step-meta"),
    screens: {
      intro: document.getElementById("screen-intro"),
      question: document.getElementById("screen-question"),
      capture: document.getElementById("screen-capture"),
      done: document.getElementById("screen-done"),
    },
    qTitle: document.getElementById("q-title"),
    options: document.getElementById("options"),
    progressWrap: document.getElementById("progress-wrap"),
    quizRoot: document.querySelector(".quiz-root"),
    introHeadline: document.getElementById("intro-headline"),
    captureHeadline: document.getElementById("capture-headline"),
    captureSub: document.getElementById("capture-sub"),
    captureCta: document.getElementById("capture-cta"),
    doneHeadline: document.getElementById("done-headline"),
    form: document.getElementById("lead-form"),
    firstName: document.getElementById("lead-name"),
    company: document.getElementById("lead-company"),
    email: document.getElementById("email"),
    phone: document.getElementById("lead-phone"),
    formErr: document.getElementById("form-err"),
    guideMount: document.getElementById("guide-mount"),
    doneSub: document.getElementById("done-sub"),
    bookCta: document.getElementById("book-cta"),
    startBtn: document.getElementById("start-btn"),
  };

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return "q_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function utm() {
    const p = new URLSearchParams(location.search);
    return {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
      utm_content: p.get("utm_content") || "",
      utm_term: p.get("utm_term") || "",
    };
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      session_id: uuid(),
      funnel: cfg.funnel,
      version: cfg.version,
      status: HAS_INTRO ? "intro" : "question",
      question_index: 0,
      answers: {},
      first_name: "",
      email: "",
      phone: "",
      company: "",
      guide_id: "",
      started_at: 0,
      ...utm(),
    };
  }

  let state = loadState();

  function saveLocal() {
    try {
      sessionStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function hog(event, props) {
    try {
      if (window.helixhog && typeof window.helixhog.capture === "function") {
        window.helixhog.capture(event, Object.assign({ funnel: cfg.funnel, quiz_session: state.session_id }, props || {}));
      }
    } catch (e) {}
  }

  function persist(extra) {
    saveLocal();
    const payload = Object.assign(
      {
        session_id: state.session_id,
        distinct_id: (window.helixhog && window.helixhog.get_distinct_id && window.helixhog.get_distinct_id()) || "",
        status: state.status,
        last_question: state.question_index,
        answers: state.answers,
        first_name: state.first_name,
        email: state.email,
        phone: state.phone,
        company: state.company,
        guide_id: state.guide_id,
        funnel: cfg.funnel,
        utm_source: state.utm_source,
        utm_medium: state.utm_medium,
        utm_campaign: state.utm_campaign,
        utm_content: state.utm_content,
        referrer: document.referrer || "",
        pathname: location.pathname,
      },
      extra || {}
    );
    try {
      var hogHost = (window.HELIXHOG_API_HOST || (window.helixhog && window.helixhog.api_host) || "").replace(/\/$/, "");
      fetch((hogHost || "") + "/quiz/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function showScreen(name) {
    Object.keys(el.screens).forEach(function (k) {
      if (!el.screens[k]) return;
      el.screens[k].classList.toggle("is-active", k === name);
    });
    if (el.quizRoot) el.quizRoot.setAttribute("data-screen", name);
  }

  function progressPct() {
    if (state.status === "intro") return 0;
    if (state.status === "capture") return 92;
    if (state.status === "done") return 100;
    return Math.round(((state.question_index + 1) / (QUESTIONS.length + 1)) * 88);
  }

  function updateChrome() {
    if (state.status === "intro") {
      el.progress.style.width = "0%";
      if (el.progressWrap) el.progressWrap.hidden = true;
      if (el.stepMeta) el.stepMeta.hidden = true;
      return;
    }
    if (el.progressWrap) el.progressWrap.hidden = false;
    el.progress.style.width = progressPct() + "%";
    if (!el.stepMeta) return;
    if (state.status === "question") {
      el.stepMeta.textContent = "Question " + (state.question_index + 1) + " of " + QUESTIONS.length;
      el.stepMeta.hidden = false;
    } else if (state.status === "capture") {
      el.stepMeta.textContent = "Last step";
      el.stepMeta.hidden = false;
    } else if (state.status === "done") {
      el.stepMeta.textContent = "Done";
      el.stepMeta.hidden = false;
    } else {
      el.stepMeta.hidden = true;
    }
  }

  function pickGuideId() {
    const wp = (state.answers.workflow_pain || {}).id;
    const sd = (state.answers.staff_dependency || {}).id;
    const mapW = cfg.guideMap.workflow_pain || {};
    const mapS = cfg.guideMap.staff_dependency || {};
    if (wp && mapW[wp]) return mapW[wp];
    if (sd && mapS[sd]) return mapS[sd];
    return "general";
  }

  function renderGuide() {
    const id = state.guide_id || pickGuideId();
    const g = cfg.guides[id] || cfg.guides.general;
    state.guide_id = g.id;
    el.guideMount.innerHTML =
      "<h2>" +
      escapeHtml(g.title) +
      "</h2><ul class=\"focus-list\">" +
      g.focus.map(function (f) { return "<li>" + escapeHtml(f) + "</li>"; }).join("") +
      "</ul>" +
      g.sections
        .map(function (s) {
          return (
            "<div class=\"guide-section\"><h3>" +
            escapeHtml(s.heading) +
            "</h3><p>" +
            escapeHtml(s.body) +
            "</p></div>"
          );
        })
        .join("");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyCopy() {
    const intro = cfg.intro || {};
    if (el.introHeadline && intro.headline && intro.headlineEm) {
      el.introHeadline.innerHTML =
        escapeHtml(intro.headline) +
        " <em>" +
        escapeHtml(intro.headlineEm) +
        "</em> " +
        escapeHtml(intro.headlineEnd || "");
    }
    if (el.startBtn && intro.cta) el.startBtn.textContent = intro.cta;

    const capture = cfg.capture || {};
    if (el.captureHeadline && capture.headline) el.captureHeadline.textContent = capture.headline;
    if (el.captureSub && capture.subhead) el.captureSub.textContent = capture.subhead;
    if (el.captureCta && capture.cta) el.captureCta.textContent = capture.cta;

    const done = cfg.done || {};
    if (el.doneHeadline && done.headline) el.doneHeadline.textContent = done.headline;
    if (el.doneSub && done.subhead && state.status !== "done") el.doneSub.textContent = done.subhead;
    if (el.bookCta && done.secondaryCta) el.bookCta.textContent = done.secondaryCta;
    if (el.bookCta && done.secondaryHref) el.bookCta.setAttribute("href", done.secondaryHref);
  }

  function currentQuestion() {
    return QUESTIONS[state.question_index];
  }

  function renderQuestion() {
    const q = currentQuestion();
    if (!q) {
      goCapture();
      return;
    }
    state.status = "question";
    showScreen("question");
    updateChrome();
    el.qTitle.textContent = q.title;

    const saved = state.answers[q.id];
    el.options.innerHTML = "";
    q.options.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option" + (saved && saved.id === opt.id ? " is-selected" : "");
      btn.dataset.id = opt.id;
      btn.textContent = opt.label;
      btn.addEventListener("click", function () {
        selectOption(q, opt, btn);
      });
      el.options.appendChild(btn);
    });

    hog("quiz_question_viewed", {
      question_id: q.id,
      question_index: state.question_index + 1,
      question_total: QUESTIONS.length,
      question_title: q.title,
    });
    persist();
  }

  function selectOption(q, opt, btn) {
    Array.prototype.forEach.call(el.options.querySelectorAll(".quiz-option"), function (b) {
      b.classList.toggle("is-selected", b === btn);
    });
    state.answers[q.id] = {
      id: opt.id,
      label: opt.label,
    };
    hog("quiz_answer", {
      question_id: q.id,
      question_index: state.question_index + 1,
      question_total: QUESTIONS.length,
      question_title: q.title,
      answer_id: opt.id,
      answer_label: opt.label,
    });
    persist();
    window.setTimeout(advance, 220);
  }

  function advance() {
    const q = currentQuestion();
    if (!q || !state.answers[q.id]) return;
    if (state.question_index < QUESTIONS.length - 1) {
      state.question_index += 1;
      renderQuestion();
    } else {
      goCapture();
    }
  }

  function goCapture() {
    state.status = "capture";
    hog("quiz_complete", {
      answers: state.answers,
      question_total: QUESTIONS.length,
    });
    persist();
    showScreen("capture");
    updateChrome();
    hog("quiz_email_view");
  }

  function resolveGuide() {
    state.guide_id = pickGuideId();
    renderGuide();
  }

  function allQuestionsAnswered() {
    return QUESTIONS.every(function (q) {
      return state.answers && state.answers[q.id];
    });
  }

  function showIntro() {
    state.status = "intro";
    showScreen("intro");
    updateChrome();
    persist();
  }

  function start() {
    state.status = "question";
    state.question_index = 0;
    state.answers = {};
    state.guide_id = "";
    state.first_name = "";
    state.email = "";
    state.phone = "";
    state.company = "";
    state.started_at = Date.now();
    hog("quiz_start");
    persist();
    renderQuestion();
  }

  function submitLead(e) {
    e.preventDefault();
    el.formErr.textContent = "";
    const name = (el.firstName.value || "").trim();
    const company = (el.company.value || "").trim();
    const email = (el.email.value || "").trim();
    const phone = (el.phone.value || "").trim();
    const phoneDigits = phone.replace(/\D/g, "");
    if (!name) {
      el.formErr.textContent = "Please add your name.";
      el.firstName.focus();
      return;
    }
    if (!company) {
      el.formErr.textContent = "Please add your practice name.";
      el.company.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      el.formErr.textContent = "Please enter a valid email.";
      el.email.focus();
      return;
    }
    if (phoneDigits.length < 10) {
      el.formErr.textContent = "Please enter a valid phone number.";
      el.phone.focus();
      return;
    }
    state.first_name = name;
    state.company = company;
    state.email = email;
    state.phone = phone;
    state.status = "done";
    resolveGuide();
    hog("quiz_email_submit", {
      first_name: name,
      company: company,
      email: email,
      phone: phone,
      guide_id: state.guide_id,
      answers: state.answers,
    });
    hog("lead", {
      $source: "quiz",
      email: email,
      phone: phone,
      company: company,
      name: name,
      guide_id: state.guide_id,
    });
    hog("quiz_guide_view", { guide_id: state.guide_id });
    persist({ email_submitted: true });
    try {
      if (window.fbq) window.fbq("track", "Lead");
    } catch (err) {}
    const done = cfg.done || {};
    if (el.doneSub) {
      if (cfg.funnel === "workflow-guide-quiz") {
        el.doneSub.textContent =
          "Your personalized guide is on its way to " + email + " — read the highlights below.";
      } else {
        el.doneSub.textContent = done.subhead || "We'll follow up shortly.";
      }
    }
    showScreen("done");
    updateChrome();
  }

  if (el.startBtn) el.startBtn.addEventListener("click", start);
  el.form.addEventListener("submit", submitLead);
  if (el.bookCta) {
    el.bookCta.addEventListener("click", function () {
      hog("quiz_cta_click", { cta: "book", href: el.bookCta.getAttribute("href") });
      persist({ cta_book: true });
    });
  }

  function init() {
    applyCopy();
    hog("quiz_view");

    const answered = Object.keys(state.answers || {}).length;
    const canResume =
      state.status === "question" &&
      answered > 0 &&
      !allQuestionsAnswered();

    if (canResume) {
      if (!state.started_at) state.started_at = Date.now();
      persist();
      renderQuestion();
      return;
    }

    if (HAS_INTRO) {
      showIntro();
      return;
    }

    start();
  }

  init();
})();
