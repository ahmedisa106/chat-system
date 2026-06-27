<?php

namespace App\Models;

use App\Enums\MessageTypeEnum;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['conversation_id', 'sender_id', 'message', 'message_type'];

    public function casts()
    {
        return [
            'message_type' => MessageTypeEnum::class
        ];
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id', 'id');
    }

    public function recipt()
    {
        return $this->hasOne(MessageRecipt::class, 'message_id', 'id');
    }
}
