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

  var pageId = uuid();
  fbq("track", "PageView", {}, { eventID: pageId });
  setTimeout(function () { sendCapi("PageView", pageId); }, 400);

  if (/thank-you/.test(location.pathname)) {
    var leadId = leadEventId();
    fbq("track", "Lead", {}, { eventID: leadId });
    setTimeout(function () { sendCapi("Lead", leadId); }, 450);
  }
})();
