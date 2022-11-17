const socket = io();
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chat-box");
const feedback = document.getElementById("feedback");
const onlineUsers = document.getElementById("online-users-list");
const chatConatainer = document.getElementById("chatConatainer");
const nickname = localStorage.getItem("nickname");
const room = localStorage.getItem("room");
const modalTitle = document.getElementById("modalTitle");
const pvChatMessage = document.getElementById("pvChatMessage");
const pvChatForm = document.getElementById("pvChatForm");
const pvMessageInput = document.getElementById("pvMessageInput");


socket.emit("login", {
    nickname,
    room
})
let socketId;
//Listeners

socket.on("online", data => {
    onlineUsers.innerHTML = "";
    for (let value in data) {
        if (room === data[value].room) {

            onlineUsers.innerHTML += `
            <li>
            <button data-toggle="modal" data-target="#pvChat" data-id=${value} 
            data-client=${data[value].nickname} 
            class="alert ${value===socket.id ? 'alert-success' : 'alert-light'} p-1 mx-2"
             ${value===socket.id ? 'disabled' : ''}>
            ${data[value].nickname}
            <span class="badge badge-success"> </span>
            </button>
            </li>
            `;
        }
    };
})
socket.on("chat message", data => {
    chatBox.innerHTML += `
    <li class="alert alert-light">
    <span
        class="text-dark font-weight-normal"
        style="font-size: 13pt"
        >${data.nickname}</span
    >
    <span
        class="
            text-muted
            font-italic font-weight-light
            m-2
        "
        style="font-size: 9pt"
        >ساعت 12:00</span
    >
    <p
        class="alert alert-info mt-2"
        style="font-family: persian01"
    >
    ${data.message}
    </p>
</li>
    `
    feedback.innerHTML = "";
    chatConatainer.scrollTop = chatConatainer.scrollHeight - chatConatainer.clientHeight;
})
socket.on("typing", data => {
    feedback.innerHTML = `<div class="alert alert-warning w-25">${data.nickname} is typing</div>`
})
socket.on("pvChat", data => {
    $("#pvChat").modal("show");
    modalTitle.innerHTML = `دریافت پیام از طرف: ${data.nickname}`;
    pvChatMessage.style.display = "block";
    pvChatMessage.innerHTML = data.message;
    socketId = data.from;

})
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (messageInput.value !== "") {
        socket.emit("chat message", {
            message: messageInput.value,
            socketId: socket.id,
            nickname,
            room
        })
    }
    messageInput.value = "";
})
messageInput.addEventListener("keypress", () => {
    socket.emit("typing", {
        socketId: socket.id,
        nickname,
        room
    })
})
$("#pvChat").on("show.bs.modal", function(e) {
    var button = $(e.relatedTarget);
    var user = button.data("client");
    socketId = button.data("id");

    modalTitle.innerHTML = `ارسال پیام شخصی به: ${user}`;
})

pvChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (pvMessageInput.value !== "") {
        socket.emit("send message", {
            message: pvMessageInput.value,
            to: socketId,
            from: socket.id,
            nickname,
            room
        })
    }

    $("#pvChat").modal("hide");
    pvMessageInput.value = "";

})