$(function () {
  var currentFilter = "all";

  function applyFilters() {
    var query = $("#searchInput").val().trim().toLowerCase();

    $("#conversationList > li").each(function () {
      var $item = $(this);
      var $link = $item.find(".conversation-item");
      var type = $link.data("type");
      var name = String($link.data("name") || "").toLowerCase();
      var preview = String($link.data("preview") || "").toLowerCase();

      var typeMatch = currentFilter === "all" || type === currentFilter;
      var searchMatch = !query || name.indexOf(query) !== -1 || preview.indexOf(query) !== -1;

      $item.toggle(typeMatch && searchMatch);
    });
  }

  $(".filter-tabs__btn").on("click", function () {
    $(".filter-tabs__btn").removeClass("active");
    $(this).addClass("active");
    currentFilter = $(this).data("filter");
    applyFilters();
  });

  $("#searchInput").on("input", applyFilters);
});
