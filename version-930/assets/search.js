(function () {
  var data = window.MOVIE_SEARCH_DATA || [];
  var state = {
    query: '',
    region: '',
    type: '',
    year: '',
    visibleCount: 48
  };

  function qs(selector) {
    return document.querySelector(selector);
  }

  function uniqueValues(field) {
    return data
      .map(function (item) { return item[field] || ''; })
      .filter(Boolean)
      .filter(function (value, index, array) { return array.indexOf(value) === index; })
      .sort(function (a, b) {
        if (field === 'year') {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, 'zh-Hans-CN');
      });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <div class="poster-shell">',
      '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy" onerror="this.closest(\'.poster-shell\').classList.add(\'has-fallback\'); this.remove();">',
      '      <span class="poster-fallback">' + escapeHtml(item.title.slice(0, 2)) + '</span>',
      '    </div>',
      '    <span class="corner-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="rating-badge">★ ' + escapeHtml(item.rating) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(item.description) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterData() {
    var query = state.query.trim().toLowerCase();
    return data.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.description,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return (!query || haystack.indexOf(query) >= 0)
        && (!state.region || item.region === state.region)
        && (!state.type || item.type === state.type)
        && (!state.year || item.year === state.year);
    }).sort(function (a, b) {
      return Number(b.rating) - Number(a.rating) || Number(b.views) - Number(a.views);
    });
  }

  function render() {
    var results = qs('#searchResults');
    var summary = qs('#searchSummary');
    var loadMore = qs('#loadMore');
    if (!results || !summary || !loadMore) {
      return;
    }

    var matches = filterData();
    var visible = matches.slice(0, state.visibleCount);
    results.innerHTML = visible.map(cardTemplate).join('\n');
    summary.textContent = '找到 ' + matches.length + ' 部影片，当前显示 ' + visible.length + ' 部。';
    loadMore.hidden = visible.length >= matches.length;
  }

  function setup() {
    var queryInput = qs('#searchQuery');
    var regionFilter = qs('#regionFilter');
    var typeFilter = qs('#typeFilter');
    var yearFilter = qs('#yearFilter');
    var loadMore = qs('#loadMore');

    fillSelect(regionFilter, uniqueValues('region'));
    fillSelect(typeFilter, uniqueValues('type'));
    fillSelect(yearFilter, uniqueValues('year'));

    state.query = getQueryFromUrl();
    if (queryInput) {
      queryInput.value = state.query;
      queryInput.addEventListener('input', function () {
        state.query = queryInput.value;
        state.visibleCount = 48;
        render();
      });
    }

    [
      [regionFilter, 'region'],
      [typeFilter, 'type'],
      [yearFilter, 'year']
    ].forEach(function (pair) {
      var select = pair[0];
      var field = pair[1];
      if (!select) {
        return;
      }
      select.addEventListener('change', function () {
        state[field] = select.value;
        state.visibleCount = 48;
        render();
      });
    });

    if (loadMore) {
      loadMore.addEventListener('click', function () {
        state.visibleCount += 48;
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', setup);
}());
