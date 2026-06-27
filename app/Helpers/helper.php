<?php

use App\Enums\MessageReciptStatusEnum;

if (! function_exists('conversations')) {
    function conversations()
    {
        return auth()->user()->conversations()
            ->with(['lastMessage.sender'])
            ->withCount(['recipts' => function ($q) {
                $q->where('receiver_id', auth()->id())
                    ->whereNot('status', MessageReciptStatusEnum::READ);
            }])
            ->orderBy(function ($q) {
                $q->from('messages')
                    ->select('messages.created_at')
                    ->whereColumn('conversations.id', 'messages.conversation_id')
                    ->latest('created_at')
                    ->limit(1);
            }, 'desc')
            ->get()
            ->each(function ($conversation) {
                $conversation->setRelation('otherParticipant', $conversation->participants()->whereNot('user_id', auth()->id())->first());
            });
    }
}
