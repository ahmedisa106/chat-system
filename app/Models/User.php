<?php

namespace App\Models;

use Exception;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use  Notifiable;

    /**
     * The attributes that are mass assignable.
     * 
     * @var array
     */
    protected $fillable = [
        'name',
        'phone',
        'avatar',
        'password',
        'remember_token',
        'is_online'
    ];

    /**
     * The attributes that should be hidden for serialization.
     * 
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_online' => 'boolean'
        ];
    }

    public function getAbbr()
    {
        $nameArr = explode(' ',  $this->name);
        $abbr = '';

        foreach ($nameArr as $name) {
            $abbr .= $name[0];
        }

        return $abbr;
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, ConversationParticipant::class, 'user_id', 'conversation_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id', 'id');
    }
}
