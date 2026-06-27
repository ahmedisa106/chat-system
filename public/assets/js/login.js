$(function () {
  var $form = $("#loginForm");
  var $alert = $("#formAlert");
  var $submitBtn = $("#submitBtn");

  AuthCommon.initPasswordToggles($form);
  AuthCommon.initClearOnInput($form);

  if (new URLSearchParams(location.search).get("registered") === "1") {
    AuthCommon.showAlert($alert, "تم إنشاء الحساب بنجاح! سجّل دخولك الآن.", "success");
  }

  if (new URLSearchParams(location.search).get("logout") === "1") {
    AuthCommon.showAlert($alert, "تم تسجيل الخروج بنجاح.", "success");
  }

  // $form.on("submit", function (e) {
  //   e.preventDefault();
  //   AuthCommon.hideAlert($alert);
  //   AuthValidation.clearFormErrors($form);

  //   var $phone = $("#phone");
  //   var $password = $("#password");
  //   var valid = true;

  //   var phoneError = AuthValidation.validatePhone($phone.val());
  //   if (phoneError) {
  //     AuthValidation.showFieldError($phone, phoneError);
  //     valid = false;
  //   }

  //   var passwordError = AuthValidation.validatePassword($password.val());
  //   if (passwordError) {
  //     AuthValidation.showFieldError($password, passwordError);
  //     valid = false;
  //   }

  //   if (!valid) return;

  //   AuthCommon.setButtonLoading($submitBtn, true);

  //   // setTimeout(function () {
  //   //   sessionStorage.setItem("chat-auth", "1");
  //   //   sessionStorage.setItem("chat-user-phone", $phone.val().trim());
  //   //   AuthCommon.showAlert($alert, "تم تسجيل الدخول بنجاح!", "success");
  //   //   setTimeout(function () {
  //   //     window.location.href = "index.html";
  //   //   }, 800);
  //   // }, 600);
  // });
});
