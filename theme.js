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

        button.innerHTML = `
            <span class="theme-toggle-icon theme-toggle-sun" aria-hidden="true">☀</span>
            <span class="theme-toggle-track" aria-hidden="true">
                <span class="theme-toggle-knob"></span>
            </span>
            <span class="theme-toggle-icon theme-toggle-moon" aria-hidden="true">☾</span>
        `;

        function updateButton() {
            const theme =
                document.documentElement.getAttribute("data-theme") || "light";

            const isDark = theme === "dark";

            button.classList.toggle("is-dark", isDark);

            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

            button.setAttribute(
                "title",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
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

        const navLinks = document.querySelector(".nav-links");
        const headerRight = document.querySelector(".header-right");
        if (navLinks) {
            navLinks.appendChild(button);
        } else if (headerRight) {
            headerRight.appendChild(button);
        } else {
            document.body.appendChild(button);
        }

        updateButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createToggle);
    } else {
        createToggle();
    }
})();
