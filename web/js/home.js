
$(document).ready(init);


function init() {
  $("#btn-create-act").click(createNewAct);
  initActs();
}

function createNewAct() {
  $.ajax({
  method: "POST",
  url: "/acts",
  data: JSON.stringify({name:"Untitled"}),
  dataType: "json",
  contentType: "application/json",
  success: forwardToNewAct,
  failure: notifyCreationFailure
  });
}

function forwardToNewAct(data) {
  window.location.replace("/act.html?id="+data.id);
}

function notifyCreationFailure() {
  alert("Failed to create new act");
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
    $a = $("<a href='/act.html?id="+act.id+"'>"+act.name+"</a>");
    $delete = $("<a href='#' class='delete-act'>X</a>");
    $delete.click(confirmDeleteAct(act));
    $menuActs.append($a);
    $menuActs.append($delete);
    $menuActs.append("<br/>");
  }
}

function confirmDeleteAct(act) {
  return function(){
    if(confirm("Are you sure you want to delete '"+act.name+"'?")) {
      $.ajax({
        method: "DELETE",
        url: "/acts/"+act.id,
        dataType: "json",
        contentType: "application/json",
        success: initActs
      });
    }
  };
}
