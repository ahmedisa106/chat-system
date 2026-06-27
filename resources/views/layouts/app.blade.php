<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>المحادثات</title>
    @include('partials.css')
    @vite(['resources/js/chat.js'])
</head>

<body class="page-shell">
    <div class="chat-app">
        @include('partials.aside')

        <main class="main-panel">
            @yield('content')
        </main>
    </div>

    @include('partials.js')
</body>

</html>
