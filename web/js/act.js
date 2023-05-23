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


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const actId = urlParams.get('id')

//let actId = 2;

function init() {
  $("#tag-save").click(saveTag);
  $("#audio-waveform").click(setAudioPosition);
  $("#file-upload-button").click(uploadFile);
  $("#act-name").blur(updateActName);

  //showNotes();
  window.setInterval(updateAct,50);
  window.requestAnimationFrame(updateAudioLocation);

  // TODO fix the flicker of a refresh
  // May have to update all, rather than clear and replace
  //window.setInterval(getNotes,5000);

  getActs();
  getAct();
  getNotes();
}

function getActs() {
  // TODO get the acts
}

function getAct() {
  $.get({
    url: "/acts/"+actId,
    dataType: "json",
    contentType: "application/json",
    success: showAct
  });
}

function showAct(act) {
  $("#act-name").val(act["name"]);
  $("#audio-player > source").attr("src", act["file"]);
  $("#audio-waveform-img").attr("src", act["waveform"]);
  document.getElementById("audio-player").load();
}

function updateActName() {
  let act = {
    id: actId,
    name: $("#act-name").val()
  }

  $.ajax({
    method: "POST",
    url: "/acts/"+actId,
    data: JSON.stringify(act),
    dataType: "json",
    contentType: "application/json",
    success: successfulNameUpdate
  });
}

function successfulNameUpdate(data) {
  initActs(); // This is from home.js... I don't like that
  flashName();
}

function flashName() {
  $("#act-name").addClass("success");
  window.setTimeout(function(){$("#act-name").removeClass("success");},2000);
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

function deleteNote(note) {

  if(window.confirm("Are you sure you want to delete the note: '"+note.note+"'")) {
    $.ajax({
      method: "DELETE",
      url: "/acts/"+note["act_id"]+"/notes/"+note["id"],
      dataType: "json",
      contentType: "application/json",
      success: function(note) {
        getNotes();
      },
    });
  }
}


let repeatId = undefined;
let currentRepeatSectionId = undefined;

function showNotes() {
  entries = data.sort(function(a,b){return a.startTime-b.startTime});
  $("#act-info").empty();
  for (i in entries) {
    entry = entries[i];

    $noteEntry = $("<div class='note' note-id='"+entry.id+"'>"+formatTime(entry.startTime) + " - " + formatTime(entry.endTime) + " - " + entry.note+" </div>");
    $noteEntry.attr("id", "note-"+entry.id);
    $noteEntry.click(handleNoteClick);

    $delete = $("<button>Delete</button>");
    $delete.click((function(note){
      return function(event) {event.stopPropagation();deleteNote(note);};
    })(entry));

    $repeat = $("<button>Repeat</button>");
    $repeat.click(repeatClickClosure(entry));

    $("#act-info").append($noteEntry);
    $noteEntry.append($repeat);
    $noteEntry.append($delete);
  }
}

function repeatClickClosure(note) {
  return function(event) {
    $(".repeat-active").removeClass("repeat-active");
    window.clearInterval(repeatId);
    if (currentRepeatSectionId == note.id) {
      event.stopPropagation();
      currentRepeatSectionId = undefined;
      //$("[note-id="+entry.id+"]");
    } else {
      event.stopPropagation();
      // Kind of a hack. If it isn't already playing, this is going to still "repeat".
      // TODO need a better repeat mechanism that only fires when playing.
      document.getElementById("audio-player").play();
      let length = Math.round((note.endTime - note.startTime)*1000);
      currentRepeatSectionId = note.id;
      repeatId = window.setInterval(function(){moveAudioLocation(note.startTime)}, length);
      $(event.target).addClass("repeat-active");
      moveAudioLocation(note.startTime);
    }
  };
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


function updateAudioLocation() {
  let currentTime = document.getElementById("audio-player").currentTime;
  let duration = document.getElementById("audio-player").duration;
  let percent = currentTime/duration;
  let width = $("#audio-waveform").width();
  let position = width*percent;

  $("#audio-position-line").css("width", position+"px");
  window.requestAnimationFrame(updateAudioLocation);
}

function setAudioPosition(event) {
  let xPosition = event.offsetX;
  let width = $("#audio-waveform").width();
  let percent = xPosition/width;
  let duration = document.getElementById("audio-player").duration;
  let position = duration*percent;

  moveAudioLocation(position);
}


function uploadFile(event) {
  event.preventDefault();
  $.ajax({
    url: "/acts/"+actId+"/file",
    type: 'POST',
    data: new FormData($('#file-form')[0]), // The form with the file inputs.
    processData: false,
    contentType: false,                    // Using FormData, no need to process data.
    success: getAct
  })
}
