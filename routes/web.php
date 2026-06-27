<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TypingController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['guest']], function () {
    Route::view('login', 'auth.login')->name('login');
    Route::view('register', 'auth.register')->name('register');

    Route::post('/login', [AuthController::class, 'login'])->name('do_login');
    Route::post('/register', [AuthController::class, 'register'])->name('do_register');
});

Route::group(['middleware' => ['auth']], function () {
    Route::get('/', HomeController::class)->name('home');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('conversation/users/{user:name}', [ConversationController::class, 'chat'])->name('chat');
    Route::resource('conversations', ConversationController::class)->except('index');
    Route::post('messages/update-status-as-delivered', [MessageController::class, 'updateStatusAsDelivered'])->name('messages.updateStatusAsDelivered');
    Route::post('conversations/{conversation}/messages', MessageController::class)->name('messages.store');
    Route::post('conversations/{conversation}/typing', [TypingController::class, 'store'])
        ->middleware('throttle:60,1')
        ->name('conversations.typing');
    Route::post('messages/{message}', [MessageController::class, 'updateStatus'])->name('messages.updateStatus');
});
