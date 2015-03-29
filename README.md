yt-looper
=========

[![Build Status](https://travis-ci.org/lidel/yt-looper.svg)](https://travis-ci.org/lidel/yt-looper)

Minimalistic Youtube Looper at https://yt.aergia.eu

## URL Parameters

```
#v=VIDEO_ID[&t=start[;end]]
```

Time format is `1h2m3s` or just a number of seconds.

## Playlists

To create a playlist just chain multiple intervals with `+`:
```
#v=VIDEO_ID&t=start1;end1+start2;end2+...
```

To chain intervals from multiple videos just append them at the end of URL:
```
#v=VIDEO_ID&t=start1;end1+start2;end2&v=VIDEO2_ID&t=start1;end1+start2;end2`
```

YouTube-compatible syntax is also supported for easy domain swap in URLs: `?v=VIDEO_ID[[#|&|:]t=start[;end]]`

Playlist import with autoplay of 13th video: `#list=<playlistId>&index=<n>`

## Keyboard Commands

Press <kbd>?</kbd> to display available shortcuts.

## Companion userscript

Script adds a button on YouTube pages to open current video in yt.aergia.eu looper:

> ![](https://cloud.githubusercontent.com/assets/157609/4671390/5d989338-5580-11e4-9f67-01ed61a085ca.png)

Click to install: https://yt.aergia.eu/yt-looper.user.js

Handy addons:

- Firefox: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- Chrome/Opera: [Tampermonkey](http://tampermonkey.net)
