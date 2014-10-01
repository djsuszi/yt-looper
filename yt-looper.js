
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
  var ret = [];
  if (v) {
    var t = getParam(v, 't');
    if (t && t.length) {
      $.each(t.split('+'), function(i, interval) {
        var tt = interval.split(';');
        var rec = { start: getSeconds(tt[0]),
                      end: null };
        if (tt.length > 1) {
          rec.end = getSeconds(tt[1]);
        }
        ret.push(rec);
      });
    }
  }
  return ret;
}


function playbackSchedule() {
  console.log('playbackSchedule()');

  playbackSchedule.scheduleDetails = [];
  playbackSchedule.index = 0;

  $.each(parseVideos(window.location.href), function(i, video) {
    var v = getParam(video, 'v');
    var intervals = parseIntervals(video);

    if (intervals.length) {
      var group = [];
      $.each(intervals, function(j, interval) {
        group.push($.extend({ videoId: v }, interval));
      });
      playbackSchedule.scheduleDetails.push(group);
    } else {
      playbackSchedule.scheduleDetails.push([{ videoId: v,
                                                 start: '0',
                                                   end: null }]);
    }
  });

  playbackSchedule.schedule = toolbox.flatten1(playbackSchedule.scheduleDetails);

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
      playbackSchedule.scheduleDetails
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

      if (playbackSchedule.schedule.length > 1) {
        newPlayer(playbackSchedule.cycle());
      } else {
        event.target.seekTo(playbackSchedule.current().start);
        event.target.playVideo();
      }

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
    changeFavicon('http://youtube.com/favicon.ico');
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
