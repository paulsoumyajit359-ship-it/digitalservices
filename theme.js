(function () {
    const savedTheme = localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);

    function createToggle() {
        if (document.getElementById("themeToggleGlobal")) {
            return;
        }

        const button = document.createElement("button");

        button.id = "themeToggleGlobal";
        button.className = "theme-toggle-global";
        button.type = "button";

        function updateButton() {
            const theme =
                document.documentElement.getAttribute("data-theme") || "light";

            if (theme === "dark") {
                button.textContent = "☀️";
                button.setAttribute("aria-label", "Switch to light mode");
                button.setAttribute("title", "Switch to light mode");
            } else {
                button.textContent = "🌙";
                button.setAttribute("aria-label", "Switch to dark mode");
                button.setAttribute("title", "Switch to dark mode");
            }
        }

        button.addEventListener("click", function () {
            const currentTheme =
                document.documentElement.getAttribute("data-theme") || "light";

            const nextTheme =
                currentTheme === "dark" ? "light" : "dark";

            localStorage.setItem("theme", nextTheme);
            document.documentElement.setAttribute("data-theme", nextTheme);

            updateButton();
        });

        document.body.appendChild(button);

        updateButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createToggle);
    } else {
        createToggle();
    }
})();
