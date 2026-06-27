$(function () {
  $("#statusToggle").on("click", function () {
    var $btn = $(this);
    var isOnline = $btn.data("status") === "online";
    var nextStatus = isOnline ? "offline" : "online";

    $btn.data("status", nextStatus);

    if (nextStatus === "online") {
      $btn.find(".status-icon")
        .removeClass("status-icon--offline bi-circle")
        .addClass("status-icon--online bi-circle-fill");
      $btn.find(".status-label").text("متصل");
      $("#myStatusDot").removeClass("status-dot--offline").addClass("status-dot--online");
    } else {
      $btn.find(".status-icon")
        .removeClass("status-icon--online bi-circle-fill")
        .addClass("status-icon--offline bi-circle");
      $btn.find(".status-label").text("غير متصل");
      $("#myStatusDot").removeClass("status-dot--online").addClass("status-dot--offline");
    }
  });
});
