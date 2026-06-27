$(function () {
  var $overlay = $("#voiceCall");
  if (!$overlay.length) return;

  var $btn = $("#voiceCallBtn");
  var $avatar = $("#callAvatar");
  var $name = $("#callName");
  var $status = $("#callStatus");
  var $timer = $("#callTimer");
  var $muteBtn = $("#callMuteBtn");
  var $speakerBtn = $("#callSpeakerBtn");
  var $endBtn = $("#callEndBtn");
  var $acceptBtn = $("#callAcceptBtn");
  var $declineBtn = $("#callDeclineBtn");
  var $incomingActions = $("#callIncomingActions");
  var $outgoingControls = $("#callOutgoingControls");

  var state = "idle";
  var timerInterval = null;
  var callSeconds = 0;
  var ringTimeout = null;
  var isOutgoing = true;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDuration(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return pad(m) + ":" + pad(s);
  }

  function formatDurationLabel(seconds) {
    if (seconds < 60) return seconds + " ث";
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return s > 0 ? m + " د " + s + " ث" : m + " د";
  }

  function nowTime() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function setOverlayVisible(visible) {
    $overlay.toggleClass("voice-call--visible", visible).attr("aria-hidden", !visible);
    $("body").toggleClass("voice-call-open", visible);
  }

  function resetControls() {
    $muteBtn.removeClass("voice-call__ctrl--active");
    $speakerBtn.removeClass("voice-call__ctrl--active");
    $muteBtn.find("i").attr("class", "bi bi-mic-fill");
    $speakerBtn.find("i").attr("class", "bi bi-volume-up-fill");
  }

  function clearTimers() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (ringTimeout) {
      clearTimeout(ringTimeout);
      ringTimeout = null;
    }
  }

  function setState(next) {
    state = next;
    $overlay.removeClass("voice-call--ringing voice-call--active voice-call--incoming");

    if (next === "ringing") {
      $overlay.addClass("voice-call--ringing");
      $status.text(isOutgoing ? "جاري الاتصال..." : "مكالمة واردة...").show();
      $timer.hide();
      $incomingActions.prop("hidden", isOutgoing);
      $outgoingControls.prop("hidden", !isOutgoing);
    } else if (next === "active") {
      $overlay.addClass("voice-call--active");
      $status.hide();
      $timer.show().text("00:00");
      $incomingActions.prop("hidden", true);
      $outgoingControls.prop("hidden", false);
      callSeconds = 0;
      timerInterval = setInterval(function () {
        callSeconds += 1;
        $timer.text(formatDuration(callSeconds));
      }, 1000);
    } else {
      $status.show();
      $timer.hide();
      $incomingActions.prop("hidden", true);
      $outgoingControls.prop("hidden", false);
    }
  }

  function setupContact($trigger) {
    var name = $trigger.data("contact-name") || "مستخدم";
    var initial = $trigger.data("contact-initial") || name.charAt(0);
    var color = $trigger.data("contact-color") || "#128c7e";
    var online = String($trigger.data("contact-online")) !== "false";

    $name.text(name);
    $avatar.text(initial).css("background", color);
    $overlay.data("contact-online", online);
    return online;
  }

  function appendCallLog(durationSeconds, missed) {
    var $messages = $("#chatMessages");
    if (!$messages.length) return;

    var label = missed ? "مكالمة فائتة" : "مكالمة صوتية";
    var meta = missed
      ? "لم يتم الرد • صادرة"
      : formatDurationLabel(durationSeconds) + " • صادرة";

    $messages.append(
      '<div class="message-row message-row--outgoing message-row--call">' +
        '<div class="message-bubble message-bubble--call' + (missed ? " message-bubble--call-missed" : "") + '">' +
          '<i class="bi bi-telephone' + (missed ? "-x" : "") + '-fill message-bubble__call-icon"></i>' +
          '<div class="message-bubble__call-body">' +
            '<p class="message-bubble__text">' + label + '</p>' +
            '<p class="message-bubble__call-meta">' + meta + '</p>' +
          '</div>' +
          '<div class="message-bubble__meta">' +
            '<span class="message-bubble__time">' + nowTime() + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    $messages.scrollTop($messages[0].scrollHeight);
  }

  function endCall(options) {
    var duration = callSeconds;
    var wasActive = state === "active";
    var missed = options && options.missed;
    clearTimers();
    setOverlayVisible(false);
    state = "idle";
    resetControls();
    callSeconds = 0;

    if (wasActive || missed) {
      appendCallLog(duration, !!missed);
    }
  }

  function startOutgoingCall($trigger) {
    isOutgoing = true;
    var online = setupContact($trigger);
    resetControls();
    setOverlayVisible(true);
    setState("ringing");

    var ringMs = online ? 2500 : 5000;
    ringTimeout = setTimeout(function () {
      if (online) {
        setState("active");
      } else {
        $status.text("لم يتم الرد").show();
        ringTimeout = setTimeout(function () {
          endCall({ missed: true });
        }, 2000);
      }
    }, ringMs);
  }

  function startIncomingCall() {
    isOutgoing = false;
    var name = $overlay.data("contact-name") || "سارة";
    var initial = $overlay.data("contact-initial") || "س";
    var color = $overlay.data("contact-color") || "#128c7e";

    $name.text(name);
    $avatar.text(initial).css("background", color);
    resetControls();
    setOverlayVisible(true);
    setState("ringing");
  }

  $btn.on("click", function () {
    if (state !== "idle") return;
    startOutgoingCall($(this));
  });

  $endBtn.on("click", function () {
    if (state === "idle") return;
    endCall({ missed: false });
  });

  $acceptBtn.on("click", function () {
    if (state !== "ringing" || isOutgoing) return;
    clearTimers();
    setState("active");
  });

  $declineBtn.on("click", function () {
    if (state !== "ringing" || isOutgoing) return;
    clearTimers();
    setOverlayVisible(false);
    state = "idle";
    resetControls();
  });

  $muteBtn.on("click", function () {
    if (state !== "active") return;
    var active = $muteBtn.toggleClass("voice-call__ctrl--active").hasClass("voice-call__ctrl--active");
    $muteBtn.find("i").attr("class", active ? "bi bi-mic-mute-fill" : "bi bi-mic-fill");
  });

  $speakerBtn.on("click", function () {
    if (state !== "active") return;
    var active = $speakerBtn.toggleClass("voice-call__ctrl--active").hasClass("voice-call__ctrl--active");
    $speakerBtn.find("i").attr("class", active ? "bi bi-volume-mute-fill" : "bi bi-volume-up-fill");
  });

  if ($overlay.data("demo-incoming") === true || $overlay.data("demo-incoming") === "true") {
    setTimeout(startIncomingCall, 1500);
  }
});
