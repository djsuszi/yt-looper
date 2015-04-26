module.exports = {

  'Get short URL via menu item' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .click('#shorten')
      .waitForElementPresent('#shortened')
      .assert.value('#shortened input', 'http://goo.gl/T3mfkD')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

  'Get short URL via keyboard shortcut' : function (browser) {
    browser
      .page.looper().uri('#v=T0rs3R4E1Sk&t=23;30')
      .waitForElementVisible('#shorten-ui')
      .keys('s')
      .waitForElementPresent('#shortened')
      .assert.value('#shortened input', 'http://goo.gl/T3mfkD')
      .page.looper().uri('#v=ZuHZSbPJhaY&t=1h1s;1h4s')
      .assert.elementNotPresent('#shortened')
      .end();
  },

};
