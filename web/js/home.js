
$(document).ready(init);


function init() {
  initActs();
}

function initActs() {
  $.get({
    url: "/acts",
    dataType: "json",
    contentType: "application/json",
    success: listActs
  });
}

function listActs(acts) {
  $menuActs = $("#menu-acts");
  $menuActs.empty();

  for (i in acts) {
    act = acts[i];
    console.log(act);
    $a = $("<a href='/act.html?id="+act.id+"'>"+act.name+"</a>");
    $menuActs.append($a);
    $menuActs.append("<br/>");
  }

}
