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


  const checks = [...document.querySelectorAll(".checklist-items input")];
  const updateCount = () => { document.getElementById("checklist-count").textContent = `${checks.filter((box) => box.checked).length} / ${checks.length} 已梳理`; };
  checks.forEach((box) => box.addEventListener("change", updateCount));
  document.getElementById("reset-checklist").addEventListener("click", () => {
    checks.forEach((box) => { box.checked = false; }); updateCount();
    document.getElementById("download-status").textContent = "已重置，您可以重新梳理资料。";
  });
  document.getElementById("download-checklist").addEventListener("click", () => {
    const lines = ["瓦努阿图投资入籍 · 资料准备参考清单", "版本日期：2026-10-30", "", "此清单仅供准备方向参考，最终文件要求以官方及指定代理确认版本为准。", "勾选代表用户已梳理，不代表资料已收件、已审核或获批。", "", ...checks.map((box) => `${box.checked ? "[已梳理]" : "[待准备]"} ${box.value}`), "", "签约前需确认：", "- 官方指定代理资格、适用项目及家庭资格", "- 捐款、尽调、服务、护照、翻译公证等逐项费用", "- 付款节点、收款账户、退费条款与办理时效", "- 宣誓及护照生物信息采集安排", "", "官方参考：", "https://vancitizenship.gov.vu/images/forms/Investment%20Program%20Form.pdf"];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "瓦努阿图投资入籍_资料准备清单.txt";
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    document.getElementById("download-status").textContent = "资料清单已生成，请在浏览器下载记录中查看。";
  });

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
