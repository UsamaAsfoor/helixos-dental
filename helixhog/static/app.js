const $ = (sel) => document.querySelector(sel);
const view = $("#view");
const title = $("#page-title");
const livePill = $("#live-pill");
const rangeEl = $("#range");

const TITLES = {
  overview: "Overview",
  quiz: "Quiz funnel",
  events: "Event explorer",
  insights: "Insights",
  heatmaps: "Heatmaps",
  persons: "Persons",
  install: "Install on any site",
};

let current = "overview";

function range() {
  return rangeEl.value || "7d";
}

async function api(path) {
  const url = path.includes("?") ? `${path}&range=${range()}` : `${path}?range=${range()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(n || 0);
}

function when(ts) {
  return new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function shortId(id) {
  if (!id) return "—";
  return id.length > 18 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}

function empty(msg) {
  return `<div class="empty">${msg}<div style="margin-top:0.6rem"><a href="/">Open the site to generate events</a></div></div>`;
}

async function renderOverview() {
  const d = await api("/api/overview");
  livePill.textContent = d.pageviews || d.clicks || d.leads ? `${fmt(d.pageviews)} pageviews` : "Waiting for events";
  livePill.classList.toggle("hot", d.pageviews > 0);
  if (!d.pageviews && !d.clicks && !d.leads) {
    view.innerHTML = empty("No events in this range yet. Open any page with the HelixHog snippet, or paste /hog.js on a Fly.io site.");
    return;
  }
  view.innerHTML = `
    <div class="kpis">
      <div class="kpi"><label>Unique persons</label><b>${fmt(d.visitors)}</b><span>Distinct IDs</span></div>
      <div class="kpi"><label>Sessions</label><b>${fmt(d.sessions)}</b><span>30-minute windows</span></div>
      <div class="kpi"><label>Pageviews</label><b>${fmt(d.pageviews)}</b><span>$pageview</span></div>
      <div class="kpi"><label>Leads</label><b>${fmt(d.leads)}</b><span>${d.conversion_rate}% of persons</span></div>
      <div class="kpi"><label>Clicks</label><b>${fmt(d.clicks)}</b><span>$autocapture</span></div>
      <div class="kpi"><label>Scrolls</label><b>${fmt(d.scrolls)}</b><span>Depth marks</span></div>
      <div class="kpi"><label>Forms</label><b>${fmt(d.forms)}</b><span>$submit</span></div>
    </div>
    ${d.sites && d.sites.length ? `<div class="card" style="margin-bottom:0.75rem">
      <h2>Websites</h2>
      <table><thead><tr><th>Host</th><th>Visitors</th><th>Pageviews</th><th>Clicks</th><th>Leads</th></tr></thead><tbody>
        ${d.sites.map((s) => `<tr>
          <td class="mono">${s.host}</td>
          <td>${fmt(s.visitors)}</td>
          <td>${fmt(s.pageviews)}</td>
          <td>${fmt(s.clicks)}</td>
          <td>${fmt(s.leads)}</td>
        </tr>`).join("")}
      </tbody></table>
    </div>` : ""}
    <div class="grid-2">
      <div class="card">
        <h2>Top pages</h2>
        ${d.pages.length ? `<table><thead><tr><th>Path</th><th>Views</th></tr></thead><tbody>${d.pages.map((p) => `<tr><td class="mono">${p.path}</td><td>${fmt(p.views)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">No pageviews yet.</p>`}
      </div>
      <div class="card">
        <h2>Where people come from</h2>
        ${d.sources.length ? `<table><thead><tr><th>Source</th><th>Entry views</th></tr></thead><tbody>${d.sources.map((s) => `<tr><td>${s.source}</td><td>${fmt(s.visitors)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">No source data yet. Add ?utm_source=meta to ad links.</p>`}
      </div>
    </div>
  `;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSubmissionCard(s) {
  const answers = (s.answers_detail || []).map((a) => `
    <div class="answer-row">
      <div class="answer-q">Q${(s.answers_detail.indexOf(a) + 1)} · ${esc(a.question)}</div>
      <div class="answer-a">${esc(a.answer)}</div>
    </div>`).join("");
  const missing = Math.max(0, (s.questions_total || 5) - (s.questions_answered || 0));
  return `
    <details class="submission-card" ${s.email ? "open" : ""}>
      <summary>
        <div class="submission-head">
          <div>
            <strong>${esc(s.first_name || "Anonymous")}</strong>
            ${s.company ? `<span class="muted"> · ${esc(s.company)}</span>` : ""}
            <div class="submission-meta mono">${esc(s.email || "No email yet")}${s.phone ? ` · ${esc(s.phone)}` : ""}</div>
          </div>
          <div class="submission-badges">
            <span class="tag blue">${esc(s.funnel_label || s.funnel || "quiz")}</span>
            <span class="tag">${s.questions_answered || 0}/${s.questions_total || 5} answered</span>
            ${s.email_submitted ? `<span class="tag green">Lead</span>` : ""}
          </div>
        </div>
      </summary>
      <div class="submission-body">
        <div class="submission-grid">
          <div><span class="muted">Funnel path</span><div class="mono">${esc(s.pathname || "—")}</div></div>
          <div><span class="muted">Source</span><div>${esc(s.utm_source || "direct")}</div></div>
          <div><span class="muted">Guide</span><div class="mono">${esc(s.guide_id || "—")}</div></div>
          <div><span class="muted">Status</span><div>${esc(s.status || "—")}</div></div>
          <div><span class="muted">Last active</span><div class="mono">${when(s.updated_at)}</div></div>
          <div><span class="muted">Session</span><div class="mono">${esc(s.session_id)}</div></div>
        </div>
        <h3>Answers</h3>
        ${answers || `<p class="muted">No answers recorded yet.</p>`}
        ${missing ? `<p class="muted" style="margin-top:0.5rem">Dropped off before completing ${missing} question${missing === 1 ? "" : "s"}.</p>` : ""}
      </div>
    </details>`;
}

function renderQuizBlock(d, title) {
  const maxQ = Math.max(1, ...d.question_funnel.map((s) => s.count), d.sessions);
  return `
    <div class="card" style="margin-bottom:0.75rem">
      <h2>${title}</h2>
      <div class="kpis" style="margin-top:0.75rem;margin-bottom:0">
        <div class="kpi"><label>Sessions</label><b>${fmt(d.sessions)}</b></div>
        <div class="kpi"><label>Started</label><b>${fmt(d.started)}</b><span>${d.start_rate}%</span></div>
        <div class="kpi"><label>Finished</label><b>${fmt(d.completed)}</b><span>${d.complete_rate}%</span></div>
        <div class="kpi"><label>Leads</label><b>${fmt(d.emails)}</b><span>${d.email_rate}%</span></div>
      </div>
      <div class="funnel" style="margin-top:1rem">
        ${d.question_funnel.map((s) => `
          <div class="funnel-row quiz-funnel-row-wide">
            <div><div class="mono">Q${s.index}</div><div class="funnel-q-title">${esc(s.title || s.id)}</div></div>
            <div class="bar-track"><div class="bar" style="width:${Math.max(6, (s.count / maxQ) * 100)}%"></div></div>
            <div>${fmt(s.count)} <span class="muted">${s.conversion}%</span></div>
          </div>`).join("")}
      </div>
    </div>`;
}

async function renderQuiz() {
  const d = await api("/api/quiz");
  livePill.textContent = `${fmt(d.sessions)} quiz sessions`;
  livePill.classList.toggle("hot", d.sessions > 0);
  if (!d.sessions && !(d.event_funnel && d.event_funnel.steps && d.event_funnel.steps.some((s) => s.count))) {
    view.innerHTML = empty("No quiz sessions yet. Open /quiz/ or /quiz/guide/ and walk through a few questions — answers are stored as you go.");
    return;
  }
  const maxE = Math.max(1, ...(d.event_funnel.steps || []).map((s) => s.count));
  const funnelBlocks = (d.funnels || []).map((f) => {
    const block = d.by_funnel && d.by_funnel[f.id];
    return block ? renderQuizBlock(block, f.label || f.id) : "";
  }).join("");
  const submissions = (d.submissions || []).filter((s) => s.email || (s.answers_detail && s.answers_detail.length));
  view.innerHTML = `
    <div class="kpis">
      <div class="kpi"><label>All sessions</label><b>${fmt(d.sessions)}</b><span>/quiz/ + /quiz/guide/</span></div>
      <div class="kpi"><label>Started</label><b>${fmt(d.started)}</b><span>${d.start_rate}% of visits</span></div>
      <div class="kpi"><label>Finished questions</label><b>${fmt(d.completed)}</b><span>${d.complete_rate}% of starts</span></div>
      <div class="kpi"><label>Leads</label><b>${fmt(d.emails)}</b><span>${d.email_rate}% of finishes</span></div>
      <div class="kpi"><label>Book CTA</label><b>${fmt(d.book_clicks)}</b><span>After results</span></div>
    </div>
    ${funnelBlocks || renderQuizBlock(d, "Overall")}
    <div class="grid-2" style="margin-top:0.75rem">
      <div class="card">
        <h2>Event funnel (all)</h2>
        <p class="muted" style="margin-bottom:0.85rem">quiz_view → start → complete → email → guide → book CTA</p>
        <div class="funnel">
          ${(d.event_funnel.steps || []).map((s) => `
            <div class="funnel-row quiz-funnel-row">
              <div class="mono">${s.event}</div>
              <div class="bar-track"><div class="bar" style="width:${Math.max(6, (s.count / maxE) * 100)}%"></div></div>
              <div>${fmt(s.count)} <span class="muted">${s.conversion}%</span></div>
            </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <h2>Sources</h2>
        ${d.sources.length ? `<table><thead><tr><th>utm_source</th><th>Sessions</th></tr></thead><tbody>${d.sources.map((s) => `<tr><td>${s.source}</td><td>${fmt(s.count)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Add ?utm_source=meta on ad links.</p>`}
      </div>
    </div>
    <div class="card" style="margin-top:0.75rem">
      <h2>Answer distributions</h2>
      <p class="muted" style="margin-bottom:0.85rem">Across both funnels — use this to see which problems and PMS systems show up most.</p>
      <div class="quiz-dist">
        ${d.distributions.map((q) => `
          <div>
            <h3>${esc(q.question_title || q.question_id)}</h3>
            ${q.answers.length ? `<table><tbody>${q.answers.map((a) => `<tr><td>${esc(a.label)}</td><td>${fmt(a.count)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">No answers yet.</p>`}
          </div>`).join("")}
      </div>
    </div>
    <div class="card" style="margin-top:0.75rem">
      <h2>People &amp; their answers</h2>
      <p class="muted" style="margin-bottom:0.85rem">Every person who answered at least one question or submitted the form — expand to see exactly what they picked.</p>
      ${submissions.length ? `<div class="submission-list">${submissions.map(renderSubmissionCard).join("")}</div>` : `<p class="muted">No submissions with answers yet.</p>`}
    </div>
  `;
}

async function renderEvents() {
  const names = await api("/api/event-names");
  const selected = document.getElementById("event-filter")?.value || "";
  const data = await api(`/api/events?limit=80${selected ? `&event=${encodeURIComponent(selected)}` : ""}`);
  livePill.textContent = `${fmt(data.total)} events`;
  livePill.classList.toggle("hot", data.total > 0);
  view.innerHTML = `
    <div class="toolbar">
      <select id="event-filter">
        <option value="">All events</option>
        ${(data.events || names.events || []).map((e) => `<option ${e === selected ? "selected" : ""}>${e}</option>`).join("")}
      </select>
    </div>
    <div class="card" style="padding:0">
      ${data.items.length ? `<table><thead><tr><th>Time</th><th>Event</th><th>Site</th><th>Person</th><th>Path</th><th>Source</th></tr></thead><tbody>
        ${data.items.map((e) => `<tr>
          <td class="mono">${when(e.ts)}</td>
          <td><span class="tag">${e.event}</span></td>
          <td class="mono">${e.host || e.properties.$host || "—"}</td>
          <td class="mono">${shortId(e.distinct_id)}</td>
          <td class="mono">${e.pathname || e.properties.$pathname || "—"}</td>
          <td>${e.utm_source || e.properties.$referring_domain || "direct"}</td>
        </tr>`).join("")}
      </tbody></table>` : empty("No events captured yet.")}
    </div>
  `;
  $("#event-filter")?.addEventListener("change", () => renderEvents());
}

function spark(labels, values) {
  const w = 720, h = 200, p = 24;
  const max = Math.max(1, ...values);
  const n = Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => {
    const x = p + (i / n) * (w - p * 2);
    const y = h - p - (v / max) * (h - p * 2);
    return `${x},${y}`;
  }).join(" ");
  const bars = values.map((v, i) => {
    const bw = Math.max(4, (w - p * 2) / values.length - 4);
    const x = p + (i / values.length) * (w - p * 2);
    const bh = (v / max) * (h - p * 2);
    return `<rect x="${x}" y="${h - p - bh}" width="${bw}" height="${bh}" rx="2" fill="#F54E00" opacity="0.85"/>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${bars}
    <polyline fill="none" stroke="#ffb899" stroke-width="1.5" points="${pts}"/>
  </svg>
  <div class="muted" style="display:flex;justify-content:space-between;margin-top:0.4rem">
    <span>${labels[0] || ""}</span><span>${labels[labels.length - 1] || ""}</span>
  </div>`;
}

async function renderInsights() {
  const names = await api("/api/event-names");
  const event = document.getElementById("trend-event")?.value || "$pageview";
  const interval = range() === "24h" ? "hour" : "day";
  const [tr, fun] = await Promise.all([
    api(`/api/trends?event=${encodeURIComponent(event)}&interval=${interval}`),
    api("/api/funnel?steps=" + encodeURIComponent("$pageview,book_continue,lead")),
  ]);
  const maxFunnel = Math.max(1, ...fun.steps.map((s) => s.count));
  view.innerHTML = `
    <div class="toolbar">
      <label class="muted">Trend event</label>
      <select id="trend-event">${(names.events.length ? names.events : ["$pageview", "lead"]).map((e) => `<option ${e === event ? "selected" : ""}>${e}</option>`).join("")}</select>
    </div>
    <div class="grid-2">
      <div class="card">
        <h2>${tr.event} · ${fmt(tr.total)} total</h2>
        ${tr.total ? spark(tr.labels, tr.values) : empty("Nothing to chart yet.")}
      </div>
      <div class="card">
        <h2>Discovery funnel</h2>
        <p class="muted" style="margin-bottom:0.85rem">Pageview → Continue → Lead (thank-you)</p>
        <div class="funnel">
          ${fun.steps.map((s) => `
            <div class="funnel-row">
              <div class="mono">${s.event}</div>
              <div class="bar-track"><div class="bar" style="width:${Math.max(6, (s.count / maxFunnel) * 100)}%"></div></div>
              <div>${fmt(s.count)} <span class="muted">${s.conversion}%</span></div>
            </div>`).join("")}
        </div>
      </div>
    </div>
  `;
  $("#trend-event")?.addEventListener("change", () => renderInsights());
}

function heatPoint(doc, pt) {
  const win = doc.defaultView;
  const scrollX = win.scrollX || 0;
  const scrollY = win.scrollY || 0;
  if (pt.selector && pt.selector.includes("#")) {
    const id = (pt.selector.match(/#([A-Za-z0-9_-]+)/) || [])[1];
    const el = id && doc.getElementById(id);
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
    }
  }
  const w = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth, 1);
  const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 1);
  return { x: (pt.x / 100) * w, y: (pt.y / 100) * h };
}

function paintHeatOverlay(doc, points) {
  doc.getElementById("helixhog-heat-overlay")?.remove();
  const w = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth, 1);
  const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 1);
  const canvas = doc.createElement("canvas");
  canvas.id = "helixhog-heat-overlay";
  canvas.width = w;
  canvas.height = h;
  canvas.setAttribute(
    "style",
    "position:absolute;left:0;top:0;width:" + w + "px;height:" + h + "px;pointer-events:none;z-index:2147483646;"
  );
  const ctx = canvas.getContext("2d");
  for (const pt of points) {
    const loc = heatPoint(doc, pt);
    const g = ctx.createRadialGradient(loc.x, loc.y, 0, loc.x, loc.y, 32);
    g.addColorStop(0, "rgba(245,78,0,0.6)");
    g.addColorStop(1, "rgba(245,78,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(loc.x, loc.y, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  (doc.body || doc.documentElement).appendChild(canvas);
}

async function renderHeatmaps() {
  const selected = document.getElementById("heat-path")?.value || "";
  const data = await api(`/api/heatmap?path=${encodeURIComponent(selected)}`);
  const path = selected || data.paths[0] || "/";
  livePill.textContent = `${fmt(data.points.length)} clicks`;
  livePill.classList.toggle("hot", data.points.length > 0);
  view.innerHTML = `
    <div class="toolbar">
      <label class="muted">Page</label>
      <select id="heat-path">
        ${(data.paths.length ? data.paths : ["/"]).map((p) => `<option ${p === path ? "selected" : ""}>${p}</option>`).join("")}
      </select>
      <span class="muted">${fmt(data.points.length)} clicks · scroll inside the preview like a normal browser</span>
    </div>
    <div class="heat-wrap">
      <iframe id="heat-frame" src="${path}" title="Heatmap page"></iframe>
    </div>
  `;
  $("#heat-path")?.addEventListener("change", () => renderHeatmaps());
  const frame = $("#heat-frame");
  frame.addEventListener("load", () => {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      paintHeatOverlay(doc, data.points);
      setTimeout(() => paintHeatOverlay(doc, data.points), 400);
    } catch (e) {
      /* ignore */
    }
  });
}

async function renderPersons() {
  const data = await api("/api/persons");
  livePill.textContent = `${fmt(data.items.length)} persons`;
  livePill.classList.toggle("hot", data.items.length > 0);
  const withQuiz = data.items.filter((p) => p.quiz_sessions && p.quiz_sessions.length);
  view.innerHTML = `
    ${withQuiz.length ? `<div class="card" style="margin-bottom:0.75rem">
      <h2>Quiz respondents</h2>
      <p class="muted" style="margin-bottom:0.85rem">Persons linked to a quiz session — expand for full question-by-question answers.</p>
      <div class="submission-list">
        ${withQuiz.map((p) => {
          const s = p.quiz_sessions[0];
          return renderSubmissionCard({
            ...s,
            first_name: s.first_name || p.quiz_name,
            email: s.email || p.quiz_email,
            company: s.company || p.quiz_company,
          });
        }).join("")}
      </div>
    </div>` : ""}
    <div class="card" style="padding:0">
      <h2 style="padding:1rem 1.1rem 0">All persons</h2>
      ${data.items.length ? `<table><thead><tr><th>Person</th><th>Name / email</th><th>Quiz funnel</th><th>Site</th><th>Source</th><th>Events</th><th>Leads</th><th>Last seen</th></tr></thead><tbody>
        ${data.items.map((p) => `<tr>
          <td class="mono">${shortId(p.distinct_id)}</td>
          <td>${p.quiz_name ? `${esc(p.quiz_name)}<br><span class="mono muted">${esc(p.quiz_email || "")}</span>` : "—"}</td>
          <td>${p.quiz_funnel ? `<span class="tag blue">${esc(p.quiz_funnel)}</span>` : "—"}</td>
          <td class="mono">${p.host || "—"}</td>
          <td>${p.source || "direct"}</td>
          <td>${fmt(p.events)}</td>
          <td>${p.leads ? `<span class="tag green">${p.leads}</span>` : "0"}</td>
          <td class="mono">${when(p.last_seen)}</td>
        </tr>`).join("")}
      </tbody></table>` : empty("No persons yet.")}
    </div>
  `;
}

async function renderInstall() {
  const cfg = await api("/api/config").catch(() => ({ origin: location.origin, snippet: `<script src="${location.origin}/hog.js" async></script>` }));
  livePill.textContent = "Snippet";
  livePill.classList.remove("hot");
  const snippet = cfg.snippet || `<script src="${cfg.origin || location.origin}/hog.js" async></script>`;
  view.innerHTML = `
    <div class="card">
      <h2>One snippet. Every Fly.io site.</h2>
      <p class="muted" style="margin-bottom:1rem">Paste this in the <span class="mono">&lt;head&gt;</span> of any website. Pageviews, clicks, scroll depth, forms, outbound links, Calendly bookings, errors, and time-on-page all land here, grouped by hostname.</p>
      <pre class="snippet" id="snippet-block">${snippet.replace(/</g, "&lt;")}</pre>
      <button type="button" class="copy-btn" id="copy-snippet">Copy snippet</button>
    </div>
    <div class="grid-2" style="margin-top:0.75rem">
      <div class="card">
        <h2>Optional attributes</h2>
        <p class="muted" style="margin-bottom:0.7rem">Name a site or A/B variant when you have several Fly apps:</p>
        <pre class="snippet">&lt;script src="${cfg.origin || location.origin}/hog.js" data-site="agency" async&gt;&lt;/script&gt;</pre>
      </div>
      <div class="card">
        <h2>What it captures</h2>
        <p class="muted">$pageview · $pageleave · $autocapture (clicks / heatmap) · $scroll · $submit · $outbound · $rageclick · $exception · $media_play · calendly_scheduled · lead</p>
        <p class="muted" style="margin-top:0.7rem">Password fields are ignored. Form values are not stored — only field names.</p>
      </div>
    </div>
  `;
  document.getElementById("copy-snippet")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      const btn = document.getElementById("copy-snippet");
      if (btn) btn.textContent = "Copied";
    } catch (e) {}
  });
}

const renders = { overview: renderOverview, quiz: renderQuiz, events: renderEvents, insights: renderInsights, heatmaps: renderHeatmaps, persons: renderPersons, install: renderInstall };

async function show(name) {
  current = name;
  title.textContent = TITLES[name];
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  try {
    await renders[name]();
  } catch (err) {
    view.innerHTML = `<p class="muted">Could not load HelixHog data. ${String(err.message || err)}</p>`;
  }
}

document.querySelectorAll("nav button").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
rangeEl.addEventListener("change", () => show(current));
show("overview");
