var EMOJI_LIST = [
    "😀",
    "😂",
    "😍",
    "👍",
    "🙏",
    "🎉",
    "❤️",
    "🔥",
    "😊",
    "😢",
    "👏",
    "💯",
    "🤔",
    "😎",
    "🙌",
    "✨",
    "💪",
    "👋",
    "😅",
    "🥳",
    "😴",
    "🤝",
    "📎",
    "✅",
];

$(function () {
    var $messages = $("#chatMessages");

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

    function statusHtml(status) {
        var icon = status === "sent" ? "bi-check" : "bi-check-all";
        var labels = {
            sent: "تم الإرسال",
            delivered: "تم التوصيل",
            read: "تمت القراءة",
        };
        return (
            '<span class="message-status message-status--' +
            status +
            '" title="' +
            labels[status] +
            '">' +
            '<i class="bi ' +
            icon +
            '"></i>' +
            "</span>"
        );
    }

    function appendOutgoingText(text) {
        $messages
            .removeClass("chat-messages--empty")
            .find(".chat-empty-hint")
            .remove();

        var html =
            '<div class="message-row message-row--outgoing">' +
            '<div class="message-bubble">' +
            '<p class="message-bubble__text">' +
            escapeHtml(text) +
            "</p>" +
            '<div class="message-bubble__meta">' +
            '<span class="message-bubble__time">' +
            nowTime() +
            "</span>" +
            statusHtml("sent") +
            "</div>" +
            "</div>" +
            "</div>";

        var $indicator = $("#typingIndicator");
        if ($indicator.length) {
            $indicator.before(html);
            $indicator.appendTo($messages);
        } else {
            $messages.append(html);
        }

        scrollToBottom();

        // setTimeout(function () {
        //     $messages
        //         .find(".message-row--outgoing")
        //         .last()
        //         .find(".message-status")
        //         .attr("class", "message-status message-status--delivered")
        //         .attr("title", "تم التوصيل")
        //         .html('<i class="bi bi-check-all"></i>');
        // }, 800);
    }

    function appendOutgoingFile(file) {
        $messages
            .removeClass("chat-messages--empty")
            .find(".chat-empty-hint")
            .remove();

        var html =
            '<div class="message-row message-row--outgoing">' +
            '<div class="message-bubble">' +
            '<div class="message-file">' +
            '<div class="message-file__icon"><i class="bi bi-file-earmark"></i></div>' +
            '<div class="message-file__info">' +
            '<p class="message-file__name">' +
            escapeHtml(file.name) +
            "</p>" +
            '<p class="message-file__size">' +
            formatFileSize(file.size) +
            "</p>" +
            "</div>" +
            "</div>" +
            '<div class="message-bubble__meta">' +
            '<span class="message-bubble__time">' +
            nowTime() +
            "</span>" +
            statusHtml("sent") +
            "</div>" +
            "</div>" +
            "</div>";

        var $indicator = $("#typingIndicator");
        if ($indicator.length) {
            $indicator.before(html);
            $indicator.appendTo($messages);
        } else {
            $messages.append(html);
        }

        scrollToBottom();
    }

    function initEmojiPicker() {
        var $grid = $("#emojiGrid");
        EMOJI_LIST.forEach(function (emoji) {
            $grid.append(
                '<button type="button" class="emoji-picker__item" data-emoji="' +
                    emoji +
                    '">' +
                    emoji +
                    "</button>",
            );
        });
    }

    $("#sendBtn").on("click", function () {
        var text = $("#messageInput").val().trim();
        if (!text) return;
        appendOutgoingText(text);
        $("#messageInput").val("").css("height", "auto");
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
    });

    $("#attachBtn").on("click", function () {
        $("#fileInput").click();
    });

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
        $input.val($input.val() + emoji).focus();
        $("#emojiPicker").removeClass("show");
    });

    $(document).on("click", function (e) {
        if (!$(e.target).closest("#emojiPicker, #emojiBtn").length) {
            $("#emojiPicker").removeClass("show");
        }
    });

    initEmojiPicker();
    scrollToBottom();
});
