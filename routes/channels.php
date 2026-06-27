<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{id}', function ($user, $id) {
    return Conversation::where('id', $id)
        ->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
        ->exists();
});

Broadcast::channel('conv.{id}', function ($user, $id) {
    return $user->id == $id;
});

Broadcast::channel('message.{id}', function ($user, $id) {
    return $user->id == $id;
});

Broadcast::channel('chat', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'is_online' => $user->is_online,
    ];
});
