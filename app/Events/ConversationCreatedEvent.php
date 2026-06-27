<?php

namespace App\Events;

use App\Enums\MessageReciptStatusEnum;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationCreatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Conversation $conversation, public int $userId, public Message $message)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conv.' . $this->userId),
        ];
    }

    public function broadcastAs()
    {
        return "new.conversation";
    }

    public function broadcastWith()
    {
        $message = $this->message;
        $this->message->loadMissing('sender:id,name,avatar,is_online');
        $sender = $this->message->sender;

        $this->conversation->loadCount(['recipts' => function ($q) {
            $q->where('receiver_id', $this->userId)
                ->whereNot('status', MessageReciptStatusEnum::READ);
        }]);

        return [
            'id' => $message->id,
            'message' => $message->message,
            'time' => $message->created_at->format("H:i"),
            'sender_id' => $sender->id,
            'receiver_id' => $this->userId,
            'sender' => [
                'name' => $sender->name,
                'avatar' =>  is_null($sender->avatar) ? $sender->getAbbr() : asset($sender->avatar),
                'status' => $sender->is_online,
            ],
            'unread_count' => $this->conversation?->recipts_count,
            'conversation_id' => $this->conversation->id,
            'url' => route('conversations.show', $message->conversation->id)
        ];
    }
}
