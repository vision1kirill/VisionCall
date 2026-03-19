const msgInput = document.getElementById("msgInput");
const sendBtn  = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let unreadCount  = 0;
let chatIsOpen   = true; /* на десктопе сайдбар всегда видим */

/* Проверяем, открыт ли сайдбар */
function isChatVisible() {
    const sb = document.querySelector(".sidebar");
    if (!sb) return true;
    /* На мобиле — нужен класс mobile-open */
    const isMobile = window.innerWidth <= 900;
    return isMobile ? sb.classList.contains("mobile-open") : true;
}

sendBtn.onclick = sendMessage;
msgInput.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    socket.emit("chat-message", { room, name, text });
    addMessage(name, text, true);
    msgInput.value = "";
}

socket.on("chat-message", data => {
    addMessage(data.name, data.text, false);
    /* Показываем бейдж непрочитанных если сайдбар закрыт */
    if (!isChatVisible()) {
        unreadCount++;
        updateUnreadBadge();
    }
});

function addMessage(author, text, isSelf) {
    const div = document.createElement("div");
    div.className = "message" + (isSelf ? " message-self" : "");

    const authorEl = document.createElement("div");
    authorEl.className = "msg-author";
    authorEl.textContent = author;

    const textEl = document.createElement("div");
    textEl.className = "msg-text";
    textEl.textContent = text;

    div.appendChild(authorEl);
    div.appendChild(textEl);
    messages.appendChild(div);

    /* Скроллим вниз только если пользователь и так внизу */
    const threshold = 60;
    const atBottom  = messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;
    if (atBottom) messages.scrollTop = messages.scrollHeight;
}

/* ── Бейдж непрочитанных на кнопке «Чат» ── */
function updateUnreadBadge() {
    const btn = document.getElementById("chatBtn");
    if (!btn) return;
    let badge = btn.querySelector(".chat-badge");
    if (unreadCount > 0) {
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "chat-badge";
            btn.appendChild(badge);
        }
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    } else if (badge) {
        badge.remove();
    }
}

/* Сбрасываем бейдж при открытии чата */
const chatBtnEl = document.getElementById("chatBtn");
if (chatBtnEl) {
    const orig = chatBtnEl.onclick;
    chatBtnEl.onclick = function (e) {
        if (orig) orig.call(this, e);
        unreadCount = 0;
        updateUnreadBadge();
    };
}
