
const BACKEND = "https://dezubik-pharmacy-ltd.onrender.com";

const loading = document.getElementById("auth-loading");
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("admin-dashboard");

let dashboardLoaded = false;

function showLogin() {
    loading.style.display = "none";
    dashboard.style.display = "none";
    loginSection.style.display = "flex";
}

function showDashboard() {
    loading.style.display = "none";
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    if (!dashboardLoaded) {
        dashboardLoaded = true;

        const script = document.createElement("script");
        script.src = "./admin-orders.js";

        script.onerror = () => {
            console.error("Could not load admin dashboard JavaScript.");
        };

        document.body.appendChild(script);
    }
}

// Verify existing admin session
async function checkAdminSession() {
    try {
        const response = await fetch(`${BACKEND}/api/admin/me`, {
            credentials: "include"
        });

        if (response.ok) {
            showDashboard();
        } else {
            showLogin();
        }

    } catch (error) {
        console.error("Authentication check failed:", error);
        showLogin();

        document.getElementById("login-error").textContent =
            "Unable to connect to the server. Please try again.";
    }
}

// Login
document.getElementById("admin-login-form").addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("admin-username").value.trim();

        const password =
            document.getElementById("admin-password").value;

        const button =
            document.getElementById("login-button");

        const errorDisplay =
            document.getElementById("login-error");

        button.disabled = true;
        button.textContent = "Logging in...";
        errorDisplay.textContent = "";

        try {

            const response = await fetch(`${BACKEND}/api/admin/login`, {

                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Login failed.");
            }

            // Confirm the session was established
            await checkAdminSession();

        } catch (error) {

            errorDisplay.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Login";

        }

    }
);

// Show / hide password
document.getElementById("toggle-password").addEventListener(
    "click",
    () => {

        const password =
            document.getElementById("admin-password");

        const button =
            document.getElementById("toggle-password");

        if (password.type === "password") {
            password.type = "text";
            button.textContent = "Hide";
        } else {
            password.type = "password";
            button.textContent = "Show";
        }

    }
);

// Logout
document.getElementById("logout-button").addEventListener(
    "click",
    async () => {

        try {

            const response = await fetch(`${BACKEND}/api/admin/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout failed.");
            }

            window.location.reload();

        } catch (error) {

            alert(error.message);

        }

    }
);

// Start authentication check
checkAdminSession();
