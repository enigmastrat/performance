$(document).ready(initTabs);

function initTabs() {
    $(".tab-link").click(toggleTab);

}

function toggleTab(event) {
    let $t = $(event.target);
    let rel = $t.attr("rel");

    $(".tab-link.selected").removeClass("selected");
    $t.addClass("selected");

    $(".tab").hide();
    $("#"+rel).show();
}