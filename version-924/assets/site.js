(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === active);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters(scope) {
    var input = scope.querySelector('[data-live-search]');
    var sort = scope.querySelector('[data-sort-select]');
    var list = scope.querySelector('[data-card-list]');
    var empty = scope.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function apply() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' '));
        var matched = !query || text.indexOf(query) >= 0;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      var value = sort ? sort.value : 'year';
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }

        var left = Number(a.dataset[value] || 0);
        var right = Number(b.dataset[value] || 0);
        return right - left;
      });

      sorted.forEach(function (card) {
        list.appendChild(card);
      });

      cards = sorted;
      apply();
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    applySort();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilters);

  var queryInput = document.querySelector('[data-query-input]');

  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q') || '';

    if (value) {
      queryInput.value = value;
      queryInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function preparePlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    function attach() {
      if (!video || !stream || video.dataset.ready === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      video.dataset.ready = '1';
    }

    function play() {
      attach();

      if (button) {
        button.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(preparePlayer);
})();
