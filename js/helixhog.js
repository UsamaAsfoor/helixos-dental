/* HelixHog tracker v1.2 — drop this on any Fly.io (or local) site. Does not replace Meta Pixel. */
(function () {
  if (window.helixhog && window.helixhog.__loaded) return;
  var script = document.currentScript;
  var loc = window.location;
  if (window.parent !== window) return;
  if (/\/hog(\/|$)/.test(loc.pathname)) return;

  var token = (script && script.getAttribute("data-token")) || "phc_helix_dental";
  var siteName = (script && (script.getAttribute("data-site") || script.getAttribute("data-funnel"))) || "";
  var ab = (script && script.getAttribute("data-ab")) || "";

  function resolveHost() {
    var fromWin = window.HELIXHOG_API_HOST;
    if (fromWin) return String(fromWin).replace(/\/$/, "");
    var attr = script && script.getAttribute("data-api-host");
    if (attr) return String(attr).replace(/\/$/, "");
    if (script && script.src) {
      try {
        var u = new URL(script.src, loc.href);
        if (u.protocol === "http:" || u.protocol === "https:") return u.origin;
      } catch (e) {}
    }
    if (loc.protocol === "http:" || loc.protocol === "https:") return loc.origin;
    return "";
  }

  var apiHost = resolveHost();
  if (!apiHost) return;

  var LS_ID = "helixhog_distinct_id";
  var LS_FT = "helixhog_first_touch";
  var SS_SID = "helixhog_session_id";
  var SS_LEAD = "helixhog_lead_sent";
  var SS_ACT = "helixhog_last_activity";
  var pageStarted = Date.now();
  var maxScroll = 0;
  var scrollMarks = {};
  var lastClicks = [];

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return "hog_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function getDistinctId() {
    try {
      var id = localStorage.getItem(LS_ID);
      if (!id) {
        id = uuid();
        localStorage.setItem(LS_ID, id);
      }
      return id;
    } catch (e) {
      return uuid();
    }
  }

  function sessionId() {
    try {
      var last = parseInt(sessionStorage.getItem(SS_ACT) || "0", 10);
      var sid = sessionStorage.getItem(SS_SID);
      if (!sid || Date.now() - last > 30 * 60 * 1000) {
        sid = uuid();
        sessionStorage.setItem(SS_SID, sid);
      }
      sessionStorage.setItem(SS_ACT, String(Date.now()));
      return sid;
    } catch (e) {
      return uuid();
    }
  }

  function referringDomain(ref) {
    if (!ref) return "";
    try {
      return new URL(ref).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function firstTouch() {
    var params = new URLSearchParams(loc.search);
    var utm = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    };
    try {
      var saved = JSON.parse(localStorage.getItem(LS_FT) || "null");
      if (!saved) {
        saved = Object.assign(
          {
            $initial_referrer: document.referrer || "",
            $initial_referring_domain: referringDomain(document.referrer),
          },
          utm
        );
        localStorage.setItem(LS_FT, JSON.stringify(saved));
      }
      return saved;
    } catch (e) {
      return utm;
    }
  }

  function deviceType() {
    var w = window.innerWidth || 0;
    if (w < 768) return "Mobile";
    if (w < 1024) return "Tablet";
    return "Desktop";
  }

  function browser() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return "Edge";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
    if (/Firefox/.test(ua)) return "Firefox";
    return "Other";
  }

  function os() {
    var ua = navigator.userAgent;
    if (/Mac OS X/.test(ua)) return "Mac OS X";
    if (/Windows/.test(ua)) return "Windows";
    if (/Linux/.test(ua)) return "Linux";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    return "Other";
  }

  function superProps() {
    var ft = firstTouch();
    var params = new URLSearchParams(loc.search);
    return Object.assign(
      {
        token: token,
        distinct_id: getDistinctId(),
        $session_id: sessionId(),
        $current_url: loc.href,
        $host: loc.host,
        $pathname: loc.pathname,
        site: siteName || loc.hostname,
        ab_variant: ab,
        $referrer: document.referrer || "",
        $referring_domain: referringDomain(document.referrer),
        $browser: browser(),
        $os: os(),
        $device_type: deviceType(),
        $viewport_width: window.innerWidth,
        $viewport_height: window.innerHeight,
        $screen_width: window.screen && screen.width,
        $screen_height: window.screen && screen.height,
        $lib: "helixhog",
        $lib_version: "1.2.0",
        utm_source: params.get("utm_source") || ft.utm_source || "",
        utm_medium: params.get("utm_medium") || ft.utm_medium || "",
        utm_campaign: params.get("utm_campaign") || ft.utm_campaign || "",
        utm_content: params.get("utm_content") || ft.utm_content || "",
        utm_term: params.get("utm_term") || ft.utm_term || "",
      },
      ft
    );
  }

  var queue = [];
  var flushing = false;

  function flush(forceBeacon) {
    if (flushing || !queue.length) return;
    flushing = true;
    var batch = queue.splice(0, 20);
    var body = JSON.stringify({ api_key: token, batch: batch });
    var url = apiHost.replace(/\/$/, "") + "/e";
    var ok = function () {
      flushing = false;
      if (queue.length) flush();
    };
    var fail = function () {
      queue = batch.concat(queue);
      flushing = false;
    };
    try {
      var hide = forceBeacon || document.visibilityState === "hidden";
      if (hide && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "text/plain;charset=UTF-8" }));
        ok();
        return;
      }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: body,
        keepalive: true,
        mode: "cors",
      }).then(function (r) {
        if (r.ok) ok();
        else fail();
      }).catch(fail);
    } catch (e) {
      fail();
    }
  }

  function capture(event, properties) {
    var props = Object.assign(superProps(), properties || {});
    queue.push({
      event: event,
      distinct_id: props.distinct_id,
      timestamp: new Date().toISOString(),
      properties: props,
    });
    flush(event === "$pageleave" || event === "$exception");
  }

  function cssPath(el) {
    if (!el || !el.tagName) return "";
    var parts = [];
    var node = el;
    var depth = 0;
    while (node && node.nodeType === 1 && depth < 5) {
      var part = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(part + "#" + node.id);
        break;
      }
      if (node.className && typeof node.className === "string") {
        var cls = node.className.trim().split(/\s+/).slice(0, 2).join(".");
        if (cls) part += "." + cls;
      }
      parts.unshift(part);
      node = node.parentElement;
      depth += 1;
    }
    return parts.join(" > ");
  }

  function safeText(el) {
    return (el.innerText || el.value || el.getAttribute("aria-label") || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("input[type=password]")) return;
    var el = t.closest("a, button, input[type=submit], input[type=button], [role=button], .book-option, .cta-btn, .quiz-option") || t;
    var rectDocW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, 1);
    var rectDocH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1);
    var x = e.pageX || 0;
    var y = e.pageY || 0;
    var href = el.getAttribute && el.getAttribute("href");
    var text = safeText(el);
    var props = {
      $event_type: "click",
      $el_text: text,
      tag_name: (el.tagName || "").toLowerCase(),
      href: href,
      $elements: cssPath(el),
      $x: x,
      $y: y,
      $x_percent: Math.round((x / rectDocW) * 1000) / 10,
      $y_percent: Math.round((y / rectDocH) * 1000) / 10,
    };
    capture("$autocapture", props);
    if (el.id === "book-continue" || text === "Continue") capture("book_continue", props);
    if (href && /^(https?:)?\/\//i.test(href)) {
      try {
        var dest = new URL(href, loc.href);
        if (dest.hostname && dest.hostname !== loc.hostname) {
          capture("$outbound", Object.assign({}, props, { destination: dest.hostname }));
        }
      } catch (err) {}
    }
    lastClicks.push({ t: Date.now(), x: x, y: y });
    lastClicks = lastClicks.filter(function (c) {
      return Date.now() - c.t < 1000;
    });
    if (lastClicks.length >= 3) {
      var near = lastClicks.filter(function (c) {
        return Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 40;
      });
      if (near.length >= 3) {
        capture("$rageclick", props);
        lastClicks = [];
      }
    }
  }

  function scrollPct() {
    var el = document.documentElement;
    var body = document.body;
    var top = window.scrollY || el.scrollTop || 0;
    var height = Math.max(el.scrollHeight, body.scrollHeight, 1) - (window.innerHeight || 0);
    if (height <= 0) return 100;
    return Math.min(100, Math.round((top / height) * 100));
  }

  function onScroll() {
    var pct = scrollPct();
    if (pct > maxScroll) maxScroll = pct;
    [25, 50, 75, 90, 100].forEach(function (mark) {
      if (pct >= mark && !scrollMarks[mark]) {
        scrollMarks[mark] = true;
        capture("$scroll", { $scroll_depth: mark });
      }
    });
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form || !form.tagName || form.tagName.toLowerCase() !== "form") return;
    var fields = [];
    Array.prototype.forEach.call(form.elements || [], function (f) {
      if (!f || !f.name) return;
      var type = (f.type || "").toLowerCase();
      if (type === "password") return;
      fields.push({ name: f.name, type: type, id: f.id || "" });
    });
    capture("$submit", {
      form_id: form.id || "",
      form_name: form.getAttribute("name") || "",
      form_action: form.getAttribute("action") || "",
      field_names: fields.map(function (f) {
        return f.name;
      }).slice(0, 20),
    });
  }

  function onError(msg, src, line, col) {
    capture("$exception", {
      $exception_message: String(msg || "").slice(0, 240),
      $exception_source: String(src || "").slice(0, 240),
      $exception_line: line || 0,
      $exception_col: col || 0,
    });
  }

  function pageleave() {
    capture("$pageleave", {
      $duration: Math.round((Date.now() - pageStarted) / 1000),
      $scroll_depth: maxScroll,
    });
    flush(true);
  }

  function pageview() {
    capture("$pageview");
    if (/thank-you/.test(loc.pathname)) {
      try {
        if (!sessionStorage.getItem(SS_LEAD)) {
          sessionStorage.setItem(SS_LEAD, "1");
          capture("lead", { $source: "thank-you" });
        }
      } catch (e) {
        capture("lead", { $source: "thank-you" });
      }
    }
  }

  document.addEventListener("click", onClick, true);
  document.addEventListener("submit", onSubmit, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", pageleave);
  window.addEventListener("beforeunload", function () {
    flush(true);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("error", function (ev) {
    onError(ev.message, ev.filename, ev.lineno, ev.colno);
  });
  window.addEventListener("unhandledrejection", function (ev) {
    capture("$exception", { $exception_message: String((ev && ev.reason) || "unhandledrejection").slice(0, 240) });
  });
  window.addEventListener("hashchange", pageview);
  window.addEventListener("popstate", pageview);
  window.addEventListener("message", function (ev) {
    var data = ev && ev.data;
    var name = typeof data === "string" ? data : data && data.event;
    if (name === "calendly.event_scheduled") {
      capture("calendly_scheduled", { $source: "calendly" });
      capture("lead", { $source: "calendly" });
    }
  });
  document.addEventListener(
    "play",
    function (ev) {
      var el = ev.target;
      if (!el || (el.tagName !== "VIDEO" && el.tagName !== "AUDIO")) return;
      capture("$media_play", { tag_name: el.tagName.toLowerCase(), src: (el.currentSrc || el.src || "").slice(0, 240) });
    },
    true
  );

  window.helixhog = {
    __loaded: true,
    capture: capture,
    api_host: apiHost,
    identify: function (id) {
      try {
        if (id) localStorage.setItem(LS_ID, String(id));
      } catch (e) {}
    },
    get_distinct_id: getDistinctId,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      pageview();
      onScroll();
    });
  } else {
    pageview();
    onScroll();
  }
})();
