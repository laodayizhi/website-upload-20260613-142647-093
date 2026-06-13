(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isHidden = mobileNav.hasAttribute("hidden");
        if (isHidden) {
          mobileNav.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        } else {
          mobileNav.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    var dotsWrap = document.querySelector("[data-hero-dots]");

    if (slider && dotsWrap) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll("button"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var filterLists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));

    filterLists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector(".js-filter-input");
      var year = section.querySelector(".js-filter-year");
      var type = section.querySelector(".js-filter-type");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (input && initial) {
        input.value = initial;
      }

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (year) {
        year.addEventListener("change", applyFilter);
      }
      if (type) {
        type.addEventListener("change", applyFilter);
      }
      applyFilter();
    });
  });
})();
