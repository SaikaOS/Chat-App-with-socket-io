const socket = io("http://localhost:3000");
const form = document.querySelector("form");
const messageInput = document.querySelector(".text");
const messageDiv = document.getElementById("messages");
const uploadFile = document.getElementById("file");
const nameUser = prompt("What is your name?");

appendMessages("You joined");
socket.emit("new-user", nameUser);

socket.on("chat-message", (data) => {
  appendMessages(`${data.name}:${data.message}`);
});

socket.on("user-conntected", (name) => {
  appendMessages(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessages(`${name} disconnected`);
});

socket.on("base64 image", (msg) => {
  const img = document.createElement("img");
  img.src = msg.file;
  messageDiv.append(img);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessages(`You: ${message}`);
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

uploadFile.addEventListener("change", function (e) {
  let data = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (evt) {
    let msg = {};
    msg.file = evt.target.result;
    msg.fileName = data.name;
    socket.emit("base64 file", msg);
  };
  reader.readAsDataURL(data);
});

function appendMessages(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageDiv.append(messageElement);
}

const dropZoneElement = uploadFile.closest(".chat");

dropZoneElement.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZoneElement.addEventListener("drop", (e) => {
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    uploadFile.files = e.dataTransfer.files;
    updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
  }
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    messageDiv.appendChild(thumbnailElement);
  }

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  }
}
