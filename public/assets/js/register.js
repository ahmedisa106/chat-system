$(function () {
  var $form = $("#registerForm");
  var $alert = $("#formAlert");
  var $submitBtn = $("#submitBtn");
  var $avatarInput = $("#avatar");
  var avatarFile = null;

  AuthCommon.initPasswordToggles($form);
  AuthCommon.initClearOnInput($form);

  $avatarInput.on("change", function () {
    var file = this.files[0];
    avatarFile = file || null;
    $("#avatarField").removeClass("has-error");
    $("#avatar-error").removeClass("is-visible").find("span").text("");

    if (!file) {
      $("#avatarPreview").html('<i class="bi bi-person-fill"></i>');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      $("#avatarPreview").html('<img src="' + e.target.result + '" alt="صورة الحساب">');
    };
    reader.readAsDataURL(file);
  });

  // $form.on("submit", function (e) {
  //   e.preventDefault();
  //   AuthCommon.hideAlert($alert);
  //   AuthValidation.clearFormErrors($form);

  //   var $name = $("#name");
  //   var $phone = $("#phone");
  //   var $password = $("#password");
  //   var $passwordConfirm = $("#password_confirmation");
  //   var valid = true;

  //   var nameError = AuthValidation.validateName($name.val());
  //   if (nameError) {
  //     AuthValidation.showFieldError($name, nameError);
  //     valid = false;
  //   }

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

  //   var confirmError = AuthValidation.validatePasswordConfirmation(
  //     $password.val(),
  //     $passwordConfirm.val()
  //   );
  //   if (confirmError) {
  //     AuthValidation.showFieldError($passwordConfirm, confirmError);
  //     valid = false;
  //   }

  //   var imageError = AuthValidation.validateImage(avatarFile);
  //   if (imageError) {
  //     $("#avatarField").addClass("has-error");
  //     $("#avatar-error").addClass("is-visible").find("span").text(imageError);
  //     valid = false;
  //   }

  //   if (!valid) return;

  //   AuthCommon.setButtonLoading($submitBtn, true);

  //   // setTimeout(function () {
  //   //   window.location.href = "login.html?registered=1";
  //   // }, 800);
  // });
});
