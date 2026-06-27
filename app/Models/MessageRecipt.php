<?php

namespace App\Models;

use App\Enums\MessageReciptStatusEnum;
use Illuminate\Database\Eloquent\Model;

class MessageRecipt extends Model
{
    protected $fillable = ['message_id', 'receiver_id', 'status'];

    protected $casts = [
        'status' => MessageReciptStatusEnum::class
    ];

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}
