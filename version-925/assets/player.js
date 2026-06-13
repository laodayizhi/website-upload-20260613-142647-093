(function () {
  function hideMasks(shell) {
    Array.prototype.slice.call(shell.querySelectorAll(".play-mask")).forEach(function (mask) {
      mask.classList.add("hidden");
    });
  }

  function startVideo(video, shell) {
    if (!video) {
      return;
    }

    var source = video.dataset.src;

    if (!source) {
      return;
    }

    hideMasks(shell || video.parentElement);

    if (video.dataset.ready === "1") {
      video.play().catch(function () {});
      return;
    }

    video.dataset.ready = "1";

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        video.src = source;
        video.play().catch(function () {});
      });

      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
    var video = shell.querySelector("video");
    var mask = shell.querySelector(".play-mask");

    if (mask) {
      mask.addEventListener("click", function () {
        startVideo(video, shell);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        startVideo(video, shell);
      });

      video.addEventListener("play", function () {
        hideMasks(shell);
      });
    }
  });
})();
