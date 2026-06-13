(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobile = document.querySelector(".mobile-nav");

  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, idx) {
      slide.classList.toggle("active", idx === current);
    });

    dots.forEach(function (dot, idx) {
      dot.classList.toggle("active", idx === current);
    });
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener("click", function () {
      showSlide(idx);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var panel = document.querySelector(".filter-panel");
  var list = document.querySelector(".movie-list");
  var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".js-movie-card")) : [];
  var empty = document.querySelector(".empty-state");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!panel || !list) {
      return;
    }

    var keywordInput = panel.querySelector(".js-filter-keyword");
    var typeSelect = panel.querySelector(".js-filter-type");
    var yearSelect = panel.querySelector(".js-filter-year");
    var sortSelect = panel.querySelector(".js-sort");
    var keyword = normalize(keywordInput && keywordInput.value);
    var type = typeSelect ? typeSelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var sort = sortSelect ? sortSelect.value : "default";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.category,
        card.dataset.type,
        card.dataset.year,
        card.textContent
      ].join(" "));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (type && card.dataset.type !== type) {
        matched = false;
      }

      if (year && card.dataset.year !== year) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visibleCount += 1;
      }
    });

    var sorted = cards.slice().sort(function (a, b) {
      if (sort === "views") {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      }

      if (sort === "rating") {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      }

      if (sort === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }

      return 0;
    });

    sorted.forEach(function (card) {
      list.appendChild(card);
    });

    if (empty) {
      empty.classList.toggle("show", visibleCount === 0);
    }
  }

  if (panel && list) {
    var keywordInput = panel.querySelector(".js-filter-keyword");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && keywordInput) {
      keywordInput.value = q;
    }

    panel.addEventListener("input", applyFilters);
    panel.addEventListener("change", applyFilters);
    applyFilters();
  }
})();
