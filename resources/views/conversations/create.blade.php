@extends('layouts.app')
@push('css')
    <link rel="stylesheet" href="{{ asset('assets/css/new-chat.css') }}">
@endpush
@section('content')
    <header class="page-header">
        <a href="{{ route('home') }}" class="page-header__back page-header__back--mobile-only" title="رجوع"><i
                class="bi bi-arrow-right"></i></a>
        <h1 class="page-header__title">محادثة جديدة</h1>
    </header>

    <div class="new-chat-page">
        <div class="search-bar">
            <div class="search-bar__input-wrap">
                <i class="bi bi-search search-bar__icon"></i>
                <input type="text" class="search-bar__input" id="contactSearchInput"
                    placeholder="ابحث بالاسم أو رقم الهاتف...">
            </div>
        </div>
        <p class="new-chat-page__hint">اختر مستخدماً لبدء محادثة فردية</p>

        <ul class="contact-list" id="contactList">
            @forelse ($users as $user)
                <li>
                    <a href="{{ $user->has_chat_with_me ? route('conversations.show', [$user->conversation_id]) : route('chat', ['user' => trim($user->name)]) }}"
                        class="contact-item" data-search="{{ $user->name . ' ' . $user->phone }}">
                        <div class="avatar-wrap">
                            <div class="avatar avatar--sm" style="background:#128c7e">
                                @if ($user->avatar)
                                    <img src=" {{ asset($user->avatar) }}" alt="{{ $user->name }}">
                                @else
                                    {{ $user->getAbbr() }}
                                @endif
                            </div>
                            <span id="user-status-chat-{{ $user->id }}"
                                class="status-dot status-dot--{{ $user->is_online ? 'online' : 'offline' }}"
                                title="{{ $user->is_online ? 'online' : 'offline' }}"></span>
                        </div>
                        <div class="contact-item__body">
                            <span class="contact-item__name">{{ $user->name }}</span>
                            <span class="contact-item__phone">{{ $user->phone }}</span>
                        </div>
                        <span class="contact-item__badge">
                            {{ $user->has_chat_with_me ? 'محادثة موجودة' : '' }}

                        </span>
                    </a>

                    {{-- @if ($user->has_chat_with_me)
                        @else
                        <a href="{{ route('chat', trim($user->name)) }}" class="contact-item"
                            data-search="{{ $user->name . ' ' . $user->phone }}">
                            <div class="avatar-wrap">
                                <div class="avatar avatar--sm" style="background:#128c7e">
                                    @if ($user->avatar)
                                    <img src=" {{ asset($user->avatar) }}" alt="{{ $user->name }}">
                                    @else
                                    {{ $user->getAbbr() }}
                                    @endif
                                </div>
                                <span id="user-status-out-{{ $user->id }}"
                                    class="status-dot status-dot--{{ $user->is_online ? 'online' : 'offline' }}"
                                    title="{{ $user->is_online ? 'online' : 'offline' }}"></span>
                            </div>
                            <div class="contact-item__body">
                                <span class="contact-item__name">{{ $user->name }}</span>
                                <span class="contact-item__phone">{{ $user->phone }}</span>
                            </div>
                        </a>
                        @endif --}}

                </li>
            @empty
            @endforelse

        </ul>

        <div class="w-0 mx-auto">
            {{ $users->links() }}
        </div>

        <div class="contact-list__empty" id="contactListEmpty">
            <i class="bi bi-person-x contact-list__empty-icon"></i>
            <p>لا يوجد مستخدمون مطابقون للبحث</p>
        </div>
    </div>
@endsection
@push('js')
    <script src="{{ asset('assets/js/new-chat.js') }}"></script>
@endpush
