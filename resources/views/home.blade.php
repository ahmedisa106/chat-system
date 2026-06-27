@extends('layouts.app')

@section('content')
    <div class="welcome-panel">
        <i class="bi bi-whatsapp welcome-panel__icon"></i>
        <h2 class="welcome-panel__title">شات ديزاين</h2>
        <p class="welcome-panel__text">اختر محادثة من القائمة، أو ابدأ <a href="{{ route('conversations.create') }}">محادثة جديدة</a>،
            أو أنشئ مجموعة.</p>
    </div>
@endsection