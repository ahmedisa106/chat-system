<?php

namespace App\Http\Controllers;

use App\Events\UserTypingEvent;
use App\Models\Conversation;
use Illuminate\Http\Request;

class TypingController extends Controller
{
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate([
            'typing' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        $isParticipant = $conversation->participants()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isParticipant) {
            abort(403);
        }

        $participant = $conversation->participants()
            ->whereNot('users.id', $user->id)
            ->first();

        if (! $participant) {
            abort(403);
        }

        broadcast(new UserTypingEvent(
            $conversation,
            $user,
            $participant,
            $request->boolean('typing'),
        ))->toOthers();

        return response()->noContent();
    }
}
