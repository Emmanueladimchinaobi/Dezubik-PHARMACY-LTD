console.log("Palm Luxe Empire Admin Loaded");

const API_URL = "https://palm-luxe-empire.onrender.com/api/orders";

async function loadOrders() {

    const container = document.getElementById("orders");

    container.innerHTML = `
        <div class="text-center py-10 text-gray-500 text-lg">
            Loading orders...
        </div>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch orders.");
        }

        const orders = await response.json();

        container.innerHTML = "";

        if (orders.length === 0) {

            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-10 text-center">
                    <h2 class="text-2xl font-bold mb-2">
                        No Orders Yet
                    </h2>

                    <p class="text-gray-500">
                        Orders will appear here once customers place them.
                    </p>
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
                            alt="${item.name}"
                            class="w-20 h-20 rounded-lg object-cover"
                        >

                        <div class="flex-1">

                            <h3 class="font-bold text-lg">
                                ${item.name}
                            </h3>

                            <p>
                                Quantity: ${item.quantity}
                            </p>

                            <p class="font-semibold text-green-700">
                                ₦${(item.price || 0).toLocaleString()}
                            </p>

                        </div>

                    </div>
                `;
            });

            container.innerHTML += `

                <div class="bg-white shadow-lg rounded-xl p-6 mb-8">

                    <div class="flex flex-col md:flex-row justify-between gap-6">

                        <div>

                            <h2 class="text-2xl font-bold mb-3">
                                ${order.customerName}
                            </h2>

                            <p class="text-gray-700">
                                <strong>Email:</strong>
                                ${order.email}
                            </p>

                            <p class="text-gray-700">
                                <strong>Phone:</strong>
                                ${order.phone}
                            </p>

                            <p class="text-gray-700">
                                <strong>Address:</strong>
                                ${order.address}
                            </p>

                        </div>

                        <div class="text-left md:text-right">

                            <p class="text-gray-500">
                                Total Amount
                            </p>

                            <h2 class="text-3xl font-bold text-green-600">
                                ₦${(order.total || 0).toLocaleString()}
                            </h2>

                        </div>

                    </div>

                    <hr class="my-6">

                    <h3 class="text-xl font-bold mb-4">
                        Ordered Products
                    </h3>

                    ${itemsHTML}

                    <div class="flex flex-wrap gap-3 mt-6">

                        <span class="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                            Payment: ${order.paymentMethod}
                        </span>

                        <span class="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                            Status: ${order.status}
                        </span>

                    </div>

                    <div class="mt-6 text-sm text-gray-500">

                        Ordered on:

                        ${new Date(order.createdAt).toLocaleString()}

                    </div>
                    <button
    onclick="deleteOrder('${order._id}')"
    class="mt-6 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
>
    Delete Order
</button>

                </div>

            `;

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="bg-red-100 text-red-700 rounded-lg p-8 text-center">

                <h2 class="text-2xl font-bold mb-3">
                    Failed to load orders
                </h2>

                <p>${error.message}</p>

            </div>
        `;

    }

}

loadOrders();
async function deleteOrder(id) {

    const confirmDelete = confirm("Are you sure you want to delete this order?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `https://palm-luxe-empire.onrender.com/api/orders/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete order");
        }

        alert("Order deleted successfully.");

        loadOrders();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}