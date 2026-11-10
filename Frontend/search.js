
document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (!searchInput || !searchResults) return;

    let allProducts = [];

    // LOAD PRODUCTS FROM INDEX.HTML
    async function loadProducts() {

        try {

            const response = await fetch("./index.html");

            if (!response.ok) {
                throw new Error("Could not load products");
            }

            const html = await response.text();

            const parser = new DOMParser();

            const documentPage = parser.parseFromString(
                html,
                "text/html"
            );

            const productCards =
                documentPage.querySelectorAll(".product-card");

            allProducts = Array.from(productCards).map(
                (product, index) => {

                    const button = product.querySelector(".add-cart");

                    const name =
                        button?.dataset.name ||
                        product.querySelector("h3")?.innerText
                            .replace(/\s+/g, " ")
                            .trim();

                    const price = button?.dataset.price || "";

                    const image =
                        button?.dataset.image ||
                        product.querySelector("img")?.getAttribute("src");

                    return {
                        id: index,
                        name,
                        price,
                        image,
                        page: "./index.html#search-product-" + index
                    };

                }
            ).filter(product => product.name);

        } catch (error) {

            console.error("Product loading error:", error);

        }

    }

    // LOAD PRODUCTS WHEN PAGE OPENS
    loadProducts();


    // SEARCH PRODUCTS
    searchInput.addEventListener("input", async () => {

        const query = searchInput.value.trim().toLowerCase();

        searchResults.innerHTML = "";

        if (query.length < 2) {

            searchResults.classList.add("hidden");

            return;

        }

        // Wait for products to load
        if (allProducts.length === 0) {

            await loadProducts();

        }

        const results = allProducts.filter(product =>
            product.name.toLowerCase().includes(query)
        );

        searchResults.classList.remove("hidden");

        if (results.length === 0) {

            searchResults.innerHTML = `
                <p class="p-5 text-center text-gray-500">
                    No products found.
                </p>
            `;

            return;

        }

      
results.forEach(product => {

    const result = document.createElement("a");

    result.href = product.page;

    result.className =
        "flex items-center gap-3 p-3 border-b hover:bg-gray-100 cursor-pointer";

    result.style.display = "flex";
    result.style.textDecoration = "none";
    result.style.color = "black";
    result.style.position = "relative";
    result.style.zIndex = "101";
    result.style.pointerEvents = "auto";

    const image = document.createElement("img");

    image.src = product.image || "";
    image.alt = product.name;

    image.className =
        "w-16 h-16 object-contain rounded-lg";

    const details = document.createElement("div");

    details.className = "flex-1";

    const name = document.createElement("p");

    name.className = "font-semibold text-sm";
    name.textContent = product.name;

    const price = document.createElement("p");

    price.className = "text-pink-700 font-bold";

    price.textContent = product.price
        ? "₦" + Number(product.price).toLocaleString("en-NG")
        : "";

    details.appendChild(name);
    details.appendChild(price);

    result.appendChild(image);
    result.appendChild(details);

    // Close dropdown after clicking
    result.addEventListener("click", () => {
        searchResults.classList.add("hidden");
    });

    searchResults.appendChild(result);

});


    });


    // CLOSE SEARCH DROPDOWN
    document.addEventListener("click", event => {

        if (
            !searchInput.contains(event.target) &&
            !searchResults.contains(event.target)
        ) {

            searchResults.classList.add("hidden");

        }

    });


    // REOPEN SEARCH RESULTS
    searchInput.addEventListener("focus", () => {

        if (searchInput.value.trim().length >= 2) {

            searchInput.dispatchEvent(
                new Event("input")
            );

        }

    });


    // ESCAPE KEY
    searchInput.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            searchResults.classList.add("hidden");

            searchInput.blur();

        }

    });

});
