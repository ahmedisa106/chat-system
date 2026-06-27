$(function () {
  var $items = $("#contactList .contact-item");
  var $empty = $("#contactListEmpty");

  $("#contactSearchInput").on("input", function () {
    var q = $(this).val().trim().toLowerCase();
    var visible = 0;

    $items.each(function () {
      var haystack = String($(this).data("search") || "").toLowerCase();
      var match = !q || haystack.indexOf(q) !== -1;
      $(this).closest("li").toggle(match);
      if (match) visible += 1;
    });

    $empty.toggleClass("show", q.length > 0 && visible === 0);
  });
});
