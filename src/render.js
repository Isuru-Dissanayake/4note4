const { desktopCapturer, remote, ipcRenderer, BrowserWindow } = require('electron');
const { writeFile } = require('fs');
const { get } = require('https');
const { dialog, Menu } = remote;

window.onload = function() {
  loadNotesDetails();
  renderQuickLinks();
  renderQuickLinkNotes('All notes');
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
  var tagData = JSON.parse(localStorage.getItem('tagData'));
  if (tagData === null || tagData === 'null') {
    tagData = {"All notes":{tag_name: "All notes", tag_color: "#ffffff"}}
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
  console.log('taggggggggg', tagId);
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
  renderQuickLinkNotes(tagId);
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
  renderQuickLinkNotes('All notes');
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
    } else{
      var checkCard = 'card-' + id;
      var cardAvailable = document.getElementById(checkCard);
      if (cardAvailable) {
        document.getElementById(checkCard).style.background = "#282828";
      }
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
                        <textarea id="new-note-description-div" class="description-box" placeholder="Description....." onkeyup="clearTitleError()" readOnly>${currentNote.description}</textarea>
                        </div>
                      </div>`
  noteContainer.innerHTML = '';
  noteContainer.innerHTML = cardDetails;
  var tagData = loadTagData();
  document.getElementById("tag-name-editable").style.color = tagData[currentNote.tagId].tag_color;
  document.getElementById("tag-dot-editable").style.backgroundColor = tagData[currentNote.tagId].tag_color;
}
function renderNoteCards(tagType) {
  console.log('renderNoteCards')
  document.getElementById('note-container-title').innerHTML = tagType;
  var cardList = document.getElementById("notes-list");
  cardList.innerHTML = ''
  var tagData = loadTagData();
  console.log('tagdata', tagData)
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
    var tagId = notesDetails[id].tagId;
    if (tagType === 'All notes') {
      const noteCard = `<div id="card-${ind}" class="note-card" onclick="showCardContent(${ind})" >
                        <div class="note-card-title">
                          <div class="tag-dot">
                            <span id="card-dot-${ind}" class="dot"></span>
                          </div>
                          <div>${title}</div>
                        </div>
                        <div class="note-card-date">${date}</div>
                      </div>`
      cardList.innerHTML += noteCard;
      console.log('tag color',tagData[tagId].tag_color);
      document.getElementById('card-dot-' + ind).style.backgroundColor = tagData[tagId].tag_color;
    } else if(tagId === tagType) {
      const noteCard = `<div id="card-${ind}" class="note-card" onclick="showCardContent(${ind})" >
                        <div class="note-card-title">
                          <div class="tag-dot">
                            <span id="card-dot-${ind}" class="dot"></span>
                          </div>
                          <div>${title}</div>
                        </div>
                        <div class="note-card-date">${date}</div>
                      </div>`
      cardList.innerHTML += noteCard;
      document.getElementById('card-dot-' + ind).style.backgroundColor = tagData[tagId].tag_color;
    }
  });
}

function onClickDeleteNote(ind) {
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  var tagInd = notesDetails[ind].tagId;
  delete notesDetails[parseInt(ind)];
  localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
  renderQuickLinkNotes(tagInd);
}
function onClickEditNote(ind) {
  document.getElementById('new-note-title-div').contentEditable = true;
  document.getElementById('new-note-description-div').readOnly = false;
  var iconContainer = document.getElementById("icon-container");
  const iconSet = `<i class="fas fa-angle-left" onclick= "onClickNewNoteBackButton()"></i>
                   <i class="fas fa-check" onclick="onClickCurrentNoteSave(${ind})" ></i>
                   <i class="fas fa-trash" onclick="onClickDeleteNote(${ind})"></i>
                   <div id="note-tag-editable" class="note-tag-editable">
                      <div class="tag-dot">
                        <span id="tag-dot-editable" class="dot-side-menu"></span>
                      </div>
                      <div id="tag-name-editable" class="tag-name">All notes</div>
                      <div id="dropdown-content" class="dropdown-content">
                      </div>
                   </div>
                   <i id="save-warning-text" class="save-warning-text"></i>
                  `
  iconContainer.innerHTML = iconSet
  var dropdownContent = document.getElementById("dropdown-content")
  var tagData = loadTagData();
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  document.getElementById('tag-name-editable').innerHTML = notesDetails[ind].tagId;
  document.getElementById('tag-name-editable').style.color = tagData[notesDetails[ind].tagId].tag_color;
  document.getElementById('tag-dot-editable').style.backgroundColor = tagData[notesDetails[ind].tagId].tag_color;
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
  var description = document.getElementById("new-note-description-div").value
  var date = notesDetails[newNoteIndex].date
  var tagId = document.getElementById('tag-name-editable').textContent;
  if (title === "" || description === "") {
    document.getElementById("save-warning-text").innerHTML = 'Title/ Description cannot be empty.';
  } else {
    notesDetails[newNoteIndex] = {title: title, date: date, description: description, tagId: tagId}
    localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
    document.getElementById("save-warning-text").innerHTML = 'Saved successfully.';
  }
  renderQuickLinkNotes(tagId);
}
function renderQuickLinks() {
  quickLinkContent = document.getElementById('quick-links-container');
  quickLinkContent.innerHTML = `<div id="quick-links-title" class="quick-links-title">
                                  Quick Links
                                  <i class="fas fa-plus quick-link-edit" onclick="manageQuickLinks()"></i>
                                </div>`
  var tagData = loadTagData();
  var tagDataIndexes = Object.keys(tagData);
  tagDataIndexes.forEach((id)=> {
    var ind = id;
    var tagName = tagData[id].tag_name;
    var tagColor = tagData[id].tag_color;
    const drowdownItem = `<div id="quick-link-tag-${ind}" class="quick-link-tag" onclick="renderQuickLinkNotes('${ind}')">
                            <div class="tag-dot">
                              <i id="quick-link-tag-dot-${ind}" class="fas fa-tag"></i>
                            </div>
                            <div id="quick-link-tag-name-${ind}" class="tag-name">
                              ${tagName}
                            </div>
                          </div>`
    quickLinkContent.innerHTML += drowdownItem;
    document.getElementById('quick-link-tag-dot-'+ind).style.color = tagColor;
  });
  renderQuickLinkNotes('All notes');
}
function renderQuickLinkNotes(ind) {
  var tagData = loadTagData();
  var tagDataIndexes = Object.keys(tagData);
  tagDataIndexes.forEach((id)=>{
    if (id === ind) {
      document.getElementById("quick-link-tag-" + id).style.backgroundColor = '#323232';
    } else {
      document.getElementById("quick-link-tag-" + id).style.backgroundColor = '#1f1f1f';
    }
  });
  renderNoteCards(ind);
}
function manageQuickLinks(){
  const manageQuickLinks = `<div class="manage-quick-links-div"><div class="manage-quick-links-title">Manage Quick Links</div><div id="manage-quick-links" class="manage-quick-links-list"></div></div>`
  document.getElementById("new-note-container").innerHTML = manageQuickLinks;
  var manageQuickLinksDiv = document.getElementById('manage-quick-links')
  var tagData = loadTagData();
  var tagDataIndexes = Object.keys(tagData);
  tagDataIndexes.forEach((id)=> {
    var ind = id;
    if (ind !== 'All notes'){
      var tagName = tagData[id].tag_name;
      var tagColor = tagData[id].tag_color;
      const manageTag = `<div id="manage-quick-link-tag-${ind}" class="manage-quick-link-tag">
                          <div class="tag-dot">
                            <i id="manage-quick-link-tag-dot-${ind}" class="fas fa-tag"></i>
                          </div>
                          <div id="quick-link-tag-name-${ind}" class="tag-name">
                            ${tagName}
                          </div>
                          <i class="fas fa-trash quick-link-delete" onclick="deleteQuickLink('${ind}')"></i>
                        </div>`
      manageQuickLinksDiv.innerHTML += manageTag;
      document.getElementById('manage-quick-link-tag-dot-'+ind).style.color = tagColor;
    }
  });
  manageQuickLinksDiv.innerHTML += `<div id="quick-link-add-div" class="quick-link-add-div"><i class="fas fa-plus quick-link-add" onclick="handleAddQuickLink()"></i><div>`
}
function deleteQuickLink(ind){
  var tagData = loadTagData();
  var notesDetails = JSON.parse(localStorage.getItem('notesDetails'));
  var articleIndexes = Object.keys(notesDetails);
  articleIndexes.reverse();
  articleIndexes.forEach((id)=> {
    var tagId = notesDetails[id].tagId;
    if (tagId == ind) {
      console.log('inside if', ind)
      notesDetails[id].tagId = 'All notes';
    }
  });
  delete tagData[ind];
  localStorage.setItem('tagData', JSON.stringify(tagData));
  localStorage.setItem('notesDetails', JSON.stringify(notesDetails));
  manageQuickLinks();
  renderQuickLinks();
}
function handleAddQuickLink(){
  document.getElementById('quick-link-add-div').innerHTML = `<div id="manage-quick-link-tag-new" class="manage-quick-link-tag">
                                                              <div class="tag-dot-new">
                                                              <input type="color" id="tag-color-pick" class="tag-color-pick" value="#ffffff">
                                                              </div>
                                                              <input type="text" id="quick-link-tag-name-new" class="tag-name-new" autoFocus placeholder="Tag Name"><//input>
                                                              <i class="fas fa-check quick-link-check" onclick="addNewQuickLink()"></i>
                                                              <i class="fas fa-times quick-link-times" onclick="closeAddQuickLink()"></i>
                                                            </div>`
}
function closeAddQuickLink(){
  document.getElementById('quick-link-add-div').innerHTML = `<div id="quick-link-add-div" class="quick-link-add-div"><i class="fas fa-plus quick-link-add" onclick="handleAddQuickLink()"></i><div>`
}
function addNewQuickLink(){
  var tagColor = document.getElementById("tag-color-pick").value;
  var tagName = document.getElementById("quick-link-tag-name-new").value;
  var tagData = loadTagData();
  if (tagName !== '') {
    tagData[tagName] = {tag_name: tagName, tag_color: tagColor}
  }
  localStorage.setItem('tagData', JSON.stringify(tagData));
  manageQuickLinks();
  renderQuickLinks();
}
const newNoteInputForm = `<div id="new-note-input-form" class="new-note-input-form">
                          <div class="icon-container">
                            <i class="fas fa-angle-left" onclick= "onClickNewNoteBackButton()"></i>
                            <i class="fas fa-check" onclick="onClickNewNoteSave()" ></i>
                            <div id="note-tag-editable" class="note-tag-editable">
                              <div class="tag-dot">
                                <span id="tag-dot-editable" class="dot-side-menu"></span>
                              </div>
                              <div id="tag-name-editable" class="tag-name">All notes</div>
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

const quickLinkTag = `<div class="all-notes">
                        <div class="tag-dot">
                          <span class="dot-side-menu"></span>
                        </div>
                        <div class="tag-name">
                          All notes
                        </div>
                      </div>`