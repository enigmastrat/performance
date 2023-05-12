
$(document).ready(init);

function init() {
  $("#dancer-submit").click(addDancer);
  $("#group-submit").click(addGroup);
  //$("#act-submit").click(addAct);

  updateLists();
}

function updateLists() {
  updateDancers();
  updateGroups();
  //updateList("acts", updateActs);
}

function updateDancers() {
    updateList("dancers", updateDancersResponse);
}

function updateGroups() {
    updateList("groups", updateGroupsResponse);
}

function updateList(data, updateFunc) {
  $.get({
    url: "/"+data,
    success: updateFunc,
    dataType: "json"
  });
}

function updateDancersResponse(dancers) {
  $dancers = $("#dancers-list");
  $dancers.empty();
  for (i in dancers) {
    dancer = dancers[i];
    $dancer = $("<input>");
    $dancer.val(dancer.name);
    $dancer.attr("obj-id", dancer.id);
    $dancers.append($dancer);
    $dancer.blur(updateDancerDef($dancer));
    $dancers.append("</br>");
  }
}

function updateDancerDef($dancer) {
  return function() {
    id = $dancer.attr("obj-id");
    dancer = {id:id, name:$dancer.val()};
    $.ajax({
      method: "POST",
      url: "/dancers/"+id,
      data: JSON.stringify(dancer),
      contentType: "application/json",
      dataType: "json",
      success: updateDancersResponse
    });
  }
}

function updateGroupsResponse(groups) {
  $groups = $("#groups-list");
  $groups.empty();
  for (i in groups) {
    group = groups[i];
    $group = $("<input>");
    $group.val(group.name);
    $group.attr("obj-id", group.id);
    $groups.append($group);
    $group.blur(updateGroupDef($group));
    $groups.append("</br>");
  }
}
function updateGroupDef($group) {
  return function() {
    id = $group.attr("obj-id");
    group = {id:id, name:$group.val()};
    $.ajax({
      method: "POST",
      url: "/groups/"+group["id"],
      data: JSON.stringify(group),
      contentType: "application/json",
      dataType: "json",
      success: updateGroupsResponse
    });
  }
}


function addDancer() {
  console.log("adding dancer");
  name = $("#dancer-name").val();

  $.ajax({
    method: "POST",
    url: "/dancers",
    data: JSON.stringify({name: name}),
    dataType: "json",
    contentType: "application/json",
    success: updateDancersResponse
  })
}


function addGroup() {
  console.log("adding group");
  name = $("#group-name").val();

  $.ajax({
    method: "POST",
    url: "/groups",
    data: JSON.stringify({name: name}),
    dataType: "json",
    contentType: "application/json",
    success: updateGroupsResponse
  })
}
