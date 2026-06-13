(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function setupFiltering() {
    var scope = document.querySelector("[data-filter-scope]");

    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var searchInput = document.querySelector("[data-search-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : "");
      var category = categoryFilter ? categoryFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }

        card.classList.toggle("is-filtered-out", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, categoryFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function setupPlayer() {
    var frame = document.querySelector("[data-player]");

    if (!frame) {
      return;
    }

    var video = frame.querySelector("video");
    var trigger = frame.querySelector("[data-player-trigger]");
    var source = frame.getAttribute("data-url");
    var hlsInstance = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepareVideo() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      prepareVideo();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (trigger && video.currentTime === 0) {
        trigger.classList.remove("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupFiltering();
    setupPlayer();
  });
})();
