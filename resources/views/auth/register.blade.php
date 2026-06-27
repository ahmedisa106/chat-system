<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>إنشاء حساب</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset("assets/css/variables.css") }}">
    <link rel="stylesheet" href="{{ asset("assets/css/base.css") }}">
    <link rel="stylesheet" href="{{ asset("assets/css/components.css") }}">
    <link rel="stylesheet" href="{{ asset("assets/css/auth-layout.css") }}">
    <link rel="stylesheet" href="{{ asset("assets/css/auth-forms.css") }}">
</head>

<body>
    <div class="auth-page">
        <aside class="auth-brand">
            <div class="auth-brand__content">
                <i class="bi bi-chat-dots-fill auth-brand__icon"></i>
                <h2 class="auth-brand__title">شات ديزاين</h2>
                <p class="auth-brand__subtitle">أنشئ حسابك وابدأ المحادثة مع من تحب</p>
                <ul class="auth-brand__features">
                    <li><i class="bi bi-person-plus"></i> <span>تسجيل سريع بالاسم والهاتف</span></li>
                    <li><i class="bi bi-image"></i> <span>أضف صورتك الشخصية</span></li>
                    <li><i class="bi bi-people"></i> <span>انضم للمجموعات فوراً</span></li>
                </ul>
            </div>
        </aside>



        <main class="auth-form-panel">
            <div class="auth-form-panel__inner">
                <div class="auth-form-panel__mobile-brand">
                    <i class="bi bi-chat-dots-fill"></i>
                    <h1>شات ديزاين</h1>
                </div>

                <div class="auth-card">
                    <h1 class="auth-form__title">إنشاء حساب</h1>
                    <p class="auth-form__subtitle">أدخل بياناتك لإنشاء حساب جديد</p>

                    <div id="formAlert" class="auth-form__alert" role="alert">
                        <i class="bi bi-info-circle-fill"></i>
                        <span class="alert-text"></span>
                    </div>

                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif


                    <form id="registerForm" class="auth-form" method="POST" action="{{ route('do_register') }}"
                        enctype="multipart/form-data" novalidate>
                        @csrf

                        <div class="mb-field mb-field--avatar" id="avatarField">
                            <div class="auth-avatar-upload">
                                <div class="auth-avatar-upload__preview" id="avatarPreview">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                                <label class="auth-avatar-upload__btn">
                                    <i class="bi bi-camera"></i>
                                    <span>اختر صورة الحساب *</span>
                                    <input type="file" class="auth-avatar-upload__input" id="avatar" name="avatar"
                                        accept="image/*" required>
                                </label>
                            </div>
                            <div class="invalid-feedback" id="avatar-error"><i
                                    class="bi bi-exclamation-circle"></i><span></span></div>
                        </div>

                        <div class="mb-field">
                            <label for="name" class="form-label-custom">الاسم</label>
                            <div class="input-group-custom">
                                <i class="bi bi-person input-icon"></i>
                                <input type="text" value="{{ old("name") }}" id="name" name="name"
                                    class="form-control-custom has-icon-start" placeholder="أدخل اسمك الكامل"
                                    autocomplete="name" required>
                            </div>
                            <div class="invalid-feedback" id="name-error"><i
                                    class="bi bi-exclamation-circle"></i><span></span></div>
                        </div>

                        <div class="mb-field">
                            <label for="phone" class="form-label-custom">رقم الهاتف</label>
                            <div class="input-group-custom">
                                <i class="bi bi-telephone input-icon"></i>
                                <input type="tel" value="{{ old('phone') }}" id="phone" name="phone"
                                    class="form-control-custom has-icon-start" placeholder="01xxxxxxxxx" dir="ltr"
                                    autocomplete="tel" required>
                            </div>
                            <div class="invalid-feedback" id="phone-error"><i
                                    class="bi bi-exclamation-circle"></i><span></span></div>
                        </div>

                        <div class="mb-field">
                            <label for="password" class="form-label-custom">كلمة المرور</label>
                            <div class="input-group-custom">
                                <i class="bi bi-lock input-icon"></i>
                                <input type="password" id="password" name="password"
                                    class="form-control-custom has-icon-start has-icon-end"
                                    placeholder="8 أحرف على الأقل" autocomplete="new-password" required>
                                <button type="button" class="password-toggle" aria-label="إظهار كلمة المرور"><i
                                        class="bi bi-eye"></i></button>
                            </div>
                            <div class="invalid-feedback" id="password-error"><i
                                    class="bi bi-exclamation-circle"></i><span></span></div>
                        </div>

                        <div class="mb-field">
                            <label for="password_confirmation" class="form-label-custom">تأكيد كلمة المرور</label>
                            <div class="input-group-custom">
                                <i class="bi bi-lock-fill input-icon"></i>
                                <input type="password" id="password_confirmation" name="password_confirmation"
                                    class="form-control-custom has-icon-start has-icon-end"
                                    placeholder="أعد إدخال كلمة المرور" autocomplete="new-password" required>
                                <button type="button" class="password-toggle" aria-label="إظهار كلمة المرور"><i
                                        class="bi bi-eye"></i></button>
                            </div>
                            <div class="invalid-feedback" id="password-confirmation-error"><i
                                    class="bi bi-exclamation-circle"></i><span></span></div>
                        </div>

                        <button type="submit" id="submitBtn" class="btn-primary-custom auth-form__submit">
                            <span class="btn-text">إنشاء حساب</span>
                            <span class="btn-spinner spinner-border spinner-border-sm" role="status"></span>
                        </button>
                    </form>

                    <div class="auth-form__footer">
                        <p class="auth-footer-text">لديك حساب بالفعل؟ <a href="{{ route('login') }}"
                                class="auth-link">سجّل
                                دخول</a></p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="{{ asset("assets/js/auth-common.js") }}"></script>
    <script src="{{ asset("assets/js/register.js") }}"></script>
</body>

</html>