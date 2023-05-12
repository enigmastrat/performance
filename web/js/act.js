/*
TODOs
- Make it so comments stay visible (maybe show previous, current, and next)
- Allow adding audio/video comments
*/


$(document).ready(init);

function init() {
  $("#tag-save").click(saveTag);

  showNotes();
  window.setInterval(updateAct,50);
}

let data = [
  {id:0, startTime: 0, endTime: 10, note: "Song starts"},
  {id:1, startTime: 4, endTime: 10, note: "Guitar and Drums Start playing"},
  {id:2, startTime: 7, endTime: 15, note: "Lead line"},
  {id:3, startTime: 13, endTime: 21, note: "Lead line #2"},
  {id:4, startTime: 18.2, endTime: 25, note: "Lead line #3"},
  {id:5, startTime: 26, endTime: 35, note: "Verse 1"},
];

function showNotes() {
  entries = data.sort(function(a,b){return a.startTime-b.startTime});
  $("#act-info").empty();
  for (i in entries) {
    entry = entries[i];
    $noteEntry = $("<div class='note'>"+entry.startTime + " - " + entry.note+"</div>");
    $noteEntry.attr("id", "note-"+entry.id);
    $("#act-info").append($noteEntry);
  }
}


let highlightClass = "highlighted";
function updateAct() {
  let position = document.getElementById("audio-player").currentTime;

  entries = data.filter(function(a){return position>a.startTime && position<a.endTime});
  entries = entries.sort(function(a,b){return a.startTime-b.startTime});

  $(".note").removeClass(highlightClass);
  entries.forEach(function(note){
    $note = $("#note-"+note.id);
    $note.addClass(highlightClass);
  });

}

function saveTag() {
  let position = document.getElementById("audio-player").currentTime;
  let startTime = Math.round(position*10)/10;
  let endTime = startTime + 10;
  let note = $("#tag-note").val();

  data.push({
    startTime:startTime,
    endTime:endTime,
    note:note,
    id: new Date().getTime()
  });

  showNotes();
}
