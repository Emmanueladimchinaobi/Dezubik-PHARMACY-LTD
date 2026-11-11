console.log("Admin Dashboard Loaded");

const BACKEND =
    "https://dezubik-pharmacy-ltd.onrender.com";


// ==========================================
// ORDERS
// ==========================================

async function loadOrders() {

    try {

        const response = await fetch(
            `${BACKEND}/api/orders`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch orders"
            );

        }

        const orders =
            await response.json();

        const container =
            document.getElementById("orders");

        container.innerHTML = "";


        if (orders.length === 0) {

            container.innerHTML = `

                <div class="bg-white shadow rounded-lg p-8 text-center">

                    <h2 class="text-2xl font-bold">
                        No Orders Yet
                    </h2>

                </div>

            `;

            return;

        }


        orders.forEach(order => {

            let itemsHTML = "";


            order.items.forEach(item => {

                itemsHTML += `

                    <div class="flex gap-4 border rounded-lg p-4 mt-4">

                        <img
                            src="${item.image}"
                            class="w-35 h-35 rounded object-cover"
                            alt="${item.name}"
                        >

                        <div class="flex-1">

                            <h3 class="font-bold text-lg">
                                ${item.name}
                            </h3>

                            <p>
                                Size: ${item.size}
                            </p>

                            <p>
                                Colour: ${item.colour}
                            </p>

                            <p>
                                Quantity: ${item.quantity}
                            </p>

                            <p class="font-semibold">
                                ₦${item.price.toLocaleString()}
                            </p>

                        </div>

                    </div>

                `;

            });


            container.innerHTML += `

                <div class="bg-white shadow-lg rounded-xl p-6 mb-8">

                    <div class="flex justify-between items-start">

                        <div>

                            <h2 class="text-2xl font-bold">
                                ${order.customerName}
                            </h2>

                            <p class="text-gray-600">
                                ${order.phone}
                            </p>

                            <p class="text-gray-600">
                                ${order.address}
                            </p>

                            <p class="text-gray-600">
                                ${order.state}
                            </p>

                        </div>


                        <div class="text-right">

                            <p class="font-semibold">
                                Total
                            </p>

                            <h2 class="text-3xl font-bold text-green-600">
                                ₦${order.total.toLocaleString()}
                            </h2>

                        </div>

                    </div>


                    ${itemsHTML}


                    <div class="mt-6 flex flex-wrap gap-3">

                        <span class="bg-yellow-200 px-4 py-2 rounded-full font-medium">
                            Payment: ${order.paymentStatus}
                        </span>

                        <span class="bg-blue-200 px-4 py-2 rounded-full font-medium">
                            Order: ${order.orderStatus}
                        </span>

                    </div>


                    <div class="mt-6 text-sm text-gray-500">

                        Ordered on:
                        ${new Date(
                            order.createdAt
                        ).toLocaleString()}

                    </div>

                </div>

            `;

        });

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "orders"
        ).innerHTML = `

            <div class="bg-red-100 text-red-700 p-6 rounded-lg">

                Failed to load orders.

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


// ==========================================
// ADMIN CHAT
// ==========================================

const socket =
    io(BACKEND);


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
