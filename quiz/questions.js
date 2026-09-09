/**
 * @deprecated Use questions-data.js + config-details.js (or guide/config.js).
 * Kept for backwards compatibility with old script tags.
 */
(function () {
  if (window.QUIZ_BASE && !window.QUIZ_CONFIG) {
    var s = document.createElement("script");
    s.src = "/quiz/config-details.js";
    document.head.appendChild(s);
    return;
  }
  if (!window.QUIZ_BASE) {
    var a = document.createElement("script");
    a.src = "/quiz/questions-data.js";
    a.onload = function () {
      var b = document.createElement("script");
      b.src = "/quiz/config-details.js";
      document.head.appendChild(b);
    };
    document.head.appendChild(a);
  }
})();
