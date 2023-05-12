/*
TODOs
- Make it so comments stay visible (maybe show previous, current, and next)
- Allow adding audio/video comments
- Add persistence and file associations
- Add audio upload
*/


$(document).ready(init);

let data = [];
/*  {id:0, startTime: 0, endTime: 10, note: "Song starts"},
  {id:1, startTime: 4, endTime: 10, note: "Guitar and Drums Start playing"},
  {id:2, startTime: 7, endTime: 15, note: "Lead line"},
  {id:3, startTime: 13, endTime: 21, note: "Lead line #2"},
  {id:4, startTime: 18.2, endTime: 25, note: "Lead line #3"},
  {id:5, startTime: 26, endTime: 35, note: "Verse 1"},
];*/

let actId = 2;

function init() {
  $("#tag-save").click(saveTag);

  //showNotes();
  window.setInterval(updateAct,50);

  getNotes();
}


function getNotes() {
  // TODO replace with selections
  $.get({
    url: "/acts/"+actId+"/notes",
    dataType: "json",
    contentType: "application/json",
    success: function(notes) {
      data = notes;
      showNotes();
    }
  });
}


function showNotes() {
  entries = data.sort(function(a,b){return a.startTime-b.startTime});
  $("#act-info").empty();
  for (i in entries) {
    entry = entries[i];
    $noteEntry = $("<div class='note' note-id='"+entry.id+"'>"+formatTime(entry.startTime) + " - " + entry.note+"</div>");
    $noteEntry.attr("id", "note-"+entry.id);
    $noteEntry.click(handleNoteClick);
    $("#act-info").append($noteEntry);
  }
}

function handleNoteClick(event) {
  let target = event.target;
  let $target = $(target);
  let entry = data.filter(function (item){return item.id == $target.attr("note-id")})[0];
  
  moveAudioLocation(entry.startTime);
}

function moveAudioLocation(time) {
  document.getElementById("audio-player").currentTime = time;
}

function formatTime(fullSeconds) {
  let minutes = Math.floor(fullSeconds/60);
  let seconds = Math.floor(fullSeconds) - (minutes*60);
  let millis = Math.round((fullSeconds - Math.floor(fullSeconds))*1000);

  let paddedMinutes = String(minutes).padStart(2, '0');
  let paddedSeconds = String(seconds).padStart(2, '0');
  let paddedMillis = String(millis).padEnd(3, '0');

  return paddedMinutes + ":" + paddedSeconds + "." + paddedMillis;
}


let highlightClass = "highlighted";
function updateAct() {
  let position = document.getElementById("audio-player").currentTime;

  entries = data.filter(function(a){return position>=a.startTime && position<a.endTime});
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


  noteData = {
    startTime:startTime,
    endTime:endTime,
    note:note
  };

  
  $.ajax({
    method: "POST",
    url: "/acts/"+actId+"/notes",
    data: JSON.stringify(noteData),
    dataType: "json",
    contentType: "application/json",
    success: getNotes
  });

  //showNotes();
}
