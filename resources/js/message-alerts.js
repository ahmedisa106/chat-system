let audioContext = null;
let notificationPermissionRequested = false;
let alertsContainer = null;

const ALERT_DURATION_MS = 5500;
const PRESENCE_ALERT_DURATION_MS = 4000;
const MAX_VISIBLE_ALERTS = 3;

function isViewingConversation(conversationId) {
    return (
        window.conversationId &&
        String(window.conversationId) === String(conversationId)
    );
}

function unlockAudio() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioContext = new AudioCtx();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

function playTone({ frequency, start, duration, type = "triangle", volume = 0.18 }) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
}

function playMessageSound() {
    try {
        unlockAudio();
        if (!audioContext) return;

        const now = audioContext.currentTime;

        playTone({ frequency: 784, start: now, duration: 0.11, volume: 0.16, type: "sine" });
        playTone({ frequency: 988, start: now + 0.1, duration: 0.11, volume: 0.18, type: "triangle" });
        playTone({ frequency: 1175, start: now + 0.2, duration: 0.16, volume: 0.2, type: "triangle" });
        playTone({ frequency: 1568, start: now + 0.34, duration: 0.22, volume: 0.14, type: "sine" });
    } catch (error) {
        console.log(error);
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getAvatarMarkup(sender) {
    const avatar = sender?.avatar;
    const name = sender?.name || "؟";
    const initial = escapeHtml(name.trim().charAt(0) || "؟");

    if (
        typeof avatar === "string" &&
        (avatar.startsWith("http://") ||
            avatar.startsWith("https://") ||
            avatar.startsWith("/"))
    ) {
        return `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">`;
    }

    if (typeof avatar === "string" && avatar.length <= 3) {
        return escapeHtml(avatar);
    }

    return initial;
}

function ensureAlertsContainer() {
    if (alertsContainer) return alertsContainer;

    alertsContainer = document.createElement("div");
    alertsContainer.id = "messageAlertsContainer";
    alertsContainer.className = "message-alerts";
    alertsContainer.setAttribute("aria-live", "polite");
    alertsContainer.setAttribute("aria-atomic", "false");
    document.body.appendChild(alertsContainer);

    return alertsContainer;
}

function dismissAlert(alertEl) {
    if (!alertEl || alertEl.classList.contains("message-alert--leaving")) return;

    alertEl.classList.add("message-alert--leaving");
    alertEl.addEventListener(
        "animationend",
        () => {
            alertEl.remove();
        },
        { once: true },
    );
}

function trimAlerts(container) {
    const alerts = container.querySelectorAll(".message-alert");

    if (alerts.length <= MAX_VISIBLE_ALERTS) return;

    dismissAlert(alerts[alerts.length - 1]);
}

function showInAppAlert(payload) {
    const container = ensureAlertsContainer();
    trimAlerts(container);

    const senderName = payload.sender?.name || "مستخدم";
    const messageText =
        payload.message?.length > 120
            ? payload.message.slice(0, 120) + "..."
            : payload.message || "رسالة جديدة";

    const alertEl = document.createElement("article");
    alertEl.className = "message-alert";
    alertEl.innerHTML = `
        <div class="message-alert__avatar">${getAvatarMarkup(payload.sender)}</div>
        <div class="message-alert__body">
            <span class="message-alert__label">
                <i class="bi bi-chat-dots-fill" aria-hidden="true"></i>
                رسالة جديدة
            </span>
            <strong class="message-alert__name">${escapeHtml(senderName)}</strong>
            <p class="message-alert__text">${escapeHtml(messageText)}</p>
        </div>
        <button type="button" class="message-alert__close" aria-label="إغلاق">&times;</button>
        <div class="message-alert__progress" aria-hidden="true">
            <span class="message-alert__progress-bar"></span>
        </div>
    `;

    const closeBtn = alertEl.querySelector(".message-alert__close");
    const dismissTimer = setTimeout(() => dismissAlert(alertEl), ALERT_DURATION_MS);

    closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        clearTimeout(dismissTimer);
        dismissAlert(alertEl);
    });

    alertEl.addEventListener("click", () => {
        clearTimeout(dismissTimer);
        dismissAlert(alertEl);

        if (payload.url) {
            window.location.href = payload.url;
        }
    });

    container.prepend(alertEl);
}

function showPresenceAlert(payload) {
    const container = ensureAlertsContainer();
    trimAlerts(container);

    const userName = payload.name || "مستخدم";

    const alertEl = document.createElement("article");
    alertEl.className = "message-alert message-alert--presence";
    alertEl.innerHTML = `
        <div class="message-alert__avatar">${getAvatarMarkup({ name: userName, avatar: payload.avatar })}</div>
        <div class="message-alert__body">
            <span class="message-alert__label message-alert__label--presence">
                <i class="bi bi-person-check-fill" aria-hidden="true"></i>
                متاح الآن
            </span>
            <strong class="message-alert__name">${escapeHtml(userName)}</strong>
            <p class="message-alert__text">أصبح متاحاً للمحادثة</p>
        </div>
        <button type="button" class="message-alert__close" aria-label="إغلاق">&times;</button>
        <div class="message-alert__progress message-alert__progress--presence" aria-hidden="true">
            <span class="message-alert__progress-bar message-alert__progress-bar--presence"></span>
        </div>
    `;

    const closeBtn = alertEl.querySelector(".message-alert__close");
    const dismissTimer = setTimeout(
        () => dismissAlert(alertEl),
        PRESENCE_ALERT_DURATION_MS,
    );

    closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        clearTimeout(dismissTimer);
        dismissAlert(alertEl);
    });

    container.prepend(alertEl);
}

function getNotificationIcon(sender) {
    const avatar = sender?.avatar;
    if (
        typeof avatar === "string" &&
        (avatar.startsWith("http://") ||
            avatar.startsWith("https://") ||
            avatar.startsWith("/"))
    ) {
        return avatar;
    }

    return undefined;
}

function showMessageNotification(payload) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!document.hidden) return;

    const title = payload.sender?.name || "رسالة جديدة";
    const body =
        payload.message?.length > 100
            ? payload.message.slice(0, 100) + "..."
            : payload.message;

    const notification = new Notification(title, {
        body,
        icon: getNotificationIcon(payload.sender),
        tag: "conversation-" + payload.conversation_id,
        renotify: true,
    });

    notification.onclick = () => {
        window.focus();
        notification.close();

        if (payload.url) {
            window.location.href = payload.url;
        }
    };
}

export async function requestMessageNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    try {
        await Notification.requestPermission();
    } catch (error) {
        console.log(error);
    }
}

export function initMessageAlerts() {
    if (notificationPermissionRequested) return;
    notificationPermissionRequested = true;

    ensureAlertsContainer();

    const unlock = () => {
        unlockAudio();
        requestMessageNotificationPermission();
    };

    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
}

export function notifyIncomingMessage(payload, currentUserId) {
    if (payload.sender_id == currentUserId) return;
    if (isViewingConversation(payload.conversation_id)) return;

    playMessageSound();
    showInAppAlert(payload);
    showMessageNotification(payload);
}

export function notifyUserOnline(payload, currentUserId) {
    if (payload.id == currentUserId) return;

    showPresenceAlert(payload);
}
