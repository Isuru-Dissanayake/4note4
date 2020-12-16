const { desktopCapturer, remote, ipcRenderer, BrowserWindow } = require('electron');
const { writeFile } = require('fs');
const { get } = require('https');
const { dialog, Menu } = remote;

window.onload = function() {
  loadNotesDetails();
  renderNoteCards();
}

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
function getNewNoteIndex() {
  var newNoteIndex = JSON.parse(localStorage.getItem('newNoteIndex'));
  if (newNoteIndex === 'null' || newNoteIndex === null) {
    newNoteIndex = {ind: '0'}
  }
  return parseInt(newNoteIndex.ind);
};
function saveNextNoteIndex(i) {
  var nextNoteIndex = {ind: i}
  localStorage.setItem('newNoteIndex', JSON.stringify(nextNoteIndex));
}
function loadTagData() {
  var tagData = {
    "All notes":{tag_name: "All notes", tag_color: "#ffffff"},
    "Work":{tag_name: "Work", tag_color: "#00FFFF"},
    "Internship":{tag_name: "Internship", tag_color: "#FF7F50"}
  }

  return tagData;
}
function onClickClose() {
  ipcRenderer.send('close-me')
};
function onClickMaximize() {
  remote.BrowserWindow.getFocusedWindow().maximize();
  document.getElementById("max-icon").innerHTML = '<i class="far fa-window-restore" onclick="onClickRestore()"></i>'
};
function onClickMinus() {
  remote.BrowserWindow.getFocusedWindow().minimize();
};
function onClickRestore() {
  remote.BrowserWindow.getFocusedWindow().restore();
  document.getElementById("max-icon").innerHTML = '<i class="far fa-square" onclick="onClickMaximize()"></i>'
}
function changeNoteTag(tagName, tagColor) {
  document.getElementById("tag-name-editable").innerText = tagName;
  document.getElementById("tag-name-editable").style.color = tagColor;
  document.getElementById("tag-dot-editable").style.backgroundColor = tagColor;
}
function onClickAddNoteButton (){
  console.log('onClickAddNoteButton');
  document.getElementById("new-note-container").innerHTML = newNoteInputForm;
  var dropdownContent = document.getElementById("dropdown-content")
  var tagData = loadTagData();
  var tagDataIndexes = Object.keys(tagData);
  tagDataIndexes.reverse();
  tagDataIndexes.forEach((id)=> {
    var ind = id;
    var tagName = tagData[id].tag_name;
    var tagColor = tagData[id].tag_color;
    const drowdownItem = `<div id="tag" class="drop-down-item" onclick="changeNoteTag('${tagName}','${tagColor}')">
                            <div class="tag-dot">
                              <span id="drowdown-dot-${ind}" class="dot-side-menu"></span>
                            </div>
                            <div id="dropdown-name-${ind}" class="tag-name">
                              ${tagName}
                            </div>
                          </div>`
    dropdownContent.innerHTML += drowdownItem;
    document.getElementById('drowdown-dot-'+ind).style.backgroundColor = tagColor;
    document.getElementById('dropdown-name-'+ind).style.color = tagColor;
  });
  var newNoteIndex = getNewNoteIndex();
  newNoteIndex = newNoteIndex + 1;
  saveNextNoteIndex(newNoteIndex);
};
function onClickNewNoteBackButton() {
  console.log('onClickNewNoteBackButton');
  document.getElementById("new-note-container").innerHTML = createNewNoteInputForm;
  renderNoteCards();
};

function onClickNewNoteSave() {
  console.log('onClickNewNoteSave');

  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  console.log('notesDetails whenloading', notesDetails);
  var newNoteIndex = getNewNoteIndex();

  var current = new Date();
  var title = document.getElementById("new-note-title-box").value;
  var description = document.getElementById("new-note-description-box").value;
  var date = current.toLocaleString();
  var tagId = document.getElementById('tag-name-editable').textContent;
  if (title === "" || description === "") {
    document.getElementById("save-warning-text").innerHTML = 'Title/ Description cannot be empty.';
  } else {
    if (notesDetails === 'null' || notesDetails === null) {
      notesDetails = {}
      notesDetails[newNoteIndex] = {title: title, date: date, description: description, tagId: tagId}
      console.log('notesDetails', notesDetails);
      localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
      document.getElementById("save-warning-text").innerHTML = 'Saved successfully.';
    }else {
      notesDetails[newNoteIndex] = {title: title, date: date, description: description, tagId: tagId}
      console.log('notesDetails', notesDetails);
      localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
      document.getElementById("save-warning-text").innerHTML = 'Saved successfully.';
    }
  }
  renderNoteCards();
}

function loadNotesDetails() {
  var notesDetails = localStorage.getItem('notesDetails');
  console.log('loadNotesDetails loading', notesDetails);
}

function handleRemoveAllNotes() {
  document.getElementById('remove-notes-warning').innerHTML = removeNotesWarning;
}

function removeAllnotes() {
  window.localStorage.removeItem('notesDetails');
  document.getElementById('remove-notes-warning').innerHTML = '';
  document.getElementById('new-note-container').innerHTML = createNewNoteInputForm
  renderNoteCards();
}
function dontRemoveAllNotes() {
  document.getElementById('remove-notes-warning').innerHTML = '';
}

function clearTitleError() {
  console.log('clearTitleError')
  document.getElementById("save-warning-text").innerHTML = 'You have unsaved changes.';
}
function showCardContent(ind) {
  var cardId = "card-" + ind
  var currentCard = document.getElementById(cardId);
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  var articleIndexes = Object.keys(notesDetails);
  articleIndexes.reverse();
  articleIndexes.forEach((id)=>{
    if (parseInt(id) === parseInt(ind)){
      currentCard.style.background = "#323232";
    } else {
      var checkCard = 'card-' + id;
      document.getElementById(checkCard).style.background = "#282828";
    }
  });
  var currentNote = notesDetails[ind];
  var noteContainer = document.getElementById("new-note-container");
  var cardDetails = `<div id="new-note-input-form" class="new-note-input-form"> 
                        <div id="icon-container" class="icon-container">
                          <i class="fas fa-pen" onclick="onClickEditNote(${ind})"></i>
                          <i class="fas fa-trash" onclick="onClickDeleteNote(${ind})"></i>
                          <div id="note-tag-editable" class="note-tag-editable">
                            <div class="tag-dot">
                              <span id="tag-dot-editable" class="dot-side-menu"></span>
                            </div>
                            <div id="tag-name-editable" class="tag-name">
                              ${currentNote.tagId}
                            </div>
                            <div id="dropdown-content" class="dropdown-content">
                            </div>
                          </div>
                          <i id="save-warning-text" class="save-warning-text"></i>
                        </div>
                        <div class="content-form-div">
                        <div id="new-note-title-div" class="title-box" placeholder="Title....." onkeyup="clearTitleError()" contentEditable="false">${currentNote.title}</div>
                        <div id="new-note-description-div" class="description-box" placeholder="Description....." onkeyup="clearTitleError()" contentEditable="false">${currentNote.description}</div>
                        </div>
                      </div>`
  noteContainer.innerHTML = '';
  noteContainer.innerHTML = cardDetails;
  var tagData = loadTagData();
  document.getElementById("tag-name-editable").style.color = tagData[currentNote.tagId].tag_color;
  document.getElementById("tag-dot-editable").style.backgroundColor = tagData[currentNote.tagId].tag_color;
}
function renderNoteCards() {
  console.log('renderNoteCards')
  var cardList = document.getElementById("notes-list");
  cardList.innerHTML = ''
  var notesDetails = localStorage.getItem('notesDetails');
  if (notesDetails === null){
    notesDetails = {}
  } else {
    notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  }
  var articleIndexes = Object.keys(notesDetails);
  articleIndexes.reverse();
  articleIndexes.forEach((id)=> {
    var ind = id;
    var title = notesDetails[id].title;
    var date = notesDetails[id].date;
    const noteCard = `<div id="card-${ind}" class="note-card" onclick="showCardContent(${ind})" >
                        <div class="note-card-title">
                          <div class="tag-dot">
                            <span class="dot"></span>
                          </div>
                          <div>${title}</div>
                        </div>
                        <div class="note-card-date">${date}</div>
                      </div>`
    cardList.innerHTML += noteCard;
  });
}

function onClickDeleteNote(ind) {
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  delete notesDetails[parseInt(ind)];
  localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
  onClickNewNoteBackButton();
}
function onClickEditNote(ind) {
  document.getElementById('new-note-title-div').contentEditable = true;
  document.getElementById('new-note-description-div').contentEditable = true;
  var iconContainer = document.getElementById("icon-container");
  const iconSet = `<i class="fas fa-angle-left" onclick= "onClickNewNoteBackButton()"></i>
                   <i class="fas fa-check" onclick="onClickCurrentNoteSave(${ind})" ></i>
                   <i class="fas fa-trash" onclick="onClickDeleteNote(${ind})"></i>
                   <div id="note-tag-editable" class="note-tag-editable">
                      <div class="tag-dot">
                        <span id="tag-dot-editable" class="dot-side-menu"></span>
                      </div>
                      <div id="tag-name-editable" class="tag-name">
                        All notes
                      </div>
                      <div id="dropdown-content" class="dropdown-content">
                      </div>
                   </div>
                   <i id="save-warning-text" class="save-warning-text"></i>
                  `
  iconContainer.innerHTML = iconSet
  var dropdownContent = document.getElementById("dropdown-content")
  var tagData = loadTagData();
  var tagDataIndexes = Object.keys(tagData);
  tagDataIndexes.reverse();
  tagDataIndexes.forEach((id)=> {
    var ind = id;
    var tagName = tagData[id].tag_name;
    var tagColor = tagData[id].tag_color;
    const drowdownItem = `<div id="tag" class="drop-down-item" onclick="changeNoteTag('${tagName}','${tagColor}')">
                            <div class="tag-dot">
                              <span id="drowdown-dot-${ind}" class="dot-side-menu"></span>
                            </div>
                            <div id="dropdown-name-${ind}" class="tag-name">
                              ${tagName}
                            </div>
                          </div>`
    dropdownContent.innerHTML += drowdownItem;
    document.getElementById('drowdown-dot-'+ind).style.backgroundColor = tagColor;
    document.getElementById('dropdown-name-'+ind).style.color = tagColor;
  });
}
function onClickCurrentNoteSave(ind){
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  var newNoteIndex = parseInt(ind);
  var title = document.getElementById("new-note-title-div").textContent
  var description = document.getElementById("new-note-description-div").textContent
  var date = notesDetails[newNoteIndex].date
  var tagId = document.getElementById('tag-name-editable').textContent;
  if (title === "" || description === "") {
    document.getElementById("save-warning-text").innerHTML = 'Title/ Description cannot be empty.';
  } else {
    notesDetails[newNoteIndex] = {title: title, date: date, description: description, tagId: tagId}
    localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
    document.getElementById("save-warning-text").innerHTML = 'Saved successfully.';
  }
  renderNoteCards();
}
const newNoteInputForm = `<div id="new-note-input-form" class="new-note-input-form">
                          <div class="icon-container">
                            <i class="fas fa-angle-left" onclick= "onClickNewNoteBackButton()"></i>
                            <i class="fas fa-check" onclick="onClickNewNoteSave()" ></i>
                            <div id="note-tag-editable" class="note-tag-editable">
                              <div class="tag-dot">
                                <span id="tag-dot-editable" class="dot-side-menu"></span>
                              </div>
                              <div id="tag-name-editable" class="tag-name">
                                All notes
                              </div>
                              <div id="dropdown-content" class="dropdown-content">
                              </div>
                            </div>
                            <i id="save-warning-text" class="save-warning-text"></i>
                          </div>
                          <div class="content-form">
                          <textarea id="new-note-title-box" class="title-box" placeholder="Title....." onkeyup="clearTitleError()"></textarea>
                          <textarea id="new-note-description-box" class="description-box" placeholder="Description....." onkeyup="clearTitleError()"></textarea>
                          </div>
                        </div>`

const createNewNoteInputForm =  '<div  class="new-note-image-container">' +
                                  '<i class="fas fa-plus" onclick= "onClickAddNoteButton()"></i>' +
                                  '<img class="add-note-image" src="./assets/images/add-note.png"/>' +
                                '</div>'

const removeNotesWarning = '<div class="remove-note-warning">' +
                            '<div class="warning-title">Are you sure you want to remove all notes permanently?</div>'+
                            '<div class="yes-no-container">'+
                              '<div class="yes-button" onclick="removeAllnotes()">Yes</div>'+
                              '<div class="no-button" onclick="dontRemoveAllNotes()">No</div>'+
                            '</div>'+
                           '</div>'

