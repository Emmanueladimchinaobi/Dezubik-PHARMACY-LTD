const buttons = document.querySelectorAll(".add-cart");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        

       

        // Create product object
        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: Number(button.dataset.price),
            image: button.dataset.image,
            quantity: 1
        };

        // Get existing cart
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Check if SAME product  already exist
        const existing = cart.find(item =>
            item.id === product.id &&
            item.name === product.name
        );

        if (existing) {
            existing.quantity++;
        } else {
            cart.push(product);
        }

        // Save cart
        localStorage.setItem("cart", JSON.stringify(cart));

        // Update badge
        updateCartCount();

    });

});

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let count = 0;

    cart.forEach(item => {
        count += item.quantity;
    });

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = count;
    }

}

updateCartCount();



