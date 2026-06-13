(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-path') || form.getAttribute('action') || 'search.html';
        var connector = target.indexOf('?') >= 0 ? '&' : '?';
        window.location.href = query ? target + connector + 'q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function setupHeroCarousel() {
    var root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupCatalogFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var cards = qsa('.movie-card');
    var keywordInput = qs('[data-filter-keyword]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var sortSelect = qs('[data-filter-sort]', panel);
    var summary = qs('[data-filter-summary]', panel);
    var grid = qs('.catalog-section .movie-grid');

    var years = cards
      .map(function (card) { return card.getAttribute('data-year') || ''; })
      .filter(Boolean)
      .filter(function (value, idx, arr) { return arr.indexOf(value) === idx; })
      .sort(function (a, b) { return Number(b) - Number(a); });

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) >= 0;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var isVisible = matchesKeyword && matchesYear;
        card.classList.toggle('is-hidden-by-filter', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (summary) {
        summary.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
      }
    }

    function sortCards() {
      if (!grid || !sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      } else if (value === 'rating') {
        sorted.sort(function (a, b) {
          var ar = Number((a.querySelector('.rating-badge') || {}).textContent?.replace(/[^0-9.]/g, '') || 0);
          var br = Number((b.querySelector('.rating-badge') || {}).textContent?.replace(/[^0-9.]/g, '') || 0);
          return br - ar;
        });
      }
      sorted.forEach(function (card) { grid.appendChild(card); });
      apply();
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroCarousel();
    setupCatalogFilters();
  });
}());
