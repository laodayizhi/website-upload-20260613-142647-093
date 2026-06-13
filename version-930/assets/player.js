(function () {
  function initPlayer(section) {
    var videoUrl = section.getAttribute('data-video-url');
    var video = section.querySelector('video');
    var button = section.querySelector('[data-player-start]');
    var status = section.querySelector('[data-player-status]');
    var hlsInstance = null;
    var started = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请在播放器控件中再次点击播放。');
        });
      }
    }

    function start() {
      if (!videoUrl || !video) {
        setStatus('未找到可用播放地址。');
        return;
      }

      if (started) {
        playVideo();
        return;
      }
      started = true;
      section.classList.add('is-loading');
      setStatus('正在初始化高清播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        setStatus('已使用浏览器原生 HLS 播放能力加载。');
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 60,
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已加载，可以流畅观看。');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请稍后重试或更换浏览器。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else {
        video.src = videoUrl;
        setStatus('当前浏览器不支持 HLS.js，已尝试直接加载播放地址。');
        playVideo();
      }

      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video-url]').forEach(initPlayer);
  });
}());
