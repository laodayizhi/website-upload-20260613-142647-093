(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    var filterInput = document.querySelector('.page-filter');
    var sortSelect = document.querySelector('.sort-select');
    var sortableList = document.querySelector('.sortable-list');

    function cards() {
        if (!sortableList) {
            return [];
        }
        return Array.prototype.slice.call(sortableList.children);
    }

    function applyFilter() {
        if (!filterInput) {
            return;
        }
        var query = filterInput.value.trim().toLowerCase();
        cards().forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-category') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            card.classList.toggle('is-hidden-by-filter', query && text.indexOf(query) === -1);
        });
    }

    function applySort() {
        if (!sortSelect || !sortableList) {
            return;
        }
        var value = sortSelect.value;
        var list = cards();
        list.sort(function (a, b) {
            if (value === 'views') {
                return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
            }
            if (value === 'rating') {
                return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
            }
            if (value === 'year') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            return 0;
        });
        list.forEach(function (card) {
            sortableList.appendChild(card);
        });
        applyFilter();
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    var searchInput = document.getElementById('search-input');

    if (results && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim();
        if (searchInput) {
            searchInput.value = q;
        }

        function render(items) {
            results.innerHTML = items.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a class="poster" href="./' + movie.file + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
                    '<span class="play-mark">▶</span>' +
                    '</a>' +
                    '<div class="card-info">' +
                    '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.desc) + '</p>' +
                    '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        var query = q.toLowerCase();
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            if (!query) {
                return true;
            }
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags, movie.desc].join(' ').toLowerCase().indexOf(query) !== -1;
        }).slice(0, 120);

        if (summary) {
            summary.textContent = q ? '搜索 “' + q + '” 的相关影片' : '输入关键词后可搜索片库内容';
        }
        render(matched);
    }
}());
