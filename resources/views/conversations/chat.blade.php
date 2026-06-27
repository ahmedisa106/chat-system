@extends('layouts.app')
@push('css')
    <link rel="stylesheet" href="{{ asset('assets/css/chat.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/voice-call.css') }}">
@endpush
@section('content')
    <header class="page-header">
        <a href="{{ route('home') }}" class="page-header__back page-header__back--mobile-only" title="رجوع"><i
                class="bi bi-arrow-right"></i></a>
        <div class="chat-header-user">
            <div class="avatar-wrap avatar-wrap--header">
                <div class="avatar avatar--sm" style="background:#128c7e">
                    @if ($user->avatar)
                        <img src="{{ asset($user->avatar) }}" alt="">
                    @else
                        {{ $user->getAbbr() }}
                    @endif

                </div>
                <span class="status-dot status-dot--{{ $user->is_online ? 'online' : 'offline' }}"
                    id="user-status-chat-{{ $user->id }}" title="{{ $user->is_online ? 'online' : 'offline' }}"></span>
            </div>
            <div>
                <h1 class="page-header__title">{{ $user->name }}</h1>
                <p class="page-header__subtitle page-header__subtitle--{{ $user->is_online ? 'online' : 'offline' }}"
                    data-default-text="{{ $user->is_online ? 'online' : 'offline' }}">

                    {{ $user->is_online ? 'online' : 'offline' }}

                </p>
            </div>
        </div>
        <div class="page-header__tools">
            <button type="button" class="page-header__tool" id="voiceCallBtn" title="مكالمة صوتية"
                data-contact-name="{{ $user->name }}" data-contact-initial="{{ $user->getAbbr() }}"
                data-contact-color="#128c7e" data-contact-online="true">
                <i class="bi bi-telephone-fill"></i>
            </button>
        </div>
    </header>
    <div class="chat-page">
        <div class="chat-messages" id="chatMessages">
            @include('partials.components.typing_indicator')
        </div>
        <div class="chat-input-bar">
            <input type="file" class="chat-input-bar__file-input" id="fileInput" accept="*/*">
            <button type="button" class="chat-input-bar__btn" id="attachBtn" title="إرفاق ملف"><i
                    class="bi bi-paperclip"></i></button>
            <div class="chat-input-bar__field-wrap">
                <textarea class="chat-input-bar__input" id="messageInput" rows="1" placeholder="اكتب رسالة..."></textarea>
            </div>
            <button type="button" class="chat-input-bar__btn" id="emojiBtn" title="إيموجي"><i
                    class="bi bi-emoji-smile"></i></button>
            <button type="button" class="chat-input-bar__btn chat-input-bar__send" id="sendBtn" title="إرسال"><i
                    class="bi bi-send-fill"></i></button>
            <div class="emoji-picker" id="emojiPicker">
                <div class="emoji-picker__grid" id="emojiGrid"></div>
            </div>
        </div>
    </div>
@endsection
@push('js')
    <script src="{{ asset('assets/js/chat.js') }}"></script>
    <script src="{{ asset('assets/js/voice-call.js') }}"></script>

    <script>
        var authID = @json(auth()->id());

        $(function() {
            var emitDelay = 300;
            var stopDelay = 3000;
            var heartbeatDelay = 2000;
            var emitTimer = null;
            var stopTimer = null;
            var heartbeatTimer = null;
            var isSendingTyping = false;
            var csrfToken = @json(csrf_token());

            function getTypingUrl() {
                if (!window.conversationId) return null;
                return '/conversations/' + window.conversationId + '/typing';
            }

            function sendTyping(typing) {
                var url = getTypingUrl();
                if (!url) return;

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: {
                        typing: typing ? 1 : 0
                    },
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                });
            }

            function startTypingHeartbeat() {
                clearInterval(heartbeatTimer);
                heartbeatTimer = setInterval(function() {
                    if (isSendingTyping && $('#messageInput').val().trim()) {
                        sendTyping(true);
                    }
                }, heartbeatDelay);
            }

            function stopTypingHeartbeat() {
                clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }

            function emitTypingStart() {
                clearTimeout(emitTimer);
                emitTimer = setTimeout(function() {
                    if (!isSendingTyping) {
                        isSendingTyping = true;
                        sendTyping(true);
                        startTypingHeartbeat();
                    }
                }, emitDelay);
            }

            function emitTypingStop() {
                clearTimeout(emitTimer);
                clearTimeout(stopTimer);
                stopTypingHeartbeat();
                if (!isSendingTyping) {
                    return;
                }
                isSendingTyping = false;
                sendTyping(false);
            }

            function scheduleTypingStop() {
                clearTimeout(stopTimer);
                stopTimer = setTimeout(emitTypingStop, stopDelay);
            }

            function onTypingActivity() {
                if (!$('#messageInput').val().trim()) {
                    emitTypingStop();
                    return;
                }
                emitTypingStart();
                scheduleTypingStop();
            }

            $('#messageInput').on('input keydown', onTypingActivity);
            $('#messageInput').on('blur', function() {
                clearTimeout(stopTimer);
                stopTimer = setTimeout(emitTypingStop, 600);
            });
            $('#sendBtn').on('click.typingEmit', emitTypingStop);
        });

        $("#sendBtn").on("click", function() {
            var text = $("#messageInput").val().trim();
            var userId = @json($user->id);
            var type = @json(1);
            var csrf_token = @json(csrf_token());

            $.ajax({
                "type": "POST",
                "url": "{{ route('conversations.store') }}",
                "data": {
                    "user_id": userId,
                    "type": type,
                    "message": text
                },
                "header": {
                    "CSRF-TOKEN": csrf_token
                },
                success: function(response) {
                    window.conversationId = response.data.conversation_id;
                    window.history.replaceState(null, '', '/conversations/' + response.data
                        .conversation_id);

                    refreshSidebarForAuth(response.data);

                    Echo.leave(`conversation.${response.data.conversation_id}`);
                    Echo.private(
                            'conversation.' + response.data.conversation_id
                        ) // subscribe with the conversation to receive the messages
                        .listen('.new.message',
                            function(e) {
                                if (e.sender_id != @json(auth()->id())) {
                                    var html = `
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
                                `;

                                    if (window.TypingIndicator?.appendChatMessageHtml) {
                                        window.TypingIndicator.appendChatMessageHtml(html);
                                    } else {
                                        var $indicator = $('#typingIndicator');
                                        if ($indicator.length) {
                                            $indicator.before(html);
                                            $indicator.appendTo('#chatMessages');
                                        } else {
                                            $('#chatMessages').append(html);
                                        }
                                    }

                                    scrollToBottom();
                                }
                            });
                }
            })
        });

        $(document).ready(function() {
            window.Echo.private('conv.' + authID) // subscribe when a user is not in the chat 
                .listen('.new.conversation', function(e) {
                    convId = e.conversation_id;
                    window.history.replaceState(
                        null,
                        '',
                        '/conversations/' + convId
                    );
                    appendNewMessage(e);

                    Echo.private('conversation.' + convId)
                        .listen('.new.message', function(e) {
                            if (e.sender_id != @json(auth()->id())) {
                                appendNewMessage(e)
                            }
                        });
                });
        });

        function scrollToBottom() {
            $("#chatMessages").scrollTop(
                $("#chatMessages").prop("scrollHeight")
            );
        }

        function appendNewMessage(e) {
            var html = `
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
                                    `;

            if (window.TypingIndicator?.appendChatMessageHtml) {
                window.TypingIndicator.appendChatMessageHtml(html);
            } else {
                var $indicator = $('#typingIndicator');
                if ($indicator.length) {
                    $indicator.before(html);
                    $indicator.appendTo('#chatMessages');
                } else {
                    $('#chatMessages').append(html);
                }
            }

            scrollToBottom();
        }

        function refreshSidebarForAuth(data) {
            const conversationsList = $('#conversations');
            const conversationId = data.conversation_id;
            let $item = $("#conversation-" + data.conversation_id);


            if ($item.length) {
                let shortMessage =
                    data.message.length > 100 ?
                    data.message.slice(0, 100) + "..." :
                    data.message;

                $item.find(".conversation-item__preview")
                    .removeClass('conversation-item__preview--read')
                    .text(shortMessage);
                $item.find(".conversation-item__time").text(data.time);

                $(conversationsList).prepend($item);

            } else {
                let shortMessage =
                    data.message.length > 100 ?
                    data.message.slice(0, 100) + "..." :
                    data.message;

                const html = `
            <li id="conversation-${data.conversation_id}">
                <a href="${data.url}" class="conversation-item"
                   data-type="dm"
                   data-name="${data.receiver.name}"
                   data-preview="${data.message}">

                    <div class="avatar-wrap">
                        <div class="avatar" style="background:#128c7e">
                            <img src="${data.receiver.avatar}" alt="">
                        </div>

                        <span
                            class="status-dot status-dot--${data.receiver.status ? "online" : "offline"}"
                            id="user-status-${data.receiver_id}">
                        </span>
                    </div>

                    <div class="conversation-item__body">
                        <div class="conversation-item__top">
                            <span class="conversation-item__name">
                                ${data.receiver.name}
                            </span>

                            <span class="conversation-item__time">
                                ${data.time}
                            </span>
                        </div>

                        <div class="conversation-item__bottom">
                            <span class="conversation-item__preview conversation-item__preview--read">
                                ${shortMessage}
                            </span>
                        </div>
                    </div>
                </a>
            </li>`;

                $(conversationsList).prepend(html);
            }
        }
    </script>
@endpush
