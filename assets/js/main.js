"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const isInnerPage = window.location.pathname.includes("/pages/");
    const assetPrefix = isInnerPage ? "../" : "";
    const pagePrefix = isInnerPage ? "" : "pages/";
    const currentPage = document.body.dataset.page || "home";

    buildSiteChrome(assetPrefix, pagePrefix, currentPage);

    if (!document.querySelector('link[rel="icon"]')) {
        const favicon = document.createElement("link");
        favicon.rel = "icon";
        favicon.type = "image/svg+xml";
        favicon.href = `${assetPrefix}assets/icons/artisan-walls-mark.svg`;
        document.head.append(favicon);
    }

    const root = document.documentElement;
    const menuToggle = document.querySelector(".menu-toggle");
    const siteNav = document.querySelector(".site-nav");
    const themeToggles = document.querySelectorAll(".theme-toggle");
    const directionToggles = document.querySelectorAll(".direction-toggle");
    const backToTop = document.querySelector(".back-to-top");

    // Apply a saved preference, or the system preference on a first visit.
    const savedTheme = localStorage.getItem("preferred-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemDark ? "dark" : "light");

    root.setAttribute("data-theme", initialTheme);
    updateThemeButtons(initialTheme);

    const savedDirection = localStorage.getItem("preferred-direction") || "ltr";
    root.setAttribute("dir", savedDirection);
    updateDirectionButtons(savedDirection);

    themeToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

            root.setAttribute("data-theme", nextTheme);
            localStorage.setItem("preferred-theme", nextTheme);
            updateThemeButtons(nextTheme);
        });
    });

    function updateThemeButtons(theme) {
        themeToggles.forEach((toggle) => {
            const icon = toggle.querySelector("i");
            const isDark = theme === "dark";

            toggle.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode",
            );
            if (icon) {
                icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
            }
        });
    }

    directionToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const nextDirection = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";

            root.setAttribute("dir", nextDirection);
            localStorage.setItem("preferred-direction", nextDirection);
            updateDirectionButtons(nextDirection);
        });
    });

    function updateDirectionButtons(direction) {
        directionToggles.forEach((toggle) => {
            const isRtl = direction === "rtl";
            const label = toggle.querySelector(".direction-label");

            toggle.setAttribute("aria-label", isRtl ? "Switch to left-to-right" : "Switch to RTL");
            toggle.setAttribute("title", isRtl ? "Use left-to-right layout" : "Use RTL layout");
            if (label) {
                label.textContent = isRtl ? "LTR" : "RTL";
            }
        });
    }

    if (menuToggle && siteNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = siteNav.classList.toggle("open");

            document.body.classList.toggle("menu-open", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.querySelector("i").className = isOpen ? "bi bi-x-lg" : "bi bi-list";
        });
    }

    document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const item = toggle.closest(".nav-item");
            const willOpen = !item.classList.contains("open");

            document.querySelectorAll(".nav-item.open").forEach((openItem) => {
                openItem.classList.remove("open");
                openItem.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
            });

            item.classList.toggle("open", willOpen);
            toggle.setAttribute("aria-expanded", String(willOpen));
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".nav-item")) {
            document.querySelectorAll(".nav-item.open").forEach((item) => {
                item.classList.remove("open");
                item.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
            });
        }
    });

    document.querySelectorAll(".site-nav a").forEach((link) => {
        link.addEventListener("click", () => {
            siteNav?.classList.remove("open");
            document.body.classList.remove("menu-open");
            menuToggle?.setAttribute("aria-expanded", "false");
            if (menuToggle?.querySelector("i")) {
                menuToggle.querySelector("i").className = "bi bi-list";
            }
        });
    });

    // Filter project cards by their data-category value.
    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            document
                .querySelectorAll(".filter-btn")
                .forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            document.querySelectorAll(".gallery-item").forEach((item) => {
                const shouldShow = filter === "all" || item.dataset.category === filter;
                item.classList.toggle("is-hidden", !shouldShow);
            });
        });
    });

    // Keep every before/after comparison usable with mouse, touch, and keyboard.
    document.querySelectorAll("[data-comparison]").forEach((comparison) => {
        const range = comparison.querySelector(".comparison-range");

        if (range) {
            const updateComparison = () => {
                comparison.style.setProperty("--comparison-position", `${range.value}%`);
            };

            range.addEventListener("input", updateComparison);
            updateComparison();
        }
    });

    document.querySelectorAll('input[type="file"]').forEach((input) => {
        input.addEventListener("change", () => {
            const help = input.closest(".form-group")?.querySelector("small");
            const count = input.files?.length || 0;

            if (help) {
                help.textContent = count
                    ? `${count} photo${count === 1 ? "" : "s"} selected. Up to 5 photos.`
                    : "Up to 5 photos.";
            }
        });
    });

    // Lightweight accessible FAQ behavior.
    document.querySelectorAll(".accordion-button").forEach((button) => {
        button.addEventListener("click", () => {
            const item = button.closest(".accordion-item");
            const isOpen = item.classList.toggle("open");

            button.setAttribute("aria-expanded", String(isOpen));
        });
    });

    // Client-side quote form validation.
    document.querySelectorAll("[data-validate]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            let isValid = true;

            form.querySelectorAll("[required]").forEach((field) => {
                const invalid =
                    !field.value.trim() || (field.type === "email" && !field.validity.valid);

                field.classList.toggle("is-invalid", invalid);
                field.setAttribute("aria-invalid", String(invalid));
                isValid = isValid && !invalid;
            });

            const status = form.querySelector(".form-status");
            if (status) {
                status.textContent = isValid
                    ? "Thank you. Your request is ready to be connected to a form service."
                    : "Please complete the highlighted required fields.";
            }
        });
    });

    // Coming-soon countdown uses a rolling 30-day demonstration date.
    const countdown = document.querySelector("[data-countdown]");
    if (countdown) {
        const target = Date.now() + 30 * 24 * 60 * 60 * 1000;

        const updateCountdown = () => {
            const remaining = Math.max(0, target - Date.now());
            const values = {
                days: Math.floor(remaining / 86400000),
                hours: Math.floor((remaining / 3600000) % 24),
                minutes: Math.floor((remaining / 60000) % 60),
                seconds: Math.floor((remaining / 1000) % 60),
            };

            Object.entries(values).forEach(([key, value]) => {
                const field = countdown.querySelector(`[data-time="${key}"]`);
                if (field) {
                    field.textContent = String(value).padStart(2, "0");
                }
            });
        };

        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }

    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 500);
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "auto" });
        });
    }
});

// Build one consistent header and footer across every static page.
function buildSiteChrome(assetPrefix, pagePrefix, currentPage) {
    const header = document.querySelector("[data-site-header]");
    const footer = document.querySelector("[data-site-footer]");
    const active = (name) => (currentPage === name ? " active" : "");
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const selected = (file) => (currentFile === file ? ' class="active" aria-current="page"' : "");

    if (header) {
        header.innerHTML = `
            <div class="topbar">
                <div class="site-container topbar-inner">
                    <div class="topbar-group">
                        <a href="tel:+13175550184"><i class="bi bi-telephone"></i> (317) 555-0184</a>
                        <a href="mailto:hello@artisanwalls.example"><i class="bi bi-envelope"></i> hello@artisanwalls.example</a>
                    </div>
                    <span><i class="bi bi-clock"></i> Mon–Sat, 8:00 AM–6:00 PM</span>
                </div>
            </div>
            <header class="site-header">
                <div class="site-container navbar-inner">
                    <a class="brand" href="${pagePrefix}index.html" aria-label="Artisan Walls home">
                        <span class="brand-mark"><img src="${assetPrefix}assets/icons/artisan-walls-mark.svg" alt="" /></span>
                        <span class="brand-text">Artisan Walls<small>Painting &amp; Finishes</small></span>
                    </a>
                    <nav class="site-nav" aria-label="Primary navigation">
                        <ul class="nav-list">
                            <li class="nav-item">
                                <button class="dropdown-toggle${active("home")}" type="button" aria-expanded="false">
                                    Home <i class="bi bi-chevron-down"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a${selected("index.html")} href="${pagePrefix}index.html">Home Page 1</a></li>
                                    <li><a${selected("index-2.html")} href="${pagePrefix}index-2.html">Home Page 2</a></li>
                                </ul>
                            </li>
                            <li><a class="nav-link${active("about")}" href="${pagePrefix}about.html">About</a></li>
                            <li class="nav-item">
                                <button class="dropdown-toggle${active("services")}" type="button" aria-expanded="false">
                                    Services <i class="bi bi-chevron-down"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a${selected("services.html")} href="${pagePrefix}services.html">All Services</a></li>
                                    <li><a${selected("service-details.html")} href="${pagePrefix}service-details.html">Interior Painting</a></li>
                                    <li><a href="${pagePrefix}service-details.html#exterior">Exterior Painting</a></li>
                                    <li><a href="${pagePrefix}service-details.html#texture">Texture Finishes</a></li>
                                    <li><a href="${pagePrefix}service-details.html#waterproofing">Waterproofing</a></li>
                                </ul>
                            </li>
                            <li><a class="nav-link${active("projects")}" href="${pagePrefix}projects.html">Projects</a></li>
                            <li><a class="nav-link${active("consultation")}" href="${pagePrefix}color-consultation.html">Color Consultation</a></li>
                            <li><a class="nav-link${active("pricing")}" href="${pagePrefix}pricing.html">Pricing</a></li>
                            <li><a class="nav-link${active("contact")}" href="${pagePrefix}contact.html">Contact</a></li>
                            <li class="mobile-nav-quote"><a class="btn btn-primary" href="${pagePrefix}contact.html">Get a Free Quote</a></li>
                        </ul>
                    </nav>
                    <div class="header-actions">
                        <button class="icon-button theme-toggle" type="button" aria-label="Switch theme"><i class="bi bi-moon-stars"></i></button>
                        <button class="icon-button direction-toggle" type="button" aria-label="Switch to RTL" title="Use RTL layout"><span class="direction-label" aria-hidden="true">RTL</span></button>
                        <a class="btn btn-primary header-quote" href="${pagePrefix}contact.html">Free Quote</a>
                        <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false"><i class="bi bi-list"></i></button>
                    </div>
                </div>
            </header>
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <footer class="site-footer">
                <div class="site-container footer-main">
                    <div>
                        <a class="brand" href="${pagePrefix}index.html"><span class="brand-mark"><img src="${assetPrefix}assets/icons/artisan-walls-mark.svg" alt="" /></span><span>Artisan Walls<small>Painting &amp; Finishes</small></span></a>
                        <p>Careful preparation, premium finishes, and clean execution for homes and businesses.</p>
                        <div class="social-links">
                            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                            <a href="#" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a>
                        </div>
                    </div>
                    <div>
                        <h2 class="footer-title">Quick Links</h2>
                        <ul class="footer-links">
                            <li><a href="${pagePrefix}index.html">Home</a></li><li><a href="${pagePrefix}about.html">About</a></li><li><a href="${pagePrefix}services.html">Services</a></li><li><a href="${pagePrefix}projects.html">Projects</a></li><li><a href="${pagePrefix}pricing.html">Pricing</a></li><li><a href="${pagePrefix}contact.html">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 class="footer-title">Services</h2>
                        <ul class="footer-links">
                            <li><a href="${pagePrefix}service-details.html">Interior Painting</a></li><li><a href="${pagePrefix}services.html">Exterior Painting</a></li><li><a href="${pagePrefix}services.html">Texture Finishes</a></li><li><a href="${pagePrefix}services.html">Waterproofing</a></li><li><a href="${pagePrefix}color-consultation.html">Color Consultation</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 class="footer-title">Contact</h2>
                        <ul class="footer-links">
                            <li><a href="tel:+13175550184"><i class="bi bi-telephone"></i> (317) 555-0184</a></li><li><a href="mailto:hello@artisanwalls.example"><i class="bi bi-envelope"></i> hello@artisanwalls.example</a></li><li><i class="bi bi-geo-alt"></i> Indianapolis, Indiana</li><li><i class="bi bi-clock"></i> Mon–Sat, 8 AM–6 PM</li>
                        </ul>
                    </div>
                </div>
                <div class="site-container footer-bottom">
                    <span>© 2026 Artisan Walls. All Rights Reserved.</span>
                    <span><a href="#">Privacy Policy</a> · <a href="#">Terms</a></span>
                </div>
            </footer>
            <button class="back-to-top" type="button" aria-label="Back to top"><i class="bi bi-arrow-up"></i></button>
        `;
    }
}
