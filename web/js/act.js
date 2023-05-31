/*
TODOs
- Make it so comments stay visible (maybe show previous, current, and next)
- Allow adding audio/video comments
- Add persistence and file associations
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
  $("#audio-waveform").mousemove(resizeSelectionDragActive);
  $("#file-upload-button").click(uploadFile);
  $("#act-name").blur(updateActName);
  $(".perf-handle").mousedown(startResizeSelection);
  $(".perf-handle").mouseup(endResizeSelection);

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

let resizeSideSelection = false;

function startResizeSelection(event) {
  event.preventDefault();
  event.stopPropagation();
  $target = $(event.target);

  let left = event.pageX;
  resizeSideSelection = ($target.hasClass("perf-handle-left")) ? "left" : "right";
}

function endResizeSelection(event) {
  resizeSideSelection = false;

  // TODO send update, then show
  showNotes();
  saveSelectedNote();
}

function saveSelectedNote() {
  $.ajax({
    method: "POST",
    url: "/acts/"+actId+"/notes/"+selectedNote.id,
    data: JSON.stringify(selectedNote),
    dataType: "json",
    contentType: "application/json",
    success: showNotes
  });
}

function resizeSelectionDragActive() {
  if(!resizeSideSelection) {
    return;
  }
  $target = $(event.target);

  let left = event.pageX;
  let width = $("#audio-waveform").width();
  let theClass = ".perf-handle-" + resizeSideSelection;
  let duration = document.getElementById("audio-player").duration;
  let dragTime = left/width*duration;
  if(resizeSideSelection == "left") {
    selectedNote.startTime = dragTime;
  } else {
    selectedNote.endTime = dragTime;
  }

  highlightSelection();
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

    $delete = $("<button class='btn btn-danger'>Delete &#x232B;</button>");
    $delete.click((function(note){
      return function(event) {event.stopPropagation();deleteNote(note);};
    })(entry));

    let repeatClass = (selectedNote && selectedNote.id == entry.id && isRepeating) ? "btn-warning" : "btn-secondary";

    $repeat = $("<button class='btn "+repeatClass+" repeat-button'>&#x1d106; Repeat &#x1d107;</button>");
    $repeat.click(repeatClickClosure(entry));

    $btnGroup = $("<div class='btn-group' role='group'>");
    $btnGroup.append($delete);
    $btnGroup.append($repeat);

    $("#act-info").append($noteEntry);
    $noteEntry.prepend($btnGroup);
  }
}

let isRepeating = false;

function clearRepeat() {
  isRepeating = false;
}

function repeatClickClosure(note) {
  return function(event) {
    $(".repeat-button").removeClass("btn-warning").addClass("btn-secondary");
    event.stopPropagation();
    if (isRepeating) {
      if (selectedNote.id == note.id) {
        clearRepeat();
      } else {
        selectNote(note.id);
        $("#note-"+note.id+" .repeat-button").addClass("btn-warning");
      }
    } else {
      selectNote(note.id);
      isRepeating = true;
      $("#note-"+note.id+" .repeat-button").addClass("btn-warning");
    }
  };
}

let selectedNote = undefined;

function handleNoteClick(event) {
  let target = event.target;
  let $target = $(target);
  selectNote($target.attr("note-id"));
}

function selectNote(noteId) {
  let entry = data.filter(function (item){return item.id == noteId})[0];
  selectedNote = entry;
  moveAudioLocation(entry.startTime);
  highlightSelection();
  clearRepeat();
}

function highlightSelection() {
  if (!selectedNote){return;}

  let duration = document.getElementById("audio-player").duration;
  let left = selectedNote.startTime/duration*100;
  let blockDuration = (selectedNote.endTime-selectedNote.startTime)/duration*100;

  $("#audio-selection").css("left",left+"%");
  $("#audio-selection").css("width",blockDuration+"%");
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
  position = (Math.round(position*10)/10)-3.5;
  $("#audio-position-line").css("left", position+"px");

  setRepeatState();

  window.requestAnimationFrame(updateAudioLocation);
}

function setRepeatState() {
  if(isRepeating && selectedNote) {
    let audioPlayer = document.getElementById("audio-player");
    let currentTime = audioPlayer.currentTime;
    if (currentTime < selectedNote.startTime || currentTime > selectedNote.endTime) {
      moveAudioLocation(selectedNote.startTime);
    }
  }
}

function setAudioPosition(event) {
  // If we are resizing, don't click the waveform
  if (resizeSideSelection) {
    // TODO why are we landing here instead of mouse up for resize
    endResizeSelection();
    return;
  }

  let xPosition = event.pageX;
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
