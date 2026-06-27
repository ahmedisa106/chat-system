<?php

namespace App\Observers;

use App\Enums\ConversationTypeEnum;
use App\Events\ConversationCreatedEvent;
use App\Models\Conversation;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ConversationObserver implements ShouldHandleEventsAfterCommit
{
    public function created(Conversation $conversation)
    {
        if ($conversation->type == ConversationTypeEnum::DM) {
            $participantId = $conversation->participants()->where('user_id', '!=', auth()->id())->first()?->id;
            $message = $conversation->messages()->first();

            ConversationCreatedEvent::dispatch($conversation, $participantId, $message);
        }
    }
}
