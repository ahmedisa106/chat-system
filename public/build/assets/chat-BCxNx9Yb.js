import"./echo-BwjU_w5l.js";var e=null,t=!1,n=null,r=5500,i=4e3,a=3;function o(e){return window.conversationId&&String(window.conversationId)===String(e)}function s(){if(!e){let t=window.AudioContext||window.webkitAudioContext;if(!t)return;e=new t}e.state===`suspended`&&e.resume()}function c({frequency:t,start:n,duration:r,type:i=`triangle`,volume:a=.18}){let o=e.createOscillator(),s=e.createGain();o.type=i,o.frequency.setValueAtTime(t,n),s.gain.setValueAtTime(1e-4,n),s.gain.exponentialRampToValueAtTime(a,n+.015),s.gain.exponentialRampToValueAtTime(1e-4,n+r),o.connect(s),s.connect(e.destination),o.start(n),o.stop(n+r+.05)}function l(){try{if(s(),!e)return;let t=e.currentTime;c({frequency:784,start:t,duration:.11,volume:.16,type:`sine`}),c({frequency:988,start:t+.1,duration:.11,volume:.18,type:`triangle`}),c({frequency:1175,start:t+.2,duration:.16,volume:.2,type:`triangle`}),c({frequency:1568,start:t+.34,duration:.22,volume:.14,type:`sine`})}catch(e){console.log(e)}}function u(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function d(e){let t=e?.avatar,n=e?.name||`؟`,r=u(n.trim().charAt(0)||`؟`);return typeof t==`string`&&(t.startsWith(`http://`)||t.startsWith(`https://`)||t.startsWith(`/`))?`<img src="${u(t)}" alt="${u(n)}">`:typeof t==`string`&&t.length<=3?u(t):r}function f(){return n||(n=document.createElement(`div`),n.id=`messageAlertsContainer`,n.className=`message-alerts`,n.setAttribute(`aria-live`,`polite`),n.setAttribute(`aria-atomic`,`false`),document.body.appendChild(n),n)}function p(e){!e||e.classList.contains(`message-alert--leaving`)||(e.classList.add(`message-alert--leaving`),e.addEventListener(`animationend`,()=>{e.remove()},{once:!0}))}function m(e){let t=e.querySelectorAll(`.message-alert`);t.length<=a||p(t[t.length-1])}function h(e){let t=f();m(t);let n=e.sender?.name||`مستخدم`,i=e.message?.length>120?e.message.slice(0,120)+`...`:e.message||`رسالة جديدة`,a=document.createElement(`article`);a.className=`message-alert`,a.innerHTML=`
        <div class="message-alert__avatar">${d(e.sender)}</div>
        <div class="message-alert__body">
            <span class="message-alert__label">
                <i class="bi bi-chat-dots-fill" aria-hidden="true"></i>
                رسالة جديدة
            </span>
            <strong class="message-alert__name">${u(n)}</strong>
            <p class="message-alert__text">${u(i)}</p>
        </div>
        <button type="button" class="message-alert__close" aria-label="إغلاق">&times;</button>
        <div class="message-alert__progress" aria-hidden="true">
            <span class="message-alert__progress-bar"></span>
        </div>
    `;let o=a.querySelector(`.message-alert__close`),s=setTimeout(()=>p(a),r);o.addEventListener(`click`,e=>{e.stopPropagation(),clearTimeout(s),p(a)}),a.addEventListener(`click`,()=>{clearTimeout(s),p(a),e.url&&(window.location.href=e.url)}),t.prepend(a)}function g(e){let t=f();m(t);let n=e.name||`مستخدم`,r=document.createElement(`article`);r.className=`message-alert message-alert--presence`,r.innerHTML=`
        <div class="message-alert__avatar">${d({name:n,avatar:e.avatar})}</div>
        <div class="message-alert__body">
            <span class="message-alert__label message-alert__label--presence">
                <i class="bi bi-person-check-fill" aria-hidden="true"></i>
                متاح الآن
            </span>
            <strong class="message-alert__name">${u(n)}</strong>
            <p class="message-alert__text">أصبح متاحاً للمحادثة</p>
        </div>
        <button type="button" class="message-alert__close" aria-label="إغلاق">&times;</button>
        <div class="message-alert__progress message-alert__progress--presence" aria-hidden="true">
            <span class="message-alert__progress-bar message-alert__progress-bar--presence"></span>
        </div>
    `;let a=r.querySelector(`.message-alert__close`),o=setTimeout(()=>p(r),i);a.addEventListener(`click`,e=>{e.stopPropagation(),clearTimeout(o),p(r)}),t.prepend(r)}function _(e){let t=e?.avatar;if(typeof t==`string`&&(t.startsWith(`http://`)||t.startsWith(`https://`)||t.startsWith(`/`)))return t}function v(e){if(!(`Notification`in window)||Notification.permission!==`granted`||!document.hidden)return;let t=e.sender?.name||`رسالة جديدة`,n=e.message?.length>100?e.message.slice(0,100)+`...`:e.message,r=new Notification(t,{body:n,icon:_(e.sender),tag:`conversation-`+e.conversation_id,renotify:!0});r.onclick=()=>{window.focus(),r.close(),e.url&&(window.location.href=e.url)}}async function y(){if(`Notification`in window&&Notification.permission==="default")try{await Notification.requestPermission()}catch(e){console.log(e)}}function b(){if(t)return;t=!0,f();let e=()=>{s(),y()};document.addEventListener(`click`,e,{once:!0}),document.addEventListener(`keydown`,e,{once:!0})}function x(e,t){e.sender_id!=t&&(o(e.conversation_id)||(l(),h(e),v(e)))}function S(e,t){e.id!=t&&g(e)}var C=document.getElementById(`chatMessages`),w=window.userId,T=document.getElementById(`conversations`),E=window.updateMessageStatusRoute,D=window.updateStatusAsDeliveredRoute,O=window.csrfToken,k={},A=3e3;function j(){return`يكتب<span class="typing-indicator typing-indicator--text typing-indicator--sidebar"><span class="typing-indicator__dot"></span><span class="typing-indicator__dot"></span><span class="typing-indicator__dot"></span></span>`}function M(e){return e===`offline`?``:e}function N(){C&&(C.scrollTop=C.scrollHeight)}function P(){let e=document.getElementById(`typingIndicator`);C&&e&&C.appendChild(e)}function F(e){if(!C)return;let t=document.getElementById(`typingIndicator`);t?t.insertAdjacentHTML(`beforebegin`,e):C.insertAdjacentHTML(`beforeend`,e),P()}function I(e){let t=e.conversation_id;k[t]||(k[t]={});let n=k[t];if(clearTimeout(n.hideTimer),n.hideTimer=setTimeout(()=>L(t),A),T){let e=T.querySelector(`#conversation-`+t);if(e){let t=e.querySelector(`.conversation-item__preview`),r=e.querySelector(`.conversation-item`);t&&n.savedPreview===void 0&&(n.savedPreview=t.textContent.trim(),n.savedPreviewClasses=t.className),t&&(t.className=`conversation-item__preview conversation-item__preview--typing`,t.innerHTML=j()),r?.classList.add(`conversation-item--typing`)}}if(window.conversationId&&t==window.conversationId&&C){let e=document.getElementById(`typingIndicator`),t=document.querySelector(`.chat-header-user .page-header__subtitle`);e&&(e.classList.add(`is-visible`),e.setAttribute(`aria-hidden`,`false`),P()),t&&n.savedSubtitle===void 0&&(n.savedSubtitle=t.getAttribute(`data-default-text`)||t.textContent.trim(),n.savedSubtitleClasses=t.className),t&&(t.className=`page-header__subtitle page-header__subtitle--typing`,t.innerHTML=j()),N()}}function L(e){let t=k[e];if(t){if(clearTimeout(t.hideTimer),T){let n=T.querySelector(`#conversation-`+e);if(n){let e=n.querySelector(`.conversation-item__preview`),r=n.querySelector(`.conversation-item`);e&&t.savedPreview!==void 0&&(e.className=t.savedPreviewClasses,e.textContent=t.savedPreview),r?.classList.remove(`conversation-item--typing`)}}if(window.conversationId&&e==window.conversationId&&C){let e=document.getElementById(`typingIndicator`),n=document.querySelector(`.chat-header-user .page-header__subtitle`);e?.classList.remove(`is-visible`),e?.setAttribute(`aria-hidden`,`true`),n&&t.savedSubtitle!==void 0&&(n.className=t.savedSubtitleClasses,n.textContent=M(t.savedSubtitle))}delete k[e]}}function R(e){e.user_id!=w&&(e.is_typing?I(e):L(e.conversation_id))}window.TypingIndicator={showRemoteTyping:I,hideRemoteTyping:L,pinTypingIndicatorToBottom:P,appendChatMessageHtml:F},window.addEventListener(`DOMContentLoaded`,()=>{b(),Echo.join(`chat`).joining(function(e){a(e.id,2)}).listen(`.user.online`,function(t){w!=t.id&&(e(t.id),a(t.id,2),S(t,w))}).listen(`.user.offline`,function(e){t(e.id)}).leaving(function(e){e.is_online||t(e.id)}),window.Echo.private(`message.`+w).listen(`.new.message`,function(e){L(e.conversation_id),n(e.conversation_id,e),x(e,w),window.conversationId&&e.conversation_id==window.conversationId?i(e.id,3):e.receiver.status&&i(e.id,2)}).listen(`.user.typing`,R),window.conversationId&&window.Echo.private(`conversation.`+window.conversationId).listen(`.new.message`,function(e){w!=e.sender_id&&(L(e.conversation_id),r(e))}).listen(`.status.recipt`,function(e){e.receiver_id!=w&&C.querySelectorAll(`.message-row--outgoing`).forEach(t=>{let n=t.querySelector(`.message-status`);n&&(e.message.status==3?(n.className=`message-status message-status--read`,n.title=`تمت القراءة`,n.innerHTML=`<i class="bi bi-check-all"></i>`):e.message.status==2&&C.querySelectorAll(`.message-status--sent`).forEach(e=>{e.className=`message-status message-status--delivered`,e.title=`تم التوصيل`,e.innerHTML=`<i class="bi bi-check-all"></i>`}))})});function e(e){let t=document.getElementById(`user-status-${e}`),n=document.getElementById(`user-status-chat-${e}`),r=document.getElementById(`user-status-title-${e}`);t&&(t.classList.remove(`status-dot--offline`),t.classList.add(`status-dot--online`)),n&&(n.classList.remove(`status-dot--offline`),n.classList.add(`status-dot--online`)),r&&(r.classList.remove(`page-header__subtitle--offline`),r.classList.add(`page-header__subtitle--online`),r.textContent=`online`)}function t(e){let t=document.getElementById(`user-status-${e}`),n=document.getElementById(`user-status-chat-${e}`),r=document.getElementById(`user-status-title-${e}`);t&&(t.classList.remove(`status-dot--online`),t.classList.add(`status-dot--offline`)),n&&(n.classList.remove(`status-dot--online`),n.classList.add(`status-dot--offline`)),r&&(r.classList.remove(`page-header__subtitle--online`),r.classList.add(`page-header__subtitle--offline`),r.textContent=``)}function n(e,t){if(T){var n=T.querySelector(`#conversation-`+e);if(n){let e=t.message.length>100?t.message.slice(0,100)+`...`:t.message;n.querySelector(`.conversation-item__preview`).textContent=e,window.conversationId&&t.conversation_id==window.conversationId?(n.querySelector(`.conversation-item__preview`).classList.remove(`conversation-item__preview--unread`),n.querySelector(`.unread-badge`)&&n.querySelector(`.unread-badge`).remove()):n.querySelector(`.unread-badge`)?n.querySelector(`.unread-badge`).textContent=t.unread_count:n.querySelector(`.conversation-item__bottom`).insertAdjacentHTML(`beforeend`,`
                             <span class="unread-badge">${t.unread_count}</span>
                        `),n.querySelector(`.conversation-item__time`).textContent=t.time,T.prepend(n)}else{let e=`

<li id="conversation-${t.conversation_id}"> <a href="${t.url}" class="conversation-item" data-type="dm" data-name="${t.sender.name}" data-preview="${t.message}">

    <div class="avatar-wrap">
        <div class="avatar" style="background:#128c7e">
            <img src="${t.sender.avatar}" alt="">
        </div>

        <span
            class="status-dot status-dot--${t.sender.status?`online`:`offline`}"
            id="user-status-${t.sender_id}">
        </span>
    </div>

    <div class="conversation-item__body">
        <div class="conversation-item__top">
            <span class="conversation-item__name">
                ${t.sender.name}
            </span>

            <span class="conversation-item__time">
                ${t.time}
            </span>
        </div>

        <div class="conversation-item__bottom">
            <span class="conversation-item__preview conversation-item__preview--unread">
                ${t.message.length>100?t.message.slice(0,100)+`...`:t.message}
            </span>

            <span class="unread-badge">
                ${t.unread_count}
            </span>
        </div>
    </div>
</a>

</li> `;T.insertAdjacentHTML(`afterbegin`,e)}}}function r(e){if(!C)return;C.classList.remove(`chat-messages--empty`);let t=C.querySelector(`.chat-empty-hint`);t&&t.remove(),F(`
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
    `),N()}async function i(e,t){try{let n=E.replace(`:messageId`,e),r=await fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`,"X-CSRF-TOKEN":O},body:JSON.stringify({status:t})}),i=await r.json().catch(()=>({}));if(!r.ok)throw Error(i.message||`تعذّر إرسال الرد، حاول مرة أخرى`)}catch(e){console.log(e)}}async function a(e,t){try{let n=await fetch(D,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`,"X-CSRF-TOKEN":O},body:JSON.stringify({status:t,user_id:e})}),r=await n.json().catch(()=>({}));if(!n.ok)throw Error(r.message||`تعذّر إرسال الرد، حاول مرة أخرى`)}catch(e){console.log(e)}}});