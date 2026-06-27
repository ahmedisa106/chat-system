 <ul class="conversation-list" id="conversationList">
     @forelse (conversations() as $conversation)
         <li id="conversation-{{ $conversation->id }}">
             @if ($conversation->type->value == 1)
                 <a href="{{ route('conversations.show', ['conversation' => $conversation->id]) }}"
                     class="conversation-item" data-type="dm" data-name="{{ $conversation->otherParticipant->name }}"
                     data-preview="{{ $conversation->lastMessage?->message }}">
                     <div class="avatar-wrap">
                         <div class="avatar" style="background:#128c7e">
                             @if ($conversation->otherParticipant->avatar)
                                 <img src="{{ asset($conversation->otherParticipant->avatar) }}" alt="">
                             @else
                                 {{ $conversation->otherParticipant->getAbbr() }}
                             @endif
                         </div>
                         <span
                             class="status-dot status-dot--{{ $conversation->otherParticipant->is_online ? 'online' : 'offline' }}"
                             id="user-status-{{ $conversation->otherParticipant->id }}" title="متصل"></span>
                     </div>
                     <div class="conversation-item__body">
                         <div class="conversation-item__top">
                             <span class="conversation-item__name">{{ $conversation->otherParticipant->name }}
                             </span>
                             <span
                                 class="conversation-item__time">{{ $conversation->lastMessage?->created_at->format('H:i') }}</span>
                         </div>
                         <div class="conversation-item__bottom">
                             <span
                                 class="conversation-item__preview conversation-item__preview--{{ $conversation->lastMessage->recipt->status->value != '3' ? 'unread' : 'read' }}">
                                 {{ Str::limit($conversation->lastMessage?->message, 100, '...') }}
                             </span>
                             @if ($conversation->recipts_count > 0)
                                 <span class="unread-badge">{{ $conversation->recipts_count }}</span>
                             @endif
                         </div>
                     </div>
                 </a>
             @else
             @endif
         </li>
     @empty
     @endforelse

 </ul>
