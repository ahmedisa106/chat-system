var AuthValidation = {
  PHONE_REGEX: /^(?:\+20|0)?1[0125]\d{8}$/,

  validateName: function (value) {
    var trimmed = (value || "").trim();
    if (!trimmed) return "الاسم مطلوب";
    if (trimmed.length < 2) return "الاسم يجب أن يكون حرفين على الأقل";
    if (trimmed.length > 100) return "الاسم يجب ألا يتجاوز 100 حرف";
    return null;
  },

  validatePhone: function (value) {
    var trimmed = (value || "").trim();
    if (!trimmed) return "رقم الهاتف مطلوب";
    if (!this.PHONE_REGEX.test(trimmed)) return "رقم الهاتف غير صالح (مثال: 01xxxxxxxxx)";
    return null;
  },

  validatePassword: function (value) {
    if (!value) return "كلمة المرور مطلوبة";
    if (value.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    return null;
  },

  validatePasswordConfirmation: function (password, confirmation) {
    if (!confirmation) return "تأكيد كلمة المرور مطلوب";
    if (password !== confirmation) return "كلمة المرور غير متطابقة";
    return null;
  },

  validateImage: function (file) {
    if (!file) return "صورة الحساب مطلوبة";
    if (!file.type.startsWith("image/")) return "يجب اختيار ملف صورة";
    if (file.size > 5 * 1024 * 1024) return "حجم الصورة يجب ألا يتجاوز 5 ميجابايت";
    return null;
  },

  showFieldError: function ($input, message) {
    var $field = $input.closest(".mb-field");
    var $feedback = $field.find(".invalid-feedback");
    $input.addClass("is-invalid");
    $field.addClass("has-error");
    $feedback.addClass("is-visible").find("span").text(message);
  },

  clearFieldError: function ($input) {
    var $field = $input.closest(".mb-field");
    var $feedback = $field.find(".invalid-feedback");
    $input.removeClass("is-invalid");
    $field.removeClass("has-error");
    $feedback.removeClass("is-visible").find("span").text("");
  },

  clearFormErrors: function ($form) {
    $form.find(".form-control-custom").each(function () {
      AuthValidation.clearFieldError($(this));
    });
    $form.find(".mb-field--avatar").removeClass("has-error");
    $form.find("#avatar-error").removeClass("is-visible").find("span").text("");
  }
};

var AuthCommon = {
  showAlert: function ($el, message, type) {
    $el.removeClass("auth-form__alert--success auth-form__alert--error")
      .addClass("auth-form__alert--" + type)
      .find(".alert-text").text(message);
    $el.addClass("show");
  },

  hideAlert: function ($el) {
    $el.removeClass("show");
  },

  setButtonLoading: function ($btn, loading) {
    $btn.toggleClass("loading", loading).prop("disabled", loading);
  },

  initPasswordToggles: function ($form) {
    $form.on("click", ".password-toggle", function () {
      var $btn = $(this);
      var $input = $btn.siblings("input");
      var isPassword = $input.attr("type") === "password";
      $input.attr("type", isPassword ? "text" : "password");
      $btn.find("i").toggleClass("bi-eye bi-eye-slash");
    });
  },

  initClearOnInput: function ($form) {
    $form.on("input", ".form-control-custom", function () {
      AuthValidation.clearFieldError($(this));
    });
  }
};

(function () {
  if (!window.visualViewport) return;

  function updateViewportHeight() {
    document.documentElement.style.setProperty(
      "--vvh",
      window.visualViewport.height + "px"
    );
  }

  updateViewportHeight();
  window.visualViewport.addEventListener("resize", updateViewportHeight);
})();
