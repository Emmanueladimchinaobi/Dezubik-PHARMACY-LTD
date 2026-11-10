let selectedVisitor = null;
let allMessages = [];

const customerList = document.getElementById("customer-list");
const messages = document.getElementById("messages");
const input = document.getElementById("admin-input");
const send = document.getElementById("admin-send");

const socket = io("https://palm-luxe-empire.onrender.com");

// Wait until connected
socket.on("connect", () => {

    console.log("Admin Connected:", socket.id);

    socket.emit("admin_load");

});

// Load all conversations
socket.on("admin_history", (history) => {

    allMessages = history || [];

    renderCustomerList();

});

// Receive new message
socket.on("admin_new_message", (msg) => {

    allMessages.push(msg);

    renderCustomerList();

    if (selectedVisitor === msg.visitorId) {

        addMessage(msg.sender, msg.message);

    }

});

// Render sidebar
function renderCustomerList() {

    customerList.innerHTML = "";

    const visitors = [...new Set(allMessages.map(m => m.visitorId))];

    visitors.forEach(visitorId => {

        const div = document.createElement("div");

        div.className =
            "p-4 border-b cursor-pointer hover:bg-gray-100";

        div.innerHTML = `👤 ${visitorId}`;

        div.onclick = () => {

            selectVisitor(visitorId);

        };

        customerList.appendChild(div);

    });

}

// Open conversation
function selectVisitor(visitorId) {

    selectedVisitor = visitorId;

    messages.innerHTML = "";

    const conversation = allMessages.filter(

        msg => msg.visitorId === visitorId

    );

    conversation.forEach(msg => {

        addMessage(msg.sender, msg.message);

    });

}

// Display message
function addMessage(sender, text) {

    const div = document.createElement("div");

    if (sender === "Support") {

        div.className =
            "bg-pink-600 text-white p-3 rounded-lg ml-auto mb-3 max-w-[70%] w-fit";

    } else {

        div.className =
            "bg-gray-300 text-black p-3 rounded-lg mr-auto mb-3 max-w-[70%] w-fit";

    }

    div.innerHTML = `
        <strong>${sender}</strong><br>
        ${text}
    `;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}

// Send reply
send.addEventListener("click", sendReply);

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendReply();

    }

});

function sendReply() {

    const text = input.value.trim();

    if (!text) return;

    if (!selectedVisitor) {

        alert("Please select a customer.");

        return;

    }

    socket.emit("send_message", {

        visitorId: selectedVisitor,

        sender: "Support",

        message: text

    });

    // Show immediately
    addMessage("Support", text);

    // Save locally
    allMessages.push({

        visitorId: selectedVisitor,

        sender: "Support",

        message: text

    });

    input.value = "";

}