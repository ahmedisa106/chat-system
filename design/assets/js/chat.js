var EMOJI_LIST = [
  "😀", "😂", "😍", "👍", "🙏", "🎉",
  "❤️", "🔥", "😊", "😢", "👏", "💯",
  "🤔", "😎", "🙌", "✨", "💪", "👋",
  "😅", "🥳", "😴", "🤝", "📎", "✅"
];

$(function () {
  var $messages = $("#chatMessages");
  var $subtitle = $(".chat-header-user .page-header__subtitle");
  var typingHideTimer = null;
  var typingReplyTimer = null;
  var subtitleOriginal = $subtitle.length ? { text: $subtitle.text(), classes: $subtitle.attr("class") } : null;
  var contactName = $(".chat-header-user .page-header__title").text().trim() || "مستخدم";
  var isGroupChat = !$(".chat-header-user").length;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function nowTime() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function escapeHtml(text) {
    return $("<span>").text(text).html();
  }

  function scrollToBottom() {
    $messages.scrollTop($messages[0].scrollHeight);
  }

  function initTypingIndicator() {
    if (!$messages.length || $("#typingIndicator").length) return;

    $messages.append(
      '<div class="message-row message-row--outgoing typing-indicator" id="typingIndicator" hidden>' +
        '<span class="message-row__sender typing-indicator__sender" hidden></span>' +
        '<div class="message-bubble typing-indicator__bubble">' +
          '<span class="typing-indicator__dots" aria-label="يكتب...">' +
            "<span></span><span></span><span></span>" +
          "</span>" +
        "</div>" +
      "</div>"
    );
  }

  function lastIncomingSenderName() {
    var name = $messages.find(".message-row--incoming .message-row__sender").last().text().trim();
    return name || contactName;
  }

  function setHeaderTyping(isTyping) {
    if (!$subtitle.length) return;

    if (isTyping) {
      $subtitle.text("يكتب...").attr("class", "page-header__subtitle page-header__subtitle--typing");
    } else if (subtitleOriginal) {
      $subtitle.text(subtitleOriginal.text).attr("class", subtitleOriginal.classes);
    }
  }

  function showTypingIndicator(incoming) {
    var $indicator = $("#typingIndicator");
    if (!$indicator.length) return;

    var $sender = $indicator.find(".typing-indicator__sender");
    $indicator
      .toggleClass("message-row--incoming", incoming)
      .toggleClass("message-row--outgoing", !incoming)
      .prop("hidden", false);

    if (incoming && isGroupChat) {
      $sender.text(lastIncomingSenderName()).prop("hidden", false);
    } else {
      $sender.prop("hidden", true);
    }

    if (incoming && !isGroupChat) setHeaderTyping(true);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    $("#typingIndicator").prop("hidden", true);
    if (!isGroupChat) setHeaderTyping(false);
  }

  function scheduleHideTypingIndicator(delay) {
    clearTimeout(typingHideTimer);
    typingHideTimer = setTimeout(hideTypingIndicator, delay);
  }

  function scheduleTypingReplyDemo() {
    clearTimeout(typingReplyTimer);
    typingReplyTimer = setTimeout(function () {
      showTypingIndicator(true);
      scheduleHideTypingIndicator(2800);
    }, 1200);
  }

  function onUserTyping() {
    showTypingIndicator(false);
    scheduleHideTypingIndicator(2500);
  }

  function statusHtml(status) {
    var icon = status === "sent" ? "bi-check" : "bi-check-all";
    var labels = { sent: "تم الإرسال", delivered: "تم التوصيل", read: "تمت القراءة" };
    return (
      '<span class="message-status message-status--' + status + '" title="' + labels[status] + '">' +
        '<i class="bi ' + icon + '"></i>' +
      '</span>'
    );
  }

  function appendOutgoingText(text) {
    $messages.removeClass("chat-messages--empty").find(".chat-empty-hint").remove();
    $messages.append(
      '<div class="message-row message-row--outgoing">' +
        '<div class="message-bubble">' +
          '<p class="message-bubble__text">' + escapeHtml(text) + '</p>' +
          '<div class="message-bubble__meta">' +
            '<span class="message-bubble__time">' + nowTime() + '</span>' +
            statusHtml("sent") +
          '</div>' +
        '</div>' +
      '</div>'
    );
    scrollToBottom();

    setTimeout(function () {
      $messages.find(".message-row--outgoing").last()
        .find(".message-status").attr("class", "message-status message-status--delivered").attr("title", "تم التوصيل")
        .html('<i class="bi bi-check-all"></i>');
    }, 800);
  }

  function appendOutgoingFile(file) {
    $messages.removeClass("chat-messages--empty").find(".chat-empty-hint").remove();
    $messages.append(
      '<div class="message-row message-row--outgoing">' +
        '<div class="message-bubble">' +
          '<div class="message-file">' +
            '<div class="message-file__icon"><i class="bi bi-file-earmark"></i></div>' +
            '<div class="message-file__info">' +
              '<p class="message-file__name">' + escapeHtml(file.name) + '</p>' +
              '<p class="message-file__size">' + formatFileSize(file.size) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="message-bubble__meta">' +
            '<span class="message-bubble__time">' + nowTime() + '</span>' +
            statusHtml("sent") +
          '</div>' +
        '</div>' +
      '</div>'
    );
    scrollToBottom();
  }

  function initEmojiPicker() {
    var $grid = $("#emojiGrid");
    EMOJI_LIST.forEach(function (emoji) {
      $grid.append('<button type="button" class="emoji-picker__item" data-emoji="' + emoji + '">' + emoji + '</button>');
    });
  }

  $("#sendBtn").on("click", function () {
    var text = $("#messageInput").val().trim();
    if (!text) return;
    clearTimeout(typingHideTimer);
    clearTimeout(typingReplyTimer);
    hideTypingIndicator();
    appendOutgoingText(text);
    $("#messageInput").val("").css("height", "auto");
    scheduleTypingReplyDemo();
  });

  $("#messageInput").on("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      $("#sendBtn").click();
    }
  });

  $("#messageInput").on("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
    if ($(this).val().length > 0) onUserTyping();
    else {
      clearTimeout(typingHideTimer);
      hideTypingIndicator();
    }
  });

  $("#attachBtn").on("click", function () { $("#fileInput").click(); });

  $("#fileInput").on("change", function () {
    var file = this.files[0];
    if (file) {
      appendOutgoingFile(file);
      this.value = "";
    }
  });

  $("#emojiBtn").on("click", function (e) {
    e.stopPropagation();
    $("#emojiPicker").toggleClass("show");
  });

  $(document).on("click", ".emoji-picker__item", function () {
    var emoji = $(this).data("emoji");
    var $input = $("#messageInput");
    $input.val($input.val() + emoji).focus().trigger("input");
    $("#emojiPicker").removeClass("show");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#emojiPicker, #emojiBtn").length) {
      $("#emojiPicker").removeClass("show");
    }
  });

  initTypingIndicator();
  initEmojiPicker();
  scrollToBottom();
});
