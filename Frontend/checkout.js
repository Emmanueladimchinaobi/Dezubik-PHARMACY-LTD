// Display order summary
const summary = document.getElementById("order-summary");

const subtotal = document.getElementById("subtotal");

const grandTotal = document.getElementById("grand-total");


const cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

if(cart.length === 0){

    summary.innerHTML = `
        <p class="text-center text-gray-500">
            No items in cart.
        </p>
    `;

}

cart.forEach(item => {

    const itemTotal = item.price * item.quantity;

    total += itemTotal;

    summary.innerHTML += `

    <div class="flex flex-col md:flex-row gap-4 mb-6 border-b pb-6 ">

        <img
            src="${item.image}"
            class="w-24 h-24 rounded-lg object-cover"
        >

        <div class="flex-1">

            <h3 class="font-bold text-sm">
                ${item.name}
            </h3>

            

            <p class="">
                Quantity: ${item.quantity}
            </p>

            <p class="font-semibold">
                ₦${item.price.toLocaleString()}
            </p>

        </div>

        <div class="font-bold text-lg">

            ₦${itemTotal.toLocaleString()}

        </div>

    </div>

    `;

});



grandTotal.textContent =
"₦" + total.toLocaleString();




// Bank transfer functionality
const copyButton = document.getElementById("copyAccount");

if (copyButton) {
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText("1010595537");
        alert("Account number copied!");
    });
}

const confirmButton = document.getElementById("confirmPayment");

if (confirmButton) {
    confirmButton.addEventListener("click", () => {
        alert("Thank you! We'll confirm your payment shortly.");
    });
}

const placeOrderBtn = document.getElementById("placeOrder");

if (placeOrderBtn) {

    placeOrderBtn.addEventListener("click", async () => {

        // Disable the button immediately
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = "Placing Order...";

        const customerName = document.getElementById("customerName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        if (!customerName || !email || !phone || !address) {

            alert("Please fill in all customer details.");

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";

            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {

            alert("Your cart is empty.");

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";

            return;
        }

        const total = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const order = {
            customerName,
            email,
            phone,
            address,
            items: cart,
            total,
            paymentMethod: "Bank Transfer"
        };

        try {

            const response = await fetch("https://dezubik-pharmacy-ltd.onrender.com/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("Order placed successfully!");

            localStorage.removeItem("cart");

            window.location.href = "index.html";

        } catch (error) {

            console.error(error);

            alert(error.message);

            // Re-enable button if order fails
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
        }

    });

}