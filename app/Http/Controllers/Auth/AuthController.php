<?php

namespace App\Http\Controllers\Auth;

use App\Events\OfflineEvent;
use App\Events\OnlineEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        if (auth()->attempt($request->validated())) {
            $request->session()->regenerate();
            $user = auth()->user();

            $user->update(['is_online' => 1]);

            broadcast(new OnlineEvent($user))->toOthers();

            return redirect()->route('home')->with('success', 'Logged in successfully');
        }

        return redirect()
            ->back()
            ->withErrors([
                'phone' => 'بيانات غير صحيحة'
            ])->onlyInput('phone');
    }

    public function register(RegisterRequest $request)
    {
        $user = User::create($request->safe()->except('password_confirmation'));

        Auth::login($user);

        $user->update(['is_online' => 1]);

        broadcast(new OnlineEvent($user))->toOthers();

        $request->session()->regenerate();

        return redirect(route('home'))->with('success', 'Logged in successfully');
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->update(['is_online' => 0]);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Auth::logout();

        broadcast(new OfflineEvent($user->id, $user->name))->toOthers();

        return redirect(route('login'));
    }
}
