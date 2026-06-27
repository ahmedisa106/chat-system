<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    public function creating(User $user)
    {
        $path = $user->avatar->store('uploads/users', 'public');
        $user->avatar = $path;
    }
}
