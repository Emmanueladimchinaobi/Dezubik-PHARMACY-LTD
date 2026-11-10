function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

document.addEventListener("DOMContentLoaded", updateCartCount);