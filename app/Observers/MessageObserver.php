<?php

namespace App\Observers;

use App\Enums\ConversationTypeEnum;
use App\Events\NewMessageEvent;
use App\Models\Message;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class MessageObserver implements ShouldHandleEventsAfterCommit
{
    public function created(Message $message)
    {
        $message->loadMissing('conversation');
        $conversation = $message->conversation;
        if ($message->conversation->type == ConversationTypeEnum::DM) {
            $particiapant = $message->conversation->participants()->where('users.id', '!=', $message->sender_id)->first();


            NewMessageEvent::dispatch($message, $conversation, $particiapant);
        }
    }
}
