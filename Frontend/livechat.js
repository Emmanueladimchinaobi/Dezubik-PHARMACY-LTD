// Create unique visitor ID
let visitorId = localStorage.getItem("visitorId");

if (!visitorId) {

    visitorId =
        "visitor_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 8);

    localStorage.setItem("visitorId", visitorId);
}


// Connect to backend
const socket = io("https://palm-luxe-empire.onrender.com");


// Socket connected
socket.on("connect", () => {

    console.log("Connected:", socket.id);

    socket.emit("join_room", visitorId);

});


// Elements
const chatBtn = document.getElementById("chat-btn");
const chatBox = document.getElementById("chat-box");
const closeBtn2 = document.getElementById("close-chat");
const navbar = document.getElementById("navbar");

const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

const defaultQuestions =
    document.getElementById("defaultQuestions");



 

// Open Chat
chatBtn.addEventListener("click", () => {

    chatBox.classList.remove("hidden");

    navbar.classList.add("hidden");

});


// Close Chat
closeBtn2.addEventListener("click", () => {

    chatBox.classList.add("hidden");

    navbar.classList.remove("hidden");

});


// ------------------------------------
// QUICK QUESTIONS
// ------------------------------------

const quickQuestions =
    document.querySelectorAll(".quick-question");


quickQuestions.forEach((button) => {

    button.addEventListener("click", () => {

        const question =
            button.dataset.message;

        // Remove default questions
        defaultQuestions.remove();

        // Send the question
        socket.emit("send_message", {

            visitorId,

            sender: "Customer",

            message: question

        });

    });

});


// ------------------------------------
// LOAD PREVIOUS MESSAGES
// ------------------------------------

socket.on("load_messages", (history) => {

    // If there are previous messages,
    // remove the default questions
    if (history.length > 0) {

        defaultQuestions.remove();

    }

    // Add previous messages
    history.forEach((msg) => {

        addMessage(
            msg.sender,
            msg.message
        );

    });

});


// ------------------------------------
// SEND BUTTON
// ------------------------------------

sendBtn.addEventListener("click", sendMessage);


// ------------------------------------
// PRESS ENTER
// ------------------------------------

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});


// ------------------------------------
// SEND MESSAGE FUNCTION
// ------------------------------------

function sendMessage() {

    const text = input.value.trim();

    if (!text) return;


    console.log("Visitor:", visitorId);

    console.log("Sending:", text);


    // Remove default questions
    if (document.getElementById("defaultQuestions")) {

        document
            .getElementById("defaultQuestions")
            .remove();

    }


    socket.emit("send_message", {

        visitorId,

        sender: "Customer",

        message: text

    });


    input.value = "";

}


// ------------------------------------
// RECEIVE NEW MESSAGE
// ------------------------------------

socket.on("receive_message", (msg) => {

    console.log("Received:", msg);

    addMessage(
        msg.sender,
        msg.message
    );

});


// ------------------------------------
// ADD MESSAGE TO CHAT
// ------------------------------------

function addMessage(sender, text) {

    const div =
        document.createElement("div");


    if (sender === "Customer") {

        div.className =
            "bg-pink-600 text-white rounded-lg px-3 py-2 mb-2 ml-auto max-w-[80%] w-fit";

    } else {

        div.className =
            "bg-gray-200 text-black rounded-lg px-3 py-2 mb-2 mr-auto max-w-[80%] w-fit";

    }


    div.innerHTML = `
        <strong>${sender}</strong><br>
        ${text}
    `;


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;

}