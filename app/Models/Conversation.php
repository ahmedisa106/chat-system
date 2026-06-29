<?php

namespace App\Models;

use App\Enums\ConversationTypeEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['type', 'created_by'];

    protected $casts = [
        'type' => ConversationTypeEnum::class
    ];

    public function participants()
    {
        return $this->belongsToMany(User::class, ConversationParticipant::class, 'conversation_id', 'user_id');
    }

    // public function participant()
    // {
    //     return $this->participant()->whereNot('id', auth()->id())->first();
    // }

    public function conversationParticipants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function group()
    {
        return $this->hasOne(Group::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->ofMany('created_at', 'max');
    }

    public function recipts()
    {
        return $this->hasManyThrough(MessageRecipt::class, Message::class, 'conversation_id', 'message_id', 'id', 'id');
    }
}
