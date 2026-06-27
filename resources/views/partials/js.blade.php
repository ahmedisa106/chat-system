<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="{{ asset('assets/js/mobile-layout.js') }}"></script>
<script src="{{ asset('assets/js/sidebar.js') }}"></script>
<script src="{{ asset('assets/js/conversations.js') }}"></script>

@stack('js')
<script>
    window.userId = @json(auth()->id());
    window.updateMessageStatusRoute = "{{ route('messages.updateStatus', ':messageId') }}";
    window.csrfToken = "{{ csrf_token() }}";
    window.updateStatusAsDeliveredRoute = "{{ route('messages.updateStatusAsDelivered') }}";
</script>
