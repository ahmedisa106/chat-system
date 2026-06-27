import "./echo";
import {
    initMessageAlerts,
    notifyIncomingMessage,
    notifyUserOnline,
} from "./message-alerts";

const $messages = document.getElementById("chatMessages");
const userId = window.userId;
const conversationsList = document.getElementById("conversations");
const $updateMessageStatusRoute = window.updateMessageStatusRoute;
const $updateStatusAsDeliveredRoute = window.updateStatusAsDeliveredRoute;
const csrfToken = window.csrfToken;

const typingState = {};
const REMOTE_HIDE_DELAY = 3000;

function typingPreviewHtml() {
    return (
        'يكتب<span class="typing-indicator typing-indicator--text typing-indicator--sidebar">' +
        '<span class="typing-indicator__dot"></span>' +
        '<span class="typing-indicator__dot"></span>' +
        '<span class="typing-indicator__dot"></span>' +
        "</span>"
    );
}

function getSubtitleLabel(text) {
    if (text === "offline") return "";
    return text;
}

function scrollToBottom() {
    if (!$messages) return;
    $messages.scrollTop = $messages.scrollHeight;
}

function pinTypingIndicatorToBottom() {
    const indicator = document.getElementById("typingIndicator");
    if ($messages && indicator) {
        $messages.appendChild(indicator);
    }
}

function appendChatMessageHtml(html) {
    if (!$messages) return;

    const indicator = document.getElementById("typingIndicator");

    if (indicator) {
        indicator.insertAdjacentHTML("beforebegin", html);
    } else {
        $messages.insertAdjacentHTML("beforeend", html);
    }

    pinTypingIndicatorToBottom();
}

function showRemoteTyping(e) {
    const convId = e.conversation_id;

    if (!typingState[convId]) {
        typingState[convId] = {};
    }

    const state = typingState[convId];

    clearTimeout(state.hideTimer);
    state.hideTimer = setTimeout(
        () => hideRemoteTyping(convId),
        REMOTE_HIDE_DELAY,
    );

    if (conversationsList) {
        const item = conversationsList.querySelector("#conversation-" + convId);

        if (item) {
            const preview = item.querySelector(".conversation-item__preview");
            const sidebarItem = item.querySelector(".conversation-item");

            if (preview && state.savedPreview === undefined) {
                state.savedPreview = preview.textContent.trim();
                state.savedPreviewClasses = preview.className;
            }

            if (preview) {
                preview.className =
                    "conversation-item__preview conversation-item__preview--typing";
                preview.innerHTML = typingPreviewHtml();
            }

            sidebarItem?.classList.add("conversation-item--typing");
        }
    }

    if (window.conversationId && convId == window.conversationId && $messages) {
        const indicator = document.getElementById("typingIndicator");
        const subtitle = document.querySelector(
            ".chat-header-user .page-header__subtitle",
        );

        if (indicator) {
            indicator.classList.add("is-visible");
            indicator.setAttribute("aria-hidden", "false");
            pinTypingIndicatorToBottom();
        }

        if (subtitle && state.savedSubtitle === undefined) {
            state.savedSubtitle =
                subtitle.getAttribute("data-default-text") ||
                subtitle.textContent.trim();
            state.savedSubtitleClasses = subtitle.className;
        }

        if (subtitle) {
            subtitle.className =
                "page-header__subtitle page-header__subtitle--typing";
            subtitle.innerHTML = typingPreviewHtml();
        }

        scrollToBottom();
    }
}

function hideRemoteTyping(convId) {
    const state = typingState[convId];

    if (!state) return;

    clearTimeout(state.hideTimer);

    if (conversationsList) {
        const item = conversationsList.querySelector("#conversation-" + convId);

        if (item) {
            const preview = item.querySelector(".conversation-item__preview");
            const sidebarItem = item.querySelector(".conversation-item");

            if (preview && state.savedPreview !== undefined) {
                preview.className = state.savedPreviewClasses;
                preview.textContent = state.savedPreview;
            }

            sidebarItem?.classList.remove("conversation-item--typing");
        }
    }

    if (window.conversationId && convId == window.conversationId && $messages) {
        const indicator = document.getElementById("typingIndicator");
        const subtitle = document.querySelector(
            ".chat-header-user .page-header__subtitle",
        );

        indicator?.classList.remove("is-visible");
        indicator?.setAttribute("aria-hidden", "true");

        if (subtitle && state.savedSubtitle !== undefined) {
            subtitle.className = state.savedSubtitleClasses;
            subtitle.textContent = getSubtitleLabel(state.savedSubtitle);
        }
    }

    delete typingState[convId];
}

function handleUserTyping(e) {
    if (e.user_id == userId) return;

    if (e.is_typing) {
        showRemoteTyping(e);
    } else {
        hideRemoteTyping(e.conversation_id);
    }
}

window.TypingIndicator = {
    showRemoteTyping,
    hideRemoteTyping,
    pinTypingIndicatorToBottom,
    appendChatMessageHtml,
};

window.addEventListener("DOMContentLoaded", () => {
    initMessageAlerts();

    Echo.join("chat")
        .joining(function (e) {
            markAllMessageAsDelivered(e.id, 2);
        })
        .listen(".user.online", function (e) {
            if (userId == e.id) return;
            markUserAsOnline(e.id);
            markAllMessageAsDelivered(e.id, 2);
            notifyUserOnline(e, userId);
        })
        .listen(".user.offline", function (e) {
            markUserAsOffline(e.id);
        })
        .leaving(function (e) {
            if (!e.is_online) {
                markUserAsOffline(e.id);
            }
        });

    window.Echo.private("message." + userId)
        .listen(".new.message", function (e) {
            hideRemoteTyping(e.conversation_id);
            refreshSideBar(e.conversation_id, e);
            notifyIncomingMessage(e, userId);
            if (
                window.conversationId &&
                e.conversation_id == window.conversationId
            ) {
                markMessageAsRead(e.id, 3);
            } else {
                if (e.receiver.status) {
                    markMessageAsRead(e.id, 2);
                }
            }
        })
        .listen(".user.typing", handleUserTyping);

    if (window.conversationId) {
        window.Echo.private("conversation." + window.conversationId)
            .listen(".new.message", function (e) {
                if (userId == e.sender_id) return;
                hideRemoteTyping(e.conversation_id);
                appendNewMessage(e);
            })
            .listen(".status.recipt", function (e) {
                if (e.receiver_id != userId) {
                    const outgoingMessages = $messages.querySelectorAll(
                        ".message-row--outgoing",
                    );

                    outgoingMessages.forEach((message) => {
                        const status = message.querySelector(".message-status");

                        if (!status) return;

                        if (e.message.status == 3) {
                            status.className =
                                "message-status message-status--read";
                            status.title = "تمت القراءة";
                            status.innerHTML =
                                '<i class="bi bi-check-all"></i>';
                        } else if (e.message.status == 2) {
                            const statuses = $messages.querySelectorAll(
                                ".message-status--sent",
                            );
                            statuses.forEach((statusEl) => {
                                statusEl.className =
                                    "message-status message-status--delivered";
                                statusEl.title = "تم التوصيل";
                                statusEl.innerHTML =
                                    '<i class="bi bi-check-all"></i>';
                            });
                        }
                    });
                }
            });
    }

    function markUserAsOnline(id) {
        const status = document.getElementById(`user-status-${id}`);
        const statusChat = document.getElementById(`user-status-chat-${id}`);
        const statusTitle = document.getElementById(`user-status-title-${id}`);

        if (status) {
            status.classList.remove("status-dot--offline");
            status.classList.add("status-dot--online");
        }
        if (statusChat) {
            statusChat.classList.remove("status-dot--offline");
            statusChat.classList.add("status-dot--online");
        }

        if (statusTitle) {
            statusTitle.classList.remove("page-header__subtitle--offline");
            statusTitle.classList.add("page-header__subtitle--online");
            statusTitle.textContent = "online";
        }
    }

    function markUserAsOffline(id) {
        const status = document.getElementById(`user-status-${id}`);
        const statusChat = document.getElementById(`user-status-chat-${id}`);
        const statusTitle = document.getElementById(`user-status-title-${id}`);

        if (status) {
            status.classList.remove("status-dot--online");
            status.classList.add("status-dot--offline");
        }
        if (statusChat) {
            statusChat.classList.remove("status-dot--online");
            statusChat.classList.add("status-dot--offline");
        }

        if (statusTitle) {
            statusTitle.classList.remove("page-header__subtitle--online");
            statusTitle.classList.add("page-header__subtitle--offline");
            statusTitle.textContent = "";
        }
    }

    function refreshSideBar(conversationId, response) {
        if (!conversationsList) return;

        var item = conversationsList.querySelector(
            "#conversation-" + conversationId,
        );
        if (item) {
            let shortMessage =
                response.message.length > 100
                    ? response.message.slice(0, 100) + "..."
                    : response.message;
            item.querySelector(".conversation-item__preview").textContent =
                shortMessage;

            if (
                window.conversationId &&
                response.conversation_id == window.conversationId
            ) {
                item.querySelector(
                    ".conversation-item__preview",
                ).classList.remove("conversation-item__preview--unread");

                if (item.querySelector(".unread-badge")) {
                    item.querySelector(".unread-badge").remove();
                }
            } else {
                let badge = item.querySelector(".unread-badge");

                if (badge) {
                    item.querySelector(".unread-badge").textContent =
                        response.unread_count;
                } else {
                    item.querySelector(
                        ".conversation-item__bottom",
                    ).insertAdjacentHTML(
                        "beforeend",
                        `
                             <span class="unread-badge">${response.unread_count}</span>
                        `,
                    );
                }
            }

            item.querySelector(".conversation-item__time").textContent =
                response.time;

            conversationsList.prepend(item);
        } else {
            const html = `

<li id="conversation-${response.conversation_id}"> <a href="${response.url}" class="conversation-item" data-type="dm" data-name="${response.sender.name}" data-preview="${response.message}">

    <div class="avatar-wrap">
        <div class="avatar" style="background:#128c7e">
            <img src="${response.sender.avatar}" alt="">
        </div>

        <span
            class="status-dot status-dot--${response.sender.status ? "online" : "offline"}"
            id="user-status-${response.sender_id}">
        </span>
    </div>

    <div class="conversation-item__body">
        <div class="conversation-item__top">
            <span class="conversation-item__name">
                ${response.sender.name}
            </span>

            <span class="conversation-item__time">
                ${response.time}
            </span>
        </div>

        <div class="conversation-item__bottom">
            <span class="conversation-item__preview conversation-item__preview--unread">
                ${
                    response.message.length > 100
                        ? response.message.slice(0, 100) + "..."
                        : response.message
                }
            </span>

            <span class="unread-badge">
                ${response.unread_count}
            </span>
        </div>
    </div>
</a>

</li> `;
            conversationsList.insertAdjacentHTML("afterbegin", html);
        }
    }

    function appendNewMessage(e) {
        if (!$messages) return;

        $messages.classList.remove("chat-messages--empty");
        const emptyHint = $messages.querySelector(".chat-empty-hint");
        if (emptyHint) {
            emptyHint.remove();
        }

        appendChatMessageHtml(`
    <div class="message-row message-row--incoming">
        <div class="message-bubble">
            <p class="message-bubble__text">
                ${e.message}
            </p>
            <div class="message-bubble__meta">
                <span class="message-bubble__time">
                    ${e.time}
                </span>
               
            </div>
        </div>
    </div>
    `);
        scrollToBottom();
    }

    async function markMessageAsRead(messageId, status) {
        try {
            const route = $updateMessageStatusRoute.replace(
                ":messageId",
                messageId,
            );

            const response = await fetch(route, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    status: status,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(
                    data.message || "تعذّر إرسال الرد، حاول مرة أخرى",
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function markAllMessageAsDelivered(user_id, status) {
        try {
            const route = $updateStatusAsDeliveredRoute;

            const response = await fetch(route, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    status: status,
                    user_id: user_id,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(
                    data.message || "تعذّر إرسال الرد، حاول مرة أخرى",
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
});
