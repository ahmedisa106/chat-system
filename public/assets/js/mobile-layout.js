(function () {
  var MOBILE_BREAKPOINT = 768;

  function isMobile() {
    return window.matchMedia("(max-width: 767.98px)").matches;
  }

  function getChatApp() {
    return document.querySelector(".chat-app");
  }

  function hasPanelContent() {
    var panel = document.querySelector(".main-panel");
    if (!panel) return false;
    return !!panel.querySelector(
      ".page-header, .chat-page, .new-chat-page, .create-group-form"
    );
  }

  function openPanel() {
    var app = getChatApp();
    if (app) app.classList.add("chat-app--panel-open");
  }

  function closePanel() {
    var app = getChatApp();
    if (app) app.classList.remove("chat-app--panel-open");
  }

  function syncPanelState() {
    if (!isMobile()) {
      closePanel();
      return;
    }

    if (hasPanelContent()) {
      openPanel();
    } else {
      closePanel();
    }
  }

  function bindViewportHeight() {
    if (!window.visualViewport) return;

    function updateHeight() {
      document.documentElement.style.setProperty(
        "--vvh",
        window.visualViewport.height + "px"
      );
    }

    updateHeight();
    window.visualViewport.addEventListener("resize", updateHeight);
    window.visualViewport.addEventListener("scroll", updateHeight);
  }

  function bindBackButtons() {
    document.addEventListener("click", function (e) {
      var back = e.target.closest(".page-header__back--mobile-only");
      if (!back || !isMobile()) return;

      e.preventDefault();
      closePanel();

      var href = back.getAttribute("href");
      if (href && href !== "#" && href !== "index.html") {
        window.location.href = href;
      } else {
        window.location.href = back.dataset.homeUrl || "/";
      }
    });
  }

  function init() {
    bindViewportHeight();
    bindBackButtons();
    syncPanelState();

    window.matchMedia("(max-width: 767.98px)").addEventListener("change", syncPanelState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
