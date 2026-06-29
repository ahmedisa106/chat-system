<?php

namespace App\Http\Controllers;

use App\Enums\MessageReciptStatusEnum;
use App\Events\ChangeMessageReciptStatus;
use App\Http\Requests\ConversationRequest;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function create()
    {
        // $users = User::whereNot('id', auth()->id())
        //     ->addSelect(['conversation_id' => function ($q) {
        //         $q->from('conversation_participants as cp1')
        //             ->select('cp1.conversation_id')
        //             ->join('conversation_participants as cp2', 'cp2.conversation_id', 'cp1.conversation_id')
        //             ->join('messages', 'messages.conversation_id', 'cp1.conversation_id')
        //             ->where('cp1.user_id', auth()->id())
        //             ->whereColumn('cp2.user_id', 'users.id')
        //             ->limit(1);
        //     }])
        //     ->get()
        //     ->map(function ($row) {
        //         $row->has_chat_with_me = ! is_null($row->conversation_id);
        //         return $row;
        //     });
        // dd(auth()->id());
        $users = User::query()
            ->whereNot('id', auth()->id())
            ->select('users.*')
            ->selectSub(function ($q) {
                $q->from('conversation_participants as  cp1')
                    ->select('cp1.conversation_id')
                    ->join('conversation_participants as cp2', 'cp1.conversation_id', 'cp2.conversation_id')
                    ->where('cp1.user_id', auth()->id())
                    ->whereColumn('cp2.user_id', 'users.id')
                    ->join('messages', 'cp1.conversation_id', 'messages.conversation_id')
                    ->limit(1)
                ;
            }, 'conversation_id')
            ->paginate(10)
            ->through(function ($item) {
                $item->has_chat_with_me = !is_null($item->conversatino_id);
                return $item;
            });
        // dd($users);

        return view('conversations.create', compact('users'));
    }

    public function chat(Request $request, User $user)
    {
        $existedConversation = auth()
            ->user()
            ->conversations()->whereHas('participants', fn($q) => $q->where('users.id', $user->id))
            ->first();

        if ($existedConversation) {
            return to_route('conversations.show', $existedConversation);
        }

        return view('conversations.chat', ['user' => $user]);
    }

    public function store(ConversationRequest $request)
    {
        $author = $request->user();
        $participantId = $request->user_id;
        $participant = User::find($participantId);

        try {
            $conversation = DB::transaction(function () use ($request, $author, $participantId) {
                if (! $this->checkExistingConversation($author, $request->user_id)) {
                    $conversation = $this->createNewConversation($author, $request->type, $request->user_id);
                } else {
                    $conversation = $author->conversations()->whereRelation('participants', 'user_id', $participantId)->first();
                }

                $this->createMessage($conversation, $author, $request->message, $participantId);

                return $conversation;
            });
        } catch (Exception $e) {
            throw $e;
        }

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

    public function show(Conversation $conversation)
    {
        abort_unless($conversation->participants()->where('users.id', auth()->id())->exists(), 403);

        $conversation->loadMissing(['messages' => [
            'sender',
            'recipt'
        ]]);

        $user = $conversation->participants()->whereNot('user_id', auth()->id())->first();

        $conversation->messages()
            ->cursor()
            ->each(function ($message) {
                $message->recipt()
                    ->where('receiver_id', auth()->id())
                    ->update(['status' => MessageReciptStatusEnum::READ]);
            });

        broadcast(new ChangeMessageReciptStatus($conversation, auth()->id()));

        return view('conversations.show', compact('conversation', 'user'));
    }

    private function checkExistingConversation(User $author, int $participantId)
    {
        return  $author->conversations()->whereRelation('participants', 'user_id', $participantId)->exists();
    }

    private function createNewConversation(User $author, int $type, int $participantId)
    {
        $conversation = $author->conversations()
            ->create([
                'created_by' => $author->id,
                'type' => $type
            ]);

        $conversation->participants()->syncWithoutDetaching([$author->id, $participantId]);

        return $conversation;
    }

    private function createMessage(Conversation $conversation, User $author, string $message, int $particiapantId)
    {
        try {
            $message = DB::transaction(function () use ($author, $conversation, $particiapantId, $message) {
                $message = $conversation->messages()->create(['sender_id' => $author->id, 'message' => $message]);
                $message->recipt()->create(['receiver_id' => $particiapantId]);
            });
            return $message;
        } catch (Exception $e) {
            throw $e;
        }

        return $message;
    }
}
