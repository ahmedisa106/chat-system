<?php

namespace App\Http\Controllers;

use App\Enums\MessageReciptStatusEnum;
use App\Events\ChangeMessageReciptStatus;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageRecipt;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Conversation $conversation)
    {
        $author = $request->user();
        $participantId = $request->user_id;
        $participant = User::find($participantId);

        DB::transaction(function () use ($conversation, $request) {
            try {
                $message =  $conversation
                    ->messages()
                    ->create(
                        [
                            'type' => $request->type,
                            'message' => $request->message,
                            'sender_id' => $request->user_id
                        ]
                    );

                $message->recipt()->create(['receiver_id' => $request->participant_id]);
            } catch (Exception $e) {
                dd($e->getMessage());
            }
        });
        // $view = view('partials.components.conversations_list', conversations())->render();
        $message = $conversation->messages()->latest()->first();
        $conversation->loadCount(['recipts' => function ($q) use ($participantId) {
            $q->where('receiver_id', $participantId)
                ->whereNot('status', MessageReciptStatusEnum::READ);
        }]);

        $data = [
            'id' => $message->id,
            'message' => $message->message,
            'time' => $message->created_at->format("H:i"),
            'sender_id' => $author->id,
            'receiver_name' => $author->name,
            'receiver_id' => $participantId,
            'sender' => [
                'name' => $author->name,
                'avatar' =>  is_null($author->avatar) ? $author->getAbbr() : asset($author->avatar),
                'status' => $author->is_online,
            ],
            'receiver' => [
                'name' => $participant->name,
                'avatar' =>  is_null($participant->avatar) ? $participant->getAbbr() : asset($participant->avatar),
                'status' => $participant->is_online,
            ],
            'unread_count' => $conversation?->recipts_count,
            'conversation_id' => $conversation->id,
            'url' => route('conversations.show', $message->conversation->id)
        ];

        return response()->json(['data' => $data]);
    }

    public function updateStatus(Request $request, Message $message)
    {
        $recipt = MessageRecipt::whereRelation('message', 'id', $message->id)
            ->first();
        $recipt->update(['status' => $request->status]);

        broadcast(new ChangeMessageReciptStatus($message->conversation, $recipt->receiver_id));
        return response()->json();
    }

    public function updateStatusAsDelivered(Request $request)
    {
        $auhor = auth()->user();
        $conversation =  $auhor->conversations()
            ->whereHas('participants', fn($q) => $q->where('users.id', $request->user_id))
            ->first();

        if ($conversation) {
            $conversation?->messages()
                ->whereHas('recipt', fn($q) => $q->whereStatus(MessageReciptStatusEnum::PENDING))
                ->cursor()
                ->each(function ($message) use ($request) {
                    $message->recipt()
                        ->where('receiver_id',  $request->user_id)
                        ->update(
                            ['status' => MessageReciptStatusEnum::DELIVERED]
                        );
                });
            broadcast(new ChangeMessageReciptStatus($conversation, $auhor->id));
        }

        return response()->json();
    }
}
