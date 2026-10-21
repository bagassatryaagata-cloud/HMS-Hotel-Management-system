// Animasi masuk saat scroll. Ditaruh paling atas supaya tetap jalan walau blok lain error.
(() => {
  "use strict";

  const root = document.documentElement;
  root.setAttribute("data-rise-ready", "");
  if (!root.classList.contains("has-rise")) return;

  const targets = [];
  document
    .querySelectorAll("[data-rise]")
    .forEach((element) => targets.push(element));
  document.querySelectorAll("[data-rise-group]").forEach((group) => {
    [...group.children].forEach((child) => {
      child.setAttribute("data-rise-item", "");
      targets.push(child);
    });
  });
  const observer = new IntersectionObserver(
    (entries) => {
      // elemen yang muncul bersamaan masuk berurutan (jeda ditentukan --i di CSS)
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) =>
          a.target.compareDocumentPosition(b.target) &
          Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
        )
        .forEach((entry, index) => {
          entry.target.style.setProperty("--i", Math.min(index, 6));
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );

  targets.forEach((element) => observer.observe(element));
})();

// Spotlight: cahaya lembut mengikuti kursor di kartu (hanya perangkat dengan mouse)
(() => {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".jt-grid").forEach((grid) => {
    grid.addEventListener("pointermove", (event) => {
      const card = event.target.closest(".jt-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
})();

(() => {
  "use strict";

  const tour = document.querySelector("[data-feature-tour]");
  if (!tour) return;

  const featureSection = tour.closest(".feature-tour");
  const tabs = [...tour.querySelectorAll("[data-feature-select]")];
  const visual = tour.querySelector(".feature-tour-visual");
  const visualShellTemplate = document.getElementById("feature-visual-shell");
  const featureTemplates = tabs.map((_, index) =>
    document.getElementById(`feature-content-${index}`),
  );

  let activeIndex = 0;
  let pagePaused = document.hidden;
  let sectionPaused = true;
  let wasPaused = false;
  let lastFitWidth = 0;
  const mobileQuery = window.matchMedia("(max-width: 680px)");

  const syncPausedState = () => {
    const isPaused = pagePaused || sectionPaused;
    tour.classList.toggle("is-paused", isPaused);
    if (isPaused === wasPaused) return;
    wasPaused = isPaused;
  };

  // Skala mockup: dirancang untuk kanvas ~657px, diperbesar sampai 1.45x saat panel lebih lebar
  const DESIGN_WIDTH = 657;
  const MAX_ZOOM = 1.45;
  const fitVisual = () => {
    visual.classList.remove("is-fitted");
    const width = mobileQuery.matches
      ? visual.parentElement.clientWidth
      : visual.clientWidth;
    if (!width) return;
    lastFitWidth = visual.clientWidth;
    if (width < DESIGN_WIDTH) {
      visual.style.removeProperty("--fit-zoom");
      visual.style.removeProperty("--fit-width");
      return;
    }
    const zoom = Math.min(width / DESIGN_WIDTH, MAX_ZOOM);
    visual.style.setProperty("--fit-zoom", zoom.toFixed(3));
    visual.style.setProperty("--fit-width", `${(width / zoom).toFixed(1)}px`);
    visual.classList.add("is-fitted");
  };

  // Di layar kecil, panel visual dipindah tepat di bawah tab yang aktif
  const placeVisual = () => {
    if (mobileQuery.matches) {
      if (tabs[activeIndex].nextElementSibling !== visual)
        tabs[activeIndex].after(visual);
    } else if (visual.parentElement !== tour) {
      tour.append(visual);
    }
  };

  // Auto-scroll di mobile saat tab dipencet user
  const scrollToActiveTabMobile = () => {
    if (!mobileQuery.matches) return;
    setTimeout(() => {
      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar ? navbar.offsetHeight : 70;
      const target = tabs[activeIndex];
      if (!target) return;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }, 60); // Jeda singkat agar pemindahan DOM selesai terlebih dahulu
  };

  const bindDialogValues = (dialog, values) => {
    Object.entries(values).forEach(([key, value]) => {
      dialog.querySelectorAll(`[data-bind="${key}"]`).forEach((element) => {
        element.textContent = value;
      });
      dialog
        .querySelectorAll(`[data-bind-value="${key}"]`)
        .forEach((element) => {
          element.value = value;
        });
    });
  };

  const updatePmTaskCard = (taskCard, status) => {
    const badge = taskCard.querySelector(".pm-status-badge");
    taskCard.dataset.status = status;
    badge.classList.toggle("is-progress", status === "in-progress");
    badge.classList.toggle("is-completed", status === "completed");
    badge.textContent =
      status === "in-progress"
        ? "In Progress"
        : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const showPmTask = (taskCard) => {
    const detail = visual.querySelector("[data-pm-detail]");
    if (!detail || !taskCard) return;
    detail.dataset.taskId = taskCard.dataset.taskId;
    detail.dataset.taskName = taskCard.dataset.taskName;
    detail.dataset.asset = taskCard.dataset.asset;
    detail.dataset.assetCode = taskCard.dataset.assetCode;
    detail.dataset.schedule = taskCard.dataset.schedule;
    detail.dataset.status = taskCard.dataset.status;
    detail.querySelector("[data-pm-detail-id]").textContent =
      taskCard.dataset.taskId;
    detail.querySelector("[data-pm-detail-name]").textContent =
      taskCard.dataset.taskName;
    detail.querySelector("[data-pm-detail-asset]").textContent =
      taskCard.dataset.asset;
    detail.querySelector("[data-pm-detail-code]").textContent =
      taskCard.dataset.assetCode;
    detail.querySelector("[data-pm-detail-date]").textContent =
      taskCard.dataset.schedule;
    detail.querySelector("[data-pm-status-text]").textContent =
      taskCard.dataset.status === "in-progress"
        ? "In Progress"
        : taskCard.dataset.status.charAt(0).toUpperCase() +
          taskCard.dataset.status.slice(1);
    detail
      .querySelector(".pm-current-status")
      .classList.toggle(
        "is-progress",
        taskCard.dataset.status === "in-progress",
      );
    detail
      .querySelector(".pm-current-status")
      .classList.toggle(
        "is-completed",
        taskCard.dataset.status === "completed",
      );
    detail.querySelector("[data-pm-empty]").hidden =
      taskCard.dataset.status !== "assigned";
    detail.querySelector("[data-pm-checklist]").hidden =
      taskCard.dataset.status === "assigned";
    const startButton = detail.querySelector("[data-pm-start]");
    startButton.querySelector("span").textContent =
      taskCard.dataset.status === "assigned"
        ? "Start Inspection"
        : taskCard.dataset.status === "completed"
          ? "Inspection Complete"
          : "Continue Inspection";
    startButton.disabled = taskCard.dataset.status === "completed";
    detail
      .querySelectorAll("[data-pm-checklist] input[type=checkbox]")
      .forEach((checkbox) => {
        checkbox.checked = taskCard.dataset.status === "completed";
      });
    const checksDone = detail.querySelectorAll(
      "[data-pm-checklist] input:checked",
    ).length;
    detail.querySelector("[data-pm-progress]").textContent =
      `${checksDone} / 3 complete`;
  };

  const filterPmTasks = () => {
    const filter = visual.querySelector(".pm-task-filter")?.value || "all";
    const query =
      visual
        .querySelector(".pm-task-search input")
        ?.value.trim()
        .toLowerCase() || "";
    const cards = [...visual.querySelectorAll("[data-pm-task]")];
    cards.forEach((card) => {
      const matchesStatus = filter === "all" || card.dataset.status === filter;
      const matchesQuery =
        !query ||
        `${card.dataset.taskId} ${card.dataset.taskName} ${card.dataset.asset}`
          .toLowerCase()
          .includes(query);
      card.hidden = !matchesStatus || !matchesQuery;
    });
    const selected =
      visual.querySelector("[data-pm-task].is-selected:not([hidden])") ||
      cards.find((card) => !card.hidden);
    cards.forEach((card) =>
      card.classList.toggle("is-selected", card === selected),
    );
    if (selected) showPmTask(selected);
  };

  const showWorkOrderDialog = (mode, row) => {
    const record = row || {};
    const opener = document.activeElement;
    const templateId =
      mode === "edit"
        ? "work-order-edit-template"
        : "work-order-report-template";
    const template = document.getElementById(templateId);
    const dialog = template.content.firstElementChild.cloneNode(true);
    const escapeHandler = (event) => {
      if (event.key !== "Escape") return;
      closeDialog();
    };
    const closeDialog = () => {
      dialog.remove();
      if (featureSection) featureSection.classList.remove("has-open-dialog");
      document.removeEventListener("keydown", escapeHandler);
      if (opener instanceof HTMLElement) opener.focus();
    };

    bindDialogValues(dialog, {
      "order-number": record.number || "WO-20260903-0004",
      "asset-name": record.asset || "Cable assembly",
    });
    document.body.append(dialog);
    if (featureSection) featureSection.classList.add("has-open-dialog");
    if (window.lucide)
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    dialog.querySelector("[data-dialog-close]")?.focus();
    dialog.addEventListener("click", (event) => {
      if (
        event.target === dialog ||
        event.target.closest("[data-dialog-close]")
      )
        closeDialog();
    });
    dialog
      .querySelector("[data-print-report]")
      ?.addEventListener("click", () => window.print());
    dialog
      .querySelector(".wo-edit-form")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        closeDialog();
      });
    document.addEventListener("keydown", escapeHandler);
  };

  visual.addEventListener("click", (event) => {
    const assetTab = event.target.closest("[data-asset-tab]");
    if (assetTab) {
      const assetScene = assetTab.closest(".asset-scene-detail");
      assetScene.querySelectorAll("[data-asset-tab]").forEach((tab) => {
        const isActive = tab === assetTab;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });
      assetScene.querySelectorAll("[data-asset-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.assetPanel !== assetTab.dataset.assetTab;
      });
      return;
    }
    const pmTask = event.target.closest("[data-pm-task]");
    if (pmTask) {
      visual
        .querySelectorAll("[data-pm-task]")
        .forEach((card) =>
          card.classList.toggle("is-selected", card === pmTask),
        );
      showPmTask(pmTask);
      return;
    }
    const startInspection = event.target.closest("[data-pm-start]");
    if (startInspection) {
      const detail = startInspection.closest("[data-pm-detail]");
      const taskCard = [...visual.querySelectorAll("[data-pm-task]")].find(
        (card) => card.dataset.taskId === detail.dataset.taskId,
      );
      if (taskCard && taskCard.dataset.status === "assigned") {
        updatePmTaskCard(taskCard, "in-progress");
        visual.querySelector(".pm-task-filter").value = "in-progress";
        filterPmTasks();
      }
      if (taskCard) showPmTask(taskCard);
      return;
    }
    const action = event.target.closest("[data-work-order-action]");
    if (!action) return;
    const row = action.closest(".wo-queue-row");
    const rowInfo = row?.querySelector(".wo-queue-info");
    showWorkOrderDialog(action.dataset.workOrderAction, {
      number: rowInfo?.querySelector("strong")?.textContent.trim(),
      asset: rowInfo
        ?.querySelector("small")
        ?.textContent.split(" · ")[0]
        .trim(),
    });
  });

  visual.addEventListener("change", (event) => {
    if (event.target.matches(".pm-task-filter, .pm-task-search input")) {
      filterPmTasks();
      return;
    }
    if (!event.target.matches("[data-pm-checklist] input[type=checkbox]"))
      return;
    const checklist = event.target.closest("[data-pm-checklist]");
    const completedCount = checklist.querySelectorAll("input:checked").length;
    checklist.querySelector("[data-pm-progress]").textContent =
      `${completedCount} / 3 complete`;
    if (completedCount !== 3) return;
    const detail = event.target.closest("[data-pm-detail]");
    const taskCard = [...visual.querySelectorAll("[data-pm-task]")].find(
      (card) => card.dataset.taskId === detail.dataset.taskId,
    );
    if (taskCard) {
      updatePmTaskCard(taskCard, "completed");
      visual.querySelector(".pm-task-filter").value = "completed";
      filterPmTasks();
      showPmTask(taskCard);
    }
  });

  visual.addEventListener("input", (event) => {
    if (event.target.matches(".pm-task-search input")) filterPmTasks();
  });

  // Fungsi aktivasi tab (parameter userInitiated menentukan apakah dipicu user)
  const activateFeature = (index, userInitiated = false) => {
    activeIndex = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    const template = featureTemplates[activeIndex];
    const visualShell = visualShellTemplate.content.cloneNode(true);
    const featureContent = template.content.cloneNode(true);
    visualShell.querySelector("[data-feature-label]").textContent =
      template.dataset.label;
    visualShell.querySelector("[data-feature-count]").textContent =
      `0${activeIndex + 1} / 05`;
    visualShell.querySelector("[data-feature-title]").textContent =
      template.dataset.title;
    visualShell.querySelector(".tour-visual-content").append(featureContent);
    visual.setAttribute("aria-labelledby", tabs[activeIndex].id);
    visual.replaceChildren(visualShell);
    if (window.lucide)
      window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
    placeVisual();
    fitVisual();

    // Jika dipencet oleh user di mobile, lakukan scroll otomatis ke tab tersebut
    if (userInitiated) {
      scrollToActiveTabMobile();
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateFeature(index, true));
    tab.addEventListener("keydown", (event) => {
      let targetIndex = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight")
        targetIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") targetIndex = 0;
      else if (event.key === "End") targetIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateFeature(targetIndex, true);
      tabs[targetIndex].focus();
    });
  });

  // Timer auto-play tidak memicu auto-scroll (userInitiated = false)
  tour.addEventListener("animationend", (event) => {
    if (
      event.target.matches(".feature-tour-progress i") &&
      event.animationName === "feature-tour-fill" &&
      event.target
        .closest(".feature-tour-item")
        ?.classList.contains("is-active")
    ) {
      activateFeature(activeIndex + 1, false);
      // Di mobile, saat fitur berganti otomatis, halaman ikut scroll ke tab aktif
      // (hanya jika bagian tour sedang terlihat di layar, supaya tidak mengganggu saat user di bagian lain)
      if (mobileQuery.matches && !sectionPaused) {
        scrollToActiveTabMobile();
      }
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (Math.abs(visual.clientWidth - lastFitWidth) > 1) fitVisual();
    }).observe(visual);
  }
  mobileQuery.addEventListener("change", () => {
    placeVisual();
    fitVisual();
  });

  document.addEventListener("visibilitychange", () => {
    pagePaused = document.hidden;
    syncPausedState();
  });

  const updateSectionVisibility = () => {
    if (!featureSection) return;
    const rect = featureSection.getBoundingClientRect();
    const visibleHeight = Math.max(
      0,
      Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top),
    );
    sectionPaused =
      visibleHeight / Math.min(window.innerHeight, rect.height) < 0.25;
    syncPausedState();
  };
  window.addEventListener("scroll", updateSectionVisibility, { passive: true });
  window.addEventListener("resize", updateSectionVisibility, { passive: true });

  syncPausedState();
  updateSectionVisibility();
  activateFeature(0, false);
  syncPausedState();
})();

// Kartu peran: klik Learn more -> kartu melebar (bukan pop-up), kartu lain menyusut
(() => {
  "use strict";

  const wrap = document.querySelector("[data-fr-cards]");
  if (!wrap) return;
  const cards = [...wrap.querySelectorAll("[data-fr-card]")];

  const setOpen = (index) => {
    const hasOpen = index !== null;
    wrap.classList.toggle("has-open", hasOpen);
    cards.forEach((card, cardIndex) => {
      const isOpen = hasOpen && cardIndex === index;
      card.classList.toggle("is-open", isOpen);
      card
        .querySelector(".fr-btn")
        .setAttribute("aria-expanded", String(isOpen));
    });
  };

  const closeAll = () => {
    const index = cards.findIndex((card) => card.classList.contains("is-open"));
    if (index === -1) return;
    setOpen(null);
    cards[index].querySelector(".fr-btn").focus({ preventScroll: true });
  };

  wrap.addEventListener("click", (event) => {
    if (event.target.closest("[data-fr-close]")) {
      closeAll();
      return;
    }
    const opener = event.target.closest("[data-fr-open]");
    if (!opener) return;
    const card = opener.closest("[data-fr-card]");
    setOpen(cards.indexOf(card));
    card.querySelector("[data-fr-close]").focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
  });
})();

// Jejak riwayat: klik Learn more -> langkah-langkah terbuka di dalam kartu
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-jt-card]").forEach((card) => {
    const button = card.querySelector("[data-jt-toggle]");
    const label = button.querySelector("[data-jt-label]");
    button.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      label.textContent = isOpen ? "Show less" : "Learn more";
      if (reduceMotion.matches) return;
      label.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 260, easing: "cubic-bezier(.2, .75, .25, 1)" },
      );
    });
  });
})();

/* ===== KEY FEATURES: carousel + Learn more ===== */
(() => {
  "use strict";

  const section = document.querySelector(".kf-section");
  if (!section) return;

  const track = section.querySelector("[data-kf-track]");
  const pages = [...section.querySelectorAll("[data-kf-page]")];
  const dots = [...section.querySelectorAll("[data-kf-dot]")];
  const prevBtn = section.querySelector("[data-kf-prev]");
  const nextBtn = section.querySelector("[data-kf-next]");
  if (!track || pages.length === 0) return;

  // Tutup semua card yang terbuka dan kembalikan label "Learn more"
  const resetCards = () => {
    track.querySelectorAll("[data-kf-card].is-open").forEach((card) => {
      const button = card.querySelector("[data-kf-toggle]");
      card.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      card.querySelector("[data-kf-label]").textContent = "Learn more";
    });
  };

  const currentPage = () => {
    const index = Math.round(track.scrollLeft / track.clientWidth) || 0;
    return Math.min(Math.max(index, 0), pages.length - 1);
  };

  const updateControls = () => {
    const cur = currentPage();
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === cur);
      dot.setAttribute("aria-current", String(i === cur));
    });
    prevBtn.disabled = cur <= 0;
    nextBtn.disabled = cur >= pages.length - 1;
  };

  const goTo = (index) => {
    const target = Math.min(Math.max(index, 0), pages.length - 1);
    resetCards();
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  };

  // Learn more / Show less
  section.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kf-toggle]");
    if (!button) return;
    const card = button.closest("[data-kf-card]");
    const open = !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    card.querySelector("[data-kf-label]").textContent = open ? "Show less" : "Learn more";
  });

  // Dot dan panah
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  prevBtn.addEventListener("click", () => goTo(currentPage() - 1));
  nextBtn.addEventListener("click", () => goTo(currentPage() + 1));

  // Update dot/panah saat track di-scroll (termasuk geser manual)
  track.addEventListener(
    "scroll",
    () => window.requestAnimationFrame(updateControls),
    { passive: true }
  );

  // Navigasi keyboard saat track difokuskan
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentPage() + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentPage() - 1);
    }
  });

  // Spotlight mengikuti kursor (hanya perangkat dengan mouse)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    track.addEventListener("pointermove", (event) => {
      const card = event.target.closest(".kf-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  }

  updateControls();
})();