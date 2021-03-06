module.exports = {

  'Get short URL via menu item' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .waitForElementVisible('#player')
      .click('#shorten')
      .waitForElementPresent('div.toast-success')
      .assert.containsText('div.toast-success', 'http://goo.gl/WTz6Nj')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

  'Get short URL via keyboard shortcut' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .waitForElementVisible('#player')
      .keys('s')
      .waitForElementPresent('div.toast-success')
      .assert.containsText('div.toast-success', 'http://goo.gl/WTz6Nj')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

  'Legacy UI: Get short URL via menu item' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .waitForElementVisible('#player')
      .click('#shorten')
      .waitForElementPresent('#shortened')
      .assert.value('#shortened input', 'http://goo.gl/WTz6Nj')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

  'Legacy UI: Get short URL via keyboard shortcut' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .waitForElementVisible('#player')
      .keys('s')
      .waitForElementPresent('#shortened')
      .assert.value('#shortened input', 'http://goo.gl/WTz6Nj')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

  'Reject invalid token' : function (browser) {
    browser
      .page.looper().uri('#h=693D6C6B4433382E6769667626743D357326656469746F72.378363385')
      .waitForElementPresent('div.toast-error')
      .assert.containsText('div.toast-error', 'Invalid URL Token')
      .assert.elementNotPresent('#player')
      .end();
  },

  'Inline shortened playlists' : function (browser) {
    browser
      .page.looper().uri('#http://goo.gl/ycH3Px&http://goo.gl/LKbVEc&http://goo.gl/WTz6Nj')
      .waitForElementVisible('iframe#player')
      .assert.uriEquals('#v=ZuHZSbPJhaY&t=1h1s;1h4s&v=lWqJTKdznaM&t=58;68&v=T0rs3R4E1Sk&t=23;30')
      .end();
  },



};
