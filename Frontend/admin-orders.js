console.log("Admin Dashboard Loaded");



// ==========================================
// ORDERS
// ==========================================


async function loadOrders() {

    const container = document.getElementById("orders");

    container.innerHTML = "<p>Connecting to orders server...</p>";

    try {

        const response = await fetch(
            `${BACKEND}/api/orders`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        console.log("ORDERS HTTP STATUS:", response.status);

        const responseText = await response.text();

        console.log("ORDERS RAW RESPONSE:", responseText);

        let orders;

        try {
            orders = JSON.parse(responseText);
        } catch {
            throw new Error("Backend did not return valid JSON.");
        }

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${
                    orders.message || "Orders request rejected"
                }`
            );
        }

        if (!Array.isArray(orders)) {
            throw new Error("Orders response is not an array.");
        }

        console.log("ORDERS RECEIVED:", orders.length);

        container.innerHTML = "";

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="bg-white shadow rounded-lg p-8 text-center">
                    <h2 class="text-2xl font-bold">No Orders Yet</h2>
                </div>
            `;
            return;
        }

        // Reuse your existing order rendering logic here.
        orders.forEach(order => {

            let itemsHTML = "";

            (order.items || []).forEach(item => {

                itemsHTML += `
                    <div class="flex gap-4 border rounded-lg p-4 mt-4">
                        <img
                            src="${escapeHTML(item.image || "")}"
                            class="w-24 h-24 rounded object-cover"
                            alt="${escapeHTML(item.name || "Product")}"
                        >

                        <div>
                            <h3 class="font-bold">
                                ${escapeHTML(item.name || "")}
                            </h3>

                            <p>Quantity: ${Number(item.quantity) || 0}</p>

                            <p>
                                ₦${(Number(item.price) || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                `;
            });

            const card = document.createElement("div");

            card.className =
                "bg-white shadow-lg rounded-xl p-6 mb-8";

            card.innerHTML = `
                <h2 class="text-2xl font-bold">
                    ${escapeHTML(order.customerName || "")}
                </h2>

                <p>${escapeHTML(order.phone || "")}</p>
                <p>${escapeHTML(order.address || "")}</p>
                <p>${escapeHTML(order.state || "")}</p>

                <h2 class="text-2xl font-bold text-green-600 mt-4">
                    ₦${(Number(order.total) || 0).toLocaleString()}
                </h2>

                ${itemsHTML}

                <p class="mt-4 text-gray-500">
                    Ordered on:
                    ${order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Unknown"}
                </p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error("ORDERS FETCH ERROR:", error);

        container.innerHTML = `
            <div class="bg-red-100 text-red-700 p-6 rounded-lg">
                <h3 class="font-bold">Failed to load orders</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

    }
}


// ==========================================
// ADMIN CHAT
// ==========================================

const socket = io(BACKEND, {
    withCredentials: true
});
socket.on("admin_auth_error", () => {
    alert("Your admin session has expired. Please log in again.");
    window.location.reload();
});

let messages = [];

let selectedVisitorId = null;


// ==========================================
// CONNECT ADMIN
// ==========================================

socket.on("connect", () => {

    console.log(
        "Admin connected:",
        socket.id
    );

    socket.emit("admin_load");

});


// ==========================================
// LOAD MESSAGE HISTORY
// ==========================================

socket.on(
    "admin_history",
    history => {

        console.log(
            "Message history:",
            history
        );

        messages = history || [];

        renderMessages();

    }
);


// ==========================================
// NEW MESSAGE
// ==========================================

socket.on(
    "admin_new_message",
    message => {

        console.log(
            "New message:",
            message
        );

        messages.push(message);

        renderMessages();

    }
);


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function renderMessages() {

    const container =
        document.getElementById(
            "admin-messages"
        );


    if (!container) return;


    if (messages.length === 0) {

        container.innerHTML = `

            <p class="text-gray-500 text-center">
                No messages yet.
            </p>

        `;

        return;

    }


    container.innerHTML = `

        <div
            id="message-list"
            class="space-y-3 max-h-[500px] overflow-y-auto mb-4">

        </div>


        <div class="border-t pt-4">

            <p
                id="selected-customer"
                class="text-sm text-gray-500 mb-2">

                Select a customer message to reply.

            </p>


            <div class="flex gap-2">

                <input
                    id="admin-message-input"
                    type="text"
                    placeholder="Type your reply..."
                    class="flex-1 border rounded-lg p-3 text-black"
                >


                <button
                    id="admin-send-btn"
                    class="bg-black text-white px-5 py-3 rounded-lg">

                    Send

                </button>

            </div>

        </div>

    `;


    const list =
        document.getElementById(
            "message-list"
        );


    messages.forEach(message => {

        const div =
            document.createElement("div");


        const isAdmin =
            message.sender === "Admin";


        div.className =
            isAdmin
                ? "bg-black text-white p-3 rounded-lg ml-auto max-w-[80%]"
                : "bg-gray-100 text-black p-3 rounded-lg max-w-[80%]";


        div.innerHTML = `

            <div class="font-bold">

                ${escapeHTML(
                    message.sender
                )}

            </div>


            <div>

                ${escapeHTML(
                    message.message
                )}

            </div>


            <div class="text-xs opacity-60 mt-1">

                ${message.visitorId || ""}

            </div>

        `;


        div.addEventListener(
            "click",
            () => {

                selectedVisitorId =
                    message.visitorId;


                const selected =
                    document.getElementById(
                        "selected-customer"
                    );


                if (selected) {

                    selected.textContent =
                        `Replying to: ${selectedVisitorId}`;

                }

            }
        );


        list.appendChild(div);

    });


    const sendBtn =
        document.getElementById(
            "admin-send-btn"
        );


    const input =
        document.getElementById(
            "admin-message-input"
        );


    sendBtn.addEventListener(
        "click",
        sendAdminMessage
    );


    input.addEventListener(
        "keypress",
        event => {

            if (event.key === "Enter") {

                sendAdminMessage();

            }

        }
    );

}


// ==========================================
// SEND ADMIN MESSAGE
// ==========================================

function sendAdminMessage() {

    const input =
        document.getElementById(
            "admin-message-input"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    if (!selectedVisitorId) {

        alert(
            "Click a customer message first."
        );

        return;

    }


    socket.emit(
        "send_message",
        {

            visitorId:
                selectedVisitorId,

            sender:
                "Admin",

            message:
                text

        }
    );


    input.value = "";

}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ==========================================
// START
// ==========================================

loadOrders();
