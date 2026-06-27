<aside class="sidebar-panel">
    <div class="sidebar-top">
        <div class="sidebar-profile">
            <div class="avatar-wrap">
                <div class="avatar avatar--sm" style="background:#075e54">
                    @if (!is_null($avatar = auth()->user()->avatar))
                        <img src="{{ asset($avatar) }}" alt="{{ auth()->user()->name }}">
                    @else
                        {{ auth()->user()->getAbbr() }}
                    @endif
                </div>
            </div>
            <div class="sidebar-profile__info">
                <span class="sidebar-profile__name">{{ auth()->user()->name }}</span>
                <button type="button" class="sidebar-profile__status-btn" id="statusToggle" data-status="online">
                    <i class="bi bi-circle-fill status-icon status-icon--online"></i>
                    <span class="status-label">متصل</span>
                </button>
            </div>
        </div>
        <div class="sidebar-top__actions">
            <a href="{{ route('conversations.create') }}"
                class="sidebar-top__btn @if (request()->routeIs('conversations.create')) sidebar-top__btn--active @endif"
                title="محادثة جديدة"><i class="bi bi-chat-dots-fill"></i></a>
            <a href="#" class="sidebar-top__btn" title="إنشاء مجموعة"><i class="bi bi-people-fill"></i></a>
            <a href="javascript:;" onclick="$('#logout_form').submit()"
                class="sidebar-top__btn sidebar-top__btn--logout" title="تسجيل الخروج">
                <i class="bi bi-box-arrow-right"></i></a>
            <form action="{{ route('logout') }}" method="POST" id="logout_form">
                @csrf

            </form>

        </div>
    </div>
    <div class=" search-bar">
        <div class="search-bar__input-wrap">
            <i class="bi bi-search search-bar__icon"></i>
            <input type="text" class="search-bar__input" id="searchInput" placeholder="بحث في المحادثات...">
        </div>
    </div>
    <div class="filter-tabs">
        <button class="filter-tabs__btn active" data-filter="all">الكل</button>
        <button class="filter-tabs__btn" data-filter="dm">فردي</button>
        <button class="filter-tabs__btn" data-filter="group">مجموعات</button>
    </div>
    <div id="conversations">
        @include('partials.components.conversations_list')
    </div>

</aside>
