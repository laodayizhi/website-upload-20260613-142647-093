(function () {
  var players = new WeakMap();

  window.setupPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (players.has(video)) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        players.set(video, true);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        players.set(video, hls);
        return;
      }

      video.src = source;
      players.set(video, true);
    }

    function start() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
