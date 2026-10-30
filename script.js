"use strict";
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    mobileNav.hidden = !open;
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => { if (event.matches) setMenu(false); });



  if ("IntersectionObserver" in window) {
    const navLinks = [...document.querySelectorAll(".desktop-nav a")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => { if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-18% 0px -58% 0px", threshold: 0 });
    navLinks.forEach((link) => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  }
})();
