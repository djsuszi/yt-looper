
// all short simple utensils go here
var toolbox = {
  flatten1: function(tt) { // flatten array one level only
    return $.map(tt, function(n) { return n; });
  },
  shuffle: function(tt) { // shuffle "in place"
    var m = tt.length;
    while (m) {
      var i = Math.floor(Math.random() * m--);
      var t = tt[m];
      tt[m] = tt[i];
      tt[i] = t;
    }
    return tt;
  }
};


function getParam(params, key) {
  var rslt = new RegExp(key + '=([^&:]*)', 'i').exec(params);
  return rslt && unescape(rslt[1]) || '';
}

function urlParam(key) {
  return getParam(window.location.href, key);
}

function urlFlag(key) {
  var ptrn = '(?:[#?&:]' + key + '[&:])|(?:[#?&:]' + key + '$)';
  var rslt = new RegExp(ptrn).exec(window.location.href);
  return !rslt ? urlParam(key) == 'true'
               : true;
}

function parseVideos(url) {
  var vids = [];
  var regx = /v=[^&:]*(?:[&:]t=[^&:]*)?/g, rslt;
  while ((rslt = regx.exec(url))) {
    vids.push(rslt[0]);
  }
  return vids;
}


function parseIntervals(v) {
  var getSeconds = function(t) {
    // convert from 1h2m3s
    var tokens = /(\d+h)?(\d+m)?(\d+s)?/g.exec(t);
    var tt = 0;
    $.each(tokens, function(i, token) {
      if (token && i > 0) {
        if (token.indexOf('s') != -1) {
          tt += parseInt(token.split('s')[0], 10);
        } else if (token.indexOf('m') != -1) {
          tt += 60 * parseInt(token.split('m')[0], 10);
        } else if (token.indexOf('h') != -1) {
          tt += 3600 * parseInt(token.split('h')[0], 10);
        }
      }
    });
    return tt > 0 ? tt : parseInt(t, 10);
  };
  var t;
  return v && (t = getParam(v, 't')) && t.length
    ? $.map(t.split('+'), function(interval) {
        var tt = interval.split(';');
        return { start: getSeconds(tt[0]),
                   end: tt.length > 1 ? getSeconds(tt[1]) : null };
      })
    : [];
}


function playbackSchedule() {
  console.log('playbackSchedule()');

  playbackSchedule.scheduleGroups =
    $.map(parseVideos(window.location.href), function(video) {
      var v = getParam(video, 'v');
      var intervals = parseIntervals(video);
      return [
        intervals.length
        ? $.map(intervals, function(interval) {
          return $.extend({ videoId: v }, interval)
        })
        : { videoId: v,
              start: '0',
                end: null }
      ];
    });
  playbackSchedule.schedule = toolbox.flatten1(playbackSchedule.scheduleGroups);
  playbackSchedule.index = 0;


  playbackSchedule.log = function() {
    $.each(playbackSchedule.schedule, function(i, playback) {
      console.log(playback);
    });
  };

  playbackSchedule.current = function() {
    return playbackSchedule.schedule[playbackSchedule.index];
  };

  playbackSchedule.cycle = function() {
    var current = playbackSchedule.current();
    var index = playbackSchedule.index + 1;
    playbackSchedule.index = index >= playbackSchedule.schedule.length
                           ? 0
                           : index;
    return current;
  };

  playbackSchedule.rewind = function() {
    var rewindOnce = function() {
      var index = playbackSchedule.index - 1;
      playbackSchedule.index = index < 0
                             ? playbackSchedule.schedule.length - 1
                             : index;
    };
    rewindOnce();
    rewindOnce();
    return playbackSchedule.cycle();
  };

  playbackSchedule.shuffle = function() {
    playbackSchedule.schedule = toolbox.flatten1(toolbox.shuffle(
      playbackSchedule.scheduleGroups
    ));
  };

  if (urlFlag('shuffle')) {
    playbackSchedule.shuffle();
  }
}


function onYouTubeIframeAPIReady() {
  console.log('onYouTubeIframeAPIReady()');

  var newPlayer = function(playback) {
    console.log('newPlayer()');
    console.log(playback);

    var $player = $('#player');
    if ($player.length) {
      $player.remove();
    }

    $('#box').html('<div id="player"></div>');

    new YT.Player('player',{
      width: '640',
      videoId: playback.videoId,
      playerVars: {
        start: playback.start,
        end: playback.end,
        autohide: '1',
        html5: '1',
        iv_load_policy: '3',
        modestbranding: '1',
        showinfo: '0',
        rel: '0',
        theme: 'dark',
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };

  var onPlayerReady = function(event) {
    console.log('onPlayerReady()');

    $(document).prop('title', event.target.getVideoData().title);
    $('#box').css('background-image', 'none');

    event.target.playVideo();
  };

  var onPlayerStateChange = function(event) {
    console.log('onPlayerStateChange(): ' + event.data);

    if (event.data == YT.PlayerState.ENDED) {
      changeFavicon(faviconWait);

      if (playbackSchedule.schedule.length > 1) {
        newPlayer(playbackSchedule.cycle());
      } else {
        event.target.seekTo(playbackSchedule.current().start);
        event.target.playVideo();
      }

    } else if (event.data == YT.PlayerState.PLAYING) {
      changeFavicon(faviconPlay);
    } else if (event.data == YT.PlayerState.PAUSED) {
      changeFavicon(faviconPause);
    } else {
      changeFavicon(faviconWait);
    }

  };

  $(document).keypress(function(e) {
    console.log('keypress(): ' + String.fromCharCode(e.which));

    if (e.which == 'h'.charCodeAt(0)) { // prev video
      newPlayer(playbackSchedule.rewind());
    } else if(e.which == 'l'.charCodeAt(0)) { // next video
      newPlayer(playbackSchedule.cycle());
    }

  });

  playbackSchedule();
  playbackSchedule.log();
  newPlayer(playbackSchedule.cycle());
}


function initYT() {
  var tag = document.createElement('script');
  tag.src = '//www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// document.head (http://jsperf.com/document-head) failsafe init for old browsers
document.head = typeof document.head != 'object'
              ? document.getElementsByTagName('head')[0]
              : document.head;

var faviconPlay = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgNkQkIDZGiCA2RzAgNkcwIDZH/CA2R/wgNkf8IDZH/CA2R/wgNkf8IDZH/CA2R2AgNkcwIDZHMCA2RhAgNkQYIDpWHCA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpWHCQ6ZzAkOmf8JDpn/CQ6Z/wkOmf8JDpb/BQhc/wgMgf8JDpn/CQ6Z/wkOmf8JDpn/CQ6Z/wkOmf8JDpn/CQ6ZzAkOnuoJDp7/CQ6e/wkOnv8JDp7/Exed/8jIy/9RU4j/Bwp0/wkOm/8JDp7/CQ6e/wkOnv8JDp7/CQ6e/wkOnuoJD6T8CQ+k/wkPpP8JD6T/CQ+k/xUbo//V1dX/1dXV/4yNrP8QFG//CA6Y/wkPpP8JD6T/CQ+k/wkPpP8JD6T8CQ+q/wkPqv8JD6r/CQ+q/wkPqv8WG6n/3d3d/93d3f/d3d3/v7/M/y0wjv8JD6r/CQ+q/wkPqv8JD6r/CQ+q/woQr/8KEK//ChCv/woQr/8KEK//Fx2v/+fn5//n5+f/5+fn/+jo6P+YmtP/ChCv/woQr/8KEK//ChCv/woQr/8KELX8ChC1/woQtf8KELX/ChC1/xgdtf/x8fH/8fHx//Ly8v+bndv/Ehi3/woQtf8KELX/ChC1/woQtf8KELX8ChG76goRu/8KEbv/ChG7/woRu/8YH77/+fn5/+/v9/9fY9H/ChG7/woRu/8KEbv/ChG7/woRu/8KEbv/ChG76goRwMwKEcD/ChHA/woRwP8KEcD/EBfB/6Ol5/8tM8n/ChHA/woRwP8KEcD/ChHA/woRwP8KEcD/ChHA/woRwMwLEcSHCxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcSHCxLICQsSyKULEsjMCxLI+QsSyP8LEsj/CxLI/wsSyP8LEsj/CxLI/wsSyP8LEsj/CxLI0gsSyMwLEsiiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAD//wAA//8AAA==';
var faviconPause = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AAgNkQkIDZGiCA2RzAgNkcwIDZH/CA2R/wgNkf8IDZH/CA2R/wgNkf8IDZH/CA2R2AgNkcwIDZHMCA2RhAgNkQYIDpWHCA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpWHCQ6ZzAkOmf8JDpn/CA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgOlf8JDpn/CQ6Z/wkOmf8JDpn/CQ6ZzAkOnuoJDp7/CQ6e/wgOlf8IDpX///////////8KEbv/CA6V////////////CQ6e/wkOnv8JDp7/CQ6e/wkOnuoJD6T8CQ+k/wkPpP8JD6T/CxHE////////////ChG7/wgOlf///////////woRu/8JD6T/CQ+k/wkPpP8JD6T8CQ+q/wkPqv8JD6r/CQ+q/wsRxP///////////woRu/8IDpX///////////8KEbv/CQ+q/wkPqv8JD6r/CQ+q/woQr/8KEK//ChCv/woQr/8LEcT///////////8KEbv/CxHE////////////ChG7/woQr/8KEK//ChCv/woQr/8KELX8ChC1/woQtf8KELX/CxHE////////////ChG7/wsRxP///////////woRu/8KELX/ChC1/woQtf8KELX8ChG76goRu/8KEbv/ChG7/wsRxP///////////woRu/8LEcT///////////8KEbv/ChG7/woRu/8KEbv/ChG76goRwMwKEcD/ChHA/woRwP8LEcT///////////8KEbv/CxHE////////////ChHA/woRwP8KEcD/ChHA/woRwMwLEcSHCxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcT/CxHE/wsRxP8LEcSHCxLICQsSyKULEsjMCxLI+QsSyP8LEsj/CxLI/wsSyP8LEsj/CxLI/wsSyP8LEsj/CxLI0gsSyMwLEsiiAAAAAP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A//8AAP//AACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAAD//wAA//8AAA==';
var faviconWait = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgNkQkIDZGiCA2RzAgNkcwIDZH/CA2R/wgNkf8IDZH/CA2R/wgNkf8IDZH/CA2R2AgNkcwIDZHMCA2RhAgNkQYIDpWHCA6V/wgOlf8IDpX/CA6V/wgOlf8IDpX/CA6V/wgNk/8IDZT/CA6V/ggOlfwIDpX/CA6V/wgOlf8IDpWHCQ6ZzAkOmf8JDpn/CA6X/wgOl/8IDpX/CA6V/wgOlf8IDpX/CA6V/wkOmP8JDpn/CQ6Z/wkOmf8JDpn/CQ6ZzAkOnuoJDp7/CQ6e/wkOm/8JDpv/DBGY/wsRmP8JDpn/CA2Z/wkOmf8JDpv/CQ6d/wkOnv8JDp7/CQ6e/wkOnuoJD6T8CQ+k/wkPpP8JDqH/CQ6f/wsQnf8JDpz/CQ6d/wkOn/8JDp7/CA6e/wkOoP8JD6L/CQ+k/wkPpP8JD6T8CQ+q/wkPqv8JD6n///////////8JDqH+CQ6i/v//////////CQ+j/gkPov///////////wkPqv8JD6r/CQ+q/woQr/8KEK//ChCv////////////ChCn/woQpv///////////wkPqf8JD6r///////////8KEK//ChCv/woQr/8KELX8ChC1/woQtP8KELL/ChCw/wkPrf8JD6z/CQ+t/goQrv4KEK/+ChCv/goQsf4KELX/ChC1/woQtf8KELX8ChG76goRu/8KEbv/ChC4/woQtf8KELP/ChCx/woQsv8KELT+ChC1/woQtf4KELf+ChG7/woRu/8KEbv/ChG76goRwNgKEcD4ChHA+woRvv0KELz+CxG5/goQuP4MErf+ChG6/goRu/4KEbv+ChG//woRwP8KEcD/ChHA/woRwMwLEcSHCxHE/wsRxP8LEcT+ChHB/wsSvv8MEr//ChG+/woRwP8LEcT/ChHD/woRw/8LEcT/CxHE/wsRxP8LEcSHCxLICQsSyKULEsjMCxLI+QsSyP8LEsj/CxLI/woRxf8LEsj/CxLI/wsSyP8LEsj/CxLI0gsSyMwLEsiiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAAD//wAA//8AAA==';

function changeFavicon(src) {
  var oldIcon = document.getElementById('dynamic-favicon');
  if (oldIcon || (!src && oldIcon)) {
    document.head.removeChild(oldIcon);
  }
  if (src) {
    var icon = document.createElement('link');
    icon.id = 'dynamic-favicon';
    icon.rel = 'shortcut icon';
    icon.href = src;
    document.head.appendChild(icon);
  }
}

function renderPage() {
  var v = urlParam('v');
  if (v) {
    // splash screen
    $('#box').css('background-image', 'url(//img.youtube.com/vi/' + v + '/hqdefault.jpg)');
    initYT();
  } else {
    changeFavicon();
    $('#box').html(
          '<p><big>Usage:</big></p>'
        + '<p>append <tt>#v=VIDEO_ID:t=start;end</tt> to current URL</p>'
        + '<p>alternative syntax: <tt>?v=VIDEO_ID&t=start;end</tt> will also work</p>'
        + '<p style="font-size:small">eg. <tt><a href="#v=ZuHZSbPJhaY:t=1h1s;1h4s">#v=ZuHZSbPJhaY:t=1h1s;1h4s</a></tt> '
        + 'or <tt><a href="#v=eSMeUPFjQHc:t=60;80:v=ZuHZSbPJhaY:t=1h;1h5s">#v=eSMeUPFjQHc:t=60;80:v=ZuHZSbPJhaY:t=1h;1h5s</a></tt><br/>'
        + 'or even <tt><a href="#v=ZNno63ZO2Lw:t=54s;1m20s+1m33s;1m47s+3m30s;3m46s:v=TM1Jy3qPSCQ:t=2s;16s">#v=ZNno63ZO2Lw:t=54s;1m20s+1m33s;1m47s+3m30s;3m46s:v=TM1Jy3qPSCQ:t=2s;16s</a></tt></p>'
        + '<p style="text-align:right;font-size:xx-small">More at <a href="https://github.com/lidel/yt-looper">GitHub</a></p>'
    );
  }
}


$(window).bind('hashchange', function() {
  console.log('hash change: ' + window.location.hash);

  // reset player or entire page
  if ($('#player').length > 0) {
    onYouTubeIframeAPIReady();
  } else {
    renderPage();
  }

});

// vim:ts=2:sw=2:et:
