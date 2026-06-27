$(function () {
  function updateSelectedCount() {
    $("#selectedCount").text($(".member-checkbox:checked").length);
  }

  $(document).on("change", ".member-checkbox", updateSelectedCount);

  $("#avatarInput").on("change", function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      $("#avatarPreview").html('<img src="' + e.target.result + '" alt="صورة المجموعة">');
    };
    reader.readAsDataURL(file);
  });

  $("#createGroupForm").on("submit", function (e) {
    $("#formError").removeClass("show");
    $("#nameError, #membersError").removeClass("show");
    $("#groupName").removeClass("is-invalid");

    var name = $("#groupName").val().trim();
    var members = $(".member-checkbox:checked").length;
    var hasError = false;

    if (!name) {
      $("#groupName").addClass("is-invalid");
      $("#nameError").addClass("show");
      hasError = true;
    }
    if (members === 0) {
      $("#membersError").addClass("show");
      hasError = true;
    }
    if (hasError) {
      e.preventDefault();
      $("#formError").text("يرجى تعبئة الحقول المطلوبة").addClass("show");
    }
  });

  updateSelectedCount();
});
