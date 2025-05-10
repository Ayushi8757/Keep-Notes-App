let notes = JSON.parse(localStorage.getItem("notes")) || [];
let deletedNote = null;
let deleteTimeout = null;

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("active");
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addNote() {
  const note = {
    id: Date.now(),
    title: "Untitled Note",
    content: "",
    date: new Date().toISOString(),
    pinned: false,
    archived: false,
  };
  notes.unshift(note);
  saveNotes();
  renderNotes();
  document.querySelector(`#note-${note.id} .note-title`).focus();
}

function updateNote(id, title, content) {
  const note = notes.find((note) => note.id === id);
  if (note) {
    note.title = title;
    note.content = content;
    note.date = new Date().toISOString();
    saveNotes();
  }
}

function deleteNote(id) {
  deletedNote = notes.find((note) => note.id === id);
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes();
  showSnackbar();
  deleteTimeout = setTimeout(() => {
    deletedNote = null;
  }, 4000);
}

function undoDelete() {
  if (deletedNote) {
    notes.unshift(deletedNote);
    deletedNote = null;
    saveNotes();
    renderNotes();
    clearTimeout(deleteTimeout);
  }
  hideSnackbar();
}

function togglePin(id) {
  const note = notes.find((note) => note.id === id);
  if (note) {
    note.pinned = !note.pinned;
    saveNotes();
    renderNotes();
  }
}

function toggleArchive(id) {
  const note = notes.find((note) => note.id === id);
  if (note) {
    note.archived = !note.archived;
    saveNotes();
    renderNotes();
  }
}

function renderNotes() {
  const notesGrid = document.getElementById("notesGrid");
  const showArchived = document.getElementById("showArchived")?.checked;
  notesGrid.innerHTML = "";

  const visibleNotes = notes.filter((note) =>
    showArchived ? note.archived : !note.archived
  );

  if (visibleNotes.length === 0) {
    notesGrid.innerHTML = `
      <div class="empty-state">
        <h2>No ${showArchived ? "archived" : ""} notes</h2>
        <p>${
          showArchived
            ? "Your archived notes will appear here."
            : 'Click the "New Note" button to create one!'
        }</p>
      </div>
    `;
    return;
  }

  const sortedNotes = [...visibleNotes].sort((a, b) => b.pinned - a.pinned);

  sortedNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.className = "note";
    noteElement.id = `note-${note.id}`;
    noteElement.innerHTML = `
      <input type="text" class="note-title" value="${note.title}" 
          onchange="updateNote(${note.id}, this.value, this.nextElementSibling.value)">
      <textarea class="note-content" 
          onchange="updateNote(${note.id}, this.previousElementSibling.value, this.value)">${note.content}</textarea>
      <div class="note-footer">
        <span class="note-date">Last edited ${formatDate(note.date)}</span>
        <div class="note-actions">
          <button class="action-btn" onclick="togglePin(${note.id})">
            ${note.pinned ? "Unpin" : "Pin"}
          </button>
          <button class="action-btn" onclick="toggleArchive(${note.id})">
            ${note.archived ? "Unarchive" : "Archive"}
          </button>
          <button class="action-btn" onclick="deleteNote(${note.id})">Delete</button>
        </div>
      </div>
    `;
    notesGrid.appendChild(noteElement);
  });
}

function searchNotes(query) {
  const searchTerm = query.toLowerCase();
  const noteElements = document.querySelectorAll(".note");

  noteElements.forEach((noteEl) => {
    const title = noteEl.querySelector(".note-title").value.toLowerCase();
    const content = noteEl.querySelector(".note-content").value.toLowerCase();
    const isVisible =
      title.includes(searchTerm) || content.includes(searchTerm);
    noteEl.style.display = isVisible ? "block" : "none";
  });
}

function showSnackbar() {
  const snackbar = document.getElementById("snackbar");
  snackbar.className = "show";
}

function hideSnackbar() {
  const snackbar = document.getElementById("snackbar");
  snackbar.className = snackbar.className.replace("show", "");
}

document.querySelector(".search-input").addEventListener("input", (e) => {
  searchNotes(e.target.value);
});

renderNotes();
