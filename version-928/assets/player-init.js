(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function attach(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hls = hls;
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', 'true');
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.play-cover');
      if (!video) {
        return;
      }

      function play() {
        attach(video);
        if (cover) {
          cover.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        attach(video);
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('hidden');
        }
      });
    });
  });
}());
