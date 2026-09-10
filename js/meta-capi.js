/* Meta Pixel + Conversion API. Browser and server share eventID for dedupe. */
(function () {
  if (window.__metaCapiLoaded) return;
  window.__metaCapiLoaded = true;
  if (window.parent !== window) return;
  if (/\/hog(\/|$)/.test(location.pathname)) return;
  if (typeof fbq !== "function") return;

  function uuid() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function cookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  function leadEventId() {
    try {
      var id = sessionStorage.getItem("meta_lead_event_id");
      if (!id) {
        id = uuid();
        sessionStorage.setItem("meta_lead_event_id", id);
      }
      return id;
    } catch (e) {
      return uuid();
    }
  }

  function cookies() {
    var fbclid = new URLSearchParams(location.search).get("fbclid") || "";
    var fbc = cookie("_fbc");
    if (!fbc && fbclid) fbc = "fb.1." + Date.now() + "." + fbclid;
    return { fbp: cookie("_fbp"), fbc: fbc };
  }

  function sendCapi(eventName, eventId) {
    var c = cookies();
    fetch("/capi/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: location.href,
        fbp: c.fbp,
        fbc: c.fbc
      })
    }).catch(function () {});
  }

  var LEAD_KEY = "meta_lead_fired";

  function leadAlreadyFired() {
    try { return sessionStorage.getItem(LEAD_KEY) === "1"; } catch (e) { return false; }
  }

  function markLeadFired() {
    try { sessionStorage.setItem(LEAD_KEY, "1"); } catch (e) {}
  }

  function fieldValue(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector("[name=\"" + names[i] + "\"], #" + names[i]);
      if (el && el.value) return String(el.value).trim();
    }
    return "";
  }

  function trackLead(userData) {
    if (leadAlreadyFired()) return null;
    var data = userData || {};
    var eventId = leadEventId();
    markLeadFired();
    fbq("track", "Lead", {}, { eventID: eventId });
    var c = cookies();
    fetch("/capi/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify({
        event_name: "Lead",
        event_id: eventId,
        event_source_url: location.href,
        fbp: c.fbp,
        fbc: c.fbc,
        email: data.email || "",
        phone: data.phone || "",
        first_name: data.first_name || data.fn || "",
        last_name: data.last_name || data.ln || ""
      })
    }).catch(function () {});
    return eventId;
  }

  window.metaCapi = { trackLead: trackLead };

  var pageId = uuid();
  fbq("track", "PageView", {}, { eventID: pageId });
  setTimeout(function () { sendCapi("PageView", pageId); }, 400);

  if (/thank-you/.test(location.pathname) && !leadAlreadyFired()) {
    trackLead({});
  }

  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (!form || form.tagName !== "FORM") return;
    if (form.id === "lead-form" || form.getAttribute("data-skip-meta-lead") === "true") return;
    var email = fieldValue(form, ["email", "Email", "your-email"]);
    if (!email) return;
    trackLead({
      email: email,
      phone: fieldValue(form, ["phone", "Phone", "tel", "your-phone"]),
      first_name: fieldValue(form, ["first_name", "name", "Name", "your-name", "fname"])
    });
  }, true);

  window.addEventListener("message", function (ev) {
    var data = ev && ev.data;
    var name = typeof data === "string" ? data : data && data.event;
    if (name === "calendly.event_scheduled") trackLead({});
  });
})();
