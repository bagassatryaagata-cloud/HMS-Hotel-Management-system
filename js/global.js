/* =========================================
   HMS GLOBAL JS
   Navbar (scroll + hamburger) & Lucide Icons
========================================= */
(() => {
  "use strict";

  const MOBILE_MAX = 900;
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".humberger-menu");
  const menu = document.querySelector(".navbar-menu");

  const renderIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    }
  };

  /* ---------- Navbar mengecil saat di-scroll ---------- */
  if (navbar) {
    const onScroll = () =>
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Hamburger menu (Mobile) ---------- */
  if (navbar && toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
      toggle.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
      document.body.classList.toggle("nav-open", open);
      renderIcons();
    };

    // Klik tombol hamburger
    toggle.addEventListener("click", (event) => {
      event.stopPropagation(); // MENCEGAH KLIK BOCOR KE DOCUMENT
      const willOpen = !menu.classList.contains("is-open");
      setOpen(willOpen);
    });

    // Tutup saat link di dalam menu diklik
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Tutup dengan tombol Escape di keyboard
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tutup jika klik di luar area navbar/menu
    document.addEventListener("click", (event) => {
      // Abaikan jika elemen sudah terlepas dari DOM atau klik berada di dalam navbar
      if (!event.target.isConnected) return;
      if (
        menu.classList.contains("is-open") &&
        !navbar.contains(event.target)
      ) {
        setOpen(false);
      }
    });

    // Tutup otomatis saat layar diperlebar kembali ke desktop
    window
      .matchMedia(`(min-width: ${MOBILE_MAX + 1}px)`)
      .addEventListener("change", (event) => {
        if (event.matches) setOpen(false);
      });
  }

  // Inisialisasi awal ikon Lucide saat file dimuat
  renderIcons();
})();
