(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function createResultCard(item) {
    var card = document.createElement('article');
    card.className = 'movie-card';
    card.innerHTML = [
      '<a class="movie-cover" href="' + item.url + '" aria-label="观看《' + item.title + '》">',
      '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '<span class="movie-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="' + item.url + '">' + item.title + '</a>',
      '<p class="movie-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</p>',
      '<p class="movie-line">' + item.oneLine + '</p>',
      '</div>'
    ].join('');
    return card;
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var resultBox = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');
    if (!form || !input || !resultBox || !window.SiteSearch) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render(query) {
      var keyword = normalize(query);
      resultBox.innerHTML = '';
      if (!keyword) {
        if (note) {
          note.textContent = '输入片名、类型、地区或关键词，快速查找想看的内容。';
        }
        return;
      }

      var matches = window.SiteSearch.filter(function (item) {
        return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.type + ' ' + item.tags + ' ' + item.oneLine).indexOf(keyword) !== -1;
      }).slice(0, 96);

      if (note) {
        note.textContent = matches.length ? '搜索结果如下。' : '暂未找到相关内容，可以换一个关键词。';
      }

      matches.forEach(function (item) {
        resultBox.appendChild(createResultCard(item));
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      history.replaceState(null, '', url);
      render(query);
    });

    render(input.value);
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchPage();
  });
}());
