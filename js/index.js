/* =========================================
   HMS HERO & PAGE INTERACTION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const heroVisual = document.querySelector(".hero-visual");
  const hotel = document.querySelector(".hotel-model");
  const cards = document.querySelectorAll(".hero .floating-card");

  /* =====================================
       1. MOUSE PARALLAX (Desktop Saja)
    ===================================== */
  if (window.matchMedia("(pointer: fine)").matches && hero) {
    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (event.clientY - rect.top) / rect.height - 0.5;

      if (hotel) {
        hotel.style.transform = `translate(${mouseX * 12}px, ${mouseY * 8}px)`;
      }

      cards.forEach((card, index) => {
        const strength = 4 + index * 2;
        card.style.transform = `translate(${mouseX * strength}px, ${mouseY * strength}px)`;
      });

      const glow1 = document.querySelector(".hero-glow-1");
      const glow2 = document.querySelector(".hero-glow-2");
      if (glow1)
        glow1.style.transform = `translate(${mouseX * 30}px, ${mouseY * 20}px)`;
      if (glow2)
        glow2.style.transform = `translate(${mouseX * -20}px, ${mouseY * -15}px)`;
    });

    hero.addEventListener("mouseleave", () => {
      if (hotel) hotel.style.transform = "";
      cards.forEach((card) => (card.style.transform = ""));
      const glow1 = document.querySelector(".hero-glow-1");
      const glow2 = document.querySelector(".hero-glow-2");
      if (glow1) glow1.style.transform = "";
      if (glow2) glow2.style.transform = "";
    });
  }

  /* =====================================
       2. SCROLL PARALLAX HERO
    ===================================== */
  let ticking = false;

  function handleScroll() {
    if (!hero || window.innerWidth <= 768) return;
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY <= heroHeight) {
      const progress = Math.min(scrollY / heroHeight, 1);
      if (heroContent) {
        heroContent.style.transform = `translateY(${progress * -35}px)`;
        heroContent.style.opacity = 1 - progress * 0.65;
      }
      if (heroVisual) {
        heroVisual.style.transform = `translateY(${progress * 25}px)`;
      }
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true },
  );

  /* =====================================
       3. INTERSECTION OBSERVERS
          (Animasi Scroll Halus & Hemat Memori)
    ===================================== */
  const createScrollObserver = (selector, threshold = 0.2) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target); // Lepas observer setelah muncul
          }
        });
      },
      { threshold },
    );

    elements.forEach((el) => observer.observe(el));
  };

  // Jalankan observer animasi scroll
  createScrollObserver(".problem-row", 0.2);
  createScrollObserver(".solution-step", 0.2);
  createScrollObserver(".solution-center", 0.15);
  createScrollObserver(".core-header, .core-feature-card", 0.15);
  createScrollObserver(".cta-container", 0.2);
});

// section 3

var activities = [
  { type: 'pm', label: 'PM TASK',      code: 'PM-TASK-20261013-0001', name: 'AC Aqua',       status: 'Assigned',    date: '9 Okt, 02.11' },
  { type: 'pm', label: 'PM TASK',      code: 'PM-TASK-20261006-0001', name: 'AC Aqua',       status: 'In_progress', date: '2 Okt, 02.00' },
  { type: 'wo', label: 'WORK ORDER',   code: 'WO-20260903-0004',      name: 'Kabel Listrik', status: 'Resolved',    date: '3 Sep, 01.50' },
  { type: 'ar', label: 'ASSET REPAIR', code: 'MNT-20260903-0001',     name: 'AC Aqua',       status: 'In_progress', date: '3 Sep, 01.41' }
];

var movements = [
  { type: 'mv', label: 'MOVEMENT', code: 'MV-20260903-0004', name: 'AC Aqua',           status: 'Completed', date: '3/9/2026' },
  { type: 'mv', label: 'MOVEMENT', code: 'MV-20260903-0005', name: 'AC Aqua',           status: 'Completed', date: '3/9/2026' },
  { type: 'mv', label: 'MOVEMENT', code: 'MV-20260903-0003', name: 'TV LG Hospitality', status: 'Completed', date: '3/9/2026' },
  { type: 'mv', label: 'MOVEMENT', code: 'MV-20260903-0001', name: 'TV LG Hospitality', status: 'Completed', date: '3/9/2026' }
];

/* Nama di sini harus sama dengan data-tab pada tombol tab di HTML */
var tabData = {
  activities: activities,
  movements: movements
};


/* ---------------------------------------------------------------------
   2. PENGATURAN
   --------------------------------------------------------------------- */
var STEP_INTERVAL = 3200;    // ganti langkah yang menyala tiap 3,2 detik (satuan milidetik)
var COUNT_DURATION = 1400;   // lama angka statistik naik dari 0 (milidetik)
var COUNT_STAGGER = 140;     // jeda antar kotak statistik saat mulai menghitung (milidetik)
var ROW_INTERVAL = 2600;     // sorotan baris daftar berpindah tiap 2,6 detik (milidetik)


(function () {

  // Ambil elemen-elemen yang dibutuhkan dari HTML
  var section = document.querySelector('.wf-section');
  if (!section) return;                                  // berhenti kalau section tidak ada

  var list    = section.querySelector('.wf-list');
  var tabs    = section.querySelectorAll('.wf-tab');
  var numbers = section.querySelectorAll('.wf-stat-number');
  var steps   = section.querySelectorAll('.wf-step');

  // Apakah pengguna mematikan animasi di perangkatnya?
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tandai bahwa JS aktif (CSS memakai ini untuk kondisi awal animasi)
  section.classList.add('wf-js');


  /* -------------------------------------------------------------------
     3. MENAMPILKAN DAFTAR & GANTI TAB
     ------------------------------------------------------------------- */

  // Membuat HTML untuk SATU baris daftar
  function buildItem(item, index) {
    var statusClass = (item.status === 'Completed') ? 'wf-status wf-status-done' : 'wf-status';

    return '' +
      '<div class="wf-item" style="--i:' + index + '">' +
        '<div>' +
          '<span class="wf-tag wf-tag-' + item.type + '">' + item.label + '</span>' +
          '<span class="wf-code">' + item.code + '</span>' +
          '<strong class="wf-item-name">' + item.name + '</strong>' +
        '</div>' +
        '<div class="wf-item-right">' +
          '<span class="' + statusClass + '">' + item.status + '</span>' +
          '<span class="wf-date">' + item.date + '</span>' +
        '</div>' +
      '</div>';
  }

  // Menampilkan daftar sesuai nama tab, lalu menandai tab yang aktif
  function showList(tabName) {
    var items = tabData[tabName];
    var html = '';

    for (var i = 0; i < items.length; i++) {
      html += buildItem(items[i], i);
    }
    list.innerHTML = html;
    startRowLive();

    for (var j = 0; j < tabs.length; j++) {
      var isActive = (tabs[j].getAttribute('data-tab') === tabName);
      tabs[j].classList.toggle('wf-tab-active', isActive);
    }
  }

  // Saat tab diklik, tampilkan daftarnya
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      showList(tab.getAttribute('data-tab'));
    });
  });


  /* -------------------------------------------------------------------
     4. ANGKA STATISTIK NAIK DARI 0
     Mulai bergantian (kiri ke kanan), melambat halus di akhir,
     lalu "membal" kecil begitu selesai.
     Angka tujuan dibaca dari atribut data-target di HTML.
     ------------------------------------------------------------------- */
  function countUp() {
    numbers.forEach(function (el, index) {
      var target = Number(el.getAttribute('data-target'));

      // Tanpa animasi kalau animasi dimatikan atau angkanya 0
      if (reduceMotion || target === 0) {
        el.textContent = target;
        return;
      }

      setTimeout(function () {                       // mulai bergantian
        var startTime = null;

        function tick(now) {
          if (startTime === null) startTime = now;
          var progress = Math.min((now - startTime) / COUNT_DURATION, 1);   // 0 sampai 1
          var eased = (progress === 1) ? 1 : 1 - Math.pow(2, -10 * progress); // cepat di awal, sangat halus di akhir
          el.textContent = Math.round(target * eased);

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.classList.add('wf-pop');              // efek membal kecil
          }
        }

        requestAnimationFrame(tick);
      }, index * COUNT_STAGGER);
    });
  }


  /* -------------------------------------------------------------------
     5. LANGKAH 01-04 MENYALA BERURUTAN
     Urutan: 01 -> 02 -> 03 -> 04 -> kembali ke 01.
     Cincin biru terisi searah jarum jam selama STEP_INTERVAL.
     Arahkan mouse ke sebuah langkah untuk menyalakannya dan menahan putaran.
     ------------------------------------------------------------------- */
  var current = 0;          // langkah yang sedang menyala (0 sampai 3)
  var stepTimer = null;

  // Menyalakan satu langkah, mematikan yang lain
  function setActive(index) {
    steps.forEach(function (step) {
      var number = Number(step.getAttribute('data-step'));
      step.classList.toggle('wf-step-active', number === index);
    });
    current = index;
  }

  // Menyalakan langkah sekarang, lalu pindah ke langkah berikutnya setelah STEP_INTERVAL
  function nextStep() {
    setActive(current);
    stepTimer = setTimeout(function () {
      current = (current + 1) % 4;       // 0,1,2,3 lalu kembali ke 0
      nextStep();
    }, STEP_INTERVAL);
  }

  function highlightSteps() {
    if (reduceMotion) return;

    section.style.setProperty('--wf-step-time', (STEP_INTERVAL / 1000) + 's');
    section.classList.add('wf-cycle');   // CSS: langkah lain meredup halus

    steps.forEach(function (step) {
      var number = Number(step.getAttribute('data-step'));

      step.addEventListener('mouseenter', function () {   // mouse masuk: tahan di langkah ini
        clearTimeout(stepTimer);
        setActive(number);
      });
      step.addEventListener('mouseleave', function () {   // mouse keluar: lanjut ke langkah berikutnya
        clearTimeout(stepTimer);
        current = (number + 1) % 4;
        nextStep();
      });
    });

    nextStep();
  }


  /* -------------------------------------------------------------------
     5b. SOROTAN BARIS DAFTAR
     Satu baris disorot lembut, lalu berpindah ke baris berikutnya.
     ------------------------------------------------------------------- */
  var rowTimer = null;

  function startRowLive() {
    clearInterval(rowTimer);
    if (reduceMotion) return;

    var rows = list.querySelectorAll('.wf-item');
    var index = 0;

    function moveHighlight() {
      rows.forEach(function (row, i) {
        row.classList.toggle('wf-item-live', i === index);
      });
      index = (index + 1) % rows.length;
    }

    setTimeout(moveHighlight, 900);                    // tunggu baris selesai muncul
    rowTimer = setInterval(moveHighlight, ROW_INTERVAL);
  }


  /* -------------------------------------------------------------------
     6. JALANKAN SAAT SECTION TERLIHAT DI LAYAR
     ------------------------------------------------------------------- */
  function start() {
    section.classList.add('wf-show');   // memicu animasi muncul di CSS
    showList('activities');             // tab pertama yang tampil
    countUp();
    setTimeout(highlightSteps, 1400);   // tunggu animasi muncul selesai dulu
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        start();
        observer.disconnect();          // cukup jalan sekali
      }
    }, { threshold: 0.2 });             // jalan saat 20% section terlihat

    observer.observe(section);
  } else {
    start();                            // browser lama: langsung jalan
  }

})();


const revealElements = document.querySelectorAll(
  "#platform .reveal, #platform .feature-card"
);

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${(index % 4) * 100}ms`;
  observer.observe(element);
});


document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/* =====================================================================
   FEATURE GALLERY — klik kartu fitur untuk membuka galeri gambar
   ===================================================================== */
(() => {
	"use strict";

	// Daftar gambar per fitur. Ganti nama file placeholder sesuai file asli.
	const GALLERIES = {
		dashboard: {
			title: "Dashboard",
			images: [
				{ src: "img/dashboard.png", alt: "Dashboard aplikasi HMS" },
			],
		},
		workorder: {
			title: "Work Order Management",
			images: [
				{ src: "img/workorders.png", alt: "Halaman work order aplikasi HMS" },
			],
		},
		pm: {
			title: "Preventive Maintenance",
			images: [
				{ src: "img/pm main.png", alt: "Halaman preventive maintenance aplikasi HMS" },
				{ src: "img/pm-2.png", alt: "Preventive maintenance: halaman 2" },
				{ src: "img/pm-3.png", alt: "Preventive maintenance: halaman 3" },
				{ src: "img/pm-4.png", alt: "Preventive maintenance: halaman 4" },
				{ src: "img/pm-5.png", alt: "Preventive maintenance: halaman 5" },
				{ src: "img/pm-6.png", alt: "Preventive maintenance: halaman 6" },
			],
		},
		asset: {
			title: "Asset Management",
			images: [
				{ src: "img/assetmanagmenet.png", alt: "Halaman asset management aplikasi HMS" },
				{ src: "img/asset-2.png", alt: "Asset management: halaman 2" },
				{ src: "img/asset-3.png", alt: "Asset management: halaman 3" },
				{ src: "img/asset-4.png", alt: "Asset management: halaman 4" },
				{ src: "img/asset-5.png", alt: "Asset management: halaman 5" },
				{ src: "img/asset-6.png", alt: "Asset management: halaman 6" },
				{ src: "img/asset-7.png", alt: "Asset management: halaman 7" },
			],
		},
	};

	const dialog = document.querySelector("[data-gl-dialog]");
	if (!dialog) return;

	const titleEl = dialog.querySelector(".gl-title");
	const counterEl = dialog.querySelector("[data-gl-counter]");
	const track = dialog.querySelector("[data-gl-track]");
	const controls = dialog.querySelector("[data-gl-controls]");
	const dotsWrap = dialog.querySelector("[data-gl-dots]");
	const toggleBtn = dialog.querySelector("[data-gl-toggle]");
	const prevBtn = dialog.querySelector("[data-gl-prev]");
	const nextBtn = dialog.querySelector("[data-gl-next]");
	const closeBtn = dialog.querySelector("[data-gl-close]");
	const iconPlay = toggleBtn.querySelector(".gl-icon-play");
	const iconPause = toggleBtn.querySelector(".gl-icon-pause");
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	const INTERVAL = 4000;
	let images = [];
	let slides = [];
	let dots = [];
	let index = 0;
	let timer = null;
	let lastFocus = null;

	const isPlaying = () => timer !== null;

	const updateToggle = () => {
		const playing = isPlaying();
		iconPlay.hidden = playing;
		iconPause.hidden = !playing;
		toggleBtn.setAttribute("aria-label", playing ? "Jeda" : "Putar otomatis");
	};

	const stop = () => {
		clearInterval(timer);
		timer = null;
		updateToggle();
	};

	const start = () => {
		clearInterval(timer);
		timer = setInterval(() => go(index + 1), INTERVAL);
		updateToggle();
	};

	const restartIfPlaying = () => {
		if (isPlaying()) start();
	};

	const go = (i) => {
		if (!slides.length) return;
		index = (i + slides.length) % slides.length;
		track.style.transform = `translateX(-${index * 100}%)`;
		dots.forEach((dot, k) => {
			dot.classList.toggle("is-active", k === index);
			dot.setAttribute("aria-current", String(k === index));
		});
		slides.forEach((slide, k) => {
			slide.setAttribute("aria-hidden", String(k !== index));
		});
		counterEl.textContent = `${index + 1} / ${slides.length}`;
	};

	// Bangun slide dan dot sesuai daftar gambar fitur yang dipilih
	const buildGallery = (key) => {
		const gallery = GALLERIES[key];
		if (!gallery) return false;

		titleEl.textContent = gallery.title;
		track.replaceChildren();
		dotsWrap.replaceChildren();

		images = gallery.images;
		slides = images.map((image) => {
			const slide = document.createElement("div");
			slide.className = "gl-slide";
			const img = document.createElement("img");
			img.src = image.src;
			img.alt = image.alt;
			img.loading = "lazy";
			slide.append(img);
			track.append(slide);
			return slide;
		});

		// Kalau hanya satu gambar, sembunyikan kontrol navigasi dan autoplay
		const multi = images.length > 1;
		controls.hidden = !multi;

		dots = images.map((image, i) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "gl-dot";
			dot.setAttribute("aria-label", `Gambar ${i + 1}`);
			dot.addEventListener("click", () => {
				go(i);
				restartIfPlaying();
			});
			dotsWrap.append(dot);
			return dot;
		});

		return true;
	};

	const open = (key) => {
		if (!buildGallery(key)) return;
		lastFocus = document.activeElement;
		go(0);
		if (!dialog.open) dialog.showModal();

		if (images.length > 1 && !reduceMotion.matches) start();
		else updateToggle();

		closeBtn.focus();
	};

	// Klik atau tekan Enter/Space pada kartu fitur
	document.querySelectorAll("[data-feature]").forEach((card) => {
		card.addEventListener("click", () => open(card.dataset.feature));
		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				open(card.dataset.feature);
			}
		});
	});

	closeBtn.addEventListener("click", () => dialog.close());

	// Klik area gelap di luar panel untuk menutup
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});

	dialog.addEventListener("close", () => {
		stop();
		if (lastFocus) lastFocus.focus();
	});

	toggleBtn.addEventListener("click", () => {
		if (isPlaying()) stop();
		else start();
	});

	prevBtn.addEventListener("click", () => {
		go(index - 1);
		restartIfPlaying();
	});

	nextBtn.addEventListener("click", () => {
		go(index + 1);
		restartIfPlaying();
	});

	// Panah kiri dan kanan saat pop-up terbuka
	dialog.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight") {
			go(index + 1);
			restartIfPlaying();
		} else if (event.key === "ArrowLeft") {
			go(index - 1);
			restartIfPlaying();
		}
	});
})();