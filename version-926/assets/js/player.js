(function () {
    window.setupMoviePlayer = function (videoId, overlayId, playId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var play = document.getElementById(playId);
        var attached = false;
        var hls = null;

        function attachSource() {
            if (!video || attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function playVideo() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var run = video.play();
                if (run && typeof run.catch === 'function') {
                    run.catch(function () {
                        video.controls = true;
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        if (play) {
            play.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('play', attachSource, { once: true });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
}());
